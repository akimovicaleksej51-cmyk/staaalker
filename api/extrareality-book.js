// POST /api/extrareality-book
// Extrareality.by шлёт сюда бронь, когда её оформили у НИХ. Формат — form-urlencoded
// (см. extrareality-api README, раздел "Бронирование"):
//   name, phone, email, comment, datetime ("Y-m-d H:i:s"), players_num, price,
//   signature, source=extrareality, uid, our_time_id
//
// Мы: 1) проверяем подпись (если задан секрет), 2) проверяем, что слот свободен,
// 3) сохраняем бронь в тот же Redis, где и брони с нашего сайта — слот покраснеет
// и на нашем сайте тоже, 4) шлём уведомление в Telegram.
//
// Переменные окружения в Vercel:
//   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
//   EXTRAREALITY_SECRET (тот же секрет, что вписан в поле "secret" в их форме)

import crypto from 'crypto';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const EXTRAREALITY_SECRET = process.env.EXTRAREALITY_SECRET;

async function redis(command) {
  const res = await fetch(UPSTASH_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Redis error: ${res.status}`);
  return res.json();
}

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  });
  if (!r.ok) console.error('Telegram send failed:', await r.text());
}

// Vercel по умолчанию не парсит form-urlencoded — читаем и парсим сами
async function readFormBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return Object.fromEntries(new URLSearchParams(raw));
}

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  try {
    const body = await readFormBody(req);
    const { name, phone, email, comment, datetime, players_num, price, signature, our_time_id, uid } = body;

    if (!name || !phone || !datetime) {
      return res.status(400).json({ success: false, message: 'Не хватает обязательных полей' });
    }

    // Проверка подписи: md5(datetime + secret) — необязательна, но желательна
    if (EXTRAREALITY_SECRET) {
      const expected = crypto.createHash('md5').update(datetime + EXTRAREALITY_SECRET).digest('hex');
      if (signature && signature !== expected) {
        return res.status(403).json({ success: false, message: 'Неверная подпись' });
      }
    }

    const [datePart, timePart] = datetime.split(' ');
    const time = timePart ? timePart.slice(0, 5) : '';

    const existing = await redis(['SMEMBERS', `bookings:${datePart}`]);
    const alreadyBooked = (existing.result || [])
      .map((entry) => JSON.parse(entry).time)
      .includes(time);

    if (alreadyBooked) {
      return res.status(200).json({ success: false, message: 'Это время уже занято у нас' });
    }

    const bookingRecord = {
      time,
      players: players_num || '',
      mode: 'standard',
      name,
      phone,
      comment: comment || '',
      source: 'extrareality',
      extUid: uid || '',
      createdAt: new Date().toISOString(),
    };

    await redis(['SADD', `bookings:${datePart}`, JSON.stringify(bookingRecord)]);

    await sendTelegramMessage(
      `🎯 <b>Новая бронь с extrareality.by</b>\n\n` +
        `📅 Дата: <b>${datePart}</b>\n` +
        `🕐 Время: <b>${time}</b>\n` +
        `👥 Игроков: <b>${players_num || '—'}</b>\n` +
        `👤 Имя: ${name}\n` +
        `📞 Телефон: ${phone}\n` +
        (price ? `💰 Цена: ${price} р.\n` : '') +
        (comment ? `💬 Комментарий: ${comment}\n` : '')
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
}

// POST /api/book
// body: { date, time, players, mode, name, phone, comment }
//
// 1) проверяет, не занят ли слот
// 2) если свободен — сохраняет в Redis и шлёт сообщение в Telegram
// 3) если занят — возвращает 409, фронтенд должен предложить другое время
//
// Переменные окружения в Vercel:
//   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Та же сетка цен, что и на сайте (см. src/sections/Booking.tsx и api/schedule.js).
// Считаем цену на сервере, а не берём из браузера — так её нельзя подделать.
const weekdaySchedule = {
  '11:00': { 2: 110, 3: 135, 4: 150, 5: 175, 6: 190 },
  '12:40': { 2: 110, 3: 135, 4: 150, 5: 175, 6: 190 },
  '14:20': { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 },
  '16:00': { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 },
  '17:40': { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 },
  '19:15': { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 },
  '20:45': { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 },
  '22:20': { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 },
};
const weekendSchedule = {
  '10:00': { 2: 120, 3: 140, 4: 160, 5: 180, 6: 195 },
  '11:45': { 2: 120, 3: 140, 4: 160, 5: 180, 6: 195 },
  '13:30': { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 },
  '15:15': { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 },
  '17:00': { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 },
  '18:45': { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 },
  '20:30': { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 },
  '22:15': { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 },
};

function calcPrice(dateStr, time, players) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay(); // 0=вс, 6=сб — считаем в местных компонентах, без UTC-сдвигов
  const isWeekend = day === 0 || day === 6;
  const schedule = isWeekend ? weekendSchedule : weekdaySchedule;
  const row = schedule[time];
  if (!row) return null;
  return row[players] || row[2];
}

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
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'HTML',
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error('Telegram send failed:', errText);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { date, time, players, mode, name, phone, comment } = req.body || {};

  if (!date || !time || !players || !name || !phone) {
    return res.status(400).json({ error: 'Не заполнены обязательные поля' });
  }

  try {
    // Проверяем занятость слота
    const existing = await redis(['SMEMBERS', `bookings:${date}`]);
    const alreadyBooked = (existing.result || [])
      .map((entry) => JSON.parse(entry).time)
      .includes(time);

    if (alreadyBooked) {
      return res.status(409).json({ error: 'Это время уже забронировано, выберите другое' });
    }

    const price = calcPrice(date, time, Number(players));

    const bookingRecord = {
      time,
      players,
      mode: mode || 'standard',
      name,
      phone,
      comment: comment || '',
      price,
      createdAt: new Date().toISOString(),
    };

    // Сохраняем бронь навсегда (до ручной отмены) — именно это даёт
    // "слот всегда показывает занято после брони"
    await redis(['SADD', `bookings:${date}`, JSON.stringify(bookingRecord)]);

    const modeLabels = { standard: 'Стандартный (14+)', light: 'Лайт (12+)', kids: 'Детский (10+)' };

    await sendTelegramMessage(
      `🎯 <b>Новая бронь — S.T.A.L.K.E.R. Сердце Зоны</b>\n\n` +
        `📅 Дата: <b>${date}</b>\n` +
        `🕐 Время: <b>${time}</b>\n` +
        `👥 Игроков: <b>${players}</b>\n` +
        `🎮 Режим: ${modeLabels[mode] || mode}\n` +
        `💰 Цена: <b>${price !== null ? price + ' р.' : 'уточнить на сайте'}</b>\n` +
        `👤 Имя: ${name}\n` +
        `📞 Телефон: ${phone}\n` +
        (comment ? `💬 Комментарий: ${comment}\n` : '')
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Не удалось сохранить бронь, попробуйте ещё раз' });
  }
}

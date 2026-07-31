// /api/admin-bookings
// GET    ?date=YYYY-MM-DD                — список броней на дату
// POST   { date, time, note }            — добавить техническую бронь (блокирует слот)
// DELETE { date, time }                  — отменить бронь (снять блокировку слота)
//
// Все запросы должны содержать заголовок:  x-admin-password: <ADMIN_PASSWORD>
//
// Переменные окружения в Vercel:
//   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, ADMIN_PASSWORD

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

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
const modeLabels = { standard: 'Стандартный (14+)', light: 'Лайт (12+)', kids: 'Детский (10+)' };

function calcPrice(dateStr, time, players) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  const isWeekend = day === 0 || day === 6;
  const row = (isWeekend ? weekendSchedule : weekdaySchedule)[time];
  if (!row) return null;
  return row[players] || row[2];
}

async function sendTelegramMessage(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' }),
  });
  if (!r.ok) console.error('Telegram send failed:', await r.text());
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const providedPassword = req.headers['x-admin-password'];
  if (!ADMIN_PASSWORD || providedPassword !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }

  try {
    if (req.method === 'GET') {
      const { date, all } = req.query;

      if (all) {
        // Все брони по всем датам, на которых хоть раз что-то бронировали
        const datesResult = await redis(['SMEMBERS', 'booking-dates']);
        const dates = (datesResult.result || []).sort();
        const allBookings = [];
        for (const d of dates) {
          const r = await redis(['SMEMBERS', `bookings:${d}`]);
          for (const entry of r.result || []) {
            allBookings.push({ date: d, ...JSON.parse(entry) });
          }
        }
        // Только сегодня и позже, чтобы не захламлять прошедшими
        const todayStr = new Date().toISOString().slice(0, 10);
        const upcoming = allBookings.filter((b) => b.date >= todayStr);
        upcoming.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
        return res.status(200).json({ bookings: upcoming });
      }

      if (!date) return res.status(400).json({ error: 'date is required' });
      const result = await redis(['SMEMBERS', `bookings:${date}`]);
      const bookings = (result.result || []).map((entry) => JSON.parse(entry));
      bookings.sort((a, b) => a.time.localeCompare(b.time));
      return res.status(200).json({ date, bookings });
    }

    if (req.method === 'POST') {
      const { date, time, type, note, name, phone, players, mode, comment } = req.body || {};
      if (!date || !time) return res.status(400).json({ error: 'date и time обязательны' });

      const existing = await redis(['SMEMBERS', `bookings:${date}`]);
      const already = (existing.result || []).map((e) => JSON.parse(e).time).includes(time);
      if (already) return res.status(409).json({ error: 'На это время уже есть бронь' });

      let record;
      if (type === 'normal') {
        if (!name || !phone) return res.status(400).json({ error: 'Имя и телефон обязательны' });
        const price = calcPrice(date, time, Number(players) || 2);
        record = {
          time,
          players: players || 2,
          mode: mode || 'standard',
          name,
          phone,
          comment: comment || '',
          price,
          source: 'admin',
          createdAt: new Date().toISOString(),
        };
        await sendTelegramMessage(
          `🎯 <b>Бронь добавлена вручную в админке</b>\n\n` +
            `📅 Дата: <b>${date}</b>\n` +
            `🕐 Время: <b>${time}</b>\n` +
            `👥 Игроков: <b>${players || 2}</b>\n` +
            `🎮 Режим: ${modeLabels[mode] || mode || 'Стандартный'}\n` +
            `💰 Цена: <b>${price !== null ? price + ' р.' : 'уточнить на сайте'}</b>\n` +
            `👤 Имя: ${name}\n` +
            `📞 Телефон: ${phone}\n` +
            (comment ? `💬 Комментарий: ${comment}\n` : '')
        );
      } else {
        record = {
          time,
          players: '—',
          mode: 'technical',
          name: 'Техническая бронь',
          phone: '—',
          comment: note || '',
          source: 'admin',
          createdAt: new Date().toISOString(),
        };
      }

      await redis(['SADD', `bookings:${date}`, JSON.stringify(record)]);
      await redis(['SADD', 'booking-dates', date]);
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { date, time } = req.body || {};
      if (!date || !time) return res.status(400).json({ error: 'date и time обязательны' });

      const existing = await redis(['SMEMBERS', `bookings:${date}`]);
      const match = (existing.result || []).find((entry) => JSON.parse(entry).time === time);
      if (!match) return res.status(404).json({ error: 'Бронь не найдена' });

      await redis(['SREM', `bookings:${date}`, match]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
}

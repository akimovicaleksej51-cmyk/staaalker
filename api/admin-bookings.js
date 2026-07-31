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
      const { date } = req.query;
      if (!date) return res.status(400).json({ error: 'date is required' });
      const result = await redis(['SMEMBERS', `bookings:${date}`]);
      const bookings = (result.result || []).map((entry) => JSON.parse(entry));
      bookings.sort((a, b) => a.time.localeCompare(b.time));
      return res.status(200).json({ date, bookings });
    }

    if (req.method === 'POST') {
      const { date, time, note } = req.body || {};
      if (!date || !time) return res.status(400).json({ error: 'date и time обязательны' });

      const existing = await redis(['SMEMBERS', `bookings:${date}`]);
      const already = (existing.result || []).map((e) => JSON.parse(e).time).includes(time);
      if (already) return res.status(409).json({ error: 'На это время уже есть бронь' });

      const record = {
        time,
        players: '—',
        mode: 'technical',
        name: 'Техническая бронь',
        phone: '—',
        comment: note || '',
        source: 'admin',
        createdAt: new Date().toISOString(),
      };
      await redis(['SADD', `bookings:${date}`, JSON.stringify(record)]);
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

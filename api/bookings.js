// GET /api/bookings?date=2026-08-01
// Возвращает занятые времена на указанную дату: { "date": "...", "booked": ["11:00", "14:20"] }
//
// Хранилище — Upstash Redis (бесплатный тариф достаточен для квеста).
// Нужны переменные окружения в Vercel: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date is required' });

  try {
    // Все брони на дату хранятся как members множества "bookings:<date>"
    const result = await redis(['SMEMBERS', `bookings:${date}`]);
    const booked = (result.result || []).map((entry) => JSON.parse(entry).time);
    return res.status(200).json({ date, booked });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Storage error' });
  }
}

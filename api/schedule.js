// GET /api/schedule
// Вызывается СИСТЕМОЙ EXTRAREALITY.BY (не нашим фронтендом), примерно раз в
// несколько минут. Отдаёт список наших слотов на ~30 дней вперёд в формате,
// который они ожидают (см. extrareality-api README, раздел "Расписание").
//
// Формат ответа — массив объектов:
// { date, time, is_free, extraPrices: { "2 человека": 110, ... }, our_time_id }
//
// Переменные окружения в Vercel: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

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

// Та же сетка цен, что и на сайте (см. src/sections/Booking.tsx)
const weekdaySchedule = [
  { time: '11:00', prices: { 2: 110, 3: 135, 4: 150, 5: 175, 6: 190 } },
  { time: '12:40', prices: { 2: 110, 3: 135, 4: 150, 5: 175, 6: 190 } },
  { time: '14:20', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
  { time: '16:00', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
  { time: '17:40', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
  { time: '19:15', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
  { time: '20:45', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
  { time: '22:20', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
];

const weekendSchedule = [
  { time: '10:00', prices: { 2: 120, 3: 140, 4: 160, 5: 180, 6: 195 } },
  { time: '11:45', prices: { 2: 120, 3: 140, 4: 160, 5: 180, 6: 195 } },
  { time: '13:30', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
  { time: '15:15', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
  { time: '17:00', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
  { time: '18:45', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
  { time: '20:30', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
  { time: '22:15', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
];

function formatDate(d) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const result = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dateStr = formatDate(d);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const daySchedule = isWeekend ? weekendSchedule : weekdaySchedule;

      // Читаем занятые слоты на этот день из нашего общего хранилища броней
      let bookedTimes = [];
      try {
        const existing = await redis(['SMEMBERS', `bookings:${dateStr}`]);
        bookedTimes = (existing.result || []).map((entry) => JSON.parse(entry).time);
      } catch (e) {
        bookedTimes = [];
      }

      for (const slot of daySchedule) {
        result.push({
          date: dateStr,
          time: slot.time,
          is_free: !bookedTimes.includes(slot.time),
          extraPrices: {
            '2 человека': slot.prices[2],
            '3 человека': slot.prices[3],
            '4 человека': slot.prices[4],
            '5 человек': slot.prices[5],
            '6 человек': slot.prices[6],
          },
          our_time_id: `${dateStr}_${slot.time}`,
        });
      }
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Не удалось получить расписание' });
  }
}

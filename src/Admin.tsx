import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Booking = {
  date?: string;
  time: string;
  players: string | number;
  mode: string;
  name: string;
  phone: string;
  comment?: string;
  source?: string;
  price?: number | null;
  createdAt: string;
};

const modeLabels: Record<string, string> = {
  standard: 'Стандартный',
  light: 'Лайт',
  kids: 'Детский',
  technical: 'ТЕХНИЧЕСКАЯ',
};

const weekdaySlots = ['11:00', '12:40', '14:20', '16:00', '17:40', '19:15', '20:45', '22:20'];
const weekendSlots = ['10:00', '11:45', '13:30', '15:15', '17:00', '18:45', '20:30', '22:15'];

const pad2 = (n: number) => n.toString().padStart(2, '0');
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const isWeekend = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 || day === 6;
};

const Admin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');

  const [tab, setTab] = useState<'date' | 'all'>('date');
  const [date, setDate] = useState(todayStr());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedSlot, setSelectedSlot] = useState<{ time: string; booking: Booking | null } | null>(null);
  const [noteText, setNoteText] = useState('');
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const apiCall = async (method: string, body?: any, query?: string) => {
    const res = await fetch(`/api/admin-bookings${query || ''}`, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
    return data;
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      await apiCall('GET', undefined, `?date=${todayStr()}`);
      setAuthed(true);
    } catch (err: any) {
      setAuthError(err.message || 'Не удалось войти');
    }
  };

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('GET', undefined, `?date=${date}`);
      setBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadAllBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('GET', undefined, `?all=1`);
      setAllBookings(data.bookings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authed) return;
    if (tab === 'date') loadBookings();
    if (tab === 'all') loadAllBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, date, tab]);

  const cancelBooking = async (targetDate: string, time: string) => {
    if (!window.confirm(`Отменить бронь на ${targetDate} ${time}?`)) return;
    try {
      await apiCall('DELETE', { date: targetDate, time });
      setSelectedSlot(null);
      setDetailBooking(null);
      if (tab === 'date') loadBookings();
      else loadAllBookings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const addTechnical = async () => {
    if (!selectedSlot) return;
    try {
      await apiCall('POST', { date, time: selectedSlot.time, note: noteText });
      setSelectedSlot(null);
      setNoteText('');
      loadBookings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <form onSubmit={login} className="stalker-card p-6 w-full max-w-sm space-y-4">
          <h1 className="text-orange-500 text-xl font-bold text-center">Админка — вход</h1>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="w-full bg-zinc-800 text-gray-200 border border-orange-500/30 rounded px-4 py-3 pr-11 focus:outline-none focus:border-orange-500"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-400"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {authError && <p className="text-red-500 text-sm">{authError}</p>}
          <button type="submit" className="stalker-btn w-full">
            Войти
          </button>
        </form>
      </div>
    );
  }

  const slots = isWeekend(date) ? weekendSlots : weekdaySlots;
  const bookingByTime = (time: string) => bookings.find((b) => b.time === time) || null;

  return (
    <div className="min-h-screen bg-black text-gray-200 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-orange-500 text-2xl font-bold mb-6">Админка бронирования</h1>

        {/* Вкладки */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('date')}
            className={`px-4 py-2 rounded text-sm font-bold ${tab === 'date' ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-gray-400'}`}
          >
            По дате
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-4 py-2 rounded text-sm font-bold ${tab === 'all' ? 'bg-orange-500 text-black' : 'bg-zinc-800 text-gray-400'}`}
          >
            Все брони
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {tab === 'date' && (
          <>
            <div className="mb-6">
              <label className="block text-orange-400 text-sm font-bold mb-2">Дата</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSelectedSlot(null);
                }}
                className="bg-zinc-800 border border-orange-500/30 rounded px-4 py-2 text-gray-200 focus:outline-none focus:border-orange-500"
              />
              <span className="ml-3 text-xs text-gray-500">
                {isWeekend(date) ? 'Выходной день (сб/вс)' : 'Будний день'}
              </span>
            </div>

            {loading && <p className="text-gray-500 mb-4">Загрузка…</p>}

            {/* Сетка времени — как на сайте, кликабельная */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              {slots.map((time) => {
                const booking = bookingByTime(time);
                const isTechnical = booking?.mode === 'technical';
                return (
                  <button
                    key={time}
                    onClick={() => setSelectedSlot({ time, booking })}
                    className={`p-3 rounded text-center text-sm font-data border-2 transition-all ${
                      booking
                        ? isTechnical
                          ? 'bg-zinc-800 border-gray-500 text-gray-400'
                          : 'bg-red-950/60 border-red-800/60 text-red-400'
                        : 'bg-zinc-800 border-transparent text-orange-300 hover:border-orange-500/50'
                    } ${selectedSlot?.time === time ? '!border-orange-500' : ''}`}
                  >
                    <div className="font-bold">{time}</div>
                    <div className="text-xs">{booking ? (isTechnical ? 'техбронь' : 'занято') : 'свободно'}</div>
                  </button>
                );
              })}
            </div>

            {/* Панель деталей выбранного слота */}
            {selectedSlot && (
              <div className="stalker-card p-4 mb-6">
                {selectedSlot.booking ? (
                  <div>
                    <h3 className="text-orange-400 font-bold mb-2">
                      Бронь на {selectedSlot.time}
                      {selectedSlot.booking.mode === 'technical' && (
                        <span className="text-gray-500 text-xs ml-2">ТЕХНИЧЕСКАЯ</span>
                      )}
                      {selectedSlot.booking.source === 'extrareality' && (
                        <span className="text-toxic-400 text-xs ml-2">с extrareality.by</span>
                      )}
                    </h3>
                    <div className="text-sm text-gray-300 space-y-1 mb-4">
                      <div>Имя: {selectedSlot.booking.name}</div>
                      <div>Телефон: {selectedSlot.booking.phone}</div>
                      <div>Игроков: {selectedSlot.booking.players}</div>
                      <div>Режим: {modeLabels[selectedSlot.booking.mode] || selectedSlot.booking.mode}</div>
                      {selectedSlot.booking.price != null && <div>Цена: {selectedSlot.booking.price} р.</div>}
                      {selectedSlot.booking.comment && <div>Комментарий: {selectedSlot.booking.comment}</div>}
                    </div>
                    <button
                      onClick={() => cancelBooking(date, selectedSlot.time)}
                      className="text-red-500 hover:text-red-400 text-sm font-bold border border-red-500/40 rounded px-3 py-2 hover:bg-red-500/10"
                    >
                      Отменить бронь
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-orange-400 font-bold mb-2">Поставить техническую бронь на {selectedSlot.time}</h3>
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Причина (например: техобслуживание)"
                      className="w-full bg-zinc-800 border border-orange-500/30 rounded px-3 py-2 text-gray-200 mb-3 focus:outline-none focus:border-orange-500"
                    />
                    <button onClick={addTechnical} className="stalker-btn text-sm">
                      Заблокировать слот
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'all' && (
          <>
            {loading && <p className="text-gray-500 mb-4">Загрузка…</p>}
            {!loading && allBookings.length === 0 && (
              <p className="text-gray-500">Предстоящих броней нет.</p>
            )}
            <div className="space-y-2">
              {allBookings.map((b) => (
                <button
                  key={`${b.date}-${b.time}`}
                  onClick={() => setDetailBooking(b)}
                  className="w-full text-left stalker-card p-3 flex items-center justify-between hover:border-orange-500/60 transition-colors"
                >
                  <div>
                    <span className="font-data text-orange-400 font-bold">{b.date} {b.time}</span>
                    <span className="text-gray-400 text-sm ml-3">
                      {b.mode === 'technical' ? 'ТЕХНИЧЕСКАЯ' : b.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {b.source === 'extrareality' ? 'extrareality.by' : b.mode === 'technical' ? '' : 'наш сайт'}
                  </span>
                </button>
              ))}
            </div>

            {/* Модалка с деталями */}
            {detailBooking && (
              <div
                className="fixed inset-0 bg-black/80 flex items-center justify-center px-4 z-50"
                onClick={() => setDetailBooking(null)}
              >
                <div className="stalker-card p-5 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-orange-400 font-bold mb-3">
                    {detailBooking.date} {detailBooking.time}
                  </h3>
                  <div className="text-sm text-gray-300 space-y-1 mb-4">
                    <div>Имя: {detailBooking.name}</div>
                    <div>Телефон: {detailBooking.phone}</div>
                    <div>Игроков: {detailBooking.players}</div>
                    <div>Режим: {modeLabels[detailBooking.mode] || detailBooking.mode}</div>
                    {detailBooking.price != null && <div>Цена: {detailBooking.price} р.</div>}
                    {detailBooking.comment && <div>Комментарий: {detailBooking.comment}</div>}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => cancelBooking(detailBooking.date as string, detailBooking.time)}
                      className="text-red-500 hover:text-red-400 text-sm font-bold border border-red-500/40 rounded px-3 py-2 hover:bg-red-500/10"
                    >
                      Отменить
                    </button>
                    <button
                      onClick={() => setDetailBooking(null)}
                      className="text-gray-400 text-sm border border-gray-600 rounded px-3 py-2 hover:bg-white/5"
                    >
                      Закрыть
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;

import { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Booking = {
  time: string;
  players: string | number;
  mode: string;
  name: string;
  phone: string;
  comment?: string;
  source?: string;
  createdAt: string;
};

const modeLabels: Record<string, string> = {
  standard: 'Стандартный',
  light: 'Лайт',
  kids: 'Детский',
  technical: 'ТЕХНИЧЕСКАЯ',
};

const todayStr = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const Admin = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [date, setDate] = useState(todayStr());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [newTime, setNewTime] = useState('');
  const [newNote, setNewNote] = useState('');

  const apiCall = async (method: string, body?: any, query?: string) => {
    const res = await fetch(`/api/admin-bookings${query || ''}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password,
      },
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

  useEffect(() => {
    if (authed) loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, date]);

  const cancelBooking = async (time: string) => {
    if (!window.confirm(`Отменить бронь на ${time}?`)) return;
    try {
      await apiCall('DELETE', { date, time });
      loadBookings();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const addTechnical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTime) return;
    try {
      await apiCall('POST', { date, time: newTime, note: newNote });
      setNewTime('');
      setNewNote('');
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

  return (
    <div className="min-h-screen bg-black text-gray-200 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-orange-500 text-2xl font-bold mb-6">Админка бронирования</h1>

        <div className="mb-6">
          <label className="block text-orange-400 text-sm font-bold mb-2">Дата</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-zinc-800 border border-orange-500/30 rounded px-4 py-2 text-gray-200 focus:outline-none focus:border-orange-500"
          />
        </div>

        {loading && <p className="text-gray-500">Загрузка…</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && bookings.length === 0 && (
          <p className="text-gray-500 mb-6">На эту дату броней нет.</p>
        )}

        <div className="space-y-3 mb-8">
          {bookings.map((b) => (
            <div
              key={b.time}
              className={`stalker-card p-4 flex items-center justify-between ${
                b.mode === 'technical' ? 'border-red-500/50' : ''
              }`}
            >
              <div>
                <div className="font-bold font-data text-orange-400">
                  {b.time}{' '}
                  {b.mode === 'technical' && (
                    <span className="text-red-500 text-xs ml-2">ТЕХНИЧЕСКАЯ БРОНЬ</span>
                  )}
                  {b.source === 'extrareality' && (
                    <span className="text-toxic-400 text-xs ml-2">с extrareality.by</span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {b.name} · {b.phone} · {b.players} чел. · {modeLabels[b.mode] || b.mode}
                </div>
                {b.comment && <div className="text-xs text-gray-500 mt-1">💬 {b.comment}</div>}
              </div>
              <button
                onClick={() => cancelBooking(b.time)}
                className="text-red-500 hover:text-red-400 text-sm font-bold border border-red-500/40 rounded px-3 py-2 hover:bg-red-500/10 transition-colors"
              >
                Отменить
              </button>
            </div>
          ))}
        </div>

        <div className="stalker-card p-4">
          <h2 className="text-orange-400 font-bold mb-3">Поставить техническую бронь</h2>
          <form onSubmit={addTechnical} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Время (например 14:20)</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                placeholder="14:20"
                className="bg-zinc-800 border border-orange-500/30 rounded px-3 py-2 text-gray-200 w-32 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs text-gray-500 mb-1">Причина (необязательно)</label>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Например: техобслуживание"
                className="bg-zinc-800 border border-orange-500/30 rounded px-3 py-2 text-gray-200 w-full focus:outline-none focus:border-orange-500"
              />
            </div>
            <button type="submit" className="stalker-btn">
              Заблокировать слот
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Время нужно указывать точно как в сетке на сайте (например 11:00, 14:20, 19:15).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;

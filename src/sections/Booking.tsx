import { useEffect, useRef, useState } from 'react';
import { Calendar, Clock, Users, Phone, User, Check, AlertTriangle, Gift } from 'lucide-react';
import { toast } from 'sonner';

const Booking = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [players, setPlayers] = useState<number>(2);
  const [mode, setMode] = useState<string>('standard');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [isCheckingSlots, setIsCheckingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // При выборе даты подтягиваем с бэкенда список уже забронированных времён
  useEffect(() => {
    if (!selectedDate) {
      setBookedTimes([]);
      return;
    }
    let cancelled = false;
    setIsCheckingSlots(true);
    fetch(`/api/bookings?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setBookedTimes(data.booked || []);
      })
      .catch(() => {
        if (!cancelled) setBookedTimes([]);
      })
      .finally(() => {
        if (!cancelled) setIsCheckingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const weekdays = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
    const weekday = weekdays[date.getDay()];
    return {
      value: date.toISOString().split('T')[0],
      label: `${day}.${month}`,
      weekday: weekday,
      fullLabel: `${day}.${month} ${weekday}`,
    };
  });

  // Actual price grid (from schedule spreadsheet): будни / выходные, время -> цена по кол-ву игроков
  type PriceRow = { time: string; prices: Record<number, number> };

  const weekdaySchedule: PriceRow[] = [
    { time: '11:00', prices: { 2: 110, 3: 135, 4: 150, 5: 175, 6: 190 } },
    { time: '12:40', prices: { 2: 110, 3: 135, 4: 150, 5: 175, 6: 190 } },
    { time: '14:20', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
    { time: '16:00', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
    { time: '17:40', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
    { time: '19:15', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
    { time: '20:45', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
    { time: '22:20', prices: { 2: 120, 3: 145, 4: 160, 5: 180, 6: 195 } },
  ];

  const weekendSchedule: PriceRow[] = [
    { time: '10:00', prices: { 2: 120, 3: 140, 4: 160, 5: 180, 6: 195 } },
    { time: '11:45', prices: { 2: 120, 3: 140, 4: 160, 5: 180, 6: 195 } },
    { time: '13:30', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
    { time: '15:15', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
    { time: '17:00', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
    { time: '18:45', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
    { time: '20:30', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
    { time: '22:15', prices: { 2: 130, 3: 150, 4: 175, 5: 195, 6: 210 } },
  ];

  // Определяем, будни это или выходные (сб/вс), по выбранной дате
  const isWeekendDate = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const day = d.getDay(); // 0 = вс, 6 = сб
    return day === 0 || day === 6;
  };

  const activeSchedule = isWeekendDate(selectedDate) ? weekendSchedule : weekdaySchedule;

  // available: false, если слот уже кем-то забронирован (по данным с бэкенда)
  const timeSlots = activeSchedule.map((row) => ({
    time: row.time,
    price: row.prices[2],
    available: !bookedTimes.includes(row.time),
  }));

  const modes = [
    { value: 'standard', label: 'Стандартный (14+)', price: 0 },
    { value: 'light', label: 'Лайт (12+)', price: 0 },
    { value: 'kids', label: 'Детский (10+)', price: 0 },
  ];

  const getTotalPrice = () => {
    if (!selectedTime) return 0;
    const row = activeSchedule.find((t) => t.time === selectedTime);
    if (!row) return 0;
    return row.prices[players] || row.prices[2];
  };

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !name || !phone) {
      toast.error('Пожалуйста, заполните все поля');
      return;
    }

    // Validate phone number (Belarus format)
    const phoneRegex = /^\+375\s?\d{2}\s?\d{3}-?\d{2}-?\d{2}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      toast.error('Введите корректный номер телефона (+375 XX XXX-XX-XX)');
      return;
    }

    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          time: selectedTime,
          players,
          mode,
          name,
          phone,
        }),
      });
      const data = await res.json();

      if (res.status === 409) {
        // Кто-то забронировал это же время, пока вы заполняли форму
        toast.error(data.error || 'Это время уже заняли, выберите другое');
        setBookedTimes((prev) => [...prev, selectedTime]);
        setSelectedTime('');
        setShowConfirmation(false);
        return;
      }

      if (!res.ok) {
        toast.error(data.error || 'Не удалось создать бронь, попробуйте ещё раз');
        return;
      }

      toast.success('Бронирование успешно создано!', {
        description: `Мы отправили подтверждение на номер ${phone}. Ждём вас в Зоне!`,
        duration: 5000,
      });

      // Слот теперь навсегда занят (пока бронь не отменят вручную)
      setBookedTimes((prev) => [...prev, selectedTime]);
      setShowConfirmation(false);
      setSelectedDate('');
      setSelectedTime('');
      setName('');
      setPhone('');
      setPlayers(2);
      setMode('standard');
    } catch (err) {
      toast.error('Сервер бронирования недоступен, попробуйте позже или позвоните нам');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.startsWith('375')) {
      return `+${numbers.slice(0, 3)} ${numbers.slice(3, 5)} ${numbers.slice(5, 8)}-${numbers.slice(8, 10)}-${numbers.slice(10, 12)}`;
    }
    return value;
  };

  return (
    <section
      id="booking"
      ref={sectionRef}
      className="py-20 md:py-32 bg-zinc-950 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Calendar className="w-6 h-6 text-orange-500" />
            <h2 className="text-3xl md:text-5xl font-bold text-gradient font-['Orbitron']">
              БРОНИРОВАНИЕ
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Выбери удобное время и шагни за Периметр. Мы не берём комиссию за бронирование.
          </p>
        </div>

        <div
          className={`grid lg:grid-cols-3 gap-8 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="stalker-card p-6">
              {/* Date Selection */}
              <div className="mb-6">
                <label className="flex items-center space-x-2 text-orange-400 font-bold mb-3">
                  <Calendar className="w-5 h-5" />
                  <span>Выберите дату</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {dates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`p-2 rounded-lg text-center text-sm transition-all duration-200 ${
                        selectedDate === date.value
                          ? 'bg-orange-500 text-black font-bold'
                          : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                      }`}
                    >
                      <div className="text-xs">{date.label}</div>
                      <div className="font-bold text-xs capitalize">{date.weekday}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="mb-6">
                  <label className="flex items-center space-x-2 text-orange-400 font-bold mb-3">
                    <Clock className="w-5 h-5" />
                    <span>Выберите время</span>
                    {isCheckingSlots && (
                      <span className="text-xs text-gray-500 font-normal">(проверяем занятость…)</span>
                    )}
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg text-center transition-all duration-200 border ${
                          selectedTime === slot.time
                            ? 'bg-orange-500 text-black font-bold border-orange-500'
                            : slot.available
                            ? 'bg-zinc-800 text-gray-300 hover:bg-zinc-700 border-transparent'
                            : 'bg-red-950/60 text-red-500 border-red-800/60 cursor-not-allowed'
                        }`}
                      >
                        <div className="font-bold">{slot.time}</div>
                        <div className="text-xs">
                          {slot.available ? `от ${slot.price} р.` : '🔴 Занято'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Players & Mode */}
              {selectedTime && (
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="flex items-center space-x-2 text-orange-400 font-bold mb-3">
                      <Users className="w-5 h-5" />
                      <span>Количество игроков</span>
                    </label>
                    <div className="flex space-x-2">
                      {[2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          onClick={() => setPlayers(num)}
                          className={`w-10 h-10 rounded-lg font-bold transition-all duration-200 ${
                            players === num
                              ? 'bg-orange-500 text-black'
                              : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-orange-400 font-bold mb-3">
                      <Check className="w-5 h-5" />
                      <span>Режим игры</span>
                    </label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className="w-full bg-zinc-800 text-gray-300 border border-orange-500/30 rounded-lg px-4 py-2 focus:outline-none focus:border-orange-500"
                    >
                      {modes.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {selectedTime && (
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="flex items-center space-x-2 text-orange-400 font-bold mb-3">
                      <User className="w-5 h-5" />
                      <span>Ваше имя</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Иван"
                      className="w-full bg-zinc-800 text-gray-300 border border-orange-500/30 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center space-x-2 text-orange-400 font-bold mb-3">
                      <Phone className="w-5 h-5" />
                      <span>Телефон</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="+375 33 686-30-79"
                      className="w-full bg-zinc-800 text-gray-300 border border-orange-500/30 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* Book Button */}
              {selectedTime && (
                <button
                  onClick={handleBooking}
                  className="stalker-btn w-full text-lg"
                >
                  Забронировать за {getTotalPrice()} р.
                </button>
              )}
            </div>

            {/* Warning */}
            <div className="stalker-card p-4 border-yellow-500/30">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-400">
                  <p className="mb-2">
                    Бронирование является актуальным только после подтверждения по номеру телефона.
                  </p>
                  <p>
                    При опоздании более чем на 15 минут администратор вправе отменить игру.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="space-y-6">
            <div className="stalker-card p-6">
              <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                <Gift className="w-5 h-5 mr-2" />
                Стоимость {selectedDate ? (isWeekendDate(selectedDate) ? '(сб-вс)' : '(будни)') : '(будни)'}
              </h3>
              <div className="space-y-3">
                {[2, 3, 4, 5, 6].map((num) => {
                  const schedule = selectedDate ? activeSchedule : weekdaySchedule;
                  const minPrice = Math.min(...schedule.map((r) => r.prices[num]));
                  const maxPrice = Math.max(...schedule.map((r) => r.prices[num]));
                  return (
                    <div key={num} className="flex justify-between items-center">
                      <span className="text-gray-400">{num} {num === 2 ? 'человека' : num <= 4 ? 'человека' : 'человек'}</span>
                      <span className="text-orange-500 font-bold">
                        {minPrice === maxPrice ? `${minPrice} р.` : `${minPrice}–${maxPrice} р.`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-orange-500/20">
                <p className="text-sm text-gray-500">
                  Цена зависит от времени сеанса и дня недели (будни / сб-вс дороже). Выберите дату и время выше, чтобы увидеть точную стоимость.
                </p>
              </div>
            </div>

            <div className="stalker-card p-6">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Скидки</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-gray-300 font-medium">Скидка на день рождения</div>
                    <div className="text-sm text-gray-500">10 BYN</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="stalker-card p-6">
              <h3 className="text-xl font-bold text-orange-400 mb-4">Контакты</h3>
              <div className="space-y-3">
                <a
                  href="tel:+375336863079"
                  className="flex items-center space-x-3 text-gray-300 hover:text-orange-400 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>+375 (33) 686-30-79</span>
                </a>
                <div className="flex items-start space-x-3 text-gray-300">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-lg">📍</span>
                  </div>
                  <span>ул. Тимирязева, 9</span>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  м. Молодёжная — 650 м
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="stalker-card p-6 max-w-md w-full">
            <h3 className="text-2xl font-bold text-orange-400 mb-4 text-center">
              Подтвердите бронирование
            </h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-400">Дата:</span>
                <span className="text-gray-300">
                  {dates.find((d) => d.value === selectedDate)?.fullLabel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Время:</span>
                <span className="text-gray-300">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Игроков:</span>
                <span className="text-gray-300">{players}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Режим:</span>
                <span className="text-gray-300">
                  {modes.find((m) => m.value === mode)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Имя:</span>
                <span className="text-gray-300">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Телефон:</span>
                <span className="text-gray-300">{phone}</span>
              </div>
              <div className="border-t border-orange-500/30 pt-3 flex justify-between">
                <span className="text-orange-400 font-bold">Итого:</span>
                <span className="text-orange-500 font-bold text-xl">{getTotalPrice()} р.</span>
              </div>
            </div>
            <div className="space-y-3">
              <button
                onClick={confirmBooking}
                disabled={isSubmitting}
                className="stalker-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Отправляем…' : 'Подтвердить'}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isSubmitting}
                className="w-full py-3 border border-orange-500/50 text-orange-500 rounded-lg hover:bg-orange-500/10 transition-all disabled:opacity-50"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Booking;

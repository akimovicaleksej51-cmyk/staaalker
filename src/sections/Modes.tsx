import { useEffect, useRef, useState } from 'react';
import { Flame, Sun, Baby, Check, X } from 'lucide-react';

const Modes = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const modes = [
    {
      icon: Flame,
      name: 'Стандартный режим',
      age: '14+',
      description: 'Базовый сюжет с полным погружением в атмосферу Зоны',
      features: [
        { text: 'Хоррор-элементы и скримеры', included: true },
        { text: 'Возможность добавить контакт', included: true },
        { text: 'Полное погружение в атмосферу', included: true },
        { text: 'Взаимодействие с актёрами', included: true },
        { text: 'Упрощённые задания', included: false },
        { text: 'Дополнительное освещение', included: false },
      ],
      color: 'orange',
      recommended: true,
    },
    {
      icon: Sun,
      name: 'Лайт режим',
      age: '12+',
      description: 'Облегчённая версия с меньшим уровнем страха',
      features: [
        { text: 'Хоррор-элементы и скримеры', included: false },
        { text: 'Возможность добавить контакт', included: true },
        { text: 'Полное погружение в атмосферу', included: true },
        { text: 'Взаимодействие с актёрами', included: true },
        { text: 'Упрощённые задания', included: true },
        { text: 'Дополнительное освещение', included: true },
      ],
      color: 'yellow',
      recommended: false,
    },
    {
      icon: Baby,
      name: 'Детский режим',
      age: '10+',
      description: 'Изменённый сюжет с минимальным количеством хоррор-элементов',
      features: [
        { text: 'Хоррор-элементы и скримеры', included: false },
        { text: 'Сопровождение аниматора', included: true },
        { text: 'Изменённый сюжет', included: true },
        { text: 'Взаимодействие с актёрами', included: true },
        { text: 'Упрощённые задания', included: true },
        { text: 'Дополнительное освещение', included: true },
      ],
      color: 'green',
      recommended: false,
    },
  ];

  const scrollToBooking = () => {
    const element = document.querySelector('#booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="modes"
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
          <h2 className="text-3xl md:text-5xl font-bold text-gradient mb-4">
            РЕЖИМЫ ИГРЫ
          </h2>
          <div className="hazard-divider mb-4"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Выбери свой путь в Зоне. Режим можно указать при бронировании либо непосредственно перед игрой.
          </p>
        </div>

        {/* Modes Grid */}
        <div
          className={`grid md:grid-cols-3 gap-6 lg:gap-8 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {modes.map((mode, index) => (
            <div
              key={index}
              className={`relative stalker-card p-6 flex flex-col ${
                mode.recommended ? 'border-orange-500/60 scale-105 md:scale-110' : ''
              }`}
            >
              {mode.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-orange-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                  РЕКОМЕНДУЕМ
                </div>
              )}

              <div className="text-center mb-6">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    mode.color === 'orange'
                      ? 'bg-orange-500/20'
                      : mode.color === 'yellow'
                      ? 'bg-yellow-500/20'
                      : 'bg-green-500/20'
                  }`}
                >
                  <mode.icon
                    className={`w-8 h-8 ${
                      mode.color === 'orange'
                        ? 'text-orange-500'
                        : mode.color === 'yellow'
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`}
                  />
                </div>
                <h3 className="text-xl font-bold text-orange-400 mb-2">{mode.name}</h3>
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                    mode.color === 'orange'
                      ? 'bg-orange-500/20 text-orange-400'
                      : mode.color === 'yellow'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {mode.age}
                </div>
              </div>

              <p className="text-gray-400 text-center mb-6 text-sm">{mode.description}</p>

              <div className="space-y-3 mb-6 flex-grow">
                {mode.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-center space-x-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-300' : 'text-gray-500'}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={scrollToBooking}
                className={`w-full py-3 rounded-lg font-bold transition-all duration-300 ${
                  mode.recommended
                    ? 'stalker-btn'
                    : 'border border-orange-500/50 text-orange-500 hover:bg-orange-500/10'
                }`}
              >
                Выбрать режим
              </button>
            </div>
          ))}
        </div>

        {/* Note */}
        <div
          className={`mt-12 text-center transition-all duration-700 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="text-gray-500 text-sm">
            Детские команды могут играть самостоятельно без сопровождения родителей в самой игре.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Modes;

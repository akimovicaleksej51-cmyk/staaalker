import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

const Location = () => {
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
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="location" ref={sectionRef} className="py-20 md:py-32 bg-black relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MapPin className="w-6 h-6 text-orange-500" />
            <h2 className="text-3xl md:text-5xl font-bold text-gradient">
              КАК ДО НАС ДОБРАТЬСЯ
            </h2>
          </div>
          <div className="hazard-divider"></div>
        </div>

        <div
          className={`grid lg:grid-cols-3 gap-6 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="stalker-card p-6 flex flex-col justify-center space-y-6">
            <div>
              <div className="text-orange-400 font-bold text-sm uppercase tracking-wide mb-1">Адрес</div>
              <div className="text-2xl font-bold text-white">ул. Тимирязева, 9/12</div>
              <div className="text-gray-400">Минск, Беларусь</div>
            </div>
            <a
              href="https://yandex.by/maps/?text=Минск%20ул.%20Тимирязева%209/12"
              target="_blank"
              rel="noopener noreferrer"
              className="stalker-btn inline-flex items-center justify-center space-x-2 w-full"
            >
              <Navigation className="w-5 h-5" />
              <span>Построить маршрут</span>
            </a>
            <p className="text-sm text-gray-500">
              Заходите точно ко времени брони — раньше начинать не получится, инструктаж занимает несколько минут.
            </p>
          </div>

          <div className="lg:col-span-2 rounded-lg overflow-hidden border border-orange-500/30 h-80 lg:h-auto">
            <iframe
              title="Карта проезда"
              src="https://yandex.by/map-widget/v1/?text=Минск%2C%20ул.%20Тимирязева%209%2F12&z=16"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ minHeight: '320px' }}
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;

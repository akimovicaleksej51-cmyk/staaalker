import { Phone, MapPin, Mail, Clock, Instagram, Send } from 'lucide-react';

// Custom TikTok Icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const Footer = () => {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-zinc-950 border-t border-orange-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <span className="text-2xl font-bold text-orange-500 font-['Orbitron'] glow-text">
                S.T.A.L.K.E.R.
              </span>
              <span className="block text-lg text-orange-400 font-['Orbitron']">
                Сердце Зоны
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Перфоманс от Questhub. Зона — не место для слабых. Здесь всё живое либо охотится, 
              либо прячется. Ты готов шагнуть за Периметр?
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/questhub.by?igsh=NXJpanpzeG13dG5x"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.tiktok.com/@questhub.by?_r=1&_t=ZS-94rwvYkjsRk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300"
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </a>
              <a
                href="https://t.me/queststalker"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-black transition-all duration-300"
                aria-label="Telegram"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-orange-400 font-bold mb-4">Навигация</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('#about')}
                  className="text-gray-400 hover:text-orange-400 transition-colors"
                >
                  О квесте
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#gallery')}
                  className="text-gray-400 hover:text-orange-400 transition-colors"
                >
                  Галерея
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#modes')}
                  className="text-gray-400 hover:text-orange-400 transition-colors"
                >
                  Режимы игры
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#reviews')}
                  className="text-gray-400 hover:text-orange-400 transition-colors"
                >
                  Отзывы
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#booking')}
                  className="text-gray-400 hover:text-orange-400 transition-colors"
                >
                  Бронирование
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('#game')}
                  className="text-gray-400 hover:text-orange-400 transition-colors"
                >
                  Мини-игра
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-orange-400 font-bold mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="tel:+375336863079"
                  className="flex items-center space-x-3 text-gray-400 hover:text-orange-400 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>+375 (33) 686-30-79</span>
                </a>
              </li>
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>ул. Тимирязева, 9<br />Минск, Беларусь</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-5 h-5" />
                <span>questhub@mail.ru</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Clock className="w-5 h-5" />
                <span>Ежедневно: 10:00 - 23:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-orange-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm text-center md:text-left">
              <p>© 2026 S.T.A.L.K.E.R. Сердце Зоны. Все права защищены.</p>
              <p className="mt-1">
                Услугу оказывает ООО Геймстудио Лайв, УНП 193729432
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Рейтинг: 9.9/10</span>
              <span>•</span>
              <span>408 отзывов</span>
              <span>•</span>
              <span>№1 в общем рейтинге</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radiation Warning */}
      <div className="bg-orange-500/10 border-t border-orange-500/30 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-orange-500/60 text-xs">
            ⚠️ ВНИМАНИЕ: Выход за Периметр может быть опасен для жизни. В Зоне каждый шаг может стать последним.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

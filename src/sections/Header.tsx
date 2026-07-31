import { useState, useEffect } from 'react';
import { Menu, X, Phone, MapPin } from 'lucide-react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#about', label: 'О квесте' },
    { href: '#gallery', label: 'Галерея' },
    { href: '#modes', label: 'Режимы' },
    { href: '#reviews', label: 'Отзывы' },
    { href: '#booking', label: 'Бронирование' },
    { href: '#game', label: 'Игра' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-md border-b border-orange-500/30'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center space-x-2"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span className="text-xl md:text-2xl font-bold text-orange-500 font-['Orbitron'] glow-text">
              S.T.A.L.K.E.R.
            </span>
            <span className="hidden sm:inline text-sm text-orange-400 font-['Orbitron']">
              Сердце Зоны
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-orange-400 hover:text-orange-300 transition-colors duration-200 text-sm font-medium"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Contact Info */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="tel:+375336863079"
              className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">+375 (33) 686-30-79</span>
            </a>
            <button
              onClick={() => scrollToSection('#booking')}
              className="stalker-btn text-sm py-2 px-4"
            >
              Забронировать
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-orange-500 p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-black/98 border-t border-orange-500/30">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="block w-full text-left text-orange-400 hover:text-orange-300 py-2 text-lg"
              >
                {link.label}
              </button>
            ))}
            <div className="pt-4 border-t border-orange-500/30 space-y-3">
              <a
                href="tel:+375336863079"
                className="flex items-center space-x-2 text-orange-400"
              >
                <Phone className="w-5 h-5" />
                <span>+375 (33) 686-30-79</span>
              </a>
              <div className="flex items-center space-x-2 text-orange-400">
                <MapPin className="w-5 h-5" />
                <span>ул. Тимирязева, 9/12</span>
              </div>
              <button
                onClick={() => scrollToSection('#booking')}
                className="stalker-btn w-full text-center"
              >
                Забронировать
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

const Gallery = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [clickedThumb, setClickedThumb] = useState<number | null>(null);

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

  // Подписи оставлены только в alt (для доступности/SEO) — на самих фото они не показываются.
  const images = [
    { src: '/images/quest-real-1.jpg', alt: 'Актёр рассматривает записи о мутантах на стене' },
    { src: '/images/quest-real-2.jpg', alt: 'Конфликт у барной стойки в Зоне' },
    { src: '/images/quest-real-3.jpg', alt: 'Сталкер выглядывает из-под тента' },
    { src: '/images/quest-real-4.jpg', alt: 'Боец в противогазе патрулирует базу' },
    { src: '/images/quest-real-5.jpg', alt: 'Оружие направлено на пленного в противогазе' },
    { src: '/images/quest-real-6.jpg', alt: 'Сталкер с автоматом в дыму' },
    { src: '/images/quest-real-7.jpg', alt: 'Фигура в капюшоне со светящимся артефактом' },
    { src: '/images/quest-real-8.jpg', alt: 'Бармен за стойкой «100 рентген»' },
  ];

  const selectImage = (index: number) => {
    if (index === activeIndex) return;
    setClickedThumb(index);
    setActiveIndex(index);
    window.setTimeout(() => setClickedThumb(null), 350);
  };

  const goPrev = () => selectImage(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  const goNext = () => selectImage(activeIndex === images.length - 1 ? 0 : activeIndex + 1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, activeIndex]);

  return (
    <section id="gallery" ref={sectionRef} className="py-20 md:py-32 bg-black relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Camera className="w-6 h-6 text-orange-500" />
            <h2 className="text-3xl md:text-5xl font-bold text-gradient">ГАЛЕРЕЯ</h2>
          </div>
          <div className="hazard-divider mb-4"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">Загляни в Зону до того, как шагнёшь за Периметр</p>
        </div>

        {/* Главное фото — карусель с кроссфейдом и лёгким масштабированием */}
        <div
          className={`relative overflow-hidden rounded border border-orange-500/30 h-[320px] sm:h-[420px] md:h-[520px] mb-4 transition-all duration-700 delay-150 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {images.map((image, index) => (
            <img
              key={image.src}
              src={image.src}
              alt={image.alt}
              onClick={() => setLightboxOpen(true)}
              className={`absolute inset-0 w-full h-full object-cover cursor-zoom-in transition-all duration-500 ease-out ${
                index === activeIndex
                  ? 'opacity-100 scale-100'
                  : 'opacity-0 scale-105 pointer-events-none'
              }`}
            />
          ))}

          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-orange-400 flex items-center justify-center hover:bg-black/80 hover:text-orange-300 transition-colors"
            aria-label="Предыдущее фото"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 text-orange-400 flex items-center justify-center hover:bg-black/80 hover:text-orange-300 transition-colors"
            aria-label="Следующее фото"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="absolute bottom-3 right-4 text-xs text-gray-300 bg-black/60 px-2 py-1 rounded font-data">
            {activeIndex + 1} / {images.length}
          </div>
        </div>

        {/* Лента миниатюр — клик анимированно перемещает фото в главное окно */}
        <div
          className={`flex gap-2 overflow-x-auto pb-2 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {images.map((image, index) => (
            <button
              key={image.src}
              onClick={() => selectImage(index)}
              className={`shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded overflow-hidden border-2 transition-all duration-300 ${
                index === activeIndex
                  ? 'border-orange-500 opacity-100'
                  : 'border-transparent opacity-60 hover:opacity-90'
              } ${clickedThumb === index ? 'scale-90' : 'scale-100'}`}
            >
              <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-orange-500 hover:text-orange-400 z-10"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-400 z-10"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-400 z-10"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          >
            <ChevronRight className="w-10 h-10" />
          </button>
          <div className="max-w-5xl max-h-[80vh] px-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[activeIndex].src}
              alt={images[activeIndex].alt}
              className="max-w-full max-h-[80vh] object-contain rounded border border-orange-500/30"
            />
            <p className="text-center text-gray-500 text-sm mt-4 font-data">
              {activeIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;

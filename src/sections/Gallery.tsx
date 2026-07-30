import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
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

  const images = [
    { src: '/images/stalker-1.jpg', alt: 'Актёр в противогазе' },
    { src: '/images/stalker-2.webp', alt: 'Бар 100 рентген' },
    { src: '/images/stalker-3.jpg', alt: 'Артефакт в руках' },
    { src: '/images/stalker-4.webp', alt: 'Игрок с оружием' },
    { src: '/images/stalker-5.jpg', alt: 'Сталкер с оружием' },
    { src: '/images/stalker-6.jpg', alt: 'Актёр в противогазе за решёткой' },
    { src: '/images/stalker-7.jpg', alt: 'Мутант в Зоне' },
    { src: '/images/stalker-8.webp', alt: 'Конфликт в баре' },
    { src: '/images/stalker-9.jpg', alt: 'Вход в квест' },
    { src: '/images/stalker-10.jpg', alt: 'Сталкер с гранатомётом' },
  ];

  const openLightbox = (index: number) => {
    setSelectedImage(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  const goToNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === images.length - 1 ? 0 : selectedImage + 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage !== null) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') goToPrevious();
        if (e.key === 'ArrowRight') goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="py-20 md:py-32 bg-black relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Camera className="w-6 h-6 text-orange-500" />
            <h2 className="text-3xl md:text-5xl font-bold text-gradient font-['Orbitron']">
              ГАЛЕРЕЯ
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Загляни в Зону до того, как шагнешь за Периметр
          </p>
        </div>

        {/* Gallery Grid */}
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative group cursor-pointer overflow-hidden rounded-lg border border-orange-500/30 ${
                index === 0 || index === 5 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
              onClick={() => openLightbox(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-48 md:h-64 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-orange-400 text-sm font-medium">{image.alt}</p>
                </div>
              </div>
              <div className="absolute inset-0 border-2 border-orange-500/0 group-hover:border-orange-500/50 transition-all duration-300 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 text-orange-500 hover:text-orange-400 z-10"
            onClick={closeLightbox}
          >
            <X className="w-8 h-8" />
          </button>

          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-400 z-10"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500 hover:text-orange-400 z-10"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight className="w-10 h-10" />
          </button>

          <div
            className="max-w-5xl max-h-[80vh] px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg border border-orange-500/30"
            />
            <p className="text-center text-orange-400 mt-4">
              {images[selectedImage].alt}
            </p>
            <p className="text-center text-gray-500 text-sm mt-2">
              {selectedImage + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;

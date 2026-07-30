import { useEffect, useRef } from 'react';
import { Clock, Users, Star, AlertTriangle, ChevronDown } from 'lucide-react';

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(249, 115, 22, ${particle.opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const scrollToBooking = () => {
    const element = document.querySelector('#booking');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAbout = () => {
    const element = document.querySelector('#about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/stalker-6.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black"></div>
      </div>

      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Radiation Warning */}
      <div className="absolute top-24 right-4 md:top-32 md:right-8 flex items-center space-x-2 text-yellow-500 animate-pulse">
        <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
        <span className="text-xs md:text-sm font-bold">РАДИАЦИОННАЯ ОПАСНОСТЬ</span>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <div className="mb-6">
          <span className="inline-block px-4 py-1 bg-orange-500/20 border border-orange-500/50 rounded-full text-orange-400 text-sm mb-4">
            Перфоманс от Questhub
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-4 font-['Orbitron']">
          <span className="text-gradient glow-text">S.T.A.L.K.E.R.</span>
        </h1>
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 font-['Orbitron'] text-orange-400">
          Сердце Зоны
        </h2>

        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          Зона — не место для слабых. Здесь всё живое либо охотится, либо прячется.
          Говорят, в самом сердце Зоны лежит артефакт, способный изменить судьбу.
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-10">
          <div className="stalker-card px-4 py-3 md:px-6 md:py-4 flex items-center space-x-2 md:space-x-3">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            <div className="text-left">
              <div className="text-lg md:text-xl font-bold text-orange-400">70 мин</div>
              <div className="text-xs text-gray-400">Длительность</div>
            </div>
          </div>

          <div className="stalker-card px-4 py-3 md:px-6 md:py-4 flex items-center space-x-2 md:space-x-3">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            <div className="text-left">
              <div className="text-lg md:text-xl font-bold text-orange-400">2-6</div>
              <div className="text-xs text-gray-400">Игроков</div>
            </div>
          </div>

          <div className="stalker-card px-4 py-3 md:px-6 md:py-4 flex items-center space-x-2 md:space-x-3">
            <Star className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            <div className="text-left">
              <div className="text-lg md:text-xl font-bold text-orange-400">9.9</div>
              <div className="text-xs text-gray-400">Рейтинг</div>
            </div>
          </div>

          <div className="stalker-card px-4 py-3 md:px-6 md:py-4 flex items-center space-x-2 md:space-x-3">
            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
            <div className="text-left">
              <div className="text-lg md:text-xl font-bold text-orange-400">14+</div>
              <div className="text-xs text-gray-400">Возраст</div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={scrollToBooking} className="stalker-btn text-lg w-full sm:w-auto">
            Забронировать игру
          </button>
          <button onClick={scrollToAbout} className="stalker-btn-outline text-lg w-full sm:w-auto">
            Подробнее
          </button>
        </div>

        {/* Price hint */}
        <div className="mt-6 text-orange-400/80 text-sm">
          От <span className="text-xl font-bold text-orange-500">110 р.</span> за команду
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToAbout}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-orange-500 animate-bounce"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
};

export default Hero;

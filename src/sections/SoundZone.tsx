import { useRef, useState } from 'react';
import { Volume2, Play, Pause } from 'lucide-react';

const SoundZone = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => setHasError(true));
      setIsPlaying(true);
    }
  };

  return (
    <section className="py-10 bg-zinc-950 border-y border-orange-500/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="stalker-card p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <button
            onClick={toggle}
            className="shrink-0 w-14 h-14 rounded-full bg-orange-500 text-black flex items-center justify-center hover:bg-orange-400 transition-colors"
            aria-label={isPlaying ? 'Остановить звук Зоны' : 'Услышать Зону'}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start space-x-2 text-orange-400 font-bold">
              <Volume2 className="w-4 h-4" />
              <span>Услышать Зону можно прямо сейчас</span>
            </div>
            <p className="text-gray-500 text-sm mt-1">
              Атмосферный звук из квеста — включите и почувствуйте, куда вы отправитесь
            </p>
            {hasError && (
              <p className="text-red-500 text-xs mt-1">Не удалось запустить звук. Попробуйте ещё раз.</p>
            )}
          </div>
        </div>
        <audio
          ref={audioRef}
          src="/audio/zone-ambient.mp3"
          onEnded={() => setIsPlaying(false)}
          preload="none"
        />
      </div>
    </section>
  );
};

export default SoundZone;

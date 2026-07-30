import { useState, useEffect, useCallback, useRef } from 'react';
import { Target, Trophy, RotateCcw, Zap, Crosshair } from 'lucide-react';
import { toast } from 'sonner';

interface Target {
  id: number;
  x: number;
  y: number;
  type: 'mutant' | 'anomaly' | 'artifact';
  points: number;
}

const MiniGame = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<Target[]>([]);
  const [highScore, setHighScore] = useState(0);
  const [gameArea, setGameArea] = useState({ width: 0, height: 0 });
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);

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

  useEffect(() => {
    if (gameAreaRef.current) {
      const rect = gameAreaRef.current.getBoundingClientRect();
      setGameArea({ width: rect.width, height: rect.height });
    }
  }, [gameStarted]);

  const spawnTarget = useCallback(() => {
    if (gameArea.width === 0 || gameArea.height === 0) return;

    const types: Array<{ type: 'mutant' | 'anomaly' | 'artifact'; points: number; emoji: string }> = [
      { type: 'mutant', points: 10, emoji: '🧟' },
      { type: 'anomaly', points: -5, emoji: '☢️' },
      { type: 'artifact', points: 50, emoji: '💎' },
    ];

    const randomType = types[Math.floor(Math.random() * types.length)];
    const newTarget: Target = {
      id: targetIdRef.current++,
      x: Math.random() * (gameArea.width - 60) + 30,
      y: Math.random() * (gameArea.height - 60) + 30,
      type: randomType.type,
      points: randomType.points,
    };

    setTargets((prev) => [...prev.slice(-4), newTarget]);
  }, [gameArea]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameStarted(false);
      if (score > highScore) {
        setHighScore(score);
        toast.success('Новый рекорд!', {
          description: `Вы набрали ${score} очков!`,
        });
      }
    }
    return () => clearInterval(interval);
  }, [gameStarted, timeLeft, score, highScore]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (gameStarted) {
      interval = setInterval(spawnTarget, 800);
    }
    return () => clearInterval(interval);
  }, [gameStarted, spawnTarget]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(30);
    setTargets([]);
    targetIdRef.current = 0;
  };

  const hitTarget = (target: Target) => {
    setScore((prev) => Math.max(0, prev + target.points));
    setTargets((prev) => prev.filter((t) => t.id !== target.id));

    if (target.type === 'artifact') {
      toast.success('Артефакт найден!', {
        description: '+50 очков!',
      });
    } else if (target.type === 'anomaly') {
      toast.error('Аномалия!', {
        description: '-5 очков! Будь осторожнее!',
      });
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type) {
      case 'mutant':
        return '🧟';
      case 'anomaly':
        return '☢️';
      case 'artifact':
        return '💎';
      default:
        return '❓';
    }
  };

  const getTargetColor = (type: string) => {
    switch (type) {
      case 'mutant':
        return 'border-red-500 bg-red-500/20';
      case 'anomaly':
        return 'border-yellow-500 bg-yellow-500/20';
      case 'artifact':
        return 'border-cyan-500 bg-cyan-500/20';
      default:
        return 'border-gray-500 bg-gray-500/20';
    }
  };

  return (
    <section
      id="game"
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
            <Target className="w-6 h-6 text-orange-500" />
            <h2 className="text-3xl md:text-5xl font-bold text-gradient font-['Orbitron']">
              ТРЕНИРОВКА СТРЕЛКА
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-orange-600 to-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Потренируй свою реакцию перед выходом в Зону. Уничтожай мутантов, избегай аномалий и собирай артефакты!
          </p>
        </div>

        {/* Game Container */}
        <div
          className={`max-w-3xl mx-auto transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="stalker-card p-4 md:p-6">
            {/* Game Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-400">Рекорд:</span>
                  <span className="text-orange-500 font-bold">{highScore}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-400">Счёт:</span>
                  <span className="text-orange-500 font-bold">{score}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-5 h-5 text-red-500" />
                <span className={`font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-orange-500'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Game Area */}
            <div
              ref={gameAreaRef}
              className="relative w-full h-80 md:h-96 bg-zinc-900 rounded-lg border-2 border-orange-500/30 overflow-hidden cursor-crosshair"
            >
              {!gameStarted && timeLeft === 30 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                  <Crosshair className="w-16 h-16 text-orange-500 mb-4" />
                  <h3 className="text-2xl font-bold text-orange-400 mb-2">Готов к выходу в Зону?</h3>
                  <p className="text-gray-400 text-center mb-6 px-4">
                    Кликай по мутантам 🧟 и артефактам 💎<br />
                    Избегай аномалий ☢️
                  </p>
                  <button onClick={startGame} className="stalker-btn">
                    Начать тренировку
                  </button>
                </div>
              )}

              {!gameStarted && timeLeft === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
                  <Trophy className="w-16 h-16 text-yellow-500 mb-4" />
                  <h3 className="text-2xl font-bold text-orange-400 mb-2">Тренировка завершена!</h3>
                  <p className="text-gray-400 text-center mb-2">Твой результат:</p>
                  <p className="text-4xl font-bold text-orange-500 mb-6">{score} очков</p>
                  <button onClick={startGame} className="stalker-btn flex items-center space-x-2">
                    <RotateCcw className="w-5 h-5" />
                    <span>Попробовать снова</span>
                  </button>
                </div>
              )}

              {gameStarted && targets.map((target) => (
                <button
                  key={target.id}
                  onClick={() => hitTarget(target)}
                  className={`absolute w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 ${getTargetColor(
                    target.type
                  )}`}
                  style={{
                    left: target.x,
                    top: target.y,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {getTargetIcon(target.type)}
                </button>
              ))}

              {/* Grid overlay for atmosphere */}
              <div className="absolute inset-0 pointer-events-none opacity-10">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(249, 115, 22, 0.3) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(249, 115, 22, 0.3) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                  }}
                ></div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-red-500/20 flex items-center justify-center">
                  🧟
                </div>
                <div className="text-sm">
                  <div className="text-gray-300">Мутант</div>
                  <div className="text-green-500 text-xs">+10 очков</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-yellow-500 bg-yellow-500/20 flex items-center justify-center">
                  ☢️
                </div>
                <div className="text-sm">
                  <div className="text-gray-300">Аномалия</div>
                  <div className="text-red-500 text-xs">-5 очков</div>
                </div>
              </div>
              <div className="flex items-center space-x-2 justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-500 bg-cyan-500/20 flex items-center justify-center">
                  💎
                </div>
                <div className="text-sm">
                  <div className="text-gray-300">Артефакт</div>
                  <div className="text-green-500 text-xs">+50 очков</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
  </svg>
);

export default MiniGame;

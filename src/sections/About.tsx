import { useEffect, useRef, useState } from 'react';
import { Skull, MapPin, CreditCard, AlertCircle, Info } from 'lucide-react';

const About = () => {
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

  const features = [
    {
      icon: Skull,
      title: 'Хоррор-элементы',
      description: 'Настоящая атмосфера страха со скримерами и актёрами',
    },
    {
      icon: MapPin,
      title: '180 м² площадь',
      description: 'Масштабные локации с детальной проработкой',
    },
    {
      icon: CreditCard,
      title: 'Оплата картой',
      description: 'Принимаем наличные и банковские карты',
    },
  ];

  const warnings = [
    'При опоздании более чем на 15 минут администратор вправе отменить игру',
    'Бронирование актуально только после подтверждения по номеру телефона',
    'На локации нет туалета',
    'Организатор вправе отказать в проведении мероприятия без объяснения причин',
  ];

  const restrictions = [
    'Запрещено находиться в состоянии алкогольного опьянения',
    'Нельзя играть под воздействием наркотических средств',
    'Противопоказано при травмах опорно-двигательного аппарата',
    'Нельзя при клаустрофобии или эпилепсии',
    'Противопоказано беременным девушкам',
  ];

  return (
    <section
      id="about"
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
            О КВЕСТЕ
          </h2>
          <div className="hazard-divider"></div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Description */}
          <div
            className={`space-y-6 transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <div className="stalker-card p-6 md:p-8">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Зона — не место для слабых. Здесь всё живое либо охотится, либо прячется. 
                А те, кто верят в удачу, давно гниют в воронках аномалий.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Но есть истории, которые не дают покоя. Говорят, в самом сердце Зоны лежит 
                артефакт, способный изменить судьбу. Одни готовы убивать за него, другие — 
                сгинуть, лишь бы не дать ему попасть в чужие руки.
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                Ты сделал свой выбор и шагнул за Периметр. Теперь только от тебя зависит, 
                кому верить, кого опасаться и какую цену ты готов заплатить за возможность 
                добраться до цели. Но помни — в Зоне каждый шаг может стать последним.
              </p>
            </div>

            {/* Features */}
            <div className="grid sm:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="stalker-card p-4 text-center hover:border-orange-500/60 transition-all duration-300"
                >
                  <feature.icon className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                  <h3 className="text-orange-400 font-bold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image & Stats */}
          <div
            className={`space-y-6 transition-all duration-700 delay-400 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="relative">
              <img
                src="/images/quest-real-6.jpg"
                alt="S.T.A.L.K.E.R. Сердце Зоны"
                className="w-full h-80 object-cover rounded-lg border border-orange-500/30"
                style={{ objectPosition: 'center 25%' }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg"></div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center justify-between">
                  <div className="text-orange-400 font-bold">Антуражный квест</div>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-white font-bold">№1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="stalker-card p-4 text-center">
                <div className="text-3xl font-bold text-orange-500 font-data">497</div>
                <div className="text-gray-400 text-sm">Оценок</div>
              </div>
              <div className="stalker-card p-4 text-center">
                <div className="text-3xl font-bold text-orange-500 font-data">422</div>
                <div className="text-gray-400 text-sm">Игроков прошли</div>
              </div>
              <div className="stalker-card p-4 text-center">
                <div className="text-3xl font-bold text-orange-500 font-data">9.9</div>
                <div className="text-gray-400 text-sm">Средняя оценка</div>
              </div>
              <div className="stalker-card p-4 text-center">
                <div className="text-3xl font-bold text-orange-500 font-data">3</div>
                <div className="text-gray-400 text-sm">Режима игры</div>
              </div>
            </div>
          </div>
        </div>

        {/* Warnings */}
        <div
          className={`mt-12 transition-all duration-700 delay-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="stalker-card p-6 border-yellow-500/30">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="w-5 h-5 text-yellow-500" />
              <h3 className="text-yellow-500 font-bold text-lg">Важная информация</h3>
            </div>
            <ul className="space-y-2">
              {warnings.map((warning, index) => (
                <li key={index} className="flex items-start space-x-2 text-gray-400">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-1 flex-shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Restrictions */}
        <div
          className={`mt-6 transition-all duration-700 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="stalker-card p-6 border-red-500/30">
            <div className="flex items-center space-x-2 mb-4">
              <Skull className="w-5 h-5 text-red-500" />
              <h3 className="text-red-500 font-bold text-lg">Противопоказания</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              {restrictions.map((restriction, index) => (
                <div key={index} className="flex items-start space-x-2 text-gray-400">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                  <span className="text-sm">{restriction}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Если игрок утаил данную информацию и она выяснилась в процессе игры, 
              сотрудники квеста не несут ответственность за полученные травмы и имеют 
              право моментально прекратить игру без возврата уплаченных средств.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;

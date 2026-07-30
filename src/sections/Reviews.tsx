import { useEffect, useRef } from 'react';
import { Star, MessageSquare, ThumbsUp, Quote, User } from 'lucide-react';

const Reviews = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Content is visible
        }
      },
      { threshold: 0.05, rootMargin: '50px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // Снимок отзывов с extrareality.by (страница квеста «S.T.A.L.K.E.R. Сердце Зоны»)
  // Обновлено вручную по состоянию на 29.07.2026. Для настоящего автообновления
  // нужен бэкенд-скрапер — см. REVIEWS_SYNC.md в корне проекта.
  const reviews = [
    {
      name: 'Наталья',
      level: 'Новичок',
      date: '24.07.2026',
      rating: 10,
      text: 'Море чистого адреналина, много смеялись и совсем забыли думать головой. Было страшно и очень активно — вышли безумно довольными, ребята-актёры супер, всем советуем сходить.',
      ratings: { антураж: 10, сюжет: 10, эмоции: 10, актёры: 10, обслуживание: 10 },
    },
    {
      name: 'Анастасия',
      level: 'Новичок',
      date: '23.07.2026',
      rating: 10,
      text: 'Очень понравилось: и актёры, и сама игра — в общем, всё на высоте.',
      ratings: { антураж: 10, сюжет: 10, эмоции: 10, актёры: 10, обслуживание: 10 },
    },
    {
      name: 'Полина',
      level: 'Новичок',
      date: '23.07.2026',
      rating: 10,
      text: 'Лучший квест, на котором я была — адреналин зашкаливает, очень страшно, но это того стоит.',
      ratings: { антураж: 10, сюжет: 10, эмоции: 10, актёры: 10, обслуживание: 10 },
    },
    {
      name: 'Элеонора',
      level: 'Новичок',
      date: '23.07.2026',
      rating: 10,
      text: 'Обалденные впечатления, очень страшно, а актёры невероятно харизматичные — однозначно рекомендую.',
      ratings: { антураж: 10, сюжет: 10, эмоции: 10, актёры: 10, обслуживание: 10 },
    },
    {
      name: 'Hufv',
      level: 'Новичок',
      date: '23.07.2026',
      rating: 10,
      text: 'Максимальные оценки по всем пунктам — антураж, сюжет, эмоции, игра актёров и сервис.',
      ratings: { антураж: 10, сюжет: 10, эмоции: 10, актёры: 10, обслуживание: 10 },
    },
  ];

  const ratingCategories = [
    { name: 'Антураж', rating: 9.9 },
    { name: 'Сюжет', rating: 9.9 },
    { name: 'Эмоции', rating: 9.9 },
    { name: 'Игра актеров', rating: 10 },
    { name: 'Обслуживание', rating: 9.9 },
  ];

  return (
    <section
      id="reviews"
      ref={sectionRef}
      className="py-20 md:py-32 bg-black relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageSquare className="w-6 h-6 text-orange-500" />
            <h2 className="text-3xl md:text-5xl font-bold text-gradient">
              ОТЗЫВЫ СТАЛКЕРОВ
            </h2>
          </div>
          <div className="hazard-divider mb-4"></div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Узнай, что говорят те, кто уже побывал в Зоне
          </p>
        </div>

        {/* Overall Rating */}
        <div className="mb-12">
          <div className="stalker-card p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <div className="text-6xl md:text-7xl font-bold text-orange-500 mb-2">9.9</div>
                <div className="text-xl text-gray-400 mb-4">Средняя оценка</div>
                <div className="flex items-center justify-center md:justify-start space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <div className="text-gray-500">На основе 497 оценок</div>
                <a
                  href="https://extrareality.by/quest/stalker-serdce-zony"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-500/70 hover:text-orange-400 underline underline-offset-2 mt-1 inline-block"
                >
                  Отзывы собраны с extrareality.by
                </a>
              </div>

              <div className="space-y-3">
                {ratingCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-400">{category.name}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
                          style={{ width: `${(category.rating / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-orange-500 font-bold w-8">{category.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Grid - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {reviews.map((review, index) => (
            <div key={index} className="stalker-card p-4 md:p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-orange-400 text-sm md:text-base truncate">{review.name}</div>
                    <div className="text-xs text-gray-500">
                      {review.level} • {review.date}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg md:text-xl font-bold text-orange-500">{review.rating}</span>
                </div>
              </div>

              <div className="relative mb-4">
                <Quote className="absolute -top-1 -left-1 w-5 h-5 md:w-6 md:h-6 text-orange-500/30" />
                <p className="text-gray-300 text-sm leading-relaxed pl-3 md:pl-4 break-words">{review.text}</p>
              </div>

              <div className="flex flex-wrap gap-2 pt-3 md:pt-4 border-t border-orange-500/20">
                {Object.entries(review.ratings).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-1 text-xs">
                    <span className="text-gray-500">{key}:</span>
                    <span className="text-orange-400 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="stalker-card p-4 text-center">
            <ThumbsUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-500">496</div>
            <div className="text-sm text-gray-400">Положительных отзывов</div>
          </div>
          <div className="stalker-card p-4 text-center">
            <MessageSquare className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-500">497</div>
            <div className="text-sm text-gray-400">Всего отзывов</div>
          </div>
          <div className="stalker-card p-4 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-500">100%</div>
            <div className="text-sm text-gray-400">Рекомендуют</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Reviews;

import { useState, useEffect } from 'react';
import Header from './sections/Header';
import Hero from './sections/Hero';
import About from './sections/About';
import Gallery from './sections/Gallery';
import Modes from './sections/Modes';
import Reviews from './sections/Reviews';
import Booking from './sections/Booking';
import MiniGame from './sections/MiniGame';
import Footer from './sections/Footer';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-center">
          <div className="text-6xl font-bold text-orange-500 mb-4 font-['Orbitron'] animate-pulse">
            S.T.A.L.K.E.R.
          </div>
          <div className="text-2xl text-orange-400 font-['Orbitron']">
            Сердце Зоны
          </div>
          <div className="mt-8 w-64 h-2 bg-zinc-800 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 animate-[loading_1.5s_ease-in-out_infinite]" 
                 style={{ width: '0%', animation: 'loading 1.5s ease-in-out forwards' }}></div>
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-orange-500 overflow-x-hidden">
      <div className="scanlines fixed inset-0 z-40 pointer-events-none opacity-30"></div>
      <Header />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Modes />
        <Reviews />
        <Booking />
        <MiniGame />
      </main>
      <Footer />
      <Toaster position="top-center" />
    </div>
  );
}

export default App;

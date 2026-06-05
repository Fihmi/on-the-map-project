import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, Ship, Sunrise, Tent, Flame, MapPin } from 'lucide-react';

interface PreloaderProps {
  images: string[];
  onComplete: () => void;
}

export const Preloader = ({ images, onComplete }: PreloaderProps) => {
  const [progress, setProgress] = useState(0);
  const [loadedCount, setLoadedCount] = useState(0);
  const [activeMessage, setActiveMessage] = useState('Preparing your Tunisian journey...');
  const [activeIcon, setActiveIcon] = useState<any>(Compass);

  // Set up dynamic messages and matching icons based on load percentage
  useEffect(() => {
    if (progress < 20) {
      setActiveMessage('Preparing your Tunisian journey...');
      setActiveIcon(() => Compass);
    } else if (progress < 40) {
      setActiveMessage('Unveiling the blue and white of Sidi Bou Said...');
      setActiveIcon(() => MapPin);
    } else if (progress < 60) {
      setActiveMessage('Sifting the golden sands of the Sahara...');
      setActiveIcon(() => Sunrise);
    } else if (progress < 75) {
      setActiveMessage('Catching the Mediterranean breeze at Kuriat Island...');
      setActiveIcon(() => Ship);
    } else if (progress < 90) {
      setActiveMessage('Setting up camp under the stars at Cap Serrat...');
      setActiveIcon(() => Tent);
    } else {
      setActiveMessage('Ready to explore boldly...');
      setActiveIcon(() => Flame);
    }
  }, [progress]);

  // Image preloading logic
  useEffect(() => {
    if (!images || images.length === 0) {
      setProgress(100);
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }

    let loaded = 0;
    const total = images.length;

    // Prevent scroll while loading
    document.body.style.overflow = 'hidden';

    const handleImageLoad = () => {
      loaded += 1;
      setLoadedCount(loaded);
      const percentage = Math.round((loaded / total) * 100);
      setProgress(percentage);
    };

    const imagePromises = images.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          handleImageLoad();
          resolve();
        };
        img.onerror = () => {
          handleImageLoad(); // Count error as loaded to not block the loader infinitely
          resolve();
        };
      });
    });

    Promise.all(imagePromises).then(() => {
      // Small buffer delay to display 100% complete state before callback
      const timer = setTimeout(() => {
        document.body.style.overflow = '';
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    });

    return () => {
      document.body.style.overflow = '';
    };
  }, [images, onComplete]);

  // Dynamically render Lucide Icon
  const IconComponent = activeIcon;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0, 
        scale: 1.05,
        transition: { duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }
      }}
      className="fixed inset-0 z-50 bg-[#0a0f1c] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Decorative premium glows matching LandingPage design */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Traditional ornament pattern background watermark */}
      <div className="absolute inset-0 opacity-[0.01] bg-[url('https://images.unsplash.com/photo-1548625361-ec06a202cdd4?auto=format&fit=crop&q=80')] bg-repeat bg-center mix-blend-overlay"></div>

      <div className="relative z-10 flex flex-col items-center max-w-md px-6 text-center">
        {/* Glowing Central Spinning Icon */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-teal-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse"></div>
          <div className="relative w-28 h-28 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-full flex items-center justify-center shadow-2xl">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="text-orange-500"
            >
              <IconComponent className="w-12 h-12 text-gradient bg-gradient-to-tr from-orange-400 to-amber-300" />
            </motion.div>
          </div>
        </div>



        {/* Dynamic Traveling Message */}
        <div className="h-12 flex items-center justify-center mb-6">
          <motion.p
            key={activeMessage}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-slate-200 text-sm font-medium leading-relaxed drop-shadow"
          >
            {activeMessage}
          </motion.p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-64 md:w-80 h-1.5 bg-slate-950/60 backdrop-blur border border-white/5 rounded-full overflow-hidden mb-3 relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-teal-500 rounded-full relative shadow-[0_0_12px_rgba(234,88,12,0.4)]"
          />
        </div>

        {/* Progress details */}
        <div className="flex justify-between w-64 md:w-80 text-[10px] font-bold text-slate-500 tracking-wider">
          <span>{loadedCount} / {images.length} ASSETS</span>
          <span className="text-orange-400">{progress}%</span>
        </div>
      </div>
    </motion.div>
  );
};

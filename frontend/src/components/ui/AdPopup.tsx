import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Map } from 'lucide-react';

export const AdPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the ad after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full relative"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Top Image / Header */}
            <div className="h-48 bg-gradient-to-r from-orange-500 to-amber-500 relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
              <div className="relative z-10 text-center text-white px-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md mb-3">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-widest drop-shadow-md">
                  Limited Offer
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 text-center bg-white">
              <h4 className="text-2xl font-bold text-slate-800 mb-2">
                Don't Miss Out!
              </h4>
              <p className="text-slate-600 mb-6 text-lg">
                Explore <strong className="text-orange-600 font-bold">all included trips</strong> for just
              </p>
              
              <div className="flex justify-center items-end gap-1 mb-8">
                <span className="text-3xl font-bold text-slate-400">€</span>
                <span className="text-7xl font-black text-slate-900 leading-none tracking-tighter">200</span>
                <span className="text-slate-500 font-medium pb-2">/person</span>
              </div>

              <button 
                onClick={() => setIsVisible(false)}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <Map className="w-5 h-5" />
                Explore Now
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

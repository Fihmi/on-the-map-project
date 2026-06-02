import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Trip } from '../../data/trips';
import { tripsData } from '../../data/trips';
import { getDeadline, Countdown } from './Countdown';
import { X, ChevronRight } from 'lucide-react';

export const NearestTripPopup = ({ onTripClick }: { onTripClick: (trip: Trip) => void }) => {
  const [nearestTrip, setNearestTrip] = useState<Trip | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let closestTrip: Trip | null = null;
    let closestTime = Infinity;

    const now = new Date().getTime();

    tripsData.forEach((trip) => {
      const deadline = getDeadline(trip.date);
      if (deadline) {
        const timeDiff = deadline.getTime() - now;
        if (timeDiff > 0 && timeDiff < closestTime) {
          closestTime = timeDiff;
          closestTrip = trip;
        }
      }
    });

    setNearestTrip(closestTrip);

    // Slide in after a short delay so it doesn't compete with page load
    const timer = setTimeout(() => setIsVisible(true), 3500);
    return () => clearTimeout(timer);
  }, []);

  if (!nearestTrip) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-5 right-5 z-40 w-[300px]"
        >
          <div
            onClick={() => onTripClick(nearestTrip)}
            className="relative cursor-pointer rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.25)] ring-1 ring-black/5"
          >
            {/* Trip Image */}
            <div className="h-[120px] relative">
              <img
                src={nearestTrip.images[0]}
                alt={nearestTrip.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="absolute top-2 right-2 w-6 h-6 bg-black/40 hover:bg-black/60 text-white/80 hover:text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <X size={12} />
              </button>

              {/* Countdown badge on image */}
              <div className="absolute bottom-2 left-3">
                <Countdown date={nearestTrip.date} />
              </div>
            </div>

            {/* Content */}
            <div className="bg-white px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-orange-600 uppercase tracking-wide mb-0.5">
                    Closing soon
                  </p>
                  <h4 className="font-bold text-slate-900 text-sm truncate">
                    {nearestTrip.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {nearestTrip.date}
                  </p>
                </div>
                <div className="shrink-0 w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center">
                  <ChevronRight size={14} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


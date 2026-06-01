import { useEffect, useState } from 'react';
import type { Trip } from '../../data/trips';
import { tripsData } from '../../data/trips';
import { getDeadline, Countdown } from './Countdown';
import { X, Bell } from 'lucide-react';

export const NearestTripPopup = ({ onTripClick }: { onTripClick: (trip: Trip) => void }) => {
  const [nearestTrip, setNearestTrip] = useState<Trip | null>(null);
  const [isVisible, setIsVisible] = useState(true);

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
  }, []);

  if (!nearestTrip || !isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 max-w-sm w-full relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#ff385c]" />
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
          }}
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0 text-orange-600 mt-1">
            <Bell size={20} className="animate-pulse" />
          </div>
          
          <div className="flex-1 min-w-0 pr-4">
            <h4 className="font-bold text-slate-900 text-sm mb-1">Registration Closing Soon!</h4>
            <p className="text-slate-500 text-xs mb-2 truncate" title={nearestTrip.title}>
              {nearestTrip.title}
            </p>
            <div className="mb-3 scale-90 origin-left">
              <Countdown date={nearestTrip.date} />
            </div>
            <button 
              onClick={() => onTripClick(nearestTrip)}
              className="text-xs font-bold text-[#ff385c] hover:text-[#d90b3e] uppercase tracking-wider"
            >
              View Details &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

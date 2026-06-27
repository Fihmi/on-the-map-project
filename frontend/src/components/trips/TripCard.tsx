import { Star, Crown } from 'lucide-react';
import type { Trip } from '../../data/trips';
import { ImageCarousel } from './ImageCarousel';
import { getDeadline } from './Countdown';

interface TripCardProps {
  trip: Trip;
  onClick: (trip: Trip) => void;
}

export const TripCard = ({ trip, onClick }: TripCardProps) => {
  const deadline = getDeadline(trip.date, trip.registrationClosed, trip.registrationDeadline);
  const isClosed = trip.registrationClosed || (deadline ? deadline.getTime() <= Date.now() : false);

  return (
    <div className={`flex flex-col cursor-pointer group relative transition-all duration-300 ${trip.isPremium
      ? 'hover:scale-[1.02] z-10 bg-white p-4 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100'
      : 'hover:scale-[1.02] p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md'
      }`} onClick={() => onClick(trip)}>
      <div className="relative mb-3">
        <ImageCarousel
          images={trip.images}
          className="w-full aspect-square sm:aspect-[4/3] rounded-xl object-cover"
          onImageClick={() => onClick(trip)}
        />
        {isClosed && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] rounded-xl flex items-center justify-center z-20">
            <span className="bg-red-600 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg border border-red-500 uppercase tracking-widest text-center max-w-[85%]">
              This Trip Is Fully Booked
            </span>
          </div>
        )}
        {trip.isPremium && !isClosed && (
          <div className="absolute top-3 left-3 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 z-10 border border-slate-100">
            <Crown size={14} className="text-rose-500" />
            Exceptional Trip
          </div>
        )}
        {trip.isCovered && (
          <div className="absolute top-3 right-3 bg-teal-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md z-10">
            On The Map Covered
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-slate-900 text-base leading-tight truncate pr-4">{trip.location}</h3>
          <div className="flex items-center space-x-1 text-slate-800 shrink-0">
            <Star size={14} className="fill-slate-800 text-slate-800" />
            <span className="text-sm font-light">{trip.rating}</span>
          </div>
        </div>

        <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">{trip.title}</p>

        <div className="mt-2 text-slate-900">
          <span className="font-semibold">€{trip.price}</span>
          <span className="text-slate-800 text-sm font-light"> /person</span>
        </div>
      </div>
    </div>
  );
};

import { Star, Crown } from 'lucide-react';
import type { Trip } from '../../data/trips';
import { ImageCarousel } from './ImageCarousel';

interface TripCardProps {
  trip: Trip;
  onClick: (trip: Trip) => void;
}

export const TripCard = ({ trip, onClick }: TripCardProps) => {
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
        {trip.isPremium && (
          <div className="absolute top-3 left-3 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1 z-10 border border-slate-100">
            <Crown size={14} className="text-rose-500" />
            Exceptional Trip
          </div>
        )}
        {trip.isCovered && (
          <div className="absolute top-3 right-3 bg-teal-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-md z-10">
            Traveland-TRIPS Covered
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

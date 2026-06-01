import { Search, SlidersHorizontal } from 'lucide-react';

export const TripFilters = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-4 border-b border-slate-200 mb-8">
      <div className="relative w-full md:max-w-md">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Where to?"
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow"
        />
      </div>
      
      <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
        {['Anywhere', 'Any week', 'Add guests'].map((filter, index) => (
          <button 
            key={index}
            className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:shadow-md transition-shadow whitespace-nowrap"
          >
            {filter}
          </button>
        ))}
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 hover:shadow-md transition-shadow">
          <SlidersHorizontal size={16} />
          Filters
        </button>
      </div>
    </div>
  );
};

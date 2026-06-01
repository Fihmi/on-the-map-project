import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface ImageCarouselProps {
  images: string[];
  className?: string;
  onImageClick?: () => void;
}

export const ImageCarousel = ({ images, className, onImageClick }: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return <div className={clsx("bg-slate-200 flex items-center justify-center", className)}>No Image</div>;
  }

  return (
    <div className={clsx("relative group overflow-hidden", className)}>
      <img
        src={images[currentIndex]}
        alt="Trip"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
        onClick={onImageClick}
      />
      
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={20} />
          </button>
          
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={clsx(
                  "h-1.5 rounded-full transition-all",
                  idx === currentIndex ? "bg-white w-4" : "bg-white/60 w-1.5"
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

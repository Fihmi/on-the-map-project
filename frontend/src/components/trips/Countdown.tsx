import { useEffect, useState } from 'react';

export const getDeadline = (dateString?: string, registrationClosed?: boolean, registrationDeadline?: string) => {
  if (registrationClosed) return new Date(0);
  if (registrationDeadline) {
    const customDeadline = new Date(registrationDeadline);
    if (!isNaN(customDeadline.getTime())) return customDeadline;
  }
  if (!dateString) return null;
  
  // Handle multi-day format like "August 1 & 2, 2026" by stripping the "& 2" part
  const cleanDateString = dateString.replace(/\s*&\s*\d+/, '');
  const tripDate = new Date(cleanDateString);
  
  if (isNaN(tripDate.getTime())) return null;
  // Subtract 15 days
  const deadline = new Date(tripDate.getTime() - 15 * 24 * 60 * 60 * 1000);
  return deadline;
};

export const Countdown = ({ date, registrationClosed, registrationDeadline }: { date?: string; registrationClosed?: boolean; registrationDeadline?: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isClosed: boolean } | null>(null);

  useEffect(() => {
    const deadline = getDeadline(date, registrationClosed, registrationDeadline);
    if (!deadline) return;

    const calculateTimeLeft = () => {
      const difference = deadline.getTime() - new Date().getTime();
      if (difference <= 0 || registrationClosed) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isClosed: true };
      }
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isClosed: false,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [date]);

  if (!timeLeft) return null;

  if (timeLeft.isClosed) {
    return (
      <div className="flex items-center gap-1 text-red-600 font-bold text-xs bg-red-50/90 backdrop-blur-sm px-2 py-1.5 rounded-md border border-red-200 shadow-sm">
        Registration Closed
      </div>
    );
  }

  return (
    <div className="flex gap-1 text-xs font-medium text-slate-700 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded-md border border-slate-200 shadow-sm">
      <span className="font-bold text-[#ff385c]">{timeLeft.days}d</span>
      <span className="font-bold text-[#ff385c]">{timeLeft.hours}h</span>
      <span className="font-bold text-[#ff385c]">{timeLeft.minutes}m</span>
      <span className="font-bold text-[#ff385c]">{timeLeft.seconds}s</span>
    </div>
  );
};

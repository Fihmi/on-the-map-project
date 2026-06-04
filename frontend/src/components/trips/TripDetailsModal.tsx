import type { Trip } from '../../data/trips';
import { X, Star, MapPin, Check, ArrowRight, Route, Calendar, User, Mail, Phone, Loader2, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import { Countdown, getDeadline } from './Countdown';

interface TripDetailsModalProps {
  trip: Trip | null;
  onClose: () => void;
}

export const TripDetailsModal = ({ trip, onClose }: TripDetailsModalProps) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const deadline = getDeadline(trip?.date);
  const [isClosed, setIsClosed] = useState(deadline ? deadline.getTime() <= new Date().getTime() : false);

  useEffect(() => {
    if (trip) {
      setSubmitSuccess(false);
      setSubmitError('');
      setFormData({ customerName: '', customerEmail: '', customerPhone: '' });
    }
  }, [trip?.id]);

  useEffect(() => {
    if (!deadline) return;
    const timer = setInterval(() => {
      setIsClosed(deadline.getTime() <= new Date().getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (trip) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [trip]);

  if (!trip) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">

        {/* Header / Close button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-900 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{trip.title}</h2>

          {trip.isCovered && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 font-medium text-sm mb-4 border border-teal-200">
              <Check size={16} className="text-teal-600" />
              Covered for On The Map exchange participants
            </div>
          )}

          <div className="flex items-center space-x-4 text-sm text-slate-600 mb-6">
            <div className="flex items-center font-medium text-slate-900">
              <Star size={16} className="fill-current mr-1" />
              <span>{trip.rating}</span>
              <span className="text-slate-500 font-normal ml-1">({trip.reviews} reviews)</span>
            </div>
            <div className="flex items-center text-slate-500">
              <MapPin size={16} className="mr-1" />
              <span className="underline">{trip.location}</span>
            </div>
          </div>

          {/* Image Gallery Grid */}
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] mb-8 rounded-xl overflow-hidden">
            <div className="col-span-2 row-span-2 relative group">
              <img src={trip.images[0]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Main view" />
            </div>
            {trip.images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative group overflow-hidden">
                <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={`View ${idx + 2}`} />
                {idx === 3 && trip.images.length > 5 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/50 transition-colors">
                    <span className="text-white font-medium text-lg">+{trip.images.length - 5} photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-10">
            {/* Left Content */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-900 mb-4">About this trip</h3>
              <p className="text-slate-600 leading-relaxed mb-8">
                {trip.description}
              </p>

              {trip.circuit && trip.circuit.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Route size={24} className="text-teal-600" />
                    Trip Circuit
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {trip.circuit.map((stop, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="font-medium bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">{stop}</span>
                        {idx < trip.circuit!.length - 1 && (
                          <ArrowRight size={16} className="text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 className="text-xl font-bold text-slate-900 mb-4">What this place offers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trip.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center text-slate-700">
                    <Check size={20} className="text-teal-600 mr-3" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Booking Card */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xl sticky top-6">
                <div className="mb-6">
                  <span className="text-2xl font-bold text-slate-900">€{trip.price}</span>
                  <span className="text-slate-500 text-sm"> / person</span>
                </div>

                <div className="mb-6 pb-6 border-b border-slate-200">
                  <div className="flex items-center text-slate-700 gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Trip Date</p>
                      <p className="font-semibold text-slate-900">{trip.date || 'To be announced'}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-slate-700 gap-3 mt-4">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Registration</p>
                      <div className="mt-1">
                        <Countdown date={trip.date} />
                      </div>
                    </div>
                  </div>
                </div>

                {submitSuccess ? (
                  <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center border border-green-200">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={24} className="text-green-600" />
                    </div>
                    <h4 className="font-bold text-lg mb-2">Reservation Confirmed!</h4>
                    <p className="text-sm mb-4">Thank you for booking. We will contact you shortly with details.</p>
                    <button
                      onClick={onClose}
                      className="text-green-700 font-semibold underline text-sm"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    setSubmitError('');
                    try {
                      await apiClient.post('/reservations', {
                        tripId: trip.id,
                        tripName: trip.title,
                        date: trip.date || new Date().toISOString(), // Use the fixed date of the trip
                        ...formData
                      });
                      setSubmitSuccess(true);
                      setFormData({ customerName: '', customerEmail: '', customerPhone: '' });
                    } catch (err: any) {
                      setSubmitError(err.response?.data?.message || 'Failed to submit reservation. Please try again.');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name</label>
                        <div className="relative">
                          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            required
                            type="text"
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                            placeholder="John Doe"
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            required
                            type="email"
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                            placeholder="john@example.com"
                            value={formData.customerEmail}
                            onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">WhatsApp Number</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            required
                            type="tel"
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                            placeholder="+216 55 123 456"
                            value={formData.customerPhone}
                            onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    {submitError && (
                      <div className="mb-4 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                        {submitError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting || isClosed}
                      className="w-full flex items-center justify-center bg-[#ff385c] hover:bg-[#d90b3e] disabled:bg-[#ff385c]/70 text-white font-bold py-3.5 rounded-lg transition-colors"
                    >
                      {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : isClosed ? 'Registration Closed' : 'Reserve Now'}
                    </button>
                    <p className="text-center text-slate-500 text-xs mt-4">You won't be charged yet</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

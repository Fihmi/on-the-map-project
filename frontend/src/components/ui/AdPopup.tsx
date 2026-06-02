import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Map, User, Mail, Phone, Check, Loader2 } from 'lucide-react';
import { apiClient } from '../../api/client';

export const AdPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    // Show the ad after 27 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 27000);

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
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full relative max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-4 right-4 z-10 bg-black/20 hover:bg-black/40 text-white rounded-full p-1.5 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Top Image / Header */}
            <div className="h-40 bg-gradient-to-r from-orange-500 to-amber-500 relative flex items-center justify-center">
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
              <div className="relative z-10 text-center text-white px-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md mb-3 border border-white/30">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest drop-shadow-md">
                  Limited Offer
                </h3>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 text-center bg-white">
              <h4 className="text-2xl font-bold text-slate-800 mb-2">
                Don't Miss Out!
              </h4>
              <p className="text-slate-600 mb-4 text-sm">
                Get <strong className="font-bold text-slate-800">ALL the trips</strong> (except Sahara) for a special discounted price!
              </p>
              
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-slate-400 line-through">€160</span>
                  <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Save €15</span>
                </div>
                <div className="flex justify-center items-end gap-1">
                  <span className="text-xl font-bold text-orange-500">€</span>
                  <span className="text-5xl font-black text-slate-900 leading-none tracking-tighter">145</span>
                  <span className="text-slate-500 font-medium pb-1 text-sm">/person</span>
                </div>
              </div>

              {submitSuccess ? (
                <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center border border-green-200">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Reservation Confirmed!</h4>
                  <p className="text-sm mb-4">Thank you for booking the Ultimate Package. We will contact you shortly with details.</p>
                  <button 
                    onClick={() => setIsVisible(false)}
                    className="text-green-700 font-semibold underline text-sm"
                  >
                    Close Window
                  </button>
                </div>
              ) : showForm ? (
                <form className="text-left" onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setSubmitError('');
                  try {
                    await apiClient.post('/reservations', {
                      tripId: 'pack-ultimate',
                      tripName: 'Ultimate Package (Except Sahara)',
                      date: 'Various',
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
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          required
                          type="text" 
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm" 
                          placeholder="Full Name"
                          value={formData.customerName}
                          onChange={e => setFormData({...formData, customerName: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          required
                          type="email" 
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm" 
                          placeholder="Email Address"
                          value={formData.customerEmail}
                          onChange={e => setFormData({...formData, customerEmail: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          required
                          type="tel" 
                          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm" 
                          placeholder="WhatsApp Number"
                          value={formData.customerPhone}
                          onChange={e => setFormData({...formData, customerPhone: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded-lg border border-red-100 text-center">
                      {submitError}
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (
                      <>
                        <Map className="w-5 h-5" />
                        Confirm Registration
                      </>
                    )}
                  </button>
                  <p className="text-center text-slate-500 text-xs mt-3">You won't be charged yet</p>
                </form>
              ) : (
                <button 
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <Map className="w-5 h-5" />
                  Claim Offer Now
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

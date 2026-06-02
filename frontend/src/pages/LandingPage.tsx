import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { TripCard } from '../components/trips/TripCard';
import { TripDetailsModal } from '../components/trips/TripDetailsModal';
import { NearestTripPopup } from '../components/trips/NearestTripPopup';
import { InstagramPhone } from '../components/ui/InstagramPhone';
import { AdPopup } from '../components/ui/AdPopup';
import { tripsData } from '../data/trips';
import type { Trip } from '../data/trips';
import { Map, Compass, Camera, User, Mail, Phone, Check, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';
import videoLanding from '../assets/video landing.mp4';

export const LandingPage = () => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [showPackForm, setShowPackForm] = useState(false);
  const [packFormData, setPackFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });
  const [isPackSubmitting, setIsPackSubmitting] = useState(false);
  const [packSubmitSuccess, setPackSubmitSuccess] = useState(false);
  const [packSubmitError, setPackSubmitError] = useState('');

  const heroImages = [
    tripsData[0]?.images[0] || '',
    tripsData[1]?.images[0] || '',
    tripsData[2]?.images[0] || '',
  ].filter(Boolean);

  useEffect(() => {
    if (heroImages.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroImages.length]);

  // Framer motion variants
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200 overflow-x-hidden relative">
      {/* Ambient background glows and Traditional Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Traditional Islamic/Tunisian geometric pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://images.unsplash.com/photo-1548625361-ec06a202cdd4?auto=format&fit=crop&q=80')] bg-repeat bg-center mix-blend-luminosity grayscale"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-900/80 z-10 mix-blend-multiply"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            src={videoLanding}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Hero Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="relative z-20 text-center px-4 max-w-4xl mx-auto mt-16"
        >
          <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight">
            The Magic of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f3e5ab] to-orange-400">Tunisia</span>
          </h1>
          <p className="text-xl md:text-3xl text-white/90 mb-12 font-medium drop-shadow-lg leading-relaxed max-w-3xl mx-auto">
            Experience the beauty, culture, and spirit of Tunisia.          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgba(234, 88, 12, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-10 py-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-full font-bold text-xl shadow-2xl transition-all flex items-center gap-3 mx-auto border border-orange-400/50"
          >
            <Compass className="w-6 h-6 animate-spin-slow" />
            Browse Trips or Start Exploring
          </motion.button>
        </motion.div>
      </div>

      {/* Features Section - Glassmorphism aesthetic */}
      <div className="pt-16 pb-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center"
          >
            <motion.div variants={fadeUp} className="flex flex-col items-center bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/5 hover:border-white/10 transition-colors group">
              <div className="w-20 h-20 bg-teal-500/10 border-2 border-teal-500/30 text-teal-400 rounded-[30px] rotate-3 flex items-center justify-center mb-6 shadow-sm group-hover:rotate-6 transition-transform">
                <Map className="w-10 h-10 -rotate-3" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-teal-400 transition-colors">Rich Heritage</h3>
              <p className="text-slate-400 leading-relaxed">Walk through ancient Roman amphitheaters and centuries-old medinas filled with artisan crafts.</p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col items-center bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/5 hover:border-white/10 transition-colors group">
              <div className="w-20 h-20 bg-orange-500/10 border-2 border-orange-500/30 text-orange-400 rounded-[30px] -rotate-3 flex items-center justify-center mb-6 shadow-sm group-hover:-rotate-6 transition-transform">
                <Camera className="w-10 h-10 rotate-3" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-orange-400 transition-colors">Breathtaking Views</h3>
              <p className="text-slate-400 leading-relaxed">Experience the stunning contrasts between the crystal Mediterranean coast and the vast Sahara desert.</p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-col items-center bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/5 hover:border-white/10 transition-colors group">
              <div className="w-20 h-20 bg-indigo-500/10 border-2 border-indigo-500/30 text-indigo-400 rounded-[30px] rotate-3 flex items-center justify-center mb-6 shadow-sm group-hover:rotate-6 transition-transform">
                <Compass className="w-10 h-10 -rotate-3" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-indigo-400 transition-colors">Curated Experiences</h3>
              <p className="text-slate-400 leading-relaxed">From luxury camping under the stars to coastal retreats, we curate the best Tunisian adventures.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Destinations and Map Section */}
      <div id="destinations" className="pt-8 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mb-16 text-center"
          >
            <span className="text-orange-400 font-bold tracking-widest uppercase text-sm mb-3 block drop-shadow-sm">Our Collection</span>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-xl">
              Featured Getaways
            </h2>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto drop-shadow-md">
              Select one of our premium trips below or explore regions on the interactive map.
            </p>
          </motion.div>

          <div className="flex flex-col gap-10">
            {/* Trip Cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {tripsData.map((trip) => (
                <motion.div variants={fadeUp} key={trip.id}>
                  <TripCard
                    trip={trip}
                    onClick={(trip) => setSelectedTrip(trip)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Limited Offer Banner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-white/20"
            >
              <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-white md:w-2/3">
                  <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md mb-4 text-sm font-bold uppercase tracking-wider border border-white/30">
                    <span className="animate-pulse mr-2">⏳</span> Limited Offer
                  </div>
                  <h3 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-md">
                    Don't Miss Out!
                  </h3>
                  <p className="text-xl md:text-2xl font-medium text-white/90 drop-shadow">
                    Experience the ultimate Tunisian adventure. You can get <strong className="font-black text-white">ALL the trips</strong> in our collection (except Sahara) for a special discounted price!
                  </p>
                </div>
                <div className="md:w-1/3 flex flex-col items-center">
                  <div className="bg-white text-slate-900 rounded-2xl p-6 text-center shadow-xl transform rotate-2 w-full max-w-sm">
                    <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Package</div>
                    
                    <div className="flex flex-col items-center mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-slate-400 line-through">€160</span>
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Save €15</span>
                      </div>
                      <div className="flex justify-center items-end gap-1">
                        <span className="text-2xl font-bold text-orange-500">€</span>
                        <span className="text-6xl font-black leading-none tracking-tighter text-slate-900">145</span>
                        <span className="text-slate-500 font-medium pb-1">/person</span>
                      </div>
                    </div>
                    {packSubmitSuccess ? (
                      <div className="bg-green-50 text-green-700 p-4 rounded-xl text-center border border-green-200 w-full mt-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Check size={20} className="text-green-600" />
                        </div>
                        <h4 className="font-bold text-base mb-1">Reservation Confirmed!</h4>
                        <p className="text-xs mb-3">Thank you for booking. We will contact you shortly.</p>
                        <button 
                          onClick={() => setPackSubmitSuccess(false)}
                          className="text-green-700 font-semibold underline text-xs"
                        >
                          Book another
                        </button>
                      </div>
                    ) : showPackForm ? (
                      <form className="text-left w-full mt-2" onSubmit={async (e) => {
                        e.preventDefault();
                        setIsPackSubmitting(true);
                        setPackSubmitError('');
                        try {
                          await apiClient.post('/reservations', {
                            tripId: 'pack-ultimate',
                            tripName: 'Ultimate Package (Except Sahara)',
                            date: 'Various',
                            ...packFormData
                          });
                          setPackSubmitSuccess(true);
                          setPackFormData({ customerName: '', customerEmail: '', customerPhone: '' });
                        } catch (err: any) {
                          setPackSubmitError(err.response?.data?.message || 'Failed to submit reservation.');
                        } finally {
                          setIsPackSubmitting(false);
                        }
                      }}>
                        <div className="space-y-2 mb-3">
                          <div className="relative">
                            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              required
                              type="text" 
                              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm" 
                              placeholder="Full Name"
                              value={packFormData.customerName}
                              onChange={e => setPackFormData({...packFormData, customerName: e.target.value})}
                            />
                          </div>
                          <div className="relative">
                            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              required
                              type="email" 
                              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm" 
                              placeholder="Email Address"
                              value={packFormData.customerEmail}
                              onChange={e => setPackFormData({...packFormData, customerEmail: e.target.value})}
                            />
                          </div>
                          <div className="relative">
                            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                              required
                              type="tel" 
                              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm" 
                              placeholder="WhatsApp Number"
                              value={packFormData.customerPhone}
                              onChange={e => setPackFormData({...packFormData, customerPhone: e.target.value})}
                            />
                          </div>
                        </div>

                        {packSubmitError && (
                          <div className="mb-3 text-red-600 text-xs bg-red-50 p-2 rounded-lg border border-red-100 text-center">
                            {packSubmitError}
                          </div>
                        )}

                        <button 
                          type="submit"
                          disabled={isPackSubmitting}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-md"
                        >
                          {isPackSubmitting ? <Loader2 size={16} className="animate-spin" /> : (
                            <>
                              <Map className="w-4 h-4" />
                              Confirm
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowPackForm(true)}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-md flex items-center justify-center gap-2"
                      >
                        <Map className="w-5 h-5" />
                        Claim Offer Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Instagram Section */}
      <div className="py-32 relative z-10 overflow-hidden">
        {/* Subtle glass background for the whole section */}
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xl border-y border-white/5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:w-1/2"
          >
            <div className="flex items-center gap-3 mb-6">
              <Camera className="w-10 h-10 text-[#f3e5ab]" />
              <span className="text-xl font-bold text-[#f3e5ab] tracking-widest uppercase drop-shadow-md">Social Media</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-tight drop-shadow-xl">
              Share the Beauty of Tunisia
            </h2>
            <p className="text-2xl text-cyan-50 mb-10 leading-relaxed font-light drop-shadow-md">
              Join our community of travelers. Tag your amazing experiences with <strong className="font-bold">#DiscoverTunisia</strong> to be featured on our official Instagram page!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-white text-[#164e63] rounded-full font-bold text-xl shadow-2xl hover:bg-gray-100 transition-colors border-2 border-white"
            >
              Follow @DiscoverTunisia
            </motion.button>
          </motion.div>

          <div className="lg:w-1/2 relative h-[700px] w-full flex justify-center items-center">
            {/* Phone 1: traveland.tn */}
            <motion.div
              initial={{ opacity: 0, y: 100, rotate: -10 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, type: "spring", bounce: 0.4 }}
              className="absolute z-10 -ml-40 mt-20"
            >
              <InstagramPhone
                username="traveland.tn"
                location="Tunisia"
                imageUrl={tripsData[0]?.images[1] || ''}
                likes={3412}
                caption=" 🌴 Explore the beauty of Tunisia with us! From the historic medinas to the golden beaches, we bring you the best deals and unforgettable experiences. #TravelandTN #TunisiaTravel"
                delay="0s"
              />
            </motion.div>
            {/* Phone 2: igv.hadrumet */}
            <motion.div
              initial={{ opacity: 0, y: -50, rotate: 10 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2, type: "spring", bounce: 0.4 }}
              className="absolute z-20 ml-40 -mt-20"
            >
              <InstagramPhone
                username="igv.hadrumet"
                location="Sousse, Tunisia"
                imageUrl={tripsData[2]?.images[0] || ''}
                likes={5821}
                caption=" 🌊 Feel the Mediterranean breeze at IGV Hadrumet. Your perfect getaway starts here. Book your relaxing coastal retreat today! #IGVHadrumet #Sousse #Tunisia"
                delay="-3s"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950/80 backdrop-blur-lg text-slate-400 py-16 text-center border-t border-white/10 relative z-10">
        <div className="flex justify-center gap-8 mb-8">
          <motion.div whileHover={{ scale: 1.2, rotate: 10 }} className="cursor-pointer">
            <Camera className="w-8 h-8 hover:text-orange-500 transition-colors" />
          </motion.div>
          <motion.div whileHover={{ scale: 1.2, rotate: -10 }} className="cursor-pointer">
            <Map className="w-8 h-8 hover:text-orange-500 transition-colors" />
          </motion.div>
        </div>
        <p className="text-lg">&copy; {new Date().getFullYear()} Discover Tunisia. All rights reserved.</p>
      </footer>

      {/* Trip Details Modal */}
      <TripDetailsModal
        trip={selectedTrip}
        onClose={() => setSelectedTrip(null)}
      />

      {/* Nearest Trip Popup */}
      <NearestTripPopup onTripClick={(trip) => setSelectedTrip(trip)} />

      {/* Limited Offer Ad */}
      <AdPopup />
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, MapPin, Mail, Phone, Home, ArrowLeft, Trash2, Plus, X, Package } from 'lucide-react';
import { apiClient } from '../api/client';
import { tripsData } from '../data/trips';

interface Reservation {
  _id: string;
  tripId: string;
  tripName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: string;
  createdAt: string;
}

export const AdminPage = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    status: 'Not Paid'
  });

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await apiClient.get('/reservations');
      setReservations(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.put(`/reservations/${id}/status`, { status: newStatus });
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    }
  };

  const deleteReservation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    try {
      await apiClient.delete(`/reservations/${id}`);
      setReservations(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      console.error('Error deleting reservation:', err);
      alert('Failed to delete reservation.');
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId) return;

    const trip = selectedTripId === 'pack-ultimate' 
      ? { id: 'pack-ultimate', title: 'Ultimate Package (Except Sahara)', date: 'Various' } as any
      : tripsData.find(t => t.id === selectedTripId);
    if (!trip) return;

    try {
      const response = await apiClient.post('/reservations', {
        tripId: trip.id,
        tripName: trip.title,
        date: trip.date || new Date().toISOString(),
        customerName: newClientData.customerName,
        customerEmail: newClientData.customerEmail,
        customerPhone: newClientData.customerPhone
      });

      // The backend creates it with default status. We update it if it's different.
      let createdReservation = response.data.reservation;
      
      if (newClientData.status !== createdReservation.status) {
         await apiClient.put(`/reservations/${createdReservation._id}/status`, { status: newClientData.status });
         createdReservation.status = newClientData.status;
      }

      setReservations(prev => [createdReservation, ...prev]);
      setIsAddModalOpen(false);
      setNewClientData({ customerName: '', customerEmail: '', customerPhone: '', status: 'Not Paid' });
    } catch (err) {
      console.error('Error adding client:', err);
      alert('Failed to add client.');
    }
  };

  const renderDashboard = () => {
    const tripCounts = tripsData.map(trip => {
      const tripReservations = reservations.filter(r => r.tripId === trip.id);
      return {
        ...trip,
        reservationCount: tripReservations.length
      };
    });

    const packReservations = reservations.filter(r => r.tripId === 'pack-ultimate');

    return (
      <div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Trip Dashboard</h2>
          <p className="text-slate-500 mt-2">Select a trip to view its registrations.</p>
        </div>

        {/* Ultimate Package Card */}
        <div className="mb-8">
          <div
            onClick={() => setSelectedTripId('pack-ultimate')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all group relative p-6 sm:p-8"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shrink-0">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Ultimate Package</h3>
                  <p className="text-white/80 text-sm mt-1">All trips except Sahara · <span className="line-through">€160</span> <span className="font-bold text-white">€145</span>/person</p>
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-xl px-6 py-3 text-center border border-white/30">
                <div className="text-xs font-bold text-white/80 uppercase tracking-widest">Bookings</div>
                <div className="text-4xl font-black text-white">{packReservations.length}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tripCounts.map(trip => (
            <div 
              key={trip.id} 
              onClick={() => setSelectedTripId(trip.id)}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:border-teal-300 group"
            >
              <div className="h-40 overflow-hidden relative">
                <div className="absolute inset-0 bg-slate-900/20 z-10 group-hover:bg-transparent transition-colors"></div>
                <img src={trip.images[0]} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{trip.title}</h3>
                <div className="flex items-center text-slate-500 text-sm mb-4">
                  <Calendar className="w-4 h-4 mr-2" />
                  {trip.date || 'TBD'}
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="text-sm font-medium text-slate-500">Registrations</div>
                  <div className="text-3xl font-black text-teal-600">{trip.reservationCount}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDetailedView = () => {
    const isPackView = selectedTripId === 'pack-ultimate';
    const trip = isPackView
      ? null
      : tripsData.find(t => t.id === selectedTripId);
    const tripReservations = reservations.filter(r => r.tripId === selectedTripId);

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setSelectedTripId(null)}
              className="flex items-center text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </button>
          </div>
          
          {isPackView ? (
            <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-2xl shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="h-20 w-20 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
                  <Package className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">Ultimate Package</h2>
                  <div className="flex items-center text-white/80 mt-2 gap-4">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> Various dates</span>
                    <span className="flex items-center text-white font-bold"><Users className="w-4 h-4 mr-1"/> {tripReservations.length} Bookings</span>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-xs font-bold border border-white/30">€145/person</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-xl overflow-hidden shrink-0">
                  <img src={trip?.images[0]} alt={trip?.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">{trip?.title}</h2>
                  <div className="flex items-center text-slate-500 mt-2 gap-4">
                    <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {trip?.date}</span>
                    <span className="flex items-center text-teal-600 font-bold"><Users className="w-4 h-4 mr-1"/> {tripReservations.length} Registrations</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {tripReservations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center mt-6">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No registrations yet</h3>
            <p className="text-slate-500">When users book this trip, they will appear here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Customer Name</th>
                    <th className="px-6 py-4 font-semibold">Contact Info</th>
                    <th className="px-6 py-4 font-semibold">Date Booked</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {tripReservations.map((res) => (
                    <tr key={res._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{res.customerName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-slate-600 mb-1.5">
                          <Mail className="w-4 h-4 mr-2 text-slate-400" />
                          {res.customerEmail}
                        </div>
                        <div className="flex items-center text-slate-600">
                          <Phone className="w-4 h-4 mr-2 text-slate-400" />
                          {res.customerPhone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(res.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={res.status}
                          onChange={(e) => updateStatus(res._id, e.target.value)}
                          className={`appearance-none outline-none inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer border-2 transition-colors ${
                            res.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200 hover:border-green-300 focus:ring-2 focus:ring-green-500' :
                            res.status === 'Not Paid' ? 'bg-red-50 text-red-700 border-red-200 hover:border-red-300 focus:ring-2 focus:ring-red-500' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200 hover:border-yellow-300 focus:ring-2 focus:ring-yellow-500'
                          }`}
                        >
                          <option value="Not Paid">Not Paid</option>
                          <option value="Pending">Pending</option>
                          <option value="Paid">Paid</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteReservation(res._id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50 inline-flex items-center justify-center"
                          title="Delete Reservation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add Client Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold text-slate-900">Add New Client</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleAddClient} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                    value={newClientData.customerName}
                    onChange={e => setNewClientData({...newClientData, customerName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                  <input 
                    required
                    type="email" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                    value={newClientData.customerEmail}
                    onChange={e => setNewClientData({...newClientData, customerEmail: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">WhatsApp Number</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                    value={newClientData.customerPhone}
                    onChange={e => setNewClientData({...newClientData, customerPhone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                  <select 
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500" 
                    value={newClientData.status}
                    onChange={e => setNewClientData({...newClientData, status: e.target.value})}
                  >
                    <option value="Not Paid">Not Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg font-bold transition-colors"
                  >
                    Save Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-teal-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center">
            {error}
          </div>
        ) : selectedTripId ? (
          renderDetailedView()
        ) : (
          renderDashboard()
        )}
      </main>
    </div>
  );
};

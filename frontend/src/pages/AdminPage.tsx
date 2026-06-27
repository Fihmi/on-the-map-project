import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, Mail, Phone, Home, ArrowLeft, Trash2, Plus, X, Package, Lock, Eye, EyeOff, FileDown, Loader2 } from 'lucide-react';
import { apiClient } from '../api/client';
import { generateReservationTicket } from '../utils/generateTicket';
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
  
  // Password Authentication States
  const [password, setPassword] = useState(() => sessionStorage.getItem('adminPassword') || '');
  const [isAuthorized, setIsAuthorized] = useState(() => !!sessionStorage.getItem('adminPassword'));
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trips' | 'clients'>('trips');
  const [clientSearchQuery, setClientSearchQuery] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientData, setNewClientData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    status: 'Not Paid'
  });

  useEffect(() => {
    if (!isAuthorized) return;
    
    // AbortController lets us cancel the in-flight request when the admin
    // navigates away, preventing a setState call on an unmounted component.
    const controller = new AbortController();

    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/reservations', {
          signal: controller.signal,
          headers: {
            'X-Admin-Password': password
          }
        });
        setReservations(response.data);
        setError(null);
      } catch (err: any) {
        // axios wraps AbortError as a CanceledError — ignore it on unmount
        if (err?.code !== 'ERR_CANCELED') {
          console.error('Error fetching reservations:', err);
          if (err.response?.status === 401) {
            sessionStorage.removeItem('adminPassword');
            setIsAuthorized(false);
            setLoginError('Session expired. Please log in again.');
          } else {
            setError('Failed to load reservations.');
          }
        }
      } finally {
        // Only clear the spinner when the request actually resolved/rejected
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchReservations();
    return () => controller.abort();
  }, [isAuthorized, password]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setLoginError('Password is required.');
      return;
    }

    setVerifying(true);
    setLoginError(null);
    try {
      await apiClient.get('/reservations', {
        headers: {
          'X-Admin-Password': passwordInput
        }
      });
      sessionStorage.setItem('adminPassword', passwordInput);
      setPassword(passwordInput);
      setIsAuthorized(true);
      setLoginError(null);
    } catch (err: any) {
      console.error('Admin verification error:', err);
      if (err.response?.status === 401) {
        setLoginError('Incorrect password.');
      } else {
        setLoginError('Could not verify credentials. Check server connection.');
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleDownloadTicket = async (res: Reservation) => {
    if (downloadingId) return; // prevent concurrent downloads
    setDownloadingId(res._id);
    try {
      await generateReservationTicket(res);
    } catch (err) {
      console.error('Failed to generate ticket PDF:', err);
      alert('Could not generate the ticket PDF. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };


  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await apiClient.put(`/reservations/${id}/status`, { status: newStatus }, {
        headers: { 'X-Admin-Password': password }
      });
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (err: any) {
      console.error('Error updating status:', err);
      if (err.response?.status === 401) {
        sessionStorage.removeItem('adminPassword');
        setIsAuthorized(false);
        setLoginError('Session expired. Please log in again.');
      } else {
        alert('Failed to update status.');
      }
    }
  };

  const deleteReservation = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;
    try {
      await apiClient.delete(`/reservations/${id}`, {
        headers: { 'X-Admin-Password': password }
      });
      setReservations(prev => prev.filter(r => r._id !== id));
    } catch (err: any) {
      console.error('Error deleting reservation:', err);
      if (err.response?.status === 401) {
        sessionStorage.removeItem('adminPassword');
        setIsAuthorized(false);
        setLoginError('Session expired. Please log in again.');
      } else {
        alert('Failed to delete reservation.');
      }
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
      }, {
        headers: { 'X-Admin-Password': password }
      });

      // The backend creates it with default status. We update it if it's different.
      let createdReservation = response.data.reservation;
      
      if (newClientData.status !== createdReservation.status) {
         await apiClient.put(`/reservations/${createdReservation._id}/status`, { status: newClientData.status }, {
           headers: { 'X-Admin-Password': password }
         });
         createdReservation.status = newClientData.status;
      }

      setReservations(prev => [createdReservation, ...prev]);
      setIsAddModalOpen(false);
      setNewClientData({ customerName: '', customerEmail: '', customerPhone: '', status: 'Not Paid' });
    } catch (err: any) {
      console.error('Error adding client:', err);
      if (err.response?.status === 401) {
        sessionStorage.removeItem('adminPassword');
        setIsAuthorized(false);
        setLoginError('Session expired. Please log in again.');
      } else {
        alert('Failed to add client.');
      }
    }
  };

  const getTripFinancials = (tripId: string, count: number, paidCount: number) => {
    let price = 0;
    let fixedCost = 0;
    let costPerPerson = 0;

    if (tripId === 'pack-ultimate') {
      price = 145;
      fixedCost = 400;
      costPerPerson = 60;
    } else {
      const trip = tripsData.find(t => t.id === tripId);
      price = trip?.price || 0;
      fixedCost = trip?.fixedCost || 0;
      costPerPerson = trip?.costPerPerson || 0;
    }

    const expectedIncome = count * price;
    const receivedIncome = paidCount * price;
    const totalCost = count > 0 ? (fixedCost + (count * costPerPerson)) : 0;
    const netProfit = receivedIncome - totalCost;

    return {
      price,
      fixedCost,
      costPerPerson,
      expectedIncome,
      receivedIncome,
      totalCost,
      netProfit
    };
  };

  const renderDashboard = () => {
    const tripCounts = tripsData.map(trip => {
      const tripReservations = reservations.filter(r => r.tripId === trip.id);
      const paidReservations = tripReservations.filter(r => r.status === 'Paid');
      const financials = getTripFinancials(trip.id, tripReservations.length, paidReservations.length);
      return {
        ...trip,
        reservationCount: tripReservations.length,
        financials
      };
    });

    const packReservations = reservations.filter(r => r.tripId === 'pack-ultimate');
    const packPaid = packReservations.filter(r => r.status === 'Paid');
    const packFinancials = getTripFinancials('pack-ultimate', packReservations.length, packPaid.length);

    // Overall Stats
    let grandExpectedIncome = 0;
    let grandReceivedIncome = 0;
    let grandTotalCost = 0;

    const tripIds = new Set(reservations.map(r => r.tripId));
    tripsData.forEach(t => tripIds.add(t.id));
    tripIds.add('pack-ultimate');

    tripIds.forEach(id => {
      const tripReservations = reservations.filter(r => r.tripId === id);
      const paidReservations = tripReservations.filter(r => r.status === 'Paid');
      const financials = getTripFinancials(id, tripReservations.length, paidReservations.length);
      
      grandExpectedIncome += financials.expectedIncome;
      grandReceivedIncome += financials.receivedIncome;
      grandTotalCost += financials.totalCost;
    });

    const grandNetProfit = grandReceivedIncome - grandTotalCost;

    return (
      <div>
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Trip Dashboard</h2>
            <p className="text-slate-500 mt-2">Select a trip to view its registrations and financials.</p>
          </div>
        </div>

        {/* Global Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Expected Income</div>
            <div className="text-2xl font-black text-slate-900 mt-1">€{grandExpectedIncome}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Received Income</div>
            <div className="text-2xl font-black text-green-600 mt-1">€{grandReceivedIncome}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Outcome (Costs)</div>
            <div className="text-2xl font-black text-red-500 mt-1">€{grandTotalCost}</div>
          </div>
          <div className={`p-5 rounded-2xl shadow-sm border ${
            grandNetProfit >= 0 ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'
          }`}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Net Profit (from Received)</div>
            <div className={`text-2xl font-black mt-1 ${grandNetProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              €{grandNetProfit}
            </div>
          </div>
        </div>

        {/* Ultimate Package Card */}
        <div className="mb-8">
          <div
            onClick={() => setSelectedTripId('pack-ultimate')}
            className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all group relative p-6 sm:p-8"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shrink-0">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Ultimate Package</h3>
                  <p className="text-white/80 text-sm mt-1">All trips except Sahara · <span className="line-through">€160</span> <span className="font-bold text-white">€145</span>/person</p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-white">
                <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-center border border-white/20">
                  <div className="text-[10px] font-bold text-white/80 uppercase">Bookings</div>
                  <div className="text-xl font-bold">{packReservations.length}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-center border border-white/20">
                  <div className="text-[10px] font-bold text-white/80 uppercase">Income</div>
                  <div className="text-xl font-bold">€{packFinancials.receivedIncome}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-center border border-white/20">
                  <div className="text-[10px] font-bold text-white/80 uppercase">Expenses</div>
                  <div className="text-xl font-bold">€{packFinancials.totalCost}</div>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-2 text-center border border-white/20">
                  <div className="text-[10px] font-bold text-white/80 uppercase">Profit</div>
                  <div className="text-xl font-bold">€{packFinancials.netProfit}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tripCounts.map(trip => (
            <div 
              key={trip.id} 
              onClick={() => setSelectedTripId(trip.id)}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all hover:border-teal-300 group flex flex-col justify-between"
            >
              <div>
                <div className="h-40 overflow-hidden relative">
                  <div className="absolute inset-0 bg-slate-900/20 z-10 group-hover:bg-transparent transition-colors"></div>
                  <img src={trip.images[0]} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                </div>
                <div className="p-6 pb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{trip.title}</h3>
                  <div className="flex items-center text-slate-500 text-sm mb-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    {trip.date || 'TBD'}
                  </div>

                  {/* Financials details on card */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Income</div>
                      <div className="text-xs font-bold text-slate-800">€{trip.financials.receivedIncome}</div>
                      <div className="text-[8px] text-slate-400">of €{trip.financials.expectedIncome}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Outcome</div>
                      <div className="text-xs font-bold text-slate-800">€{trip.financials.totalCost}</div>
                      <div className="text-[8px] text-slate-400">Fixed: €{trip.fixedCost}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase">Profit</div>
                      <div className={`text-xs font-black ${trip.financials.netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        €{trip.financials.netProfit}
                      </div>
                      <div className="text-[8px] text-slate-400">Net</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="text-xs font-semibold text-slate-500">Registrations</div>
                <div className="text-xl font-black text-teal-600">{trip.reservationCount}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderClientsSection = () => {
    // Group reservations by client
    const clientsMap: {
      [key: string]: {
        name: string;
        email: string;
        phone: string;
        reservations: Reservation[];
        totalPaid: number;
        totalUnpaid: number;
      };
    } = {};

    reservations.forEach((res) => {
      const emailKey = res.customerEmail && res.customerEmail !== 'N/A' ? res.customerEmail.toLowerCase().trim() : '';
      const phoneKey = res.customerPhone ? res.customerPhone.trim() : '';
      const key = emailKey || phoneKey || 'unknown';

      if (!clientsMap[key]) {
        clientsMap[key] = {
          name: res.customerName,
          email: res.customerEmail,
          phone: res.customerPhone,
          reservations: [],
          totalPaid: 0,
          totalUnpaid: 0,
        };
      }

      const client = clientsMap[key];
      client.reservations.push(res);

      let price = 0;
      if (res.tripId === 'pack-ultimate') {
        price = 145;
      } else {
        const trip = tripsData.find((t) => t.id === res.tripId);
        price = trip ? trip.price : 0;
      }

      if (res.status === 'Paid') {
        client.totalPaid += price;
      } else {
        client.totalUnpaid += price;
      }
    });

    const clientsList = Object.values(clientsMap);

    const filteredClients = clientsList.filter((client) => {
      const q = clientSearchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.phone.toLowerCase().includes(q)
      );
    });

    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Clients Directory</h2>
            <p className="text-slate-500 mt-2">Manage clients, track payments, and view booking history.</p>
          </div>
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search clients..."
              value={clientSearchQuery}
              onChange={(e) => setClientSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center mt-6">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No clients found</h3>
            <p className="text-slate-500">Try adjusting your search query or add a new reservation.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold w-1/4">Client Details</th>
                    <th className="px-6 py-4 font-semibold w-2/5">Booked Trips & Payment Status</th>
                    <th className="px-6 py-4 font-semibold text-center w-1/8">Total Paid</th>
                    <th className="px-6 py-4 font-semibold text-center w-1/8">Total Unpaid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredClients.map((client, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors align-top">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-base">{client.name}</div>
                        <div className="flex items-center text-slate-500 text-xs mt-1.5 animate-none">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                          {client.email}
                        </div>
                        <div className="flex items-center text-slate-500 text-xs mt-1 animate-none">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                          {client.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-3">
                          {client.reservations.map((res) => {
                            const tripPrice = res.tripId === 'pack-ultimate' ? 145 : (tripsData.find((t) => t.id === res.tripId)?.price || 0);
                            return (
                              <div key={res._id} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-slate-800 text-sm">{res.tripName}</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                                    <span>Date: {res.date}</span>
                                    <span>Price: €{tripPrice}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={res.status}
                                    onChange={(e) => updateStatus(res._id, e.target.value)}
                                    className={`appearance-none outline-none inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border-2 transition-colors ${
                                      res.status === 'Paid' ? 'bg-green-50 text-green-700 border-green-200 hover:border-green-300' :
                                      res.status === 'Not Paid' ? 'bg-red-50 text-red-700 border-red-200 hover:border-red-300' :
                                      'bg-yellow-50 text-yellow-700 border-yellow-200 hover:border-yellow-300'
                                    }`}
                                  >
                                    <option value="Not Paid">Not Paid</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                  </select>
                                  <button
                                    onClick={() => handleDownloadTicket(res)}
                                    disabled={!!downloadingId}
                                    className="inline-flex items-center justify-center p-1.5 bg-teal-50 hover:bg-teal-100 disabled:opacity-60 text-teal-700 border border-teal-200 rounded-lg transition-colors"
                                    title="Download PDF Ticket"
                                  >
                                    {downloadingId === res._id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <FileDown className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => deleteReservation(res._id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Booking"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 rounded-lg font-black text-sm">
                          €{client.totalPaid}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-3 py-1.5 rounded-lg font-black text-sm ${
                          client.totalUnpaid > 0 
                            ? 'bg-red-50 border border-red-200 text-red-700' 
                            : 'bg-slate-50 border border-slate-200 text-slate-500'
                        }`}>
                          €{client.totalUnpaid}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDetailedView = () => {
    const isPackView = selectedTripId === 'pack-ultimate';
    const trip = isPackView
      ? null
      : tripsData.find(t => t.id === selectedTripId);
    const tripReservations = reservations.filter(r => r.tripId === selectedTripId);
    const paidReservations = tripReservations.filter(r => r.status === 'Paid');
    const financials = getTripFinancials(selectedTripId || '', tripReservations.length, paidReservations.length);

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
                  <img src={trip?.images[0]} alt={trip?.title} className="w-full h-full object-cover" loading="lazy" />
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

          {/* Detailed Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-white px-5 py-4 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Revenue</div>
              <div className="text-lg font-black text-slate-800 mt-1">€{financials.expectedIncome}</div>
              <div className="text-[10px] text-slate-400">Total Bookings * Price</div>
            </div>
            <div className="bg-white px-5 py-4 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Collected Revenue</div>
              <div className="text-lg font-black text-green-600 mt-1">€{financials.receivedIncome}</div>
              <div className="text-[10px] text-slate-400">Paid Bookings * Price</div>
            </div>
            <div className="bg-white px-5 py-4 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expenses</div>
              <div className="text-lg font-black text-red-500 mt-1">€{financials.totalCost}</div>
              <div className="text-[10px] text-slate-400">Fixed: €{financials.fixedCost} + Variable: €{financials.costPerPerson * tripReservations.length}</div>
            </div>
            <div className={`px-5 py-4 rounded-xl border ${
              financials.netProfit >= 0 ? 'bg-green-50/20 border-green-200' : 'bg-red-50/20 border-red-200'
            }`}>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Net Profit</div>
              <div className={`text-lg font-black mt-1 ${financials.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                €{financials.netProfit}
              </div>
              <div className="text-[10px] text-slate-400">Collected - Expenses</div>
            </div>
          </div>
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
                    <th className="px-6 py-4 font-semibold text-center">Ticket</th>
                    <th className="px-6 py-4 font-semibold text-right">Delete</th>
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
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Download PDF */}
                          <button
                            onClick={() => handleDownloadTicket(res)}
                            disabled={!!downloadingId}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 disabled:opacity-60 disabled:cursor-wait text-teal-700 rounded-lg text-xs font-bold transition-colors border border-teal-200 hover:border-teal-300"
                            title="Download PDF Ticket"
                          >
                            {downloadingId === res._id
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <FileDown className="w-3.5 h-3.5" />}
                            {downloadingId === res._id ? 'Generating…' : 'PDF'}
                          </button>

                        </div>
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

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl text-white max-w-md w-full relative z-20 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-teal-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-teal-500/30 mb-4 shadow-[0_0_20px_rgba(20,184,166,0.3)]">
              <Lock className="w-8 h-8 text-teal-400" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white mb-2">Admin Portal</h2>
            <p className="text-slate-400 text-sm">Please enter the administrator password to view reservations and dashboard analytics.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10 transition-all"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 flex items-center gap-2 animate-pulse">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0"></div>
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={verifying}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {verifying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to public site
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 animate-in fade-in duration-300">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-teal-600">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('adminPassword');
                setPassword('');
                setIsAuthorized(false);
              }}
              className="flex items-center space-x-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation (only show when not in detailed view) */}
        {!selectedTripId && !loading && !error && (
          <div className="flex border-b border-slate-200 mb-8">
            <button
              onClick={() => setActiveTab('trips')}
              className={`py-4 px-6 font-semibold text-sm transition-all border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === 'trips'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Calendar className="w-4.5 h-4.5" />
              Trips Dashboard
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`py-4 px-6 font-semibold text-sm transition-all border-b-2 -mb-px flex items-center gap-2 ${
                activeTab === 'clients'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              Clients Directory
            </button>
          </div>
        )}

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
        ) : activeTab === 'clients' ? (
          renderClientsSection()
        ) : (
          renderDashboard()
        )}
      </main>
    </div>
  );
};


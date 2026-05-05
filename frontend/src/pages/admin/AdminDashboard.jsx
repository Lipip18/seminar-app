import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Building, Users, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const { api } = useContext(AuthContext);
  const [stats, setStats] = useState({ halls: 0, users: 0, bookingsPending: 0, bookingsApproved: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hallsRes, usersRes, bookingsRes] = await Promise.all([
          api.get('/halls?limit=1'),
          api.get('/users?limit=1'),
          api.get('/bookings?sort=-createdAt')
        ]);
        
        const allBookings = bookingsRes.data.data;
        const pending = allBookings.filter(b => b.status === 'Pending').length;
        const approved = allBookings.filter(b => b.status === 'Approved').length;

        setStats({
          halls: hallsRes.data.count,
          users: usersRes.data.count,
          bookingsPending: pending,
          bookingsApproved: approved
        });
        
        setRecentBookings(allBookings.slice(0, 5));
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  const updateBookingStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}`, { status });
      setRecentBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      // Update stats locally
      setStats(s => ({
         ...s,
         bookingsPending: status === 'Approved' || status === 'Rejected' ? s.bookingsPending - 1 : s.bookingsPending,
         bookingsApproved: status === 'Approved' ? s.bookingsApproved + 1 : s.bookingsApproved
      }));
      toast.success(`Booking ${status}`);
    } catch (err) {
      toast.error('Failed to update booking');
    }
  };

  if (loading) return <div className="text-white text-center py-20 animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-heading font-bold text-white">Dashboard Overview</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Halls', count: stats.halls, icon: Building, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
          { label: 'Total Users', count: stats.users, icon: Users, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
          { label: 'Pending Requests', count: stats.bookingsPending, icon: CreditCard, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
          { label: 'Approved Bookings', count: stats.bookingsApproved, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
        ].map((stat, i) => (
          <div key={i} className={`glass-panel border p-6 flex flex-col ${stat.bg}`}>
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-muted-foreground font-medium">{stat.label}</h3>
               <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-4xl font-bold text-white">{stat.count}</p>
          </div>
        ))}
      </div>

      {/* Recent Bookings Table */}
      <div className="glass-panel mt-8 overflow-hidden border border-white/5">
         <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold text-white">Recent Booking Requests</h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-muted-foreground uppercase bg-white/[0.01]">
                  <th className="px-6 py-4">Requested By</th>
                  <th className="px-6 py-4">Hall</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No recent bookings found.</td>
                    </tr>
                 ) : recentBookings.map(b => (
                   <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                         <div className="text-sm font-medium text-white">{b.bookedBy?.name || 'Unknown'}</div>
                         <div className="text-xs text-muted-foreground">{b.role}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/90">{b.hallId?.name || 'Deleted Hall'}</td>
                      <td className="px-6 py-4">
                         <div className="text-sm text-white/90">{new Date(b.date).toLocaleDateString()}</div>
                         <div className="text-xs text-muted-foreground">{b.startTime} - {b.endTime}</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                           b.status === 'Approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                           b.status === 'Rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                           'bg-accent/20 text-accent border border-accent/30'
                         }`}>
                           {b.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         {b.status === 'Pending' && (
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => updateBookingStatus(b._id, 'Approved')}
                                className="p-2 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors"
                              >
                                 <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => updateBookingStatus(b._id, 'Rejected')}
                                className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                              >
                                 <XCircle className="w-4 h-4" />
                              </button>
                           </div>
                         )}
                      </td>
                   </tr>
                 ))}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, Building, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function FacultyDashboard() {
  const { api, user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalBookings: 0, upcoming: 0, pending: 0, approved: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/bookings?sort=-createdAt');
        const myBookings = res.data.data;
        
        const now = new Date();
        const upcoming = myBookings.filter(b => new Date(b.date) > now && b.status === 'Approved').length;
        const pending = myBookings.filter(b => b.status === 'Pending').length;
        const approved = myBookings.filter(b => b.status === 'Approved').length;

        setStats({
          totalBookings: myBookings.length,
          upcoming,
          pending,
          approved
        });
        
        setRecentBookings(myBookings.slice(0, 5));
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  const cancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
        try {
          await api.delete(`/bookings/${id}`);
          setRecentBookings(prev => prev.filter(b => b._id !== id));
          toast.success(`Booking cancelled`);
          setStats(s => ({ ...s, totalBookings: s.totalBookings - 1 }));
        } catch (err) {
          toast.error('Failed to cancel booking');
        }
    }
  };

  if (loading) return <div className="text-white text-center py-20 animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-heading font-bold text-white">Welcome, {user.name}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Bookings', count: stats.totalBookings, icon: Building, color: 'text-indigo-400', bg: 'bg-indigo-400/10 border-indigo-400/20' },
          { label: 'Upcoming Events', count: stats.upcoming, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
          { label: 'Pending Approvals', count: stats.pending, icon: Clock, color: 'text-accent', bg: 'bg-accent/10 border-accent/20' },
          { label: 'Approved', count: stats.approved, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
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

      {/* My Recent Bookings Table */}
      <div className="glass-panel mt-8 overflow-hidden border border-white/5">
         <div className="p-6 border-b border-white/5 bg-white/[0.02]">
            <h2 className="text-xl font-bold text-white">My Bookings</h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-muted-foreground uppercase bg-white/[0.01]">
                  <th className="px-6 py-4">Hall</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">You have not made any bookings yet.</td>
                    </tr>
                 ) : recentBookings.map(b => (
                   <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">{b.hallId?.name || 'Deleted Hall'}</td>
                      <td className="px-6 py-4">
                         <div className="text-sm text-white/90">{new Date(b.date).toLocaleDateString()}</div>
                         <div className="text-xs text-muted-foreground">{b.startTime} - {b.endTime}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/80 max-w-[200px] truncate" title={b.purpose}>
                         {b.purpose}
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
                         {(b.status === 'Pending' || b.status === 'Approved') && (
                            <button 
                                onClick={() => cancelBooking(b._id)}
                                className="text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-md hover:bg-red-500/20 transition-colors"
                            >
                               Cancel
                            </button>
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

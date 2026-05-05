import { Building, CheckCircle, CreditCard, Users, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import bookingService from "../../services/bookingService";
import hallService from "../../services/hallService";
import userService from "../../services/userService";

export default function Dashboard() {
  const [stats, setStats] = useState({ halls: 0, users: 0, bookingsPending: 0, bookingsApproved: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hallsRes, usersRes, bookingsRes] = await Promise.all([
          hallService.getHalls('limit=1'),
          userService.getUsers('limit=1'),
          bookingService.getBookings('sort=-createdAt')
        ]);
        
        const allBookings = bookingsRes.data;
        const pending = allBookings.filter(b => b.status === 'Pending').length;
        const approved = allBookings.filter(b => b.status === 'Approved').length;

        setStats({
          halls: hallsRes.count,
          users: usersRes.count,
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
  }, []);

  const updateBookingStatus = async (id, status) => {
    try {
      await bookingService.updateBookingStatus(id, { status });
      setRecentBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
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

  if (loading) return <div className="text-gray-900 text-center py-20 animate-pulse font-medium">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-heading font-bold text-gray-900">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Halls', count: stats.halls, icon: Building, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
          { label: 'Total Users', count: stats.users, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-100' },
          { label: 'Pending Requests', count: stats.bookingsPending, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100' },
          { label: 'Approved Bookings', count: stats.bookingsApproved, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl border p-6 flex flex-col shadow-sm ${stat.bg}`}>
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-gray-600 font-medium">{stat.label}</h3>
               <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-4xl font-bold text-gray-900">{stat.count}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8 overflow-hidden">
         <div className="p-6 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900">Recent Booking Requests</h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                  <th className="px-6 py-4">Requested By</th>
                  <th className="px-6 py-4">Hall</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No recent bookings found.</td>
                    </tr>
                 ) : recentBookings.map(b => (
                   <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                         <div className="text-sm font-medium text-gray-900">{b.bookedBy?.name || 'Unknown'}</div>
                         <div className="text-xs text-gray-500">{b.role}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{b.hallId?.name || 'Deleted Hall'}</td>
                      <td className="px-6 py-4">
                         <div className="text-sm text-gray-900">{new Date(b.date).toLocaleDateString()}</div>
                         <div className="text-xs text-gray-500 mt-1">{b.startTime} - {b.endTime}</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                           b.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                           b.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                           'bg-amber-100 text-amber-700 border border-amber-200'
                         }`}>
                           {b.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                         {b.status === 'Pending' && (
                           <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => updateBookingStatus(b._id, 'Approved')}
                                className="p-2 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors border border-emerald-100"
                                title="Approve"
                              >
                                 <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => updateBookingStatus(b._id, 'Rejected')}
                                className="p-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors border border-red-100"
                                title="Reject"
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

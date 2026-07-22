import { Building, Calendar, Clock, Sparkles } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AuthContext } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import hallService from '../../services/hallService';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ upcomingEvents: 0, totalHalls: 0 });
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, hallsRes] = await Promise.all([
           bookingService.getBookings('sort=date'), // Bookings route returns only approved for students
           hallService.getHalls('limit=1')
        ]);
        
        const allBookings = bookingsRes.data;
        const now = new Date();
        const upcoming = allBookings.filter(b => new Date(b.date) >= new Date(now.setHours(0,0,0,0)));

        setStats({
          upcomingEvents: upcoming.length,
          totalHalls: hallsRes.count
        });
        
        setUpcomingSchedule(upcoming.slice(0, 5));
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="py-20 text-center text-gray-900 font-medium animate-pulse">Loading dashboard…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
         <div>
           <h1 className="text-3xl font-heading font-bold text-gray-900">Hello, {user?.name}</h1>
           <p className="mt-1 text-sm text-gray-500">Stay on top of campus events and the halls you may need.</p>
         </div>
         <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
           <Sparkles className="h-4 w-4" />
           Quick overview
         </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm md:p-8">
         <div className="relative z-10 w-full md:w-2/3">
             <h2 className="mb-2 text-2xl font-bold text-indigo-900">Welcome to the Seminar Portal</h2>
             <p className="mb-6 text-sm text-indigo-700/80">View upcoming events, seminars, and check hall schedules to stay on top of campus activities.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Upcoming Campus Events', count: stats.upcomingEvents, icon: Calendar, color: 'text-purple-600', bg: 'bg-white border-gray-200' },
          { label: 'Facilities Available', count: stats.totalHalls, icon: Building, color: 'text-blue-600', bg: 'bg-white border-gray-200' },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl border shadow-sm p-6 flex items-center justify-between ${stat.bg}`}>
            <div>
               <h3 className="text-gray-500 font-medium mb-1">{stat.label}</h3>
               <p className="text-3xl font-bold text-gray-900">{stat.count}</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
         <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-6">
            <Clock className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Upcoming Seminars & Events</h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                  <th className="px-6 py-4">Event Purpose</th>
                  <th className="px-6 py-4">Hall</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Organizer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                 {upcomingSchedule.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                        <div className="font-medium text-gray-700">No upcoming events scheduled</div>
                        <div className="mt-1 text-sm text-gray-400">Your upcoming seminars will appear here once they are booked.</div>
                      </td>
                    </tr>
                 ) : upcomingSchedule.map(b => (
                   <tr key={b._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[200px] truncate" title={b.purpose}>
                         {b.purpose}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                         {b.hallId?.name || 'Unknown Hall'}
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-sm text-gray-900">{new Date(b.date).toLocaleDateString()}</div>
                         <div className="text-xs text-secondary font-medium mt-1">{b.startTime} - {b.endTime}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                         {b.bookedBy?.name || 'Faculty Member'}
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

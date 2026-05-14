import { Building, Calendar, Clock } from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AuthContext } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { api, user } = useContext(AuthContext);
  const [stats, setStats] = useState({ upcomingEvents: 0, totalHalls: 0 });
  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, hallsRes] = await Promise.all([
           api.get('/bookings?sort=date'), // Bookings route returns only approved for students
           api.get('/halls?limit=1')
        ]);
        
        const allBookings = bookingsRes.data.data;
        const now = new Date();
        const upcoming = allBookings.filter(b => new Date(b.date) >= new Date(now.setHours(0,0,0,0)));

        setStats({
          upcomingEvents: upcoming.length,
          totalHalls: hallsRes.data.count
        });
        
        setUpcomingSchedule(upcoming.slice(0, 5));
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [api]);

  if (loading) return <div className="text-white text-center py-20 animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h1 className="text-3xl font-heading font-bold text-white">Hello, {user.name}</h1>
      </div>

      <div className="bg-gradient-to-r from-secondary/20 to-accent/10 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm relative overflow-hidden">
         <div className="relative z-10 w-full md:w-2/3">
             <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Seminar Portal</h2>
             <p className="text-muted-foreground mb-6 text-sm">View upcoming events, seminars, and check hall schedules to stay on top of campus activities.</p>
         </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { label: 'Upcoming Campus Events', count: stats.upcomingEvents, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
          { label: 'Facilities Available', count: stats.totalHalls, icon: Building, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20' },
        ].map((stat, i) => (
          <div key={i} className={`glass-panel border p-6 flex items-center justify-between ${stat.bg}`}>
            <div>
               <h3 className="text-muted-foreground font-medium mb-1">{stat.label}</h3>
               <p className="text-3xl font-bold text-white">{stat.count}</p>
            </div>
            <div className="p-3 rounded-full bg-white/5">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Schedule Table */}
      <div className="glass-panel mt-8 overflow-hidden border border-white/5">
         <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
            <Clock className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-white">Upcoming Seminars & Events</h2>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-muted-foreground uppercase bg-white/[0.01]">
                  <th className="px-6 py-4">Event Purpose</th>
                  <th className="px-6 py-4">Hall</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Organizer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {upcomingSchedule.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground">No upcoming events scheduled.</td>
                    </tr>
                 ) : upcomingSchedule.map(b => (
                   <tr key={b._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white max-w-[200px] truncate" title={b.purpose}>
                         {b.purpose}
                      </td>
                      <td className="px-6 py-4 text-sm text-white/90">
                         {b.hallId?.name || 'Unknown Hall'}
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-sm text-white/90">{new Date(b.date).toLocaleDateString()}</div>
                         <div className="text-xs text-secondary font-medium mt-1">{b.startTime} - {b.endTime}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
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

import {
  Building,
  Calendar,
  Clock,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AuthContext } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import connectionService from '../../services/connectionService';
import hallService from '../../services/hallService';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    upcomingEvents: 0,
    totalHalls: 0,
  });

  const [upcomingSchedule, setUpcomingSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const [facultyList, setFacultyList] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(true);
  const [activeFaculty, setActiveFaculty] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, hallsRes] = await Promise.all([
          bookingService.getBookings('sort=date'),
          hallService.getHalls('limit=1'),
        ]);

        const allBookings = bookingsRes.data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = allBookings.filter(
          (b) => new Date(b.date) >= today
        );

        setStats({
          upcomingEvents: upcoming.length,
          totalHalls: hallsRes.count,
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

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await connectionService.getFacultyList();
        setFacultyList(res.data || []);
      } catch (err) {
        toast.error('Failed to load faculty list');
      } finally {
        setFacultyLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  const openConnectModal = (faculty) => {
    setActiveFaculty(faculty);
    setSubject('');
    setMessage('');
  };

  const closeConnectModal = () => {
    if (sending) return;
    setActiveFaculty(null);
  };

  const handleSendConnection = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Please add a subject and a message');
      return;
    }

    try {
      setSending(true);

      await connectionService.sendConnectionRequest({
        facultyId: activeFaculty._id,
        subject: subject.trim(),
        message: message.trim(),
      });

      toast.success(`Message sent to ${activeFaculty.name}`);
      setActiveFaculty(null);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Failed to send message'
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-900 font-medium animate-pulse">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">
            Hello, {user?.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Stay on top of campus events and the halls you may need.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
          <Sparkles className="h-4 w-4" />
          Quick overview
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-sm md:p-8">
        <div className="relative z-10 w-full md:w-2/3">
          <h2 className="mb-2 text-2xl font-bold text-indigo-900">
            Welcome to the Seminar Portal
          </h2>

          <p className="mb-6 text-sm text-indigo-700/80">
            View upcoming events, seminars, and check hall schedules to stay on
            top of campus activities.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[
          {
            label: 'Upcoming Campus Events',
            count: stats.upcomingEvents,
            icon: Calendar,
            color: 'text-purple-600',
            bg: 'bg-white border-gray-200',
          },
          {
            label: 'Facilities Available',
            count: stats.totalHalls,
            icon: Building,
            color: 'text-blue-600',
            bg: 'bg-white border-gray-200',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`rounded-xl border shadow-sm p-6 flex items-center justify-between ${stat.bg}`}
          >
            <div>
              <h3 className="text-gray-500 font-medium mb-1">
                {stat.label}
              </h3>
              <p className="text-3xl font-bold text-gray-900">
                {stat.count}
              </p>
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
          <h2 className="text-xl font-bold text-gray-900">
            Upcoming Seminars & Events
          </h2>
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
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="font-medium text-gray-700">
                      No upcoming events scheduled
                    </div>

                    <div className="mt-1 text-sm text-gray-400">
                      Your upcoming seminars will appear here once they are
                      booked.
                    </div>
                  </td>
                </tr>
              ) : (
                upcomingSchedule.map((b) => (
                  <tr
                    key={b._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td
                      className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[200px] truncate"
                      title={b.purpose}
                    >
                      {b.purpose}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {b.hallId?.name || 'Unknown Hall'}
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(b.date).toLocaleDateString()}
                      </div>

                      <div className="text-xs text-secondary font-medium mt-1">
                        {b.startTime} - {b.endTime}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {b.bookedBy?.name || 'Faculty Member'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/50 p-6">
          <Users className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Connect with Faculty
          </h2>
        </div>

        {facultyLoading ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            Loading faculty members…
          </div>
        ) : facultyList.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">
            No faculty members available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {facultyList.map((f) => (
              <div
                key={f._id}
                className="rounded-xl border border-gray-200 p-4 flex flex-col gap-3 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                    {f.name?.[0]?.toUpperCase() || 'F'}
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {f.name}
                    </p>

                    <p className="text-xs text-gray-500 truncate">
                      {f.department || 'Faculty'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openConnectModal(f)}
                  className="mt-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Reach out
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeFaculty && (
        <div
          onClick={closeConnectModal}
          className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Message {activeFaculty.name}
              </h3>

              <button
                onClick={closeConnectModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Query about research guidance"
              className="w-full h-11 rounded-lg border border-gray-300 px-3 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Message
            </label>

            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message…"
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={closeConnectModal}
                className="px-4 h-10 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleSendConnection}
                disabled={sending}
                className="px-4 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { Building, Calendar, CheckCircle, Clock } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthContext } from "../../context/AuthContext";
import bookingService from "../../services/bookingService";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalBookings: 0,
    upcoming: 0,
    pending: 0,
    approved: 0,
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bookingService.getBookings("sort=-createdAt");

        console.log("BOOKINGS RESPONSE:", res); // ✅ DEBUG

        const myBookings = res?.data || [];

        const now = new Date();

        const upcoming = myBookings.filter(
          (b) => new Date(b.date) > now && b.status === "Approved"
        ).length;

        const pending = myBookings.filter(
          (b) => b.status === "Pending"
        ).length;

        const approved = myBookings.filter(
          (b) => b.status === "Approved"
        ).length;

        setStats({
          totalBookings: myBookings.length,
          upcoming,
          pending,
          approved,
        });

        setRecentBookings(myBookings.slice(0, 5));
      } catch (err) {
        console.error("DASHBOARD ERROR:", err); // ✅ DEBUG
        toast.error("Failed to load dashboard data");

        // ✅ SAFE FALLBACK
        setStats({
          totalBookings: 0,
          upcoming: 0,
          pending: 0,
          approved: 0,
        });

        setRecentBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ❌ CANCEL BOOKING
  const cancelBooking = async (id) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      try {
        await bookingService.deleteBooking(id);

        setRecentBookings((prev) =>
          prev.filter((b) => b._id !== id)
        );

        toast.success("Booking cancelled");

        setStats((s) => ({
          ...s,
          totalBookings: s.totalBookings - 1,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to cancel booking");
      }
    }
  };

  // ⏳ LOADING UI (SAFE)
  if (loading) {
    return (
      <div className="text-center py-20 text-gray-600">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.name || "User"}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Bookings",
            count: stats.totalBookings,
            icon: Building,
            color: "text-indigo-500",
            bg: "bg-indigo-50",
          },
          {
            label: "Upcoming Events",
            count: stats.upcoming,
            icon: Calendar,
            color: "text-purple-500",
            bg: "bg-purple-50",
          },
          {
            label: "Pending",
            count: stats.pending,
            icon: Clock,
            color: "text-amber-500",
            bg: "bg-amber-50",
          },
          {
            label: "Approved",
            count: stats.approved,
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`rounded-xl p-6 shadow-sm border ${stat.bg}`}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600">{stat.label}</h3>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stat.count}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow border mt-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">My Bookings</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Hall</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Purpose</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-8 text-gray-500"
                  >
                    No bookings found
                  </td>
                </tr>
              ) : (
                recentBookings.map((b) => (
                  <tr key={b._id} className="border-t">
                    <td className="px-6 py-4">
                      {b.hallId?.name || "N/A"}
                    </td>

                    <td className="px-6 py-4">
                      {new Date(b.date).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4">{b.purpose}</td>

                    <td className="px-6 py-4">{b.status}</td>

                    <td className="px-6 py-4 text-right">
                      {(b.status === "Pending" ||
                        b.status === "Approved") && (
                        <button
                          onClick={() => cancelBooking(b._id)}
                          className="text-red-600 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
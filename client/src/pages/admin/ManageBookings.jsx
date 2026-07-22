import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const StatusBadge = ({ status }) => {
  const palette = {
    Approved: { bg: "#f0fdf4", text: "#15803d", border: "#86efac" },
    Rejected: { bg: "#fef2f2", text: "#b91c1c", border: "#fca5a5" },
    Pending: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  };
  const style = palette[status] || palette.Pending;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "4px 10px",
      borderRadius: 999,
      background: style.bg,
      color: style.text,
      border: `1px solid ${style.border}`,
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: style.text }} />
      {status}
    </span>
  );
};

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("token");

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/bookings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(res.data.data || []);
      setLoading(false);
    } catch {
      setError("Failed to fetch bookings");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Update booking status
  const updateStatus = async (id, status) => {
    try {
      setActionLoadingId(id);

      await axios.put(
        `${API_BASE}/bookings/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Booking ${status.toLowerCase()} successfully`);
      fetchBookings();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredBookings = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (statusFilter === "all") return sorted;

    return sorted.filter((booking) => (booking.status || "Pending") === statusFilter);
  }, [bookings, statusFilter]);

  // Delete booking
  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;

    try {
      setActionLoadingId(id);

      await axios.delete(
        `${API_BASE}/bookings/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Booking deleted");
      fetchBookings();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Review incoming requests, update their outcome, and keep the hall schedule current.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-800">{filteredBookings.length}</span> of <span className="font-semibold text-gray-800">{bookings.length}</span> bookings
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none"
        >
          <option value="all">All statuses</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow border border-gray-100 p-8 text-center text-gray-500">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          Loading bookings…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-4">User</th>
                <th>Hall</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th className="pr-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBookings.map((booking, index) => (
                <tr key={booking._id} className={`border-t ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <td className="p-4">
                    <div className="font-medium text-gray-800">{booking.user?.name || "User"}</div>
                    <div className="text-xs text-gray-500">{booking.user?.email || "No email provided"}</div>
                  </td>

                  <td className="text-gray-700">
                    {booking.hall?.name || booking.hallId?.name || "Hall"}
                  </td>

                  <td className="text-gray-700">
                    {new Date(booking.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>

                  <td className="text-gray-700">
                    {booking.startTime} - {booking.endTime}
                  </td>

                  <td>
                    <StatusBadge status={booking.status || "Pending"} />
                  </td>

                  <td className="pr-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => updateStatus(booking._id, "Approved")}
                        disabled={actionLoadingId === booking._id}
                        className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoadingId === booking._id ? "Working…" : "Approve"}
                      </button>

                      <button
                        onClick={() => updateStatus(booking._id, "Rejected")}
                        disabled={actionLoadingId === booking._id}
                        className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoadingId === booking._id ? "Working…" : "Reject"}
                      </button>

                      <button
                        onClick={() => deleteBooking(booking._id)}
                        disabled={actionLoadingId === booking._id}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionLoadingId === booking._id ? "Working…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-gray-500">
                    <div className="font-semibold text-gray-700">
                      {bookings.length === 0 ? "No bookings found" : "No bookings match the current filter"}
                    </div>
                    <div className="mt-1 text-sm text-gray-400">
                      {bookings.length === 0
                        ? "Bookings will appear here once faculty or admins create them."
                        : "Try switching the filter to view other requests."}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageBookings;
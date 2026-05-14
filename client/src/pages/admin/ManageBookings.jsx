import axios from "axios";
import { useEffect, useState } from "react";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(res.data.data || []);
      setLoading(false);
    } catch (err) {
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
      await axios.patch(
        `http://localhost:5000/api/bookings/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchBookings();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  // Delete booking
  const deleteBooking = async (id) => {
    if (!window.confirm("Delete this booking?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/bookings/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchBookings();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Manage Bookings
      </h1>

      {/* Loading / Error */}
      {loading && <p>Loading bookings...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="p-4">User</th>
                <th>Hall</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th className="text-right pr-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-t">
                  <td className="p-4">
                    {booking.user?.name || "User"}
                  </td>

                  <td>
                    {booking.hall?.name || "Hall"}
                  </td>

                  <td>
                    {new Date(booking.date).toLocaleDateString()}
                  </td>

                  <td>
                    {booking.startTime} - {booking.endTime}
                  </td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        booking.status === "Approved"
                          ? "bg-green-100 text-green-600"
                          : booking.status === "Rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>

                  <td className="text-right pr-4 space-x-2">
                    <button
                      onClick={() =>
                        updateStatus(booking._id, "Approved")
                      }
                      className="text-green-600"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(booking._id, "Rejected")
                      }
                      className="text-yellow-600"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => deleteBooking(booking._id)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {bookings.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center p-6 text-gray-400"
                  >
                    No bookings found
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
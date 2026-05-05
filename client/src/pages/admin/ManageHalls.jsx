import axios from "axios";
import { useEffect, useState } from "react";

const ManageHalls = () => {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    capacity: "",
    building: "",
    roomNumber: "",
  });

  // Fetch halls
  const fetchHalls = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/halls");
      setHalls(res.data.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch halls");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Add hall
  const addHall = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/halls", {
        name: form.name,
        capacity: Number(form.capacity),
        location: {
          building: form.building,
          roomNumber: form.roomNumber,
        },
        amenities: ["Projector"], // default for now
        description: "Sample hall",
      });

      alert("Hall added!");
      fetchHalls();

      setForm({
        name: "",
        capacity: "",
        building: "",
        roomNumber: "",
      });
    } catch (err) {
      alert("Failed to add hall");
    }
  };

  // Delete hall
  const deleteHall = async (id) => {
    if (!window.confirm("Delete this hall?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/halls/${id}`);
      fetchHalls();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // Toggle status
  const toggleStatus = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/halls/${id}/status`);
      fetchHalls();
    } catch (err) {
      alert("Status update failed");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold">Manage Halls</h1>
      <p className="text-gray-400 mt-2 mb-6">
        Add, edit, or delete seminar halls
      </p>

      {/* Add Hall Form */}
      <form
        onSubmit={addHall}
        className="bg-zinc-900 p-4 rounded mb-6 space-y-3"
      >
        <h2 className="text-lg font-semibold">Add New Hall</h2>

        <input
          type="text"
          name="name"
          placeholder="Hall Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 bg-zinc-800 rounded"
          required
        />

        <input
          type="number"
          name="capacity"
          placeholder="Capacity"
          value={form.capacity}
          onChange={handleChange}
          className="w-full p-2 bg-zinc-800 rounded"
          required
        />

        <input
          type="text"
          name="building"
          placeholder="Building"
          value={form.building}
          onChange={handleChange}
          className="w-full p-2 bg-zinc-800 rounded"
        />

        <input
          type="text"
          name="roomNumber"
          placeholder="Room Number"
          value={form.roomNumber}
          onChange={handleChange}
          className="w-full p-2 bg-zinc-800 rounded"
        />

        <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
          Add Hall
        </button>
      </form>

      {/* Loading */}
      {loading && <p>Loading halls...</p>}

      {/* Error */}
      {error && <p className="text-red-400">{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-left border border-zinc-800">
            <thead>
              <tr className="bg-zinc-900 text-gray-400">
                <th className="p-3">Name</th>
                <th>Capacity</th>
                <th>Location</th>
                <th>Status</th>
                <th className="text-right pr-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {halls.map((hall) => (
                <tr
                  key={hall._id}
                  className="border-t border-zinc-800 hover:bg-zinc-800/40"
                >
                  <td className="p-3">{hall.name}</td>
                  <td>{hall.capacity}</td>

                  <td>
                    {hall.location?.building || "-"} /{" "}
                    {hall.location?.roomNumber || "-"}
                  </td>

                  <td>
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        hall.status === "Available"
                          ? "bg-green-600/20 text-green-400"
                          : "bg-red-600/20 text-red-400"
                      }`}
                    >
                      {hall.status}
                    </span>
                  </td>

                  <td className="text-right pr-3 space-x-2">
                    <button
                      onClick={() => toggleStatus(hall._id)}
                      className="px-2 py-1 text-xs bg-yellow-600/20 text-yellow-400 rounded"
                    >
                      Toggle
                    </button>

                    <button
                      onClick={() => deleteHall(hall._id)}
                      className="px-2 py-1 text-xs bg-red-600/20 text-red-400 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {halls.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center p-4 text-gray-400">
                    No halls found
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

export default ManageHalls;
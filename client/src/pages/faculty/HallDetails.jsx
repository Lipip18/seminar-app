import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../../context/AuthContext";

const HallDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { api } = useContext(AuthContext);

  const [hall, setHall] = useState(null);

  const [loading, setLoading] = useState(true);

  /* ───────────────── FETCH HALL DETAILS ───────────────── */

  useEffect(() => {
    fetchHallDetails();
  }, [id]);

  const fetchHallDetails = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/halls/${id}`);

      setHall(res.data.data);
    } catch (err) {
      console.error(err);

      toast.error(
        err?.response?.data?.message ||
          "Failed to load hall details"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── LOADING ───────────────── */

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50"
      >
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"
          />

          <p className="mt-4 text-slate-500 font-medium">
            Loading hall details...
          </p>
        </div>
      </div>
    );
  }

  /* ───────────────── NO HALL ───────────────── */

  if (!hall) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-slate-50"
      >
        <div className="bg-white p-8 rounded-2xl shadow-sm border text-center">
          <h1 className="text-2xl font-bold text-slate-800">
            Hall Not Found
          </h1>

          <p className="text-slate-500 mt-2">
            The requested hall does not exist.
          </p>
        </div>
      </div>
    );
  }

  /* ───────────────── AVAILABILITY ───────────────── */

  const isAvailable =
    hall.isActive !== false &&
    hall.status !== "Booked" &&
    hall.status !== "Unavailable";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO SECTION */}

      <div
        className="h-[320px] bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center text-white text-8xl"
      >
        🏛
      </div>

      {/* MAIN CONTENT */}

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* TOP SECTION */}

        <div
          className="bg-white rounded-3xl shadow-sm border overflow-hidden"
        >
          <div className="p-8">
            {/* TITLE */}

            <div
              className="flex flex-col md:flex-row md:items-start md:justify-between gap-6"
            >
              <div>
                <h1
                  className="text-4xl font-bold text-slate-900"
                >
                  {hall.name}
                </h1>

                <p
                  className="text-slate-500 mt-3 text-lg"
                >
                  {hall.location?.building ||
                    "Campus Building"}
                </p>
              </div>

              {/* STATUS */}

              <div>
                <span
                  className={`px-5 py-2 rounded-full text-sm font-semibold ${
                    isAvailable
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {isAvailable
                    ? "Available"
                    : "Unavailable"}
                </span>
              </div>
            </div>

            {/* DESCRIPTION */}

            <div className="mt-8">
              <h2
                className="text-xl font-bold text-slate-800"
              >
                Description
              </h2>

              <p
                className="mt-4 text-slate-600 leading-8"
              >
                {hall.description ||
                  "This seminar hall is suitable for workshops, presentations, conferences, meetings, and academic events."}
              </p>
            </div>

            {/* DETAILS GRID */}

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10"
            >
              {/* CAPACITY */}

              <div
                className="bg-slate-50 border rounded-2xl p-6"
              >
                <p
                  className="text-sm text-slate-500"
                >
                  Seating Capacity
                </p>

                <h3
                  className="text-3xl font-bold text-slate-900 mt-3"
                >
                  {hall.capacity || 0}
                </h3>
              </div>

              {/* STATUS */}

              <div
                className="bg-slate-50 border rounded-2xl p-6"
              >
                <p
                  className="text-sm text-slate-500"
                >
                  Hall Status
                </p>

                <h3
                  className={`text-2xl font-bold mt-3 ${
                    isAvailable
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {isAvailable
                    ? "Available"
                    : "Unavailable"}
                </h3>
              </div>

              {/* FACILITIES COUNT */}

              <div
                className="bg-slate-50 border rounded-2xl p-6"
              >
                <p
                  className="text-sm text-slate-500"
                >
                  Facilities
                </p>

                <h3
                  className="text-3xl font-bold text-slate-900 mt-3"
                >
                  {(hall.facilities || hall.amenities || []).length || 0}
                </h3>
              </div>
            </div>

            {/* FACILITIES */}

            <div className="mt-12">
              <h2
                className="text-xl font-bold text-slate-800"
              >
                Available Facilities
              </h2>

              {(hall.facilities || hall.amenities || []).length > 0 ? (
                <div
                  className="flex flex-wrap gap-4 mt-5"
                >
                  {(hall.facilities || hall.amenities || []).map(
                    (facility, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium"
                      >
                        {facility}
                      </span>
                    )
                  )}
                </div>
              ) : (
                <p
                  className="mt-4 text-slate-500"
                >
                  No facilities listed.
                </p>
              )}
            </div>

            {/* ACTION BUTTONS */}

            <div
              className="flex flex-col sm:flex-row gap-4 mt-12"
            >
              {/* BOOK BUTTON */}

              {isAvailable ? (
                <button
                  onClick={() =>
                    navigate(
                      `/faculty/book-hall/${hall._id}`
                    )
                  }
                  className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                  Book This Hall
                </button>
              ) : (
                <button
                  disabled
                  className="h-14 px-8 rounded-xl bg-red-100 text-red-500 font-semibold cursor-not-allowed"
                >
                  Hall Not Available
                </button>
              )}

              {/* BACK BUTTON */}

              <button
                onClick={() => navigate(-1)}
                className="h-14 px-8 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold transition"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallDetails;
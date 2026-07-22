import {
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import { toast } from "sonner";

import { AuthContext } from "../../context/AuthContext";

const timeSlots = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
  "18:00 - 19:00",
];

const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const formatDate = (date) => {
  return new Date(date)
    .toISOString()
    .split("T")[0];
};

const getHallLocation = (hall) => {
  if (!hall) return "Main campus";

  const building =
    hall?.location?.building ||
    hall?.building ||
    hall?.location ||
    "";

  const floor = hall?.location?.floor || hall?.floor;

  return floor && building
    ? `${building}, Floor ${floor}`
    : building || "Main campus";
};

const getHallFacilities = (hall) => {
  if (!hall) return [];

  const facilities =
    hall.facilities ||
    hall.amenities ||
    [];

  if (Array.isArray(facilities)) {
    return facilities;
  }

  return [];
};

const BookHall = () => {
  // ✅ FIX 1: Destructure `user` from AuthContext (was missing, caused "user is not defined")
  const { api, user } = useContext(AuthContext);

  const navigate = useNavigate();

  const { id } = useParams();

  // today used for calendar past-date checks (stable reference is fine here)
  const today = new Date();

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [halls, setHalls] =
    useState([]);

  const [selectedHallId, setSelectedHallId] =
    useState("");

  const [selectedHall, setSelectedHall] =
    useState(null);

  const [bookings, setBookings] =
    useState([]);

  const [selectedDate, setSelectedDate] =
    useState("");

  const [selectedSlot, setSelectedSlot] =
    useState("");

  const [purpose, setPurpose] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  /* ───────────────── FETCH HALLS ───────────────── */

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      setLoading(true);

      const res =
        await api.get("/halls");

      const hallsData =
        res.data?.data || [];

      // ✅ FIX 2: Only show active halls in the dropdown
      // Handle boolean true, number 1, or string "true" from API
      const activeHalls = hallsData.filter(
        (hall) =>
          hall.isActive !== false &&
          hall.isActive !== 0 &&
          hall.isActive !== "false"
      );

      setHalls(activeHalls);

      if (id) {
        setSelectedHallId(id);
      }
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to load halls"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── FETCH SELECTED HALL ───────────────── */

  useEffect(() => {
    if (!selectedHallId) {
      setSelectedHall(null);
      setBookings([]);
      setSelectedDate("");
      setSelectedSlot("");
      setPurpose("");
      return;
    }

    fetchSelectedHall();
    fetchBookings();
  }, [selectedHallId]);

  const fetchSelectedHall =
    async () => {
      try {
        const res =
          await api.get(
            `/halls/${selectedHallId}`
          );

        setSelectedHall(
          res.data.data
        );
      } catch (err) {
        console.error(err);
      }
    };

  /* ───────────────── FETCH BOOKINGS ───────────────── */

  const fetchBookings =
    async () => {
      try {
        const res =
          await api.get(
            `/bookings?hallId=${selectedHallId}`
          );

        setBookings(
          res.data?.data || []
        );
      } catch (err) {
        console.error(err);
      }
    };

  /* ───────────────── CALENDAR HELPERS ───────────────── */

  const month =
    currentDate.getMonth();

  const year =
    currentDate.getFullYear();

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const monthName =
    currentDate.toLocaleString(
      "default",
      {
        month: "long",
      }
    );

  const calendarDays = [];

  for (
    let i = 0;
    i < firstDay;
    i++
  ) {
    calendarDays.push(null);
  }

  for (
    let d = 1;
    d <= daysInMonth;
    d++
  ) {
    calendarDays.push(d);
  }

  const prevMonth = () => {
    setCurrentDate(
      new Date(
        year,
        month - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(
        year,
        month + 1,
        1
      )
    );
  };

  /* ───────────────── DATE BOOKING CHECK ───────────────── */

  const isDateBooked =
    (date) => {
      const dateStr =
        formatDate(date);

      return bookings.some(
        (booking) =>
          formatDate(
            booking.date
          ) === dateStr
      );
    };

  /* ───────────────── BOOKED SLOTS ───────────────── */

  const bookedSlots =
    useMemo(() => {
      return bookings
        .filter(
          (booking) =>
            formatDate(
              booking.date
            ) ===
            selectedDate
        )
        .map(
          (booking) =>
            `${booking.startTime} - ${booking.endTime}`
        );
    }, [
      bookings,
      selectedDate,
    ]);

  /* ───────────────── FIX 3: FILTER PAST TIME SLOTS FOR TODAY ───────────────── */

  const availableTimeSlots = useMemo(() => {
    // Compute a FRESH Date() inside the memo so it's never stale.
    // The outer `today` is fixed at component mount and gives wrong
    // results if the user keeps the page open past an hour boundary.
    const now = new Date();
    const todayStr = formatDate(now);

    // If selected date is not today, all slots are potentially available
    if (selectedDate !== todayStr) {
      return timeSlots;
    }

    const nowHour = now.getHours();      // 0-23
    const nowMinutes = now.getMinutes(); // 0-59

    return timeSlots.filter((slot) => {
      // slot format: "09:00 - 10:00" -> slotStartHour = 9
      const slotStartHour = parseInt(slot.split(":")[0], 10);
      // Exactly on the hour (e.g. 17:00): the 17-18 slot is still valid
      if (nowMinutes === 0) return slotStartHour >= nowHour;
      // Otherwise (e.g. 17:15): only 18:00+ slots are available
      return slotStartHour > nowHour;
    });
  }, [selectedDate]); // fresh Date() computed inside, no stale reference

  /* ───────────────── FORM VALIDATION ───────────────── */

  const isFormValid =
    !!selectedHallId &&
    !!selectedDate &&
    !!selectedSlot &&
    purpose.trim().length > 0;

  /* ───────────────── BOOK HALL ───────────────── */

  const handleBooking =
    async () => {
      if (!isFormValid) {
        toast.error(
          "Please complete all fields"
        );
        return;
      }

      try {
        setSubmitting(true);

        const [
          startTime,
          endTime,
        ] =
          selectedSlot.split(
            " - "
          );

        await api.post(
          "/bookings",
          {
            hallId: selectedHallId,
            date: selectedDate,
            startTime,
            endTime,
            purpose: purpose.trim(),
            role: user?.role, // ✅ Now works because user is properly destructured above
          }
        );

        toast.success(
          "Booking request submitted"
        );

        setSelectedSlot("");
        setPurpose("");

        fetchBookings();
      } catch (err) {
        console.error(err);

        console.log(err.response?.data);

        toast.error(
          err?.response?.data?.message ||
          err?.message ||
          "Booking failed"
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* ───────────────── LOADING ───────────────── */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-700 text-lg font-semibold">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* HEADER */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800">
          Book Seminar Hall
        </h1>

        <p className="text-slate-500 mt-2">
          Pick a hall, choose a date and slot, then submit your request.
        </p>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        {/* LEFT SIDEBAR */}

        <div className="space-y-5">
          {/* SELECT HALL */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Select Hall
            </p>

            <select
              value={
                selectedHallId
              }
              onChange={(e) =>
                setSelectedHallId(
                  e.target.value
                )
              }
              className="w-full h-11 rounded-xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Choose Hall
              </option>

              {halls.map(
                (hall) => (
                  <option
                    key={hall._id}
                    value={
                      hall._id
                    }
                  >
                    {hall.name}
                  </option>
                )
              )}
            </select>
          </div>

          {/* HALL DETAILS */}

          {selectedHall && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                Hall Details
              </p>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                  {getInitials(
                    selectedHall.name
                  )}
                </div>

                <div>
                  <h2 className="font-semibold text-slate-800">
                    {
                      selectedHall.name
                    }
                  </h2>

                  <p className="text-sm text-slate-500">
                {getHallLocation(selectedHall)}
              </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {
                  selectedHall.description
                }
              </p>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">
                    Capacity
                  </p>

                  <h3 className="font-semibold text-blue-600 mt-1">
                    {selectedHall.capacity}
                  </h3>
                </div>

                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-400">
                    Booking status
                  </p>

                  <h3 className="font-semibold text-emerald-600 mt-1">
                    Available for booking
                  </h3>
                </div>
              </div>

              {getHallFacilities(selectedHall).length > 0 && (
                <div className="mt-5">
                  <p className="text-xs text-slate-400 mb-2">
                    Facilities
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {getHallFacilities(selectedHall).map(
                      (
                        facility,
                        i
                      ) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-medium"
                        >
                          {facility}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BOOKING SUMMARY */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Booking Summary
            </p>

            <div className="space-y-4">
              <div className="flex justify-between gap-3">
                <span className="text-slate-400 text-sm">
                  Hall
                </span>

                <span className="text-sm font-medium text-slate-700 text-right">
                  {selectedHall?.name || "—"}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-400 text-sm">
                  Date
                </span>

                <span className="text-sm font-medium text-slate-700 text-right">
                  {selectedDate || "—"}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-400 text-sm">
                  Time
                </span>

                <span className="text-sm font-medium text-slate-700 text-right">
                  {selectedSlot || "—"}
                </span>
              </div>
            </div>

            {!selectedHall && (
              <p className="mt-4 text-sm text-slate-500">
                Choose a hall to begin the booking flow.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SECTION */}

        <div className="space-y-6">
          {/* CALENDAR */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* CALENDAR HEADER */}

            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-800">
                {monthName} {year}
              </h2>

              <div className="flex gap-2">
                <button
                  onClick={
                    prevMonth
                  }
                  className="w-10 h-10 rounded-xl border border-slate-300 flex items-center justify-center hover:bg-slate-100"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-700" />
                </button>

                <button
                  onClick={
                    nextMonth
                  }
                  className="w-10 h-10 rounded-xl border border-slate-300 flex items-center justify-center hover:bg-slate-100"
                >
                  <ChevronRight className="w-5 h-5 text-slate-700" />
                </button>
              </div>
            </div>

            {/* WEEK DAYS */}

            <div className="grid grid-cols-7 text-center px-6 pt-6 text-sm font-medium text-slate-500">
              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map((day) => (
                <div
                  key={day}
                  className="py-3"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* CALENDAR DAYS */}

            <div className="grid grid-cols-7 gap-y-4 px-6 pb-6">
              {calendarDays.map(
                (
                  day,
                  index
                ) => {
                  if (!day) {
                    return (
                      <div
                        key={
                          index
                        }
                        className="h-24"
                      />
                    );
                  }

                  const current =
                    new Date(
                      year,
                      month,
                      day
                    );

                  const currentDateStr =
                    formatDate(
                      current
                    );

                  const isSelected =
                    currentDateStr ===
                    selectedDate;

                  const isToday =
                    currentDateStr ===
                    formatDate(
                      today
                    );

                  const hasBooking =
                    isDateBooked(
                      current
                    );

                  const isPast =
                    current <
                    new Date(
                      today.setHours(
                        0,
                        0,
                        0,
                        0
                      )
                    );

                  return (
                    <button
                      key={day}
                      disabled={
                        isPast
                      }
                      onClick={() =>
                        setSelectedDate(
                          currentDateStr
                        )
                      }
                      className={`relative h-24 rounded-2xl flex flex-col items-center justify-center transition-all border text-sm font-medium
                      
                      ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                          : isPast
                          ? "text-slate-300 cursor-not-allowed"
                          : "bg-white hover:bg-blue-50 border-transparent"
                      }
                      `}
                    >
                      <span>
                        {day}
                      </span>

                      {hasBooking && (
                        <div
                          className={`absolute bottom-3 w-2 h-2 rounded-full ${
                            isSelected
                              ? "bg-white"
                              : "bg-red-500"
                          }`}
                        />
                      )}

                      {isToday &&
                        !isSelected && (
                          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400" />
                        )}
                    </button>
                  );
                }
              )}
            </div>

            {/* FOOTER */}

            <div className="px-6 pb-5 flex gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                Booked Dates
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                Selected Date
              </div>
            </div>
          </div>

          {/* TIME SLOTS */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold text-slate-800">
                Available Time Slots
              </h2>

              {selectedDate && (
                <span className="text-sm text-slate-500">
                  {selectedDate}
                </span>
              )}
            </div>

            {!selectedDate ? (
              <div className="h-32 flex items-center justify-center text-slate-400 text-center px-4">
                Select a date to view available slots.
              </div>
            ) : availableTimeSlots.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-slate-400 text-center px-4">
                No available slots remain for this date.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {/* ✅ FIX 3: Use availableTimeSlots instead of timeSlots */}
                {availableTimeSlots.map(
                  (slot) => {
                    const isBooked =
                      bookedSlots.includes(
                        slot
                      );

                    const isSelected =
                      selectedSlot ===
                      slot;

                    return (
                      <button
                        key={slot}
                        disabled={
                          isBooked
                        }
                        onClick={() =>
                          setSelectedSlot(
                            slot
                          )
                        }
                        className={`h-14 rounded-xl border text-sm font-medium transition
                        
                        ${
                          isBooked
                            ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed"
                            : isSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-slate-300 hover:bg-blue-50 hover:border-blue-400"
                        }
                        `}
                      >
                        {slot}
                      </button>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* PURPOSE */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Booking Purpose
            </h2>

            <textarea
              rows={5}
              value={purpose}
              onChange={(e) =>
                setPurpose(
                  e.target.value
                )
              }
              placeholder="Enter booking purpose..."
              className="w-full rounded-2xl border border-slate-300 p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            {/* ACTIONS */}

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() =>
                  navigate(-1)
                }
                className="px-5 h-11 rounded-xl border border-slate-300 text-slate-600 font-medium hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={
                  handleBooking
                }
                disabled={
                  !isFormValid ||
                  submitting
                }
                className="px-6 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-40"
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Booking"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookHall;
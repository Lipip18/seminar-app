import {
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    Clock3,
    MapPin,
    User,
} from "lucide-react";

import { AuthContext } from "../../context/AuthContext";

const getBookingHall = (booking) =>
  booking?.hall?.name ||
  booking?.hallId?.name ||
  booking?.hallName ||
  "Seminar Hall";

const getBookingUser = (booking) =>
  booking?.user?.name ||
  booking?.userId?.name ||
  booking?.bookedBy ||
  "User";

const getBookingPurpose = (booking) =>
  booking?.purpose ||
  "No purpose provided";

const getBookingLocation = (booking) =>
  booking?.hall?.location?.building ||
  booking?.hallId?.location?.building ||
  booking?.location?.building ||
  "Main campus";

const Calendar = () => {
  const { api } =
    useContext(AuthContext);

  const today = new Date();

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  const [bookings, setBookings] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* ───────────────── FETCH BOOKINGS ───────────────── */

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res =
        await api.get(
          "/bookings"
        );

      const bookingData =
        res.data?.data || [];

      const validBookings =
        bookingData.filter(
          (booking) =>
            booking &&
            booking.date &&
            booking.hallId &&
            booking.status ===
              "Approved"
        );

      setBookings(
        validBookings
      );
    } catch (err) {
      console.error(
        "FETCH BOOKINGS ERROR:",
        err
      );

      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── DATE HELPERS ───────────────── */

  const formatDate = (
    date
  ) => {
    const d = new Date(date);

    return `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(
      2,
      "0"
    )}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  /* ───────────────── REAL CALENDAR LOGIC ───────────────── */

  const month =
    currentDate.getMonth();

  const year =
    currentDate.getFullYear();

  const firstDayOfMonth =
    new Date(
      year,
      month,
      1
    );

  const lastDayOfMonth =
    new Date(
      year,
      month + 1,
      0
    );

  const startDay =
    firstDayOfMonth.getDay();

  const totalDays =
    lastDayOfMonth.getDate();

  const prevMonthLastDay =
    new Date(
      year,
      month,
      0
    ).getDate();

  const calendarCells = [];

  /* PREVIOUS MONTH DAYS */

  for (
    let i = startDay - 1;
    i >= 0;
    i--
  ) {
    calendarCells.push({
      day:
        prevMonthLastDay -
        i,
      currentMonth: false,
      date: new Date(
        year,
        month - 1,
        prevMonthLastDay -
          i
      ),
    });
  }

  /* CURRENT MONTH DAYS */

  for (
    let day = 1;
    day <= totalDays;
    day++
  ) {
    calendarCells.push({
      day,
      currentMonth: true,
      date: new Date(
        year,
        month,
        day
      ),
    });
  }

  /* NEXT MONTH DAYS */

  const remaining =
    42 -
    calendarCells.length;

  for (
    let day = 1;
    day <= remaining;
    day++
  ) {
    calendarCells.push({
      day,
      currentMonth: false,
      date: new Date(
        year,
        month + 1,
        day
      ),
    });
  }

  /* ───────────────── BOOKINGS ───────────────── */

  const selectedDateString =
    formatDate(
      selectedDate
    );

  const selectedDayBookings =
    bookings.filter(
      (booking) =>
        booking?.date &&
        formatDate(
          booking.date
        ) ===
          selectedDateString
    );

  const upcomingBookings =
    useMemo(() => {
      return bookings
        .filter(
          (booking) =>
            new Date(
              booking.date
            ) >= today
        )
        .sort(
          (a, b) =>
            new Date(
              a.date
            ) -
            new Date(
              b.date
            )
        )
        .slice(0, 5);
    }, [bookings]);

  /* ───────────────── EVENT CHECK ───────────────── */

  const hasEvent = (
    date
  ) => {
    return bookings.some(
      (booking) =>
        booking?.date &&
        formatDate(
          booking.date
        ) ===
          formatDate(date)
    );
  };

  /* ───────────────── NAVIGATION ───────────────── */

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

  /* ───────────────── LOADING ───────────────── */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-700 text-lg font-semibold">
          Loading Calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            Calendar
          </h1>

          <p className="text-slate-500 mt-2">
            View
            scheduled events
          </p>
        </div>

        <button
          onClick={() => {
            setCurrentDate(
              new Date()
            );

            setSelectedDate(
              new Date()
            );
          }}
          className="h-11 px-4 rounded-xl border border-slate-300 bg-white flex items-center gap-2 text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <CalendarDays className="w-4 h-4" />
          Today
        </button>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* CALENDAR */}

        <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* TOP */}

          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-2xl font-semibold text-slate-800">
              {currentDate.toLocaleString(
                "default",
                {
                  month:
                    "long",
                  year:
                    "numeric",
                }
              )}
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

          <div className="grid grid-cols-7 border-b border-slate-200">
            {[
              "Sun",
              "Mon",
              "Tue",
              "Wed",
              "Thu",
              "Fri",
              "Sat",
            ].map(
              (day) => (
                <div
                  key={day}
                  className="py-4 text-center text-sm font-semibold text-slate-500"
                >
                  {day}
                </div>
              )
            )}
          </div>

          {/* CALENDAR GRID */}

          <div className="grid grid-cols-7">
            {calendarCells.map(
              (
                cell,
                index
              ) => {
                const isSelected =
                  formatDate(
                    cell.date
                  ) ===
                  formatDate(
                    selectedDate
                  );

                const isToday =
                  formatDate(
                    cell.date
                  ) ===
                  formatDate(
                    today
                  );

                const event =
                  hasEvent(
                    cell.date
                  );

                return (
                  <button
                    key={index}
                    onClick={() =>
                      setSelectedDate(
                        cell.date
                      )
                    }
                    className={`h-28 border border-slate-100 p-2 relative transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    {/* DATE */}

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isToday &&
                        !isSelected
                          ? "bg-blue-100 text-blue-600"
                          : ""
                      } ${
                        !cell.currentMonth
                          ? "text-slate-300"
                          : ""
                      }`}
                    >
                      {cell.day}
                    </div>

                    {/* EVENT DOT */}

                    {event && (
                      <div
                        className={`absolute bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${
                          isSelected
                            ? "bg-white"
                            : "bg-blue-500"
                        }`}
                      />
                    )}
                  </button>
                );
              }
            )}
          </div>

          {/* FOOTER */}

          <div className="p-5 flex items-center gap-6 text-sm text-slate-500 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />

              Has Events
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-400" />

              Today
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              {selectedDate.toLocaleDateString(
                "en-US",
                {
                  month:
                    "short",
                  day: "numeric",
                  year:
                    "numeric",
                }
              )}
            </h2>
          </div>

          <div className="p-6 min-h-[500px]">
            {selectedDayBookings.length ===
            0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <CalendarDays className="w-16 h-16 text-slate-300 mb-4" />

                <p className="text-slate-500 font-medium">
                  No events
                  scheduled
                </p>

                <p className="text-slate-400 text-sm mt-2">
                  There are no
                  events for
                  this date
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayBookings.map(
                  (
                    booking
                  ) => (
                    <div
                      key={
                        booking._id
                      }
                      className="border border-slate-200 rounded-2xl p-4 bg-slate-50"
                    >
                      <h3 className="font-semibold text-slate-800 text-lg">
                        {getBookingHall(booking)}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {getBookingPurpose(booking)}
                      </p>

                      <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />

                          {getBookingUser(booking)}
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock3 className="w-4 h-4" />

                          {
                            booking.startTime
                          }{" "}
                          -{" "}
                          {
                            booking.endTime
                          }
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />

                          {getBookingLocation(booking)}
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UPCOMING EVENTS */}

      <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            Upcoming Events
            (Next 7 Days)
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {upcomingBookings.length ===
          0 ? (
            <div className="text-center py-10">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />

              <p className="text-slate-500 font-medium">
                No upcoming
                events
              </p>

              <p className="text-slate-400 text-sm mt-2">
                Upcoming events will
                appear here
              </p>
            </div>
          ) : (
            upcomingBookings.map(
              (booking) => (
                <div
                  key={
                    booking._id
                  }
                  className="border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-50 transition"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {getBookingHall(booking)}
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      {getBookingPurpose(booking)}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />

                        {getBookingUser(booking)}
                      </span>

                      <span className="px-2 py-1 rounded-lg bg-green-50 text-green-600 text-xs font-medium">
                        {
                          booking.status
                        }
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-medium text-slate-700">
                      {new Date(
                        booking.date
                      ).toLocaleDateString()}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {
                        booking.startTime
                      }{" "}
                      -{" "}
                      {
                        booking.endTime
                      }
                    </p>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
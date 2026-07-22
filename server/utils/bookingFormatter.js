const formatBookingForResponse = (booking = {}) => ({
  _id: booking._id,
  date: booking.date,
  startTime: booking.startTime,
  endTime: booking.endTime,
  status: booking.status,
  purpose: booking.purpose,
  hall: {
    _id: booking.hallId?._id,
    name: booking.hallId?.name || "Hall",
  },
  user: {
    _id: booking.bookedBy?._id,
    name: booking.bookedBy?.name || "User",
    email: booking.bookedBy?.email || "",
  },
  hallId: booking.hallId
    ? {
        _id: booking.hallId._id,
        name: booking.hallId.name,
      }
    : null,
  bookedBy: booking.bookedBy
    ? {
        _id: booking.bookedBy._id,
        name: booking.bookedBy.name,
        email: booking.bookedBy.email,
      }
    : null,
});

module.exports = {
  formatBookingForResponse,
};

const test = require('node:test');
const assert = require('node:assert/strict');
const { formatBookingForResponse } = require('../utils/bookingFormatter');

test('formats booking payloads with the normalized hall and user shapes', () => {
  const booking = {
    _id: 'booking-1',
    date: '2026-08-01',
    startTime: '09:00',
    endTime: '10:00',
    status: 'Pending',
    purpose: 'Team sync',
    hallId: { _id: 'hall-1', name: 'Main Hall' },
    bookedBy: { _id: 'user-1', name: 'Ada', email: 'ada@example.com' },
  };

  const formatted = formatBookingForResponse(booking);

  assert.equal(formatted._id, 'booking-1');
  assert.equal(formatted.purpose, 'Team sync');
  assert.deepEqual(formatted.hall, { _id: 'hall-1', name: 'Main Hall' });
  assert.deepEqual(formatted.user, { _id: 'user-1', name: 'Ada', email: 'ada@example.com' });
  assert.deepEqual(formatted.hallId, { _id: 'hall-1', name: 'Main Hall' });
  assert.deepEqual(formatted.bookedBy, { _id: 'user-1', name: 'Ada', email: 'ada@example.com' });
});

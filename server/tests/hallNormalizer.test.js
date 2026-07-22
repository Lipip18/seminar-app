const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeHallPayload } = require('../utils/hallNormalizer');

test('normalizes hall payloads to keep facilities and amenities aligned', () => {
  const payload = {
    name: 'Conference Hall',
    capacity: 80,
    description: 'Great for workshops',
    facilities: ['Projector', 'WiFi'],
  };

  const normalized = normalizeHallPayload(payload);

  assert.deepEqual(normalized.facilities, ['Projector', 'WiFi']);
  assert.deepEqual(normalized.amenities, ['Projector', 'WiFi']);
});

test('supports legacy amenities-only payloads', () => {
  const payload = {
    name: 'Lab Hall',
    capacity: 40,
    description: 'Lab setup',
    amenities: ['Air Conditioning'],
  };

  const normalized = normalizeHallPayload(payload);

  assert.deepEqual(normalized.facilities, ['Air Conditioning']);
  assert.deepEqual(normalized.amenities, ['Air Conditioning']);
});

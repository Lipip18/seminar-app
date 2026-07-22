const normalizeHallPayload = (payload = {}) => {
  const facilities = payload.facilities ?? payload.amenities ?? [];
  const normalizedFacilities = Array.isArray(facilities)
    ? facilities
    : [facilities].filter(Boolean);

  return {
    ...payload,
    facilities: normalizedFacilities,
    amenities: normalizedFacilities,
  };
};

module.exports = {
  normalizeHallPayload,
};

const MODERATION_STATUSES = new Set(["PENDING", "APPROVED", "REJECTED"]);
const REQUIRED_PROPERTY_FIELDS = [
  "title",
  "subtitle",
  "description",
  "price",
  "priceNum",
  "city",
  "location",
  "type",
  "beds",
  "bathrooms",
  "area",
];
const NUMERIC_PROPERTY_FIELDS = ["priceNum", "beds", "bathrooms", "area"];

function propertyCreateData(body, status = "PENDING") {
  return {
    title: body.title,
    subtitle: body.subtitle,
    description: body.description,

    price: body.price,
    priceNum: Number(body.priceNum),

    city: body.city,
    location: body.location,
    pincode: body.pincode || null,

    type: body.type,
    listingType: body.listingType || null,

    beds: Number(body.beds),
    bathrooms: Number(body.bathrooms),
    area: Number(body.area),

    furnishing: body.furnishing || null,

    amenities: Array.isArray(body.amenities) ? body.amenities : [],
    images: Array.isArray(body.images) ? body.images : [],

    builder: body.builder || "EstateElite",

    rating: Number(body.rating ?? 0),
    reviews: Number(body.reviews ?? 0),

    featured: false,
    isNew: true,
    status,

    image: body.image || "",
  };
}

function validatePropertyPayload(body) {
  const missingFields = REQUIRED_PROPERTY_FIELDS.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(", ")}`;
  }

  const invalidNumericFields = NUMERIC_PROPERTY_FIELDS.filter((field) =>
    Number.isNaN(Number(body[field]))
  );

  if (invalidNumericFields.length > 0) {
    return `Invalid numeric fields: ${invalidNumericFields.join(", ")}`;
  }

  return null;
}

module.exports = {
  MODERATION_STATUSES,
  propertyCreateData,
  validatePropertyPayload,
};

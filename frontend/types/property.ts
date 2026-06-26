export type PropertyId = string | number;

export type PropertyCategory = "residential" | "commercial";

export type PropertyStatus = "For Sale" | "For Rent" | "PENDING" | "APPROVED" | "REJECTED" | (string & {});

export type PropertyType =
  | "Apartment"
  | "Villa"
  | "Penthouse"
  | "Studio"
  | "Commercial"
  | (string & {});

export type PropertyListingType = "For Sale" | "For Rent" | "Private Sale" | "Sell" | "Rent" | (string & {});

export type Agent = {
  name: string;
  phone?: string;
  rating?: number;
  totalRatings?: number;
  deals: number;
  avatar?: string;
  email?: string;
};

export type Property = {
  id: PropertyId;
  category: PropertyCategory;

  title: string;
  subtitle?: string | null;
  description?: string | null;

  price: string;
  priceNum: number;
  rent?: number | null;

  city: string;
  city_id?: string;
  sub_area_id?: string;
  location: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  type: PropertyType;
  listingType?: PropertyListingType | null;
  status: PropertyStatus;

  beds: number;
  bedrooms?: number | null;
  baths?: number | null;
  bathrooms?: number | null;
  area: number;
  parking?: number | null;

  furnishing?: string | null;

  amenities: string[];
  features?: string[] | null;
  highlights?: string[] | null;

  image?: string | null;
  images?: string[] | null;
  img?: string | null;
  imgs?: string[] | null;

  builder?: string | null;
  yearBuilt?: number | string | null;
  facing?: string | null;
  floor?: string | null;
  rera?: string | null;
  possession?: string | null;

  rating: number;
  reviews: number;
  featured: boolean;
  featuredRequested?: boolean;
  requested_for?: number | null;
  granted_for?: number | null;
  featuredRequestDate?: string | null;
  featuredPaymentStatus?: string | null;
  featuredPaymentProof?: string | null;
  featuredPaymentAmount?: number | null;
  featuredApprovedBy?: string | null;
  featuredApprovedAt?: string | null;
  featuredExpiryDate?: string | null;
  featuredExpired?: boolean;
  featuredRejectionReason?: string | null;

  verified?: boolean;
  isNew: boolean;

  agent?: Agent | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  submittedBy?: string | null;
  submitterEmail?: string | null;
  views?: number | null;
  inquiries?: number | null;
  rejectReason?: string | null;
  moderationStatus?: string;

  lister_id?: string;
  lister_type?: string;
  lister_name?: string;

  officeType?: string | null;
  pantry?: boolean | null;
  washrooms?: number | null;
  powerBackup?: boolean | null;
  cabinCount?: number | null;
  conferenceRoom?: boolean | null;

  coordinates?: {
    lat: number;
    lng: number;
  };

  nearbyAmenities?: {
    hospital?: { name: string; distance: number; travelTime: string };
    school?: { name: string; distance: number; travelTime: string };
    supermarket?: { name: string; distance: number; travelTime: string };
    petrol?: { name: string; distance: number; travelTime: string };
    station?: { name: string; distance: number; travelTime: string };
    bank?: { name: string; distance: number; travelTime: string };
    restaurant?: { name: string; distance: number; travelTime: string };
    atm?: { name: string; distance: number; travelTime: string };
    pharmacy?: { name: string; distance: number; travelTime: string };
    busStation?: { name: string; distance: number; travelTime: string };
    college?: { name: string; distance: number; travelTime: string };
    park?: { name: string; distance: number; travelTime: string };
    airport?: { name: string; distance: number; travelTime: string };
  };

  cloudinaryImages?: { url: string; public_id: string }[];
};

export type ListingFilters = {
  type: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  beds: string;
  city: string;
  subarea: string;
  isNew: string;
  category: string;
};

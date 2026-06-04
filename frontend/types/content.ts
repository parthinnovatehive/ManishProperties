export type IconKey =
  | "award"
  | "barChart"
  | "building"
  | "calculator"
  | "globe"
  | "home"
  | "landmark"
  | "locate"
  | "mapPin"
  | "sparkles"
  | "tree"
  | "trending"
  | "users"
  | "zap";

export type City = {
  name: string;
  state: string;
  count: string;
  img: string;
};

export type Testimonial = {
  name: string;
  role: string;
  city: string;
  rating: number;
  avatar: string;
  text: string;
};

export type Category = {
  label: string;
  icon: IconKey;
  count: string;
  queryType?: string;
  surfaceClass: string;
  accentClass: string;
  borderClass: string;
};

export type Stat = {
  value: string;
  label: string;
  icon: IconKey;
};

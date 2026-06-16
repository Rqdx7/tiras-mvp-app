export const STORE_DEFAULTS = {
  name: "Tiras",
  address: "Leova MD, Strada Independenţei 11, MD-6301",
  phone: "0788 78 414",
  email: "contact@tiras.local",
};

export const ADMIN_ROLES = ["SELLER", "ADMIN", "ROOT_ADMIN"] as const;
export const MANAGER_ROLES = ["ADMIN", "ROOT_ADMIN"] as const;
export const ROOT_ROLE = "ROOT_ADMIN";

export const ORDER_STATUSES = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "ARCHIVED",
] as const;

export const DELIVERY_METHODS = {
  PICKUP: "Ridicare din magazin",
  AGREEMENT: "Livrare prin înțelegere telefonică",
};

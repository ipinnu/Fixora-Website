export interface Trade {
  id: string;
  label: string;
  /** Older labels stored in jobs/profiles before the category refresh */
  legacyLabels?: string[];
}

export interface CategoryGroup {
  id: string;
  label: string;
  trades: Trade[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "beauty_fashion",
    label: "Beauty & Fashion",
    trades: [
      { id: "tailor", label: "Tailor / Fashion Designer", legacyLabels: ["Tailoring"] },
      { id: "hair_stylist", label: "Hair Stylist", legacyLabels: ["Hair Making"] },
      { id: "barber", label: "Barber" },
      { id: "makeup_artist", label: "Makeup Artist", legacyLabels: ["Beauty & Makeup"] },
      { id: "nail_technician", label: "Nail Technician" },
      { id: "shoe_maker", label: "Shoe Maker" },
      { id: "leather_craftsman", label: "Leather Craftsman" },
      { id: "wig_maker", label: "Wig Maker" },
      { id: "lash_technician", label: "Lash Technician" },
      { id: "crocheting", label: "Crocheting" },
    ],
  },
  {
    id: "automotive",
    label: "Automotive Services",
    trades: [
      { id: "auto_mechanic", label: "Auto Mechanic", legacyLabels: ["Auto Repair"] },
      { id: "auto_electrician", label: "Auto Electrician" },
      { id: "panel_beater", label: "Panel Beater" },
      { id: "vehicle_spray_painter", label: "Vehicle Spray Painter" },
      { id: "vulcanizer", label: "Vulcanizer" },
      { id: "car_detailer", label: "Car Detailer" },
      { id: "car_wash_operator", label: "Car Wash Operator" },
      { id: "auto_ac_technician", label: "Auto AC Technician" },
      { id: "vehicle_diagnostics", label: "Vehicle Diagnostics Specialist" },
    ],
  },
  {
    id: "home_repair",
    label: "Home Repair & Maintenance",
    trades: [
      { id: "plumber", label: "Plumber", legacyLabels: ["Plumbing"] },
      { id: "electrician", label: "Electrician", legacyLabels: ["Electrical"] },
      { id: "ac_technician", label: "AC Technician", legacyLabels: ["AC & HVAC", "AC Repair"] },
      { id: "generator_technician", label: "Generator Technician" },
      { id: "appliance_repair", label: "Appliance Repair Technician", legacyLabels: ["Appliances"] },
      { id: "cctv_installer", label: "CCTV Installer", legacyLabels: ["Security Systems"] },
      { id: "solar_installer", label: "Solar Panel Installer", legacyLabels: ["Solar & Renewable"] },
      { id: "wifi_technician", label: "Internet / Wi-Fi Technician" },
      { id: "water_treatment", label: "Water Treatment Technician" },
      { id: "borehole_technician", label: "Borehole Technician" },
      { id: "locksmith", label: "Locksmith" },
      { id: "cleaning_professional", label: "Cleaning Professional", legacyLabels: ["Cleaning"] },
    ],
  },
  {
    id: "technology",
    label: "Technology & Digital Installation",
    trades: [
      { id: "computer_repair", label: "Computer Repair Technician" },
      { id: "mobile_repair", label: "Mobile Phone Repair Technician" },
      { id: "printer_technician", label: "Printer Technician" },
      { id: "pos_technician", label: "POS Terminal Technician" },
      { id: "smart_home", label: "Smart Home Installer" },
      { id: "network_technician", label: "Network Technician" },
    ],
  },
  {
    id: "construction",
    label: "Construction & Building",
    trades: [
      { id: "carpentry", label: "Carpentry" },
      { id: "painting", label: "Painting" },
      { id: "construction", label: "Construction" },
      { id: "tiling", label: "Tiling & Flooring" },
      { id: "welding", label: "Welding" },
      { id: "masonry", label: "Masonry" },
      { id: "roofing", label: "Roofing" },
      { id: "interior_design", label: "Interior Design" },
      { id: "landscaping", label: "Landscaping" },
    ],
  },
  {
    id: "events_creative",
    label: "Events & Creative",
    trades: [
      { id: "photography", label: "Photography" },
      { id: "events", label: "Events" },
      { id: "catering", label: "Catering" },
    ],
  },
  {
    id: "other_services",
    label: "Other Services",
    trades: [
      { id: "general_repair", label: "General Repair", legacyLabels: ["General Repairs"] },
      { id: "others", label: "Others" },
    ],
  },
];

export function getAllTrades(): Trade[] {
  return CATEGORY_GROUPS.flatMap((g) => g.trades);
}

export function getTradeById(id: string): Trade | undefined {
  return getAllTrades().find((t) => t.id === id);
}

export function getTradeLabel(id: string): string {
  return getTradeById(id)?.label ?? id;
}

export function getTradeByLabel(label: string): Trade | undefined {
  return getAllTrades().find(
    (t) => t.label === label || (t.legacyLabels?.includes(label) ?? false),
  );
}

export function getGroupLabels(): string[] {
  return CATEGORY_GROUPS.map((g) => g.label);
}

export function getFilterGroupOptions(allLabel = "All"): string[] {
  return [allLabel, ...getGroupLabels()];
}

/** Match a stored category/trade label against a group filter or exact trade label */
export function matchesCategoryFilter(categoryLabel: string, filter: string, allLabel = "All"): boolean {
  if (!filter || filter === allLabel) return true;

  const group = CATEGORY_GROUPS.find((g) => g.label === filter);
  if (group) {
    return group.trades.some(
      (t) => t.label === categoryLabel || (t.legacyLabels?.includes(categoryLabel) ?? false),
    );
  }

  const trade = getTradeByLabel(filter);
  if (trade) {
    return trade.label === categoryLabel || (trade.legacyLabels?.includes(categoryLabel) ?? false);
  }

  return categoryLabel === filter;
}

export function getGroupById(id: string): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find((g) => g.id === id);
}

export function getGroupForTradeId(tradeId: string): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find((g) => g.trades.some((t) => t.id === tradeId));
}

/** All stored labels (current + legacy) for trades in a group filter */
export function getLabelsForGroupFilter(filter: string, allLabel = "All"): string[] | null {
  if (!filter || filter === allLabel) return null;

  const group = CATEGORY_GROUPS.find((g) => g.label === filter);
  if (group) {
    return group.trades.flatMap((t) => [t.label, ...(t.legacyLabels ?? [])]);
  }

  const trade = getTradeByLabel(filter);
  if (trade) return [trade.label, ...(trade.legacyLabels ?? [])];

  return [filter];
}

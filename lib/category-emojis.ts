/** Stylized emoji accents for category groups and trades */
export const GROUP_EMOJIS: Record<string, string> = {
  beauty_fashion: "💄",
  automotive: "🚗",
  home_repair: "🏠",
  technology: "💻",
  construction: "🔨",
  events_creative: "🎉",
  other_services: "⚙️",
};

export const TRADE_EMOJIS: Record<string, string> = {
  tailor: "🪡",
  hair_stylist: "💇",
  barber: "💈",
  makeup_artist: "💄",
  nail_technician: "💅",
  shoe_maker: "👞",
  leather_craftsman: "🧵",
  wig_maker: "👩",
  lash_technician: "👁️",
  crocheting: "🧶",
  auto_mechanic: "🔧",
  auto_electrician: "⚡",
  panel_beater: "🛠️",
  vehicle_spray_painter: "🎨",
  vulcanizer: "🛞",
  car_detailer: "✨",
  car_wash_operator: "🚿",
  auto_ac_technician: "❄️",
  vehicle_diagnostics: "🔍",
  plumber: "🔧",
  electrician: "⚡",
  ac_technician: "🌬️",
  generator_technician: "🔋",
  appliance_repair: "📺",
  cctv_installer: "📹",
  solar_installer: "☀️",
  wifi_technician: "📶",
  water_treatment: "💧",
  borehole_technician: "🪣",
  locksmith: "🔑",
  cleaning_professional: "🧹",
  computer_repair: "💻",
  mobile_repair: "📱",
  printer_technician: "🖨️",
  pos_technician: "💳",
  smart_home: "🏡",
  network_technician: "🌐",
  carpentry: "🪚",
  painting: "🖌️",
  construction: "🏗️",
  tiling: "🧱",
  welding: "🔥",
  masonry: "🧱",
  roofing: "🏠",
  interior_design: "🛋️",
  landscaping: "🌿",
  photography: "📸",
  events: "🎊",
  catering: "🍽️",
  general_repair: "🔩",
  others: "➕",
};

export function getGroupEmoji(groupId: string): string {
  return GROUP_EMOJIS[groupId] ?? "✦";
}

export function getTradeEmoji(tradeId: string): string {
  return TRADE_EMOJIS[tradeId] ?? "◆";
}

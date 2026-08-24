export const SAFETY_CATEGORIES = [
  { code: "harassment", label: "Intimidatie" },
  { code: "sexual", label: "Seksueel gedrag" },
  { code: "inappropriate", label: "Ongepaste inhoud" },
  { code: "threats", label: "Bedreigingen" },
  { code: "contact_request", label: "Vraagt om privécontact" },
  { code: "money_request", label: "Vraagt om geld" },
  { code: "suspicious", label: "Verdacht gedrag" },
  { code: "other", label: "Anders" },
] as const;

export type SafetyCategoryCode = (typeof SAFETY_CATEGORIES)[number]["code"];

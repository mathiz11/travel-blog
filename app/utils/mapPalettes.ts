// Palette "illustration plate" de la carte Europe de l'accueil.

export interface MapPalette {
  key: string;
  label: string;
  /** Mer / fond */
  sea: string;
  /** Pays sans voyage */
  land: string;
  landStroke: string;
  /** Pays avec ≥1 voyage */
  active: string;
  activeStroke: string;
  /** Survol d'un pays actif */
  hover: string;
  /** Pays sélectionné (zoomé) */
  selected: string;
  /** Couleur des pins de ville */
  pin: string;
  /** Couleur du texte (noms de villes) sur la carte */
  text: string;
  /** Teinte du panneau latéral en verre */
  panelTone: "light" | "dark";
}

export const MAP_PALETTES: Record<string, MapPalette> = {
  meadow: {
    key: "meadow",
    label: "Meadow",
    sea: "#d8ece4",
    land: "#f3efe6",
    landStroke: "#aabfa2",
    active: "#5fae7e",
    activeStroke: "#3f8a5e",
    hover: "#79c194",
    selected: "#4f9d6e",
    pin: "#e0892b",
    text: "#3f5244",
    panelTone: "light",
  },
};

export const DEFAULT_MAP_PALETTE = "meadow";

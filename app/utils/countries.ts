// Normalisation des noms de pays (texte libre FR) vers un code ISO-3166 alpha-3,
// pour matcher les features du GeoJSON Europe (propriété ISO_A3).

/** minuscule, sans accents, sans espaces/tirets/ponctuation */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");
}

// Clés = nom FR (et alias) normalisés → ISO-A3
const FR_NAME_TO_ISO: Record<string, string> = {
  france: "FRA",
  espagne: "ESP",
  portugal: "PRT",
  italie: "ITA",
  allemagne: "DEU",
  belgique: "BEL",
  paysbas: "NLD",
  hollande: "NLD",
  luxembourg: "LUX",
  royaumeuni: "GBR",
  angleterre: "GBR",
  ecosse: "GBR",
  irlande: "IRL",
  suisse: "CHE",
  autriche: "AUT",
  pologne: "POL",
  tchequie: "CZE",
  republiquetcheque: "CZE",
  slovaquie: "SVK",
  hongrie: "HUN",
  slovenie: "SVN",
  croatie: "HRV",
  bosnieherzegovine: "BIH",
  bosnie: "BIH",
  serbie: "SRB",
  montenegro: "MNE",
  macedoine: "MKD",
  macedoinedunord: "MKD",
  albanie: "ALB",
  grece: "GRC",
  bulgarie: "BGR",
  roumanie: "ROU",
  moldavie: "MDA",
  ukraine: "UKR",
  bielorussie: "BLR",
  lituanie: "LTU",
  lettonie: "LVA",
  estonie: "EST",
  finlande: "FIN",
  suede: "SWE",
  norvege: "NOR",
  danemark: "DNK",
  islande: "ISL",
  russie: "RUS",
  turquie: "TUR",
  chypre: "CYP",
  malte: "MLT",
  kosovo: "KOS",
  andorre: "AND",
  monaco: "MCO",
  liechtenstein: "LIE",
  saintmarin: "SMR",
};

/** Renvoie le code ISO-A3 d'un nom de pays FR libre, ou null si inconnu. */
export function countryToIso(name: string | null | undefined): string | null {
  if (!name) return null;
  return FR_NAME_TO_ISO[normalize(name)] ?? null;
}

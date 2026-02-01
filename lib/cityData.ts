// lib/cityData.ts

const CITY_TO_LOCALE: Record<string, string> = {
  // Popularne miasta
  Warsaw: "485",
  Warszawa: "485",
  Paris: "66746",
  Paryż: "66746",
  Rome: "71631",
  Rzym: "71631",
  Barcelona: "66342",
  Madrid: "66254",
  Madryt: "66254",
  London: "67458",
  Londyn: "67458",
  Berlin: "65144",
  Amsterdam: "75061",
  Prague: "64162",
  Praga: "64162",
  Vienna: "60335",
  Wiedeń: "60335",
  Budapest: "68199",
  Budapeszt: "68199",
  Lisbon: "76528",
  Lizbona: "76528",
  Athens: "99239",
  Ateny: "99239",
  Istanbul: "79079",
  Dublin: "68616",
  Copenhagen: "113",
  Kopenhaga: "113",
  Stockholm: "1638",
  Sztokholm: "1638",
  Oslo: "75084",
  Reykjavik: "22",
  Rejkiawik: "22",
  Helsinki: "66544",

  // Włochy
  Venice: "71510",
  Wenecja: "71510",
  Florence: "71854",
  Florencja: "71854",
  Milan: "71749",
  Mediolan: "71749",
  Naples: "71720",
  Neapol: "71720",
  Bologna: "71986",
  Turin: "71534",
  Turyn: "71534",
  Verona: "71506",

  // Hiszpania
  Seville: "65870",
  Sewilla: "65870",
  Valencia: "65847",
  Walencja: "65847",
  Málaga: "32",
  Granada: "66003",
  Bilbao: "66335",

  // Francja
  Lyon: "66838",
  Marseille: "66825",
  Marsylia: "66825",
  Nice: "66770",
  Nicea: "66770",
  Bordeaux: "67101",

  // Portugalia
  Porto: "76573",
  Funchal: "76533",

  // Kraje (fallback)
  Poland: "485",
  Polska: "485",
  France: "66746",
  Francja: "66746",
  Italy: "71631",
  Włochy: "71631",
  Spain: "66254",
  Hiszpania: "66254",
  Germany: "65144",
  Niemcy: "65144",
  "United Kingdom": "67458",
  "Wielka Brytania": "67458",
  Netherlands: "75061",
  Holandia: "75061",
  Greece: "99239",
  Grecja: "99239",
  Portugal: "76528",
  Portugalia: "76528",
  Austria: "60335",
  Hungary: "68199",
  Węgry: "68199",
  "Czech Republic": "64162",
  Czechy: "64162",
  Turkey: "79079",
  Turcja: "79079",
  Iceland: "22",
  Islandia: "22",
  Norway: "75084",
  Norwegia: "75084",
  Sweden: "1638",
  Szwecja: "1638",
  Denmark: "65338",
  Dania: "65338",
  Finland: "66544",
  Finlandia: "66544",
  Ireland: "68616",
  Irlandia: "68616",
};

/**
 * Pobiera ID locale dla danego miasta lub kraju.
 * Próbuje dopasować najpierw miasto, potem kraj, na końcu domyślny.
 */
export function getLocaleId(cityName: string, countryName: string): string {
  const defaultLocale = "485"; // Warszawa

  // 1. Próba dopasowania pełnej nazwy miasta
  if (cityName && CITY_TO_LOCALE[cityName]) {
    return CITY_TO_LOCALE[cityName];
  }

  // 2. Próba wyciągnięcia miasta z formatu "Warszawa, Polska"
  if (cityName && cityName.includes(",")) {
    const shortCity = cityName.split(",")[0].trim();
    if (CITY_TO_LOCALE[shortCity]) {
      return CITY_TO_LOCALE[shortCity];
    }
  }

  // 3. Próba po nazwie kraju
  if (countryName && CITY_TO_LOCALE[countryName]) {
    return CITY_TO_LOCALE[countryName];
  }

  // 4. Ostateczność: domyślny kod
  return defaultLocale;
}

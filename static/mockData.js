export const mockData = {
  Santorini: {
    plan: {
      itinerary_title: "Egejska Przygoda: Santorini",
      days: [
        {
          day_number: 1,
          location: "Oia & Fira, Grecja",
          activities: [
            {
              period: "MORNING",
              time_range: "06.00 - 11.00",
              description:
                "Rozpocznij dzień od spaceru wąskimi uliczkami Oia przed tłumami turystów. Zjedz śniadanie z widokiem na kalderę, delektując się jogurtem greckim z miodem.",
              photo_query: "Oia Santorini sunrise caldera",
            },
            {
              period: "AFTERNOON",
              time_range: "12.00 - 17.00",
              description:
                "Przejazd do Firy na zakupy w butikach. Następnie wizyta na czarnej plaży Perissa i lunch w nadmorskiej tawernie.",
              photo_query: "Santorini black sand beach Perissa",
            },
            {
              period: "EVENING",
              time_range: "18.00 - 23.00",
              description:
                "Kolacja przy zachodzie słońca w zatoce Amoudi. Spróbuj świeżych owoców morza i lokalnego wina Assyrtiko.",
              photo_query: "Amoudi Bay Santorini sunset dinner",
            },
          ],
        },
      ],
    },
    sources: [
      { title: "Santorini Travel Guide", uri: "https://www.visitgreece.gr" },
    ],
  },
};

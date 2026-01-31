// lib/types.ts

export interface Activity {
  period: string;
  time_range: string;
  description: string;
  maps_query: string;
  maps_url?: string;
}

export interface Day {
  day_number: number;
  location: string;
  location_en: string;
  activities: Activity[];
  imageUrl?: string;
  photoAuthor?: string;
  photoAuthorLink?: string;
  used_query?: string;
}

export interface TravelTips {
  before_you_go: {
    visa_docs: string;
    health: string;
    essentials: string;
  };
  transport: {
    airport_transfer: string;
    local_transport: string;
    rental_info: string;
  };
  finances: {
    currency_payments: string;
    example_prices: string[];
    tipping_culture: string;
  };
  culture_safety: {
    phrases: string;
    etiquette: string;
    safety_scams: string;
  };
}

export interface TripPlan {
  itinerary_title: string;
  country_en: string;
  days: Day[];
  travel_tips: TravelTips;
}

export interface PlanResponse {
  plan: TripPlan;
  sources: any[];
  id?: string;
}

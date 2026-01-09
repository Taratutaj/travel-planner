RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "itinerary_title": {"type": "STRING"},
        "country_en": {"type": "STRING"}, # NOWE POLE: Kraj po angielsku dla całego planu
        "days": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "day_number": {"type": "INTEGER"},
                    "location": {"type": "STRING"},
                    "location_en": {"type": "STRING"},
                    "activities": {
                        "type": "ARRAY",
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "period": {"type": "STRING"},
                                "time_range": {"type": "STRING"},
                                "description": {"type": "STRING"}
                            },
                            "required": ["period", "time_range", "description"]
                        }
                    }
                },
                "required": ["day_number", "location", "location_en", "activities"]
            }
        }
    },
    "required": ["itinerary_title", "country_en", "days"]
}
RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "itinerary_title": {"type": "STRING"},
        "country_en": {
            "type": "STRING"
        },  # NOWE POLE: Kraj po angielsku dla całego planu
        "days": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "day_number": {"type": "INTEGER"},
                    "location": {"type": "STRING"},
                    "location_en": {"type": "STRING"},
                    "activities": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "period": {"type": "string"},
                                "time_range": {"type": "string"},
                                "description": {"type": "string"},
                                "maps_query": {"type": "string"},
                            },
                            "required": [
                                "period",
                                "time_range",
                                "description",
                                "maps_query",
                            ],
                        },
                    },
                },
                "required": ["day_number", "location", "location_en", "activities"],
            },
        },
    },
    "required": ["itinerary_title", "country_en", "days"],
}

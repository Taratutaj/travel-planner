RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "itinerary_title": {"type": "STRING"},
        "country_en": {"type": "STRING"},
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
                        "minItems": 3,
                        "maxItems": 3,
                        "items": {
                            "type": "OBJECT",
                            "properties": {
                                "period": {"type": "STRING"},
                                "time_range": {"type": "STRING"},
                                "description": {"type": "STRING"},
                                "maps_query": {"type": "STRING"},
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
        "travel_tips": {
            "type": "OBJECT",
            "properties": {
                "before_you_go": {
                    "type": "OBJECT",
                    "properties": {
                        "visa_docs": {"type": "STRING"},
                        "health": {"type": "STRING"},
                        "essentials": {"type": "STRING"},
                    },
                    "required": ["visa_docs", "health", "essentials"],
                },
                "transport": {
                    "type": "OBJECT",
                    "properties": {
                        "airport_transfer": {"type": "STRING"},
                        "local_transport": {"type": "STRING"},
                        "rental_info": {"type": "STRING"},
                    },
                    "required": ["airport_transfer", "local_transport", "rental_info"],
                },
                "finances": {
                    "type": "OBJECT",
                    "properties": {
                        "currency_payments": {"type": "STRING"},
                        "example_prices": {
                            "type": "ARRAY",
                            "items": {"type": "STRING"},
                        },
                        "tipping_culture": {"type": "STRING"},
                    },
                    "required": [
                        "currency_payments",
                        "example_prices",
                        "tipping_culture",
                    ],
                },
                "culture_safety": {
                    "type": "OBJECT",
                    "properties": {
                        "phrases": {"type": "STRING"},
                        "etiquette": {"type": "STRING"},
                        "safety_scams": {"type": "STRING"},
                    },
                    "required": ["phrases", "etiquette", "safety_scams"],
                },
            },
            "required": ["before_you_go", "transport", "finances", "culture_safety"],
        },
    },
    "required": ["itinerary_title", "country_en", "days", "travel_tips"],
}

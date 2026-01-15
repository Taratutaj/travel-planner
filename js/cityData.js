// js/cityData.js

const CITY_TO_LOCALE = {
    "Aarhus": "65338",
    "Abu Dhabi": "60013",
    "Akureyri": "71389",
    "Albufeira": "76558",
    "Alicante": "66088",
    "Amsterdam": "75061",
    // Tutaj możesz dopisywać kolejne miasta zgodnie ze wzorem: "Nazwa": "Kod",
};

/**
 * Pobiera ID locale dla danego miasta lub zwraca domyślny kod.
 */
export function getLocaleId(cityName) {
    const defaultLocale = "260932"; 
    return CITY_TO_LOCALE[cityName] || defaultLocale;
}

/**
 * Tworzy i dodaje widget Travelpayouts do wskazanego kontenera.
 */
export function injectTravelpayoutsWidget(containerId, localeId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Czyścimy kontener, aby uniknąć duplikowania widgetów przy ponownym generowaniu
    container.innerHTML = '';

    const script = document.createElement('script');
    script.async = true;
    script.charset = "utf-8";
    script.src = `https://trpwdg.com/content?currency=PLN&trs=488701&shmarker=633612&language=pl&locale=${localeId}&layout=horizontal&cards=4&powered_by=true&campaign_id=89&promo_id=3947`;

    container.appendChild(script);
}

/**
 * ClimaMachala Sectorial - Lógica de Monitoreo Hiperlocal
 * Consultas multi-coordenada a Open-Meteo, Mapa Leaflet con Radar Doppler RainViewer,
 * Ranking de Fuentes y Diagnóstico Inteligente Antigravity por Sector.
 */

// Definición geográfica de los 7 sectores clave de Machala
const MACHALA_SECTORS = [
  {
    id: 'micasa',
    name: 'Mi Casa 🏠 (Hernan - Los Vergeles)',
    landmarks: 'Cdla. Los Vergeles, Urbano Los Andes, San Gregorio',
    lat: -3.2545,
    lon: -79.9345,
    tag: 'Mi Casa 🏠',
    color: '#ffd166',
    isUserHome: true
  },
  {
    id: 'norte',
    name: 'Norte (Urdesa Este / Circunvalación)',
    landmarks: 'Urdesa Este, Av. Guayas, Circunvalación Norte',
    lat: -3.2435,
    lon: -79.9480,
    tag: 'Norte',
    color: '#00f2fe'
  },
  {
    id: 'machala_libre',
    name: 'Machala Libre / Los Ceibos',
    landmarks: 'Sector Machala Libre, Los Ceibos, Av. Edgar Córdova',
    lat: -3.2515,
    lon: -79.9385,
    tag: 'Machala Libre',
    color: '#38bdf8'
  },
  {
    id: 'brisas',
    name: 'Noreste (Las Brisas / El Bosque)',
    landmarks: 'Cdla. Las Brisas, El Bosque, La Florida, Av. 25 de Junio',
    lat: -3.2575,
    lon: -79.9450,
    tag: 'Las Brisas',
    color: '#ff477e'
  },
  {
    id: 'centro',
    name: 'Centro Cívico y Comercial',
    landmarks: 'Parque Central Juan Montalvo, Paseo de la Merced, 9 de Octubre',
    lat: -3.2595,
    lon: -79.9590,
    tag: 'Centro',
    color: '#4facfe'
  },
  {
    id: 'sur',
    name: 'Sur (Rayito de Luz / Balosa)',
    landmarks: 'Rayito de Luz, Cdla. del Maestro, Vía a Balosa, Nuevo Pilo',
    lat: -3.2820,
    lon: -79.9530,
    tag: 'Sur',
    color: '#06d6a0'
  },
  {
    id: 'puerto',
    name: 'Puerto Bolívar (Zona Costera)',
    landmarks: 'Malecón de Puerto Bolívar, Muelle de Cabotaje, Brisa Marina',
    lat: -3.2675,
    lon: -80.0020,
    tag: 'Costa',
    color: '#38ef7d'
  },
  {
    id: 'este',
    name: 'Este (El Cambio / Terminal)',
    landmarks: 'Parroquia El Cambio, Terminal Terrestre, Vía a Pasaje',
    lat: -3.2725,
    lon: -79.9120,
    tag: 'Este',
    color: '#ffb703'
  },
  {
    id: 'oeste',
    name: 'Oeste (Vía Pajonal / San Antonio)',
    landmarks: 'Vía Pajonal, San Antonio, Club de Tenis',
    lat: -3.2610,
    lon: -79.9810,
    tag: 'Oeste',
    color: '#9d4edd'
  }
];

// Fuentes y Modelos Meteorológicos evaluados y ordenados por fiabilidad en Machala
const METEO_SOURCES = [
  {
    rank: 1,
    rankClass: 'rank-gold',
    name: 'ECMWF IFS (Centro Europeo)',
    institution: 'European Centre for Medium-Range Weather Forecasts',
    reliability: 96,
    stars: 5,
    bestFor: 'Pronóstico de Lluvia y Dinámica Costera (6 a 72 horas)',
    whyReliable: 'Es el modelo meteorológico más avanzado del planeta. Su parametrización de convección tropical modela con altísima precisión cómo las brisas marinas del Golfo de Guayaquil interactúan con la llanura de Machala.',
    whenToUse: 'Consúltalo para saber con alta certeza si lloverá hoy o mañana en tu sector.',
    barColor: '#ffd166'
  },
  {
    rank: 2,
    rankClass: 'rank-silver',
    name: 'Radar Doppler (RainViewer Live)',
    institution: 'Red Global de Radares Meteorológicos',
    reliability: 95,
    stars: 5,
    bestFor: 'Nowcasting Inmediato (0 a 90 minutos)',
    whyReliable: 'No es una estimación matemática futura, sino una medición física de reflectividad de las gotas de agua en las nubes en tiempo real. Si ves una mancha roja acercándose a Vergeles, lloverá con seguridad en minutos.',
    whenToUse: 'Cuando estés en la calle o quieras saber si el aguacero parará en los próximos 30 minutos.',
    barColor: '#00f2fe'
  },
  {
    rank: 3,
    rankClass: 'rank-bronze',
    name: 'INAMHI Alertas Oficiales',
    institution: 'Instituto Nacional de Meteorología e Hidrología (Ecuador)',
    reliability: 91,
    stars: 4.5,
    bestFor: 'Alertas Hidrológicas, Desbordamientos y Fenómeno El Niño',
    whyReliable: 'Emite advertencias meteorológicas con conocimiento del terreno y estaciones pluviométricas en El Oro. Es la fuente oficial para riesgos de anegamiento masivo en Machala.',
    whenToUse: 'Para emergencias, viajes interprovinciales por carretera y suspensión de actividades.',
    barColor: '#fb923c'
  },
  {
    rank: 4,
    rankClass: 'rank-standard',
    name: 'ICON 7km (Servicio Alemán DWD)',
    institution: 'Deutscher Wetterdienst',
    reliability: 88,
    stars: 4,
    bestFor: 'Transición Costa - Estribaciones Andinas (El Cambio, Pasaje)',
    whyReliable: 'Su malla triangular de alta densidad procesa muy bien la topografía cuando las nubes chocan entre la cuenca del Jubones y la cordillera baja.',
    whenToUse: 'Especialmente útil si te mueves hacia el Este de Machala o El Cambio.',
    barColor: '#a78bfa'
  },
  {
    rank: 5,
    rankClass: 'rank-standard',
    name: 'GFS Seamless (NOAA EE.UU.)',
    institution: 'National Oceanic and Atmospheric Administration',
    reliability: 82,
    stars: 3.5,
    bestFor: 'Vientos sinópticos y frentes de gran escala',
    whyReliable: 'Excelente para masas continentales y tendencias semanales, pero en Machala suele subestimar los chubascos repentinos y dispersos nocturnos, que es lo que suele mostrar Android por defecto.',
    whenToUse: 'Para comparar tendencias a largo plazo de varios días.',
    barColor: '#38bdf8'
  }
];

// Estado global de la aplicación
let weatherState = {
  sectorsData: [],
  selectedSectorId: 'micasa',
  userSectorId: null,
  activeFilter: 'all',
  lastUpdated: null,
  leafletMap: null,
  markersLayer: null,
  radarLayer: null,
  radarVisible: true,
  markersVisible: true
};

// ==========================================================================
// Mapeo e Interpretación de Códigos Meteorológicos (WMO)
// ==========================================================================
function interpretWeatherCode(code, precip = 0, isNight = false) {
  if (code >= 95) {
    return {
      text: 'Tormenta Eléctrica',
      icon: 'fa-cloud-bolt',
      color: '#ffd166',
      statusClass: 'badge-rain-storm',
      isRaining: true,
      intensity: 'Tormenta'
    };
  }
  if (code === 82 || precip >= 5.0) {
    return {
      text: 'Aguacero Torrencial',
      icon: 'fa-cloud-showers-water',
      color: '#ff477e',
      statusClass: 'badge-rain-torrential',
      isRaining: true,
      intensity: 'Muy Fuerte'
    };
  }
  if (code === 65 || code === 81 || precip >= 2.0) {
    return {
      text: 'Lluvia Fuerte',
      icon: 'fa-cloud-showers-heavy',
      color: '#3a86ff',
      statusClass: 'badge-rain-heavy',
      isRaining: true,
      intensity: 'Fuerte'
    };
  }
  if (code === 63 || code === 80 || (precip >= 0.5 && precip < 2.0)) {
    return {
      text: 'Lluvia Moderada',
      icon: 'fa-cloud-rain',
      color: '#00f2fe',
      statusClass: 'badge-rain-mod',
      isRaining: true,
      intensity: 'Moderada'
    };
  }
  if (code === 51 || code === 53 || code === 55 || code === 61 || (precip > 0.0 && precip < 0.5)) {
    return {
      text: 'Llovizna / Garúa',
      icon: isNight ? 'fa-cloud-moon-rain' : 'fa-cloud-sun-rain',
      color: '#38ef7d',
      statusClass: 'badge-rain-light',
      isRaining: true,
      intensity: 'Leve'
    };
  }
  if (code === 45 || code === 48) {
    return {
      text: 'Neblina / Niebla',
      icon: 'fa-smog',
      color: '#94a3b8',
      statusClass: 'badge-rain-none',
      isRaining: false,
      intensity: 'Seco'
    };
  }
  if (code === 3) {
    return {
      text: 'Cielo Nublado',
      icon: 'fa-cloud',
      color: '#94a3b8',
      statusClass: 'badge-rain-none',
      isRaining: false,
      intensity: 'Seco'
    };
  }
  if (code === 1 || code === 2) {
    return {
      text: 'Parcialmente Nublado',
      icon: isNight ? 'fa-cloud-moon' : 'fa-cloud-sun',
      color: isNight ? '#c084fc' : '#fbbf24',
      statusClass: 'badge-rain-none',
      isRaining: false,
      intensity: 'Seco'
    };
  }
  return {
    text: isNight ? 'Cielo Despejado (Noche)' : 'Cielo Despejado',
    icon: isNight ? 'fa-moon' : 'fa-sun',
    color: isNight ? '#a78bfa' : '#f59e0b',
    statusClass: 'badge-rain-none',
    isRaining: false,
    intensity: 'Seco'
  };
}

// ==========================================================================
// Consulta a Open-Meteo API en Batch Multi-Punto
// ==========================================================================
async function fetchMachalaWeatherData() {
  const lats = MACHALA_SECTORS.map(s => s.lat).join(',');
  const lons = MACHALA_SECTORS.map(s => s.lon).join(',');

  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,precipitation,rain,weather_code&minutely_15=precipitation,weather_code&timezone=America%2FGuayaquil&forecast_days=3`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(`Error en la consulta meteorológica: ${response.status}`);
  }

  const rawData = await response.json();
  const dataList = Array.isArray(rawData) ? rawData : [rawData];

  weatherState.sectorsData = MACHALA_SECTORS.map((sector, index) => {
    const raw = dataList[index] || {};
    const current = raw.current || {};
    const hourly = raw.hourly || {};
    const minutely15 = raw.minutely_15 || {};
    const precip = current.precipitation || 0;
    const weather = interpretWeatherCode(current.weather_code, precip);

    return {
      ...sector,
      rawCurrent: current,
      rawHourly: hourly,
      rawMinutely15: minutely15,
      temp: Math.round(current.temperature_2m ?? 25),
      feelsLike: Math.round(current.apparent_temperature ?? 27),
      humidity: current.relative_humidity_2m ?? 80,
      precip: precip.toFixed(1),
      precipNum: precip,
      windSpeed: Math.round(current.wind_speed_10m ?? 8),
      windDir: current.wind_direction_10m ?? 0,
      weather: weather
    };
  });

  weatherState.lastUpdated = new Date();
  renderApp();
  updateMapMarkers();
  initMapTimeSelector();
}

// ==========================================================================
// Mapa Interactivo Leaflet con Capa Doppler RainViewer
// ==========================================================================
function initLeafletMap() {
  if (weatherState.leafletMap) return;

  // Centro de Machala
  const machalaCenter = [-3.258, -79.960];
  const map = L.map('machala-map', {
    center: machalaCenter,
    zoom: 13,
    zoomControl: true,
    attributionControl: true
  });

  // Capas base 100% libres, sin API key, sin marcas de agua ni bloqueos
  const esriDarkBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    maxNativeZoom: 16,
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.esri.com" target="_blank">Esri</a>, HERE, Garmin'
  });

  const esriDarkRef = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    maxNativeZoom: 16,
    maxZoom: 19
  });

  const darkLayer = L.layerGroup([esriDarkBase, esriDarkRef]);

  const esriSatLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxNativeZoom: 18,
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.esri.com" target="_blank">Esri</a>, Maxar'
  });

  // Agregar por defecto la capa oscura calibrada
  darkLayer.addTo(map);
  weatherState.currentBaseLayer = 'dark';
  weatherState.baseLayers = { dark: darkLayer, satellite: esriSatLayer };

  weatherState.markersLayer = L.layerGroup().addTo(map);
  weatherState.leafletMap = map;

  // Cargar capa de radar Doppler en vivo de RainViewer
  loadRainViewerRadar(map);

  // Eventos de controles de mapa
  document.getElementById('btn-toggle-radar').addEventListener('click', function() {
    if (!weatherState.radarLayer) {
      showMapToast('🛰️ Conectando con radar Doppler RainViewer...');
      return;
    }
    weatherState.radarVisible = !weatherState.radarVisible;
    if (weatherState.radarVisible) {
      map.addLayer(weatherState.radarLayer);
      this.classList.add('active');
      showMapToast('🛰️ Radar Doppler activo: Si no ves manchas de color, es porque el cielo está despejado y no hay lluvia sobre Machala en este instante.');
    } else {
      map.removeLayer(weatherState.radarLayer);
      this.classList.remove('active');
      showMapToast('Radar Doppler desactivado');
    }
  });

  document.getElementById('btn-toggle-markers').addEventListener('click', function() {
    weatherState.markersVisible = !weatherState.markersVisible;
    if (weatherState.markersVisible) {
      map.addLayer(weatherState.markersLayer);
      this.classList.add('active');
    } else {
      map.removeLayer(weatherState.markersLayer);
      this.classList.remove('active');
    }
  });

  const basemapBtn = document.getElementById('btn-toggle-basemap');
  if (basemapBtn) {
    basemapBtn.addEventListener('click', function() {
      if (weatherState.currentBaseLayer === 'dark') {
        map.removeLayer(weatherState.baseLayers.dark);
        weatherState.baseLayers.satellite.addTo(map);
        weatherState.currentBaseLayer = 'satellite';
        this.innerHTML = '<i class="fa-solid fa-moon"></i> Ver Mapa Oscuro';
        this.classList.add('active');
      } else {
        map.removeLayer(weatherState.baseLayers.satellite);
        weatherState.baseLayers.dark.addTo(map);
        weatherState.currentBaseLayer = 'dark';
        this.innerHTML = '<i class="fa-solid fa-earth-americas"></i> Ver Satélite';
        this.classList.remove('active');
      }
    });
  }

  document.getElementById('btn-recenter-machala').addEventListener('click', function() {
    map.setView(machalaCenter, 13, { animate: true });
  });

  // Control interactivo de la Guía de Íconos del Clima
  const btnToggleLegend = document.getElementById('btn-toggle-legend');
  const btnCloseLegend = document.getElementById('btn-close-legend');
  const legendPanel = document.getElementById('weather-legend-panel');

  if (btnToggleLegend && legendPanel) {
    btnToggleLegend.addEventListener('click', function() {
      const isCollapsed = legendPanel.classList.toggle('collapsed');
      if (isCollapsed) {
        this.classList.remove('active');
      } else {
        this.classList.add('active');
        legendPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  if (btnCloseLegend && legendPanel) {
    btnCloseLegend.addEventListener('click', function() {
      legendPanel.classList.add('collapsed');
      if (btnToggleLegend) btnToggleLegend.classList.remove('active');
    });
  }

  // Soporte para hacer clic en cualquier punto del mapa y consultar el clima en tiempo real
  map.on('click', async function(e) {
    await handleMapCustomPoint(e.latlng.lat, e.latlng.lng, map);
  });
}

// Marcador temporal para puntos personalizados que el usuario clickea en el mapa
let customMapMarker = null;

async function handleMapCustomPoint(lat, lon, map) {
  const customIcon = L.divIcon({
    className: 'custom-sector-marker',
    html: `
      <div class="marker-pulse-ring" style="border-color: #ff007f; animation-duration: 1.2s;"></div>
      <div class="marker-inner-dot" style="background: #ff007f; color: #ff007f; box-shadow: 0 0 15px #ff007f;"></div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });

  if (customMapMarker) {
    map.removeLayer(customMapMarker);
  }

  customMapMarker = L.marker([lat, lon], { icon: customIcon }).addTo(map);

  customMapMarker.bindPopup(`
    <div style="font-family: var(--font-body); padding: 4px; text-align: center;">
      <i class="fa-solid fa-spinner spinning" style="font-size: 1.5rem; color: var(--cyan-neon);"></i>
      <p style="margin-top: 6px; font-size: 0.82rem; color: #cbd5e1;">Consultando estación satelital en (${lat.toFixed(4)}, ${lon.toFixed(4)})...</p>
    </div>
  `).openPopup();

  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability,precipitation&timezone=America%2FGuayaquil`;
    const res = await fetch(apiUrl);
    if (!res.ok) throw new Error('Error en consulta');
    const data = await res.json();
    const curr = data.current || {};
    const weather = interpretWeatherCode(curr.weather_code, curr.precipitation || 0);
    const prob = (data.hourly && data.hourly.precipitation_probability) ? (data.hourly.precipitation_probability[new Date().getHours()] || 0) : 0;

    customMapMarker.setPopupContent(`
      <div style="font-family: var(--font-body); padding: 4px; min-width: 230px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <strong style="color: #ff007f; font-size: 0.95rem;"><i class="fa-solid fa-location-crosshairs"></i> Punto Personalizado</strong>
          <span style="font-size: 0.72rem; color: #94a3b8; font-family: var(--font-mono);">${lat.toFixed(3)}, ${lon.toFixed(3)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0; border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1); padding: 6px 0;">
          <span>Estado: <strong>${weather.text}</strong></span>
          <span style="color: var(--cyan-neon); font-family: var(--font-mono); font-size: 1.15rem;"><strong>${(curr.precipitation || 0).toFixed(1)} mm/h</strong></span>
        </div>
        <div style="font-size: 0.8rem; color: #cbd5e1; display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
          <span>Temp: <strong>${Math.round(curr.temperature_2m || 25)}°C</strong></span>
          <span>Sens: <strong>${Math.round(curr.apparent_temperature || 27)}°C</strong></span>
          <span>Viento: <strong>${Math.round(curr.wind_speed_10m || 8)} km/h</strong></span>
          <span>Prob. lluvia: <strong>${prob}%</strong></span>
        </div>
      </div>
    `);

    // Actualizar recomendación de IA con este punto
    const titleEl = document.getElementById('ai-sector-title');
    const badgeEl = document.getElementById('ai-best-source-badge');
    const commentEl = document.getElementById('ai-sector-comment');
    const tipEl = document.getElementById('ai-sector-tip');

    titleEl.innerHTML = `Diagnóstico para <strong>Punto Personalizado (${lat.toFixed(3)}, ${lon.toFixed(3)})</strong>`;
    badgeEl.innerHTML = `Fuente recomendada: <strong>Radar Doppler + ECMWF</strong>`;
    commentEl.innerHTML = `
      Hernan, has consultado un punto exacto en las coordenadas **${lat.toFixed(4)}, ${lon.toFixed(4)}**. 
      La estación satelital reporta actualmente: **${weather.text}** con precipitación de **${(curr.precipitation || 0).toFixed(1)} mm/h**, temperatura de **${Math.round(curr.temperature_2m || 25)}°C** y probabilidad de lluvia del **${prob}%**. 
      Para este punto específico, el servicio más fiable para saber si va a llover en la próxima hora es el **Radar Doppler de reflectividad**.
    `;
    tipEl.textContent = 'Puedes hacer clic en cualquier otra manzana o calle de Machala para medir el clima punto a punto.';
  } catch (err) {
    customMapMarker.setPopupContent(`
      <div style="padding: 6px; color: var(--red-alert);">
        <i class="fa-solid fa-triangle-exclamation"></i> No se pudo obtener el clima para este punto.
      </div>
    `);
  }
}

// Obtiene la última captura de reflectividad de RainViewer
async function loadRainViewerRadar(map) {
  try {
    const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
    if (!res.ok) return;
    const data = await res.json();
    if (data.radar && data.radar.past && data.radar.past.length > 0) {
      const latestRadar = data.radar.past[data.radar.past.length - 1];
      const radarUrl = `https://tilecache.rainviewer.com/v2/radar/${latestRadar.path}/256/{z}/{x}/{y}/2/1_1.png`;

      weatherState.radarLayer = L.tileLayer(radarUrl, {
        opacity: 0.65,
        maxZoom: 18,
        zIndex: 50
      });

      if (weatherState.radarVisible) {
        weatherState.radarLayer.addTo(map);
      }
    }
  } catch (err) {
    console.warn('Radar RainViewer no disponible:', err);
  }
}

let mapToastTimer = null;
function showMapToast(msg) {
  let toast = document.getElementById('map-floating-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'map-floating-toast';
    toast.className = 'map-floating-toast';
    const mapCard = document.querySelector('.map-card-wrapper');
    if (mapCard) mapCard.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-satellite-dish" style="color: var(--cyan-neon);"></i> <span>${msg}</span>`;
  toast.style.display = 'flex';
  toast.style.opacity = '1';

  clearTimeout(mapToastTimer);
  mapToastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { toast.style.display = 'none'; }, 300);
  }, 4500);
}

// Inicializa el selector de horas flotante sobre el mapa
function initMapTimeSelector() {
  const container = document.getElementById('time-pills-container');
  const statusEl = document.getElementById('time-bar-status');
  const resetBtn = document.getElementById('btn-reset-time');
  const mapBar = document.getElementById('map-time-bar');
  const btnLeft = document.getElementById('btn-scroll-left');
  const btnRight = document.getElementById('btn-scroll-right');
  const btnTomorrow = document.getElementById('btn-jump-tomorrow');

  if (!container || !weatherState.sectorsData || !weatherState.sectorsData.length) return;

  // Evitar que el drag/scroll sobre el selector mueva el mapa Leaflet
  if (mapBar && window.L) {
    L.DomEvent.disableClickPropagation(mapBar);
    L.DomEvent.disableScrollPropagation(mapBar);
  }

  // Obtener específicamente los datos meteorológicos de Mi Casa (Los Vergeles)
  const homeSector = weatherState.sectorsData.find(sec => sec.isUserHome) || weatherState.sectorsData[0];
  const hourly = homeSector.rawHourly;
  if (!hourly || !hourly.time || !hourly.time.length) return;

  const now = new Date();
  const nowDate = now.getDate();
  const currentHour = now.getHours();

  // Buscar índice de la hora actual en los datos
  let nowIdx = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    const d = new Date(hourly.time[i]);
    if (d.getDate() === nowDate && d.getHours() === currentHour) {
      nowIdx = i;
      break;
    }
  }

  const liveHomePrecip = homeSector.precipNum || 0;
  const liveHomeTemp = homeSector.temp || 25;
  const liveHomeSub = liveHomePrecip >= 0.2 ? `${liveHomePrecip.toFixed(1)} mm` : `${liveHomeTemp}°C`;
  const liveHomeCondition = homeSector.weather?.name || 'Condiciones en vivo';

  let pillsHtml = `
    <button class="time-pill active" data-hour-idx="live" title="Ahora en Mi Casa (Los Vergeles): ${liveHomeCondition} • ${liveHomeTemp}°C${liveHomePrecip >= 0.1 ? ' • ' + liveHomePrecip.toFixed(1) + ' mm' : ''}">
      <span class="pill-day"><i class="fa-solid fa-circle live-dot-mini"></i> En Vivo</span>
      <span class="pill-hour">Ahora</span>
      <span class="pill-sub ${liveHomePrecip >= 0.2 ? 'sub-rain' : ''}">${liveHomeSub}</span>
    </button>
  `;

  // Generar hasta 36 horas adelante (incluyendo todo el día de mañana) con los datos hiperlocales de Mi Casa (Vergeles)
  for (let offset = 1; offset <= 36; offset++) {
    const idx = nowIdx + offset;
    if (idx >= hourly.time.length) break;

    const timeStr = hourly.time[idx];
    const dateObj = new Date(timeStr);
    const h24 = dateObj.getHours();
    const isTomorrow = dateObj.getDate() !== nowDate;
    const dayLabel = isTomorrow ? 'Mañana' : 'Hoy';
    const hourLabel = `${h24.toString().padStart(2, '0')}:00`;

    // Clima hiperlocal exacto de Mi Casa (Los Vergeles)
    const homePrecip = hourly.precipitation ? (hourly.precipitation[idx] || 0) : 0;
    const homeTemp = Math.round(hourly.temperature_2m ? (hourly.temperature_2m[idx] || 25) : 25);
    const homeCode = hourly.weather_code ? (hourly.weather_code[idx] || 0) : 0;

    const isNight = h24 >= 19 || h24 < 6;
    const wInfo = interpretWeatherCode(homeCode, homePrecip, isNight);
    const isRainAlert = homePrecip >= 0.2;
    const rainSub = isRainAlert ? `${homePrecip.toFixed(1)} mm` : `${homeTemp}°C`;

    pillsHtml += `
      <button class="time-pill ${isTomorrow ? 'pill-tomorrow' : ''}" data-hour-idx="${idx}" data-hour-str="${hourLabel}" data-day="${dayLabel}" title="${dayLabel} ${hourLabel} en Los Vergeles: ${wInfo.name} • ${homeTemp}°C${homePrecip >= 0.1 ? ' • Lluvia: ' + homePrecip.toFixed(1) + ' mm' : ''}">
        <span class="pill-day ${isTomorrow ? 'tag-tomorrow' : ''}">${dayLabel}</span>
        <span class="pill-hour"><i class="fa-solid ${wInfo.icon}" style="color: ${wInfo.color};"></i> ${hourLabel}</span>
        <span class="pill-sub ${isRainAlert ? 'sub-rain' : ''}">${rainSub}</span>
      </button>
    `;
  }

  container.innerHTML = pillsHtml;

  // Permitir scroll horizontal suave con la rueda del ratón
  container.addEventListener('wheel', function(e) {
    if (e.deltaY !== 0) {
      e.preventDefault();
      container.scrollLeft += e.deltaY * 1.6;
    }
  }, { passive: false });

  // Soporte de arrastre con el ratón (drag to scroll)
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  container.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - container.offsetLeft;
    scrollStart = container.scrollLeft;
  });
  container.addEventListener('mouseleave', () => { isDown = false; });
  container.addEventListener('mouseup', () => { isDown = false; });
  container.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollStart - walk;
  });

  // Flechas de navegación izquierda y derecha
  if (btnLeft) {
    btnLeft.onclick = () => {
      container.scrollBy({ left: -240, behavior: 'smooth' });
    };
  }
  if (btnRight) {
    btnRight.onclick = () => {
      container.scrollBy({ left: 240, behavior: 'smooth' });
    };
  }

  // Botón directo "Ver Mañana"
  if (btnTomorrow) {
    btnTomorrow.onclick = () => {
      const firstTomorrow = container.querySelector('.pill-tomorrow');
      if (firstTomorrow) {
        firstTomorrow.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        firstTomorrow.click();
      }
    };
  }

  // Event listener para cada píldora horaria
  container.querySelectorAll('.time-pill').forEach(btn => {
    btn.addEventListener('click', function() {
      container.querySelectorAll('.time-pill').forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const hourIdxVal = this.getAttribute('data-hour-idx');
      if (hourIdxVal === 'live') {
        weatherState.simulatedHourIndex = null;
        if (statusEl) statusEl.textContent = 'En Vivo';
        if (resetBtn) resetBtn.style.display = 'none';
        updateMapMarkers(null);
        renderSectorsGrid(weatherState.sectorsData);
        analyzeDisparity(weatherState.sectorsData);
        updateAiRecommendation(weatherState.selectedSectorId);
        showMapToast('Mostrando datos satelitales actuales en vivo');
      } else {
        const idx = parseInt(hourIdxVal, 10);
        weatherState.simulatedHourIndex = idx;
        const hourStr = this.getAttribute('data-hour-str');
        const dayLabel = this.getAttribute('data-day');
        if (statusEl) statusEl.innerHTML = `<span style="color: var(--cyan-neon);">${dayLabel} ${hourStr}</span>`;
        if (resetBtn) resetBtn.style.display = 'inline-flex';
        updateMapMarkers(idx);
        updateSectorsWithSimulatedHour(idx, hourStr, dayLabel);
        showMapToast(`Simulando mapa para: ${dayLabel} a las ${hourStr}`);
      }
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const liveBtn = container.querySelector('[data-hour-idx="live"]');
      if (liveBtn) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
        liveBtn.click();
      }
    });
  }
}

// Actualiza las tarjetas y diagnósticos cuando se selecciona una hora futura
function updateSectorsWithSimulatedHour(hourIdx, hourStr, dayLabel) {
  const simulatedSectors = weatherState.sectorsData.map(sec => {
    const rawH = sec.rawHourly || {};
    const temp = Math.round(rawH.temperature_2m ? rawH.temperature_2m[hourIdx] : sec.temp);
    const precipNum = rawH.precipitation ? (rawH.precipitation[hourIdx] || 0) : 0;
    const precip = precipNum.toFixed(1);
    const prob = rawH.precipitation_probability ? (rawH.precipitation_probability[hourIdx] || 0) : 0;
    const code = rawH.weather_code ? rawH.weather_code[hourIdx] : 0;
    const timeStr = rawH.time ? rawH.time[hourIdx] : '';
    const dObj = new Date(timeStr);
    const h24 = dObj.getHours();
    const isNight = h24 >= 19 || h24 < 6;
    const weather = interpretWeatherCode(code, precipNum, isNight);

    return {
      ...sec,
      temp,
      precip,
      precipNum,
      prob,
      weather
    };
  });

  renderSectorsGrid(simulatedSectors);
  renderCompareCards(simulatedSectors);

  // Actualizar banner de disparidad con pronóstico
  const banner = document.getElementById('disparity-banner');
  const title = document.getElementById('disparity-title');
  const desc = document.getElementById('disparity-desc');
  const badge = document.getElementById('disparity-status-badge');

  const raining = simulatedSectors.filter(s => s.precipNum >= 0.2 || s.weather.isRaining);
  const dry = simulatedSectors.filter(s => s.precipNum < 0.2 && !s.weather.isRaining);

  if (badge) badge.textContent = `Pronóstico ${hourStr}`;

  if (raining.length > 0 && dry.length > 0) {
    banner.classList.add('disparity-detected');
    title.innerHTML = `🔮 ${dayLabel} ${hourStr}: Se prevé lluvia en <strong>${raining.map(s => s.tag).join(', ')}</strong> y tiempo seco en <strong>${dry.map(s => s.tag).join(', ')}</strong>`;
    desc.textContent = `Proyección del modelo meteorológico ECMWF / Open-Meteo para las ${hourStr}.`;
  } else if (raining.length > 0) {
    banner.classList.remove('disparity-detected');
    title.innerHTML = `🌧️ ${dayLabel} ${hourStr}: Probabilidad de lluvia en todos los sectores de Machala (${raining[0].precip} mm/h)`;
    desc.textContent = `Ambiente húmedo generalizado proyectado para las ${hourStr}.`;
  } else {
    banner.classList.remove('disparity-detected');
    title.innerHTML = `☁️ ${dayLabel} ${hourStr}: Sin lluvias previstas en Machala`;
    desc.textContent = `Cielo proyectado estable o nublado sin precipitaciones significativas.`;
  }
}

// Actualiza los marcadores interactivos en el mapa con iconos visuales de clima diferenciados
function updateMapMarkers(simulatedHourIndex = null) {
  if (!weatherState.leafletMap || !weatherState.markersLayer) return;
  weatherState.markersLayer.clearLayers();

  weatherState.sectorsData.forEach(sector => {
    let temp = sector.temp;
    let precip = sector.precip;
    let precipNum = sector.precipNum;
    let weather = sector.weather;
    let prob = sector.prob || 0;
    let hourTitle = 'En Vivo';

    if (simulatedHourIndex !== null && sector.rawHourly && sector.rawHourly.time) {
      const idx = simulatedHourIndex;
      temp = Math.round(sector.rawHourly.temperature_2m ? sector.rawHourly.temperature_2m[idx] : sector.temp);
      precipNum = sector.rawHourly.precipitation ? (sector.rawHourly.precipitation[idx] || 0) : 0;
      precip = precipNum.toFixed(1);
      prob = sector.rawHourly.precipitation_probability ? (sector.rawHourly.precipitation_probability[idx] || 0) : 0;
      const code = sector.rawHourly.weather_code ? sector.rawHourly.weather_code[idx] : 0;
      const timeStr = sector.rawHourly.time[idx];
      const dObj = new Date(timeStr);
      const h24 = dObj.getHours();
      const isNight = h24 >= 19 || h24 < 6;
      weather = interpretWeatherCode(code, precipNum, isNight);
      hourTitle = `${h24.toString().padStart(2, '0')}:00`;
    }

    const isSelected = weatherState.selectedSectorId === sector.id;
    const isRaining = precipNum >= 0.2 || weather.isRaining;
    const isHome = Boolean(sector.isUserHome);
    const pulseColor = isSelected ? '#c77dff' : (isHome ? '#ffd166' : (isRaining ? weather.color : '#94a3b8'));

    // Pin visual de clima con icono diferenciado y color exacto
    const customIcon = L.divIcon({
      className: 'custom-weather-pin-container',
      html: `
        <div class="custom-weather-pin ${isSelected ? 'selected-pin' : ''} ${isHome ? 'home-pin' : ''}" style="--pin-glow: ${pulseColor};">
          <span class="pin-icon-wrap" style="color: ${weather.color};">
            <i class="fa-solid ${weather.icon}"></i>
          </span>
          <div class="pin-info-wrap">
            <span class="pin-sector-name">${sector.tag}</span>
            <span class="pin-weather-val">${precipNum > 0 ? precip + ' mm' : temp + '°C'}</span>
          </div>
        </div>
      `,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });

    const marker = L.marker([sector.lat, sector.lon], { 
      icon: customIcon,
      draggable: isHome,
      title: `${sector.name}: ${weather.text} (${temp}°C${precipNum > 0 ? ' • ' + precip + ' mm' : ''})`
    });

    if (isHome) {
      marker.on('dragend', function(e) {
        const pos = e.target.getLatLng();
        sector.lat = pos.lat;
        sector.lon = pos.lng;
        showMapToast(`Casa reubicada en: (${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)})`);
      });
    }

    const popupContent = `
      <div style="font-family: var(--font-body); padding: 4px; min-width: 230px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: ${sector.color}; font-size: 1.05rem;">${sector.name}</strong>
          <span style="font-size: 0.75rem; background: rgba(0,242,254,0.15); color: var(--cyan-neon); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-weight: 700;">${hourTitle}</span>
        </div>
        <p style="font-size: 0.78rem; color: #94a3b8; margin: 2px 0 6px;">${sector.landmarks}</p>
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 6px;">
          <span>Estado: <strong style="color: ${weather.color};">${weather.text}</strong></span>
          <span style="color: ${weather.color}; font-family: var(--font-mono);"><strong>${precip} mm/h</strong></span>
        </div>
        <div style="font-size: 0.85rem; margin-top: 4px; display: flex; justify-content: space-between;">
          <span>Temp: <strong>${temp}°C</strong></span>
          <span>Prob. lluvia: <strong style="color: var(--cyan-neon);">${prob}%</strong></span>
        </div>
        ${isHome ? '<p style="font-size: 0.72rem; color: #ffd166; margin: 6px 0 2px;"><i class="fa-solid fa-arrows-up-down-left-right"></i> Puedes arrastrar este pin a la ubicación exacta de tu casa</p>' : ''}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 10px;">
          <button onclick="selectSector('${sector.id}')" style="background: rgba(157,78,221,0.25); border: 1px solid #c77dff; color: #fff; padding: 6px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">
            <i class="fa-solid fa-wand-magic-sparkles"></i> Asesor IA
          </button>
          <button onclick="selectSector('${sector.id}'); openHourlyModal('${sector.id}')" style="background: rgba(0,242,254,0.25); border: 1px solid var(--cyan-neon); color: #fff; padding: 6px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">
            <i class="fa-solid fa-clock"></i> ¿Qué va a pasar?
          </button>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent);
    marker.on('click', () => {
      selectSector(sector.id);
    });

    weatherState.markersLayer.addLayer(marker);
  });
}

// ==========================================================================
// Diagnóstico y Recomendación de IA según el Sector
// ==========================================================================
function updateAiRecommendation(sectorId) {
  const sector = weatherState.sectorsData.find(s => s.id === sectorId) || weatherState.sectorsData[0];
  if (!sector) return;

  const titleEl = document.getElementById('ai-sector-title');
  const badgeEl = document.getElementById('ai-best-source-badge');
  const commentEl = document.getElementById('ai-sector-comment');
  const tipEl = document.getElementById('ai-sector-tip');

  titleEl.innerHTML = `Diagnóstico de Fiabilidad para <strong>${sector.name}</strong>`;

  if (sector.id === 'norte' || sector.id === 'micasa') {
    badgeEl.innerHTML = `Fuente #1 recomendada: <strong>ECMWF + Radar Doppler</strong>`;
    commentEl.innerHTML = `
      Hernan, este es el punto exacto de **tu casa (Los Vergeles / Circunvalación Norte)**. 
      Las tormentas en esta zona suelen entrar rápidamente desde el estuario y descargan con gran volumen en periodos cortos (30 a 50 minutos). 
      El selector de horas superior te muestra el pronóstico hiperlocal proyectado hora a hora directamente para tu domicilio en Vergeles.
    `;
    tipEl.textContent = 'Tu casa en Los Vergeles está monitoreada en tiempo real. En suelo plano y canales secundarios vigila el avance del radar.';
  } else if (sector.id === 'machala_libre') {
    badgeEl.innerHTML = `Fuente #1 recomendada: <strong>ECMWF + Radar Doppler</strong>`;
    commentEl.innerHTML = `
      Para **Machala Libre y Los Ceibos**, al situarse en el corredor intermedio hacia Las Brisas, las celdas de lluvia suelen cruzar aquí en dirección suroeste.
    `;
    tipEl.textContent = 'Monitorea la reflectividad Doppler para saber el avance de las celdas de precipitación.';
  } else if (sector.id === 'brisas') {
    badgeEl.innerHTML = `Fuente #1 recomendada: <strong>ECMWF + Radar Doppler</strong>`;
    commentEl.innerHTML = `
      Hernan, para **Las Brisas, El Bosque y el sector del Estero Salinas (Noreste)**, la combinación más fiable es el **Radar Doppler de reflectividad** junto con **ECMWF IFS**. 
      Esta zona residencial y comercial recibe con frecuencia las bandas de lluvia que se desplazan desde el interior hacia el centro antes de tocar el casco comercial. 
      La cercanía con el cauce del estero y la vegetación de las ciudadelas suele mantener una humedad relativa superior al 88%, por lo que la sensación térmica es más pesada y las lloviznas finas se prolongan más tiempo.
    `;
    tipEl.textContent = 'En Las Brisas y El Bosque los chubascos pueden empezar 15 minutos antes que en el Centro. Fíjate en la dirección del viento en la tarjeta.';
  } else if (sector.id === 'puerto') {
    badgeEl.innerHTML = `Fuente #1 recomendada: <strong>Radar Satelital en Vivo + Vientos ECMWF</strong>`;
    commentEl.innerHTML = `
      Para **Puerto Bolívar y el Malecón**, el factor determinante es la **brisa marina del Golfo**. 
      Frecuentemente el viento marino empuja las nubes cargadas hacia el interior (hacia Vergeles o El Cambio), dejando al puerto con llovizna leve mientras tierra adentro cae un temporal. 
      La fuente más precisa aquí es la **reflectividad Doppler minuto a minuto** y la dirección del viento de superficie.
    `;
    tipEl.textContent = 'Verifica la marea (pleamar) en el muelle de cabotaje si hay lluvia coincidente, ya que dificulta la salida del agua pluvial.';
  } else if (sector.id === 'sur') {
    badgeEl.innerHTML = `Fuente #1 recomendada: <strong>ECMWF IFS (Europeo)</strong>`;
    commentEl.innerHTML = `
      Para el **Sur (Rayito de Luz, Vía a Balosa y Nuevo Pilo)**, el modelo **ECMWF** es el más consistente. 
      Esta zona está expuesta a corrientes que se desprenden desde el Archipiélago de Jambelí y la cuenca de Santa Rosa. 
      A menudo aquí el cielo permanece despejado o apenas nublado mientras en el Norte está lloviendo fuerte, o viceversa.
    `;
    tipEl.textContent = 'En el Sur la visibilidad en carretera hacia Balosa disminuye súbitamente cuando cruzan nubes bajas. Confía en el acumulado por hora de ECMWF.';
  } else if (sector.id === 'este') {
    badgeEl.innerHTML = `Fuente #1 recomendada: <strong>ICON (DWD) + Alertas INAMHI</strong>`;
    commentEl.innerHTML = `
      Para **El Cambio y la Vía a Pasaje**, la fuente más acertada es el modelo **ICON (Alemán)** complementado con los boletines del **INAMHI**. 
      El efecto orográfico de las estribaciones de la cordillera genera nubes de mayor desarrollo vertical cerca de la cuenca del Jubones que los modelos globales amplios suelen pasar por alto.
    `;
    tipEl.textContent = 'Si vas a viajar hacia Pasaje o Guabo desde El Cambio, dale máxima prioridad a las alertas meteorológicas del INAMHI por crecidas de ríos.';
  } else if (sector.id === 'centro') {
    badgeEl.innerHTML = `Fuente #1 recomendada: <strong>ECMWF IFS</strong>`;
    commentEl.innerHTML = `
      Para el **Centro Cívico y Comercial (Parque Central / 9 de Octubre)**, el estándar de oro es **ECMWF**. 
      El calor térmico de la densidad urbana hace que los chubascos se concentren con rapidez. El modelo europeo predice con precisión las horas de mayor probabilidad durante la madrugada y tarde.
    `;
    tipEl.textContent = 'En el centro el asfalto esconde el empozamiento rápido en intersecciones bajas. Planifica tus traslados con 1 hora de margen si el radar marca más de 1.0 mm/h.';
  } else {
    badgeEl.innerHTML = `Fuente #1 recomendada: <strong>Radar Doppler + ECMWF</strong>`;
    commentEl.innerHTML = `
      Para **Vía Pajonal y San Antonio**, el **Radar Doppler** es la herramienta ideal. Es una franja de transición donde las tormentas suelen bordear sin impactar de lleno a menos que haya una convergencia amplia sobre el cantón.
    `;
    tipEl.textContent = 'Revisa las barritas de sparkline para ver la ventana de tiempo seco en las próximas 6 horas.';
  }
}

// Selecciona un sector en la UI y centra en el mapa
function selectSector(sectorId) {
  weatherState.selectedSectorId = sectorId;

  // Actualizar recomendación de IA
  updateAiRecommendation(sectorId);

  // Resaltar tarjeta en el grid
  document.querySelectorAll('.sector-card').forEach(card => card.classList.remove('active-selected-sector'));
  const card = document.getElementById(`card-sector-${sectorId}`);
  if (card) {
    card.classList.add('active-selected-sector');
  }

  // Centrar en el mapa si existe
  const sector = weatherState.sectorsData.find(s => s.id === sectorId);
  if (sector && weatherState.leafletMap) {
    weatherState.leafletMap.setView([sector.lat, sector.lon], 14, { animate: true });
    updateMapMarkers();
  }
}

// ==========================================================================
// Renderizado del Ranking de Fuentes
// ==========================================================================
function renderSourcesRanking() {
  const container = document.getElementById('sources-ranking-grid');
  if (!container) return;

  container.innerHTML = METEO_SOURCES.map(source => {
    // Generar estrellas
    const fullStars = Math.floor(source.stars);
    const halfStar = source.stars % 1 !== 0;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fa-solid fa-star"></i>';
    if (halfStar) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';

    return `
      <article class="source-rank-card ${source.rankClass}">
        <div class="source-top-bar">
          <span class="rank-number-pill">
            <i class="fa-solid fa-trophy"></i> #${source.rank} Fiabilidad
          </span>
          <span class="reliability-score">${source.reliability}% precisión</span>
        </div>

        <div class="source-title-group">
          <h3>${source.name}</h3>
          <p class="source-inst">${source.institution}</p>
          <div class="stars-rating">${starsHtml}</div>
        </div>

        <div class="reliability-bar-box">
          <div class="rel-bar-header">
            <span>Índice de acierto en Machala</span>
            <span>${source.reliability}%</span>
          </div>
          <div class="rel-bar-track">
            <div class="rel-bar-fill" style="width: ${source.reliability}%; background: ${source.barColor};"></div>
          </div>
        </div>

        <div class="source-why-desc">
          ${source.whyReliable}
        </div>

        <div class="source-best-for">
          <strong>Ideal para:</strong> ${source.bestFor}
        </div>
      </article>
    `;
  }).join('');
}

// ==========================================================================
// Detección y Análisis de Disparidad Microclimática
// ==========================================================================
function analyzeDisparity(sectors) {
  const rainingSectors = sectors.filter(s => s.precipNum >= 0.2 || s.weather.isRaining);
  const drySectors = sectors.filter(s => s.precipNum < 0.2 && !s.weather.isRaining);

  const banner = document.getElementById('disparity-banner');
  const title = document.getElementById('disparity-title');
  const desc = document.getElementById('disparity-desc');
  const badge = document.getElementById('disparity-status-badge');

  if (rainingSectors.length > 0 && drySectors.length > 0) {
    banner.classList.add('disparity-detected');
    badge.textContent = 'Variación Activa';
    badge.style.color = '#ff477e';
    badge.style.borderColor = 'rgba(255, 71, 126, 0.4)';

    const rainNames = rainingSectors.map(s => s.tag).join(', ');
    const dryNames = drySectors.map(s => s.tag).join(', ');

    title.innerHTML = `⚠️ Variación Confirmada: Llueve en <strong>${rainNames}</strong> mientras que en <strong>${dryNames}</strong> está seco`;
    desc.textContent = `Típica discrepancia microclimática de Machala. Si te trasladas entre sectores, ten en cuenta el suelo mojado o lluvia activa en ${rainNames}.`;
  } else if (rainingSectors.length > 0) {
    banner.classList.remove('disparity-detected');
    badge.textContent = 'Lluvia General';
    badge.style.color = '#00f2fe';
    badge.style.borderColor = 'rgba(0, 242, 254, 0.3)';

    title.textContent = `🌧️ Lluvia extendida en todo Machala`;
    desc.textContent = `Las celdas de precipitación cubren tanto el Norte (Vergeles), Centro y Sur de la ciudad.`;
  } else {
    banner.classList.remove('disparity-detected');
    badge.textContent = 'Tiempo Estable';
    badge.style.color = '#06d6a0';
    badge.style.borderColor = 'rgba(6, 214, 160, 0.3)';

    title.textContent = `☁️ Sin lluvias activas en los sectores de Machala`;
    desc.textContent = `Ambiente en calma en el Norte, Centro, Sur y Puerto Bolívar. Revisa el radar para monitorear nubes entrantes del Golfo.`;
  }
}

// ==========================================================================
// Renderizado Principal de la Aplicación
// ==========================================================================
function renderApp() {
  const sectors = weatherState.sectorsData;
  if (!sectors.length) return;

  // 1. Reloj de sincronización
  const syncLabel = document.getElementById('last-sync-time');
  if (weatherState.lastUpdated) {
    syncLabel.textContent = `Actualizado: ${weatherState.lastUpdated.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
  }

  // 2. Disparidad
  analyzeDisparity(sectors);

  // 3. Recomendación de IA para el sector seleccionado
  updateAiRecommendation(weatherState.selectedSectorId);

  // 4. Comparador Rápido Norte vs Sur vs Puerto Bolívar
  renderQuickCompare(sectors);

  // 5. Grid Completo de Sectores
  renderSectorsGrid(sectors);

  // 6. Ranking de Fuentes
  renderSourcesRanking();
}

function renderQuickCompare(sectors) {
  const container = document.getElementById('quick-compare-container');
  const norte = sectors.find(s => s.id === 'norte');
  const sur = sectors.find(s => s.id === 'sur');
  const puerto = sectors.find(s => s.id === 'puerto');

  const keySectors = [norte, sur, puerto].filter(Boolean);

  container.innerHTML = keySectors.map(sector => {
    const currentHourIndex = new Date().getHours();
    const prob = sector.rawHourly.precipitation_probability ? sector.rawHourly.precipitation_probability[currentHourIndex] || 0 : 0;

    return `
      <div class="quick-compare-card" onclick="selectSector('${sector.id}'); openHourlyModal('${sector.id}')" title="Haz clic para ver diagnóstico y pronóstico de ${sector.name}">
        <div class="card-top-bar">
          <span class="sector-pill-tag">${sector.tag}</span>
          <span class="sector-weather-badge ${sector.weather.statusClass}">
            <i class="fa-solid ${sector.weather.icon}"></i> ${sector.weather.intensity}
          </span>
        </div>

        <div class="card-title-group">
          <h3>${sector.name}</h3>
          <p>${sector.landmarks}</p>
        </div>

        <div class="compare-metric-row">
          <div class="main-stat">
            <span class="label">Precipitación</span>
            <div class="value">${sector.precip} <span class="unit">mm/h</span></div>
          </div>
          <div class="rain-prob-pill">
            <span class="prob-label">Prob. lluvia</span>
            <span class="prob-val">${prob}%</span>
          </div>
        </div>

        <div class="card-footer-mini-stats">
          <div class="mini-stat-item">
            <i class="fa-solid fa-temperature-half"></i>
            <span>${sector.temp}°C (Sens. ${sector.feelsLike}°C)</span>
          </div>
          <div class="mini-stat-item">
            <i class="fa-solid fa-wind"></i>
            <span>${sector.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSectorsGrid(sectors) {
  const grid = document.getElementById('sectors-grid');
  let filtered = sectors;

  if (weatherState.activeFilter === 'rain') {
    filtered = sectors.filter(s => s.precipNum >= 0.2 || s.weather.isRaining);
  } else if (weatherState.activeFilter === 'dry') {
    filtered = sectors.filter(s => s.precipNum < 0.2 && !s.weather.isRaining);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-glass);">
        <i class="fa-solid fa-cloud-sun" style="font-size: 2.5rem; margin-bottom: 0.8rem; color: var(--cyan-neon);"></i>
        <h3>No hay sectores que coincidan con este filtro</h3>
        <p>Prueba seleccionando "Todos" para ver el panorama completo.</p>
      </div>
    `;
    return;
  }

  const currentHourIndex = new Date().getHours();

  grid.innerHTML = filtered.map(sector => {
    const isUserSector = weatherState.userSectorId === sector.id;
    const isSelected = weatherState.selectedSectorId === sector.id;
    const userBadge = isUserSector ? `<div class="user-loc-badge"><i class="fa-solid fa-location-dot"></i> Tu ubicación</div>` : '';

    const nextHours = [];
    if (sector.rawHourly.precipitation) {
      for (let i = 0; i < 6; i++) {
        const hIdx = (currentHourIndex + i) % 24;
        const pVal = sector.rawHourly.precipitation[hIdx] || 0;
        nextHours.push({ hour: hIdx, val: pVal });
      }
    }

    const sparkBarsHtml = nextHours.map(h => {
      const heightPx = Math.min(34, Math.max(4, Math.round(h.val * 6) + 4));
      const hasRain = h.val > 0.1;
      return `<div class="spark-bar ${hasRain ? 'active-rain' : ''}" style="height: ${heightPx}px" title="${h.hour}:00 -> ${h.val} mm"></div>`;
    }).join('');

    return `
      <article class="sector-card ${isUserSector ? 'highlight-user-sector' : ''} ${isSelected ? 'active-selected-sector' : ''}" onclick="selectSector('${sector.id}')" id="card-sector-${sector.id}">
        ${userBadge}

        <div class="card-header-sector">
          <div class="sector-name-box">
            <span class="sector-pill-tag">${sector.tag}</span>
            <h3>${sector.name}</h3>
            <p class="ref-landmarks">${sector.landmarks}</p>
          </div>
          <div class="weather-icon-dynamic">
            <i class="fa-solid ${sector.weather.icon}" style="color: ${sector.weather.isRaining ? 'var(--cyan-neon)' : '#ffb703'}"></i>
          </div>
        </div>

        <div class="precip-display">
          <div class="rate">
            <span class="val">${sector.precip} <span style="font-size: 1rem; color: var(--cyan-neon); font-weight: 500;">mm/h</span></span>
            <span class="lbl">Intensidad de Precipitación</span>
          </div>
          <div class="rain-status-tag">
            <span class="status-badge-lg ${sector.weather.statusClass}">
              ${sector.weather.text}
            </span>
          </div>
        </div>

        <div class="metrics-row">
          <div class="metric-cell">
            <i class="fa-solid fa-temperature-half icon"></i>
            <span class="m-val">${sector.temp}°C</span>
            <span class="m-lbl">Temp</span>
          </div>
          <div class="metric-cell">
            <i class="fa-solid fa-person-rays icon"></i>
            <span class="m-val">${sector.feelsLike}°C</span>
            <span class="m-lbl">Sensación</span>
          </div>
          <div class="metric-cell">
            <i class="fa-solid fa-droplet icon"></i>
            <span class="m-val">${sector.humidity}%</span>
            <span class="m-lbl">Humedad</span>
          </div>
          <div class="metric-cell">
            <i class="fa-solid fa-wind icon"></i>
            <span class="m-val">${sector.windSpeed} km/h</span>
            <span class="m-lbl">Viento</span>
          </div>
        </div>

        <div class="sparkline-box">
          <div class="sparkline-header">
            <span>Tendencia próximas 6 horas</span>
            <span>${nextHours[0] ? nextHours[0].hour + ':00' : ''} a ${nextHours[nextHours.length - 1] ? nextHours[nextHours.length - 1].hour + ':00' : ''}</span>
          </div>
          <div class="sparkline-bars">
            ${sparkBarsHtml}
          </div>
        </div>

        <div class="card-action-btn" onclick="event.stopPropagation(); openHourlyModal('${sector.id}')">
          <i class="fa-solid fa-chart-line"></i>
          <span>Ver pronóstico detallado hora a hora</span>
        </div>
      </article>
    `;
  }).join('');
}

// ==========================================================================
// Modal de Pronóstico: Explicación Humana (N Horas) y Datos Técnicos
// ==========================================================================
let currentModalSector = null;
let currentHorizonHours = 3;

function switchModalTab(tabName) {
  const btnHuman = document.getElementById('tab-btn-human');
  const btnTech = document.getElementById('tab-btn-tech');
  const paneHuman = document.getElementById('tab-pane-human');
  const paneTech = document.getElementById('tab-pane-tech');

  if (!btnHuman || !btnTech || !paneHuman || !paneTech) return;

  if (tabName === 'human') {
    btnHuman.classList.add('active');
    btnTech.classList.remove('active');
    paneHuman.classList.add('active');
    paneTech.classList.remove('active');
  } else {
    btnTech.classList.add('active');
    btnHuman.classList.remove('active');
    paneTech.classList.add('active');
    paneHuman.classList.remove('active');
  }
}

function setHumanHorizon(hours) {
  currentHorizonHours = hours;
  document.querySelectorAll('.horizon-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.getAttribute('data-hours')) === hours);
  });
  if (currentModalSector) {
    renderHumanExplanation(currentModalSector, hours);
  }
}

function renderHumanExplanation(sector, hours) {
  const hourly = sector.rawHourly;
  const currentHour = new Date().getHours();
  
  let totalPrecip = 0;
  let maxPrecip = 0;
  let maxPrecipHour = currentHour;
  let maxProb = 0;

  if (hourly && hourly.precipitation) {
    for (let i = 0; i < hours; i++) {
      const idx = currentHour + i;
      if (idx >= hourly.precipitation.length) break;
      const p = hourly.precipitation[idx] || 0;
      const prob = hourly.precipitation_probability ? (hourly.precipitation_probability[idx] || 0) : 0;
      totalPrecip += p;
      if (p > maxPrecip) {
        maxPrecip = p;
        maxPrecipHour = (idx % 24);
      }
      if (prob > maxProb) maxProb = prob;
    }
  }

  const verdictBox = document.getElementById('human-verdict-box');
  const impactGrid = document.getElementById('impact-grid');
  if (!verdictBox || !impactGrid) return;

  let verdictClass = 'status-calm';
  let verdictBadge = '🟢 Tiempo Estable / Seco';
  let narrativeText = '';

  if (maxPrecip >= 5.0) {
    verdictClass = 'status-heavy';
    verdictBadge = '🔴 Alerta: Aguacero Fuerte';
    narrativeText = `En las próximas ${hours} horas se prevé un <strong>aguacero de ${maxPrecip.toFixed(1)} mm/h</strong> alrededor de las <strong>${maxPrecipHour}:00</strong>. Hay riesgo alto de encharcamientos en calles bajas de ${sector.tag}.`;
  } else if (maxPrecip >= 1.5) {
    verdictClass = 'status-moderate';
    verdictBadge = '🟡 Lluvia Continua Moderada';
    narrativeText = `En las próximas ${hours} horas lloverá con moderación. El momento más mojado será a las <strong>${maxPrecipHour}:00 (${maxPrecip.toFixed(1)} mm)</strong>. El piso estará resbaloso y necesitarás impermeable si sales.`;
  } else if (totalPrecip > 0.0 || maxPrecip > 0.0) {
    verdictClass = 'status-drizzle';
    verdictBadge = '🔵 Solo Garúa Suave / Sereno (Sin Peligro)';
    narrativeText = `En las próximas ${hours} horas <strong>NO VA A INUNDARSE</strong>. El acumulado total es de apenas <strong>${totalPrecip.toFixed(1)} mm en todo el lapso</strong>. Solo habrá una garúa fina o sereno con cielo nublado. Puedes dormir tranquilo, el aguacero fuerte no continuará.`;
  } else {
    verdictClass = 'status-calm';
    verdictBadge = '🟢 Totalmente Seco';
    narrativeText = `En las próximas ${hours} horas no hay probabilidad de precipitación en ${sector.name}. El tiempo se mantendrá sin lluvia.`;
  }

  verdictBox.innerHTML = `
    <div class="verdict-header">
      <span class="verdict-badge ${verdictClass}">${verdictBadge}</span>
      <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">Lapso evaluado: Próximas ${hours} horas</span>
    </div>
    <div class="verdict-summary-text">
      ${narrativeText}
    </div>
    <div class="verdict-stats-row">
      <div class="verdict-stat-cell">
        <span class="stat-lbl">Lluvia Total Acumulada</span>
        <span class="stat-val" style="color: var(--cyan-neon);">${totalPrecip.toFixed(1)} mm</span>
      </div>
      <div class="verdict-stat-cell">
        <span class="stat-lbl">Momento Pico de Lluvia</span>
        <span class="stat-val">${maxPrecip > 0 ? maxPrecipHour + ':00 (' + maxPrecip.toFixed(1) + ' mm)' : 'Ninguno'}</span>
      </div>
      <div class="verdict-stat-cell">
        <span class="stat-lbl">Certeza de Humedad</span>
        <span class="stat-val">${maxProb}%</span>
      </div>
    </div>
  `;

  // Semáforo de Actividades Diarias
  const isWetRoad = totalPrecip > 0.1;
  const isFloodingRisk = maxPrecip >= 4.0 || totalPrecip >= 12.0;
  const isStormRisk = sector.weather.intensity === 'Tormenta' || maxPrecip >= 8.0;
  const isDryingOk = totalPrecip === 0 && sector.humidity < 75;

  impactGrid.innerHTML = `
    <div class="impact-card">
      <div class="impact-top">
        <div class="impact-icon-title">
          <i class="fa-solid fa-car-side" style="color: var(--cyan-neon);"></i>
          <span>Tráfico y Conducir</span>
        </div>
        <span class="traffic-light-pill ${isFloodingRisk ? 'red' : (isWetRoad ? 'yellow' : 'green')}">
          ${isFloodingRisk ? 'Peligro' : (isWetRoad ? 'Precaución' : 'Normal')}
        </span>
      </div>
      <p class="impact-desc">
        ${isFloodingRisk 
          ? 'Calles anegadas en pasos bajos. Evita transitar en moto o vehículos bajos.' 
          : (isWetRoad ? 'Calzada mojada y resbaladiza por la garúa. Maneja despacio, pero no hay calles tapadas de agua.' : 'Calles secas y tránsito fluido sin novedad.')}
      </p>
    </div>

    <div class="impact-card">
      <div class="impact-top">
        <div class="impact-icon-title">
          <i class="fa-solid fa-house-chimney" style="color: var(--amber-warn);"></i>
          <span>Riesgo en Casa / Patio</span>
        </div>
        <span class="traffic-light-pill ${isFloodingRisk ? 'red' : 'green'}">
          ${isFloodingRisk ? 'Atención' : 'Seguro'}
        </span>
      </div>
      <p class="impact-desc">
        ${isFloodingRisk 
          ? 'Riesgo de agua acumulada si los sumideros del patio están llenos de hojas o tierra.' 
          : 'Volumen de agua muy bajo (apenas ' + totalPrecip.toFixed(1) + ' mm en ' + hours + ' horas). No subirá el nivel del agua en tus desagües.'}
      </p>
    </div>

    <div class="impact-card">
      <div class="impact-top">
        <div class="impact-icon-title">
          <i class="fa-solid fa-bolt" style="color: #c77dff;"></i>
          <span>Tormenta Eléctrica</span>
        </div>
        <span class="traffic-light-pill ${isStormRisk ? 'yellow' : 'green'}">
          ${isStormRisk ? 'Vigilar' : 'Sin Riesgo'}
        </span>
      </div>
      <p class="impact-desc">
        ${isStormRisk 
          ? 'Actividad de descargas detectada en el Golfo. Posibles bajas de tensión.' 
          : 'Sin rayos ni truenos previstos en estas ' + hours + ' horas para ' + sector.tag + '.'}
      </p>
    </div>

    <div class="impact-card">
      <div class="impact-top">
        <div class="impact-icon-title">
          <i class="fa-solid fa-shirt" style="color: #06d6a0;"></i>
          <span>Tender Ropa</span>
        </div>
        <span class="traffic-light-pill ${isDryingOk ? 'green' : 'yellow'}">
          ${isDryingOk ? 'Seca Bien' : 'No Seca'}
        </span>
      </div>
      <p class="impact-desc">
        ${isDryingOk 
          ? 'Puedes tender ropa al aire libre con total tranquilidad.' 
          : 'Humedad relativa del ' + sector.humidity + '%. Aunque no caiga un aguacero, la ropa afuera no secará o amanecerá húmeda.'}
      </p>
    </div>
  `;
}

function openHourlyModal(sectorId) {
  const sector = weatherState.sectorsData.find(s => s.id === sectorId);
  if (!sector) return;

  currentModalSector = sector;

  const modal = document.getElementById('forecast-modal');
  document.getElementById('modal-sector-tag').textContent = sector.tag;
  document.getElementById('modal-sector-name').textContent = sector.name;
  document.getElementById('modal-sector-desc').textContent = sector.landmarks;

  // Por defecto mostrar la pestaña explicativa amigable
  switchModalTab('human');
  setHumanHorizon(currentHorizonHours);

  // Resumen técnico en la segunda pestaña
  const summaryBox = document.getElementById('modal-summary-box');
  const willRainNext3Hours = sector.rawHourly.precipitation ? sector.rawHourly.precipitation.slice(0, 4).some(p => p >= 0.2) : false;

  summaryBox.innerHTML = `
    <div style="display: flex; align-items: center; gap: 1rem;">
      <i class="fa-solid ${willRainNext3Hours ? 'fa-cloud-showers-heavy' : 'fa-cloud-sun'}" style="font-size: 2rem; color: var(--cyan-neon);"></i>
      <div>
        <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff;">
          ${willRainNext3Hours ? 'Precipitación proyectada para las próximas horas' : 'Sin lluvias significativas en las próximas horas'}
        </h4>
        <p style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 0.2rem;">
          Estado actual: <strong>${sector.weather.text}</strong> con ${sector.precip} mm/h y vientos de ${sector.windSpeed} km/h hacia el sector.
        </p>
      </div>
    </div>
  `;

  // Timeline técnico hora a hora
  const timeline = document.getElementById('hourly-timeline');
  const hourly = sector.rawHourly;
  const currentHour = new Date().getHours();
  let timelineHtml = '';

  if (hourly.time && hourly.precipitation) {
    for (let i = 0; i < 18; i++) {
      const idx = currentHour + i;
      if (idx >= hourly.time.length) break;

      const rawTime = hourly.time[idx];
      const dateObj = new Date(rawTime);
      const hours24 = dateObj.getHours();
      const mins = String(dateObj.getMinutes()).padStart(2, '0');
      const isNight = hours24 >= 19 || hours24 < 6;
      const hours12 = hours24 % 12 || 12;
      const ampm = hours24 >= 12 ? 'PM' : 'AM';
      const hourStr = `${hours12}:${mins} ${ampm}`;

      const pVal = (hourly.precipitation[idx] || 0).toFixed(1);
      const prob = hourly.precipitation_probability ? hourly.precipitation_probability[idx] || 0 : 0;
      const temp = Math.round(hourly.temperature_2m ? hourly.temperature_2m[idx] : 25);
      const code = hourly.weather_code ? hourly.weather_code[idx] : 3;
      const wInfo = interpretWeatherCode(code, parseFloat(pVal), isNight);

      const barPercent = Math.min(100, Math.round((parseFloat(pVal) / 5) * 100));

      timelineHtml += `
        <div class="hour-row ${i === 0 ? 'current-hour' : ''}">
          <div class="hour-time">${i === 0 ? 'Ahora' : hourStr}</div>
          <div class="hour-weather-desc">
            <i class="fa-solid ${wInfo.icon}" style="color: ${wInfo.color}; font-size: 1.15rem; min-width: 22px; text-align: center;"></i>
            <span style="color: ${wInfo.isRaining ? '#fff' : '#cbd5e1'}; font-weight: ${wInfo.isRaining ? '700' : '500'};">${wInfo.text}</span>
          </div>
          <div class="hour-precip-bar-wrapper">
            <div class="hour-precip-val" style="color: ${wInfo.color};">${pVal} mm (${prob}%)</div>
            <div class="hour-precip-bar">
              <div class="hour-precip-fill" style="width: ${Math.max(barPercent, prob > 30 ? 15 : 4)}%; background: ${wInfo.color};"></div>
            </div>
          </div>
          <div class="hour-temp">${temp}°C</div>
        </div>
      `;
    }
  }

  timeline.innerHTML = timelineHtml;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('forecast-modal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

// ==========================================================================
// Detección de Ubicación GPS (Determina el Sector más cercano)
// ==========================================================================
function locateUserSector() {
  if (!navigator.geolocation) {
    alert('Tu navegador no soporta geolocalización.');
    return;
  }

  const btn = document.getElementById('btn-locate-me');
  const originalText = btn.innerHTML;
  btn.innerHTML = `<i class="fa-solid fa-spinner spinning"></i> <span>Detectando...</span>`;

  navigator.geolocation.getCurrentPosition(
    position => {
      const userLat = position.coords.latitude;
      const userLon = position.coords.longitude;

      let closestSector = null;
      let minDistance = Infinity;

      MACHALA_SECTORS.forEach(sec => {
        const dLat = sec.lat - userLat;
        const dLon = sec.lon - userLon;
        const dist = Math.sqrt(dLat * dLat + dLon * dLon);
        if (dist < minDistance) {
          minDistance = dist;
          closestSector = sec;
        }
      });

      if (closestSector) {
        weatherState.userSectorId = closestSector.id;
        selectSector(closestSector.id);

        const card = document.getElementById(`card-sector-${closestSector.id}`);
        if (card) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }

      btn.innerHTML = `<i class="fa-solid fa-check" style="color: var(--cyan-neon);"></i> <span>${closestSector ? closestSector.tag : 'Listo'}</span>`;
      setTimeout(() => { btn.innerHTML = originalText; }, 3000);
    },
    error => {
      console.warn('Error al obtener ubicación:', error);
      alert('No se pudo acceder a tu ubicación GPS. Por favor habilita los permisos de ubicación en tu navegador.');
      btn.innerHTML = originalText;
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// ==========================================================================
// Sintetizador de Sonido de Lluvia Ambiental (Web Audio API)
// ==========================================================================
let audioCtx = null;
let rainAudioNode = null;
let isAudioPlaying = false;

function toggleRainSound() {
  const btn = document.getElementById('btn-ambient-sound');

  if (!isAudioPlaying) {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();

      const bufferSize = audioCtx.sampleRate * 2;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 850;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      whiteNoise.start();
      rainAudioNode = { source: whiteNoise, gain: gain };

      isAudioPlaying = true;
      btn.classList.add('active');
      btn.innerHTML = `<i class="fa-solid fa-volume-high"></i> <span class="btn-text">Pausar Lluvia</span>`;
    } catch (e) {
      console.error('Error al iniciar Web Audio:', e);
    }
  } else {
    if (rainAudioNode && rainAudioNode.source) {
      rainAudioNode.source.stop();
    }
    if (audioCtx) {
      audioCtx.close();
    }
    isAudioPlaying = false;
    btn.classList.remove('active');
    btn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> <span class="btn-text">Sonido Lluvia</span>`;
  }
}

// ==========================================================================
// Canvas de Animación de Gotas de Lluvia en Fondo
// ==========================================================================
function initRainCanvas() {
  const canvas = document.getElementById('rain-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const drops = [];
  const maxDrops = 75;

  for (let i = 0; i < maxDrops; i++) {
    drops.push({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 18 + 10,
      speed: Math.random() * 8 + 6,
      opacity: Math.random() * 0.35 + 0.1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 1.2;

    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      ctx.beginPath();
      ctx.globalAlpha = d.opacity;
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 2, d.y + d.length);
      ctx.stroke();

      d.y += d.speed;
      d.x -= 1;

      if (d.y > height) {
        d.y = -d.length;
        d.x = Math.random() * width;
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// ==========================================================================
// Inicialización y Event Listeners
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar Canvas
  initRainCanvas();

  // Inicializar Mapa Leaflet
  initLeafletMap();

  // Cargar datos
  fetchMachalaWeatherData().catch(err => {
    console.error('Error cargando clima:', err);
    document.getElementById('disparity-title').textContent = 'Error al cargar los datos meteorológicos';
    document.getElementById('disparity-desc').textContent = 'Comprueba tu conexión a internet o intenta actualizar nuevamente.';
  });

  // Botón Actualizar
  const refreshBtn = document.getElementById('btn-refresh');
  refreshBtn.addEventListener('click', async () => {
    const icon = document.getElementById('refresh-icon');
    icon.classList.add('spinning');
    try {
      await fetchMachalaWeatherData();
    } finally {
      setTimeout(() => { icon.classList.remove('spinning'); }, 800);
    }
  });

  // Botón GPS
  document.getElementById('btn-locate-me').addEventListener('click', locateUserSector);

  // Botón Sonido Lluvia
  document.getElementById('btn-ambient-sound').addEventListener('click', toggleRainSound);

  // Filtros de Sectores
  const filterPills = document.querySelectorAll('#sector-filters .pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      weatherState.activeFilter = pill.getAttribute('data-filter');
      renderSectorsGrid(weatherState.sectorsData);
    });
  });

  // Cerrar Modal
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('forecast-modal').addEventListener('click', e => {
    if (e.target.id === 'forecast-modal') closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Auto-refresco cada 5 minutos
  setInterval(() => {
    fetchMachalaWeatherData().catch(e => console.warn('Auto-refresh falló:', e));
  }, 5 * 60 * 1000);
});

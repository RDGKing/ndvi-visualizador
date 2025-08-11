
let map = L.map('map');
let ndviLayer, rgbLayer, treesLayer;

map.setZoom(30);


const menuToggle = document.querySelector('.menu-toggle');
const menuClose = document.querySelector('.menu-close');
const sidebar = document.getElementById('sidebar');

menuToggle.addEventListener('click', () => {
  sidebar.classList.add('active');       // abre el menú
  menuToggle.style.display = 'none';     // oculta el botón abrir
  menuClose.style.display = 'block';     // muestra el botón cerrar
});

menuClose.addEventListener('click', () => {
  sidebar.classList.remove('active');    // cierra el menú
  menuToggle.style.display = 'block';    // muestra el botón abrir
  menuClose.style.display = 'none';      // oculta el botón cerrar
});




let selectedTree = null; // Guardará la capa del árbol seleccionado

fetch('assets/arboles_salud.geojson')
  .then(response => response.json())
  .then(data => {
    const counts = {
      "Árbol con vegetación densa o vigorosa": 0,
      "Árbol saludable": 0,
      "Árbol con vegetación escasa": 0,
      "Árbol con suelo expuesto": 0,
      "Área sin vegetación": 0,
      "Sin datos": 0
    };

    treesLayer = L.geoJSON(data, {
      style: feature => {
        const mean = feature.properties.mean;
        const salud = clasificarSalud(mean);
        counts[salud] = (counts[salud] || 0) + 1;

        return {
          color: colorPorSalud(salud),
          weight: 1,
          fillColor: colorPorSalud(salud),
          fillOpacity: 0.6
        };
      },
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          const mean = feature.properties.mean;
          const salud = clasificarSalud(mean);

          // Actualiza el panel de información
          document.getElementById('mean-ndvi').textContent = mean?.toFixed(2) ?? '-';
          document.getElementById('tree-health').textContent = salud ?? '-';

          // Quita el resaltado del árbol anterior
          if (selectedTree) {
            const prevSalud = clasificarSalud(selectedTree.feature.properties.mean);
            selectedTree.setStyle({
              color: colorPorSalud(prevSalud),
              weight: 1,
              fillColor: colorPorSalud(prevSalud),
              fillOpacity: 0.6
            });
          }

          // Aplica resaltado al árbol actual
          layer.setStyle({
            color: '#FFD700', // Dorado brillante para el borde
            weight: 4,
            fillColor: colorPorSalud(salud),
            fillOpacity: 0.8
          });

          selectedTree = layer; // Guarda el árbol actual como seleccionado
        });
      }
    }).addTo(map);

    document.getElementById('dense-count').textContent = counts["Árbol con vegetación densa o vigorosa"];
    document.getElementById('healthy-count').textContent = counts["Árbol saludable"];
    document.getElementById('sparse-count').textContent = counts["Árbol con vegetación escasa"];
    document.getElementById('bare-count').textContent = counts["Árbol con suelo expuesto"];
    document.getElementById('none-count').textContent = counts["Área sin vegetación"];
    document.getElementById('nodata-count').textContent = counts["Sin datos"];
  });


// Cargar capa NDVI
fetch('assets/ndvi.tif')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => {
    parseGeoraster(arrayBuffer).then(georaster => {
      ndviLayer = new GeoRasterLayer({
        georaster,
        opacity: 0.8,
        pixelValuesToColorFn: values => {
          const ndvi = values[0];
          if (ndvi === undefined) return null;
          if (ndvi >= 0.8) return "#006837";
          if (ndvi >= 0.5) return "#1a9850";
          if (ndvi >= 0.2) return "#a6d96a";
          if (ndvi >= 0.0) return "#ffffbf";
          if (ndvi >= -1.0) return "#a50026";
          return null;
        },
        resolution: 512
      });
      ndviLayer.addTo(map);

      const bounds = ndviLayer.getBounds();
      map.fitBounds(bounds);
      map.setMaxBounds(bounds);
      map.on('drag', () => map.panInsideBounds(bounds, { animate: false }));
      map.setMinZoom(map.getZoom() + 1);
      map.setMaxZoom(24);
      map.setZoom(21);
    });
  });

// Cargar capa RGB
fetch('assets/RGB_Area.tif')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => {
    parseGeoraster(arrayBuffer).then(georaster => {
      rgbLayer = new GeoRasterLayer({
        georaster,
        opacity: 1,
        resolution: 128
      });
      rgbLayer.addTo(map);
    });
  });

// Control de visibilidad de capas
// Función para contar cuántas capas están activas
function capasActivas() {
  let count = 0;
  if (map.hasLayer(ndviLayer)) count++;
  if (map.hasLayer(treesLayer)) count++;
  if (map.hasLayer(rgbLayer)) count++;
  return count;
}

// Control de visibilidad de capas con restricción
document.getElementById('toggle-ndvi').addEventListener('change', e => {
  if (ndviLayer) {
    if (!e.target.checked && capasActivas() === 1) {
      e.target.checked = true; // No permitir quitar la última capa
      return;
    }
    e.target.checked ? map.addLayer(ndviLayer) : map.removeLayer(ndviLayer);
  }
});

document.getElementById('toggle-trees').addEventListener('change', e => {
  if (treesLayer) {
    if (!e.target.checked && capasActivas() === 1) {
      e.target.checked = true;
      return;
    }
    e.target.checked ? map.addLayer(treesLayer) : map.removeLayer(treesLayer);
  }
});

document.getElementById('toggle-rgb').addEventListener('change', e => {
  if (rgbLayer) {
    if (!e.target.checked && capasActivas() === 1) {
      e.target.checked = true;
      return;
    }
    e.target.checked ? map.addLayer(rgbLayer) : map.removeLayer(rgbLayer);
  }
});


// Opacidad NDVI
const opacitySlider = document.getElementById('opacity-slider');
const opacityValue = document.getElementById('opacity-value');
opacitySlider.addEventListener('input', e => {
  const value = parseFloat(e.target.value);
  if (ndviLayer) {
    ndviLayer.setOpacity(value);
    opacityValue.textContent = `${Math.round(value * 100)}%`;
  }
});

// Clasificación de salud
function clasificarSalud(mean) {
  if (mean === null || isNaN(mean)) return "Sin datos";
  if (mean >= 0.8) return "Árbol con vegetación densa o vigorosa";
  if (mean >= 0.5) return "Árbol saludable";
  if (mean >= 0.2) return "Árbol con vegetación escasa";
  if (mean >= 0.0) return "Árbol con suelo expuesto";
  if (mean >= -1.0) return "Área sin vegetación";
  return "Sin datos";
}

// Color según salud
function colorPorSalud(salud) {
  switch (salud) {
    case "Árbol con vegetación densa o vigorosa": return "#006837";
    case "Árbol saludable": return "#1a9850";
    case "Árbol con vegetación escasa": return "#a6d96a";
    case "Árbol con suelo expuesto": return "#ffffbf";
    case "Área sin vegetación": return "#a50026";
    default: return "#999999";
  }
}





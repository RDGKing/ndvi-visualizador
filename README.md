# NDVI Visualizador — Bosque de San Juan de Aragón 🌳

Visualizador web interactivo para explorar el estado de salud del arbolado del **Bosque de San Juan de Aragón** (CDMX) mediante el índice NDVI y segmentación de copas.

> ⚠ **Nota:** Este repositorio contiene únicamente el código y recursos de la **plataforma de visualización**.  
> El procesamiento de imágenes, segmentación y clasificación de la vegetación se realizó previamente con técnicas de teledetección e inteligencia artificial.

## 🚀 Enlace al visualizador
🔗 [Abrir visualizador](https://rdgking.github.io/ndvi-visualizador/)

## 📌 Descripción
La página web permite:
- Visualizar las copas de árboles segmentadas.
- Consultar el **NDVI** y clasificación de salud por árbol.
- Alternar entre capas:
  - NDVI codificado por colores.
  - Imagen RGB de referencia.
  - Polígonos de copas segmentadas.
- Mostrar un resumen de árboles por categoría de salud.

## 🖥 Tecnologías usadas
- **HTML5, CSS3 y JavaScript**
- **Leaflet.js** para visualización geoespacial.
- **GeoJSON** para datos de copas segmentadas.
- **Map tiles** para imágenes NDVI y RGB.


## 📊 Clasificación NDVI usada
| NDVI        | Categoría               | Color |
|-------------|------------------------|-------|
| ≥ 0.80      | Vegetación densa       | Verde oscuro |
| 0.50–0.79   | Vegetación saludable   | Verde  |
| 0.20–0.49   | Vegetación escasa      | Verde claro |
| 0.00–0.19   | Suelo expuesto         | Amarillo pálido |
| < 0.00      | Sin vegetación         | Rojo oscuro  |

## 📜 Créditos
Este proyecto forma parte de la **evaluación del arbolado urbano** del  
**Bosque de San Juan de Aragón (CDMX)**, empleando técnicas de **teledetección** mediante dron multiespectral, cálculo de **NDVI** y segmentación de copas utilizando **DeepForest** y **Segment Anything Model (SAM)**.

Desarrollado en el marco de la **Estancia de Verano del Programa Delfín 2025**,  
por **Angel Rodrigo Barrios Yáñez** y **Dr. Marco Antonio Moreno Ibarra**.

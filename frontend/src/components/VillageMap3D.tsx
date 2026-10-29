import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl, { type LngLatBoundsLike, type Map as MlMap, type StyleSpecification } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Box, CircularProgress, Divider, IconButton, Tooltip, Typography, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ExploreIcon from '@mui/icons-material/Explore';
import LayersIcon from '@mui/icons-material/Layers';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import GridViewIcon from '@mui/icons-material/GridView';
import ApartmentIcon from '@mui/icons-material/Apartment';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { VillageMap, boundaryRing, simulatedParcels, type MapInsets, type VillageMapProps } from './VillageMap';
import { glassSx } from './glass';

// 55° rather than 60°: past ~55° the view reaches toward the horizon and pulls in many distant, barely visible tiles.
const PITCH_3D = 55;
const BEARING_3D = -17;
// Most villages span only a few hundred metres of height; real scale reads as flat at village zoom.
const EXAGGERATION = 2.5;
const COLOMBO: [number, number] = [79.8612, 6.9271];
const TILT_ZOOM_OUT = 0.7;
// Landing view is one zoom level (2x) closer than "whole village fits"; reached by a short pan-and-zoom on load.
const LANDING_ZOOM_IN = 1;
const LANDING_MS = 2200;
// Upper bounds for the hidden steps before the reveal, so a slow network still shows the map.
const PRECACHE_START_MS = 3000; // start (zoomed-out) view tiles
const PRECACHE_TIMEOUT_MS = 3000; // terrain-heights wait

// MapLibre runs at most 16 image downloads at once across all sources. The ~36 satellite tiles filled that queue
// and the terrain tiles did not even start for ~8 s (measured), stalling the landing. Different hosts have their
// own browser connection pools, so a higher limit lets terrain and imagery load side by side.
maplibregl.setMaxParallelImageRequests(32);
// Covers the whole map so the village ring can be cut out of it as a hole (everything else gets dimmed).
const WORLD_RING: [number, number][] = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]];
const NO_INSETS: MapInsets = { top: 0, right: 0, bottom: 0, left: 0 };

const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

type Base = 'satellite' | 'streets' | 'topo';
const BASE_ORDER: Base[] = ['satellite', 'streets', 'topo'];
const BASE_LABEL: Record<Base, string> = { satellite: 'Satellite', streets: 'Street map', topo: 'Topographic' };

// Both tile hosts speak HTTP/1.1 only (6 downloads at a time per host). Listing each server under the
// alternate hostnames it already answers on (same bytes, same CORS, verified) multiplies the parallel downloads;
// MapLibre maps every tile to one fixed hostname, so the browser cache still hits.
const esri = (path: string) => ['server', 'services'].map((h) => `https://${h}.arcgisonline.com/ArcGIS/rest/services/${path}/MapServer/tile/{z}/{y}/{x}`);
const TERRAIN_TILES = [
  'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
  'https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png',
  'https://elevation-tiles-prod.s3.us-east-1.amazonaws.com/terrarium/{z}/{x}/{y}.png',
];

const style: StyleSpecification = {
  version: 8,
  // No paint transitions: preloading toggles raster-opacity on hidden base maps, and the default 300 ms
  // transition made them fade out visibly over the satellite imagery (the "topographic flash" on load).
  transition: { duration: 0, delay: 0 },
  sources: {
    satellite: {
      type: 'raster',
      tiles: esri('World_Imagery'),
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    },
    streets: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    topo: {
      type: 'raster',
      tiles: ['https://tile.opentopomap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 17,
      attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
    },
    roads: {
      type: 'raster',
      tiles: esri('Reference/World_Transportation'),
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; Esri',
    },
    places: {
      type: 'raster',
      tiles: esri('Reference/World_Boundaries_and_Places'),
      tileSize: 256,
      maxzoom: 19,
    },
    buildings: { type: 'vector', url: 'https://tiles.openfreemap.org/planet', attribution: '<a href="https://openfreemap.org">OpenFreeMap</a> &copy; OpenStreetMap contributors' },
    parcels: { type: 'geojson', data: EMPTY },
    dem: {
      type: 'raster-dem',
      tiles: TERRAIN_TILES,
      encoding: 'terrarium',
      // Heights only shape the mesh; imagery stays full resolution. Capped at z11 (~75 m height samples) because at
      // village zooms any finer cap let MapLibre flip the height tiles between two zoom levels while the camera
      // moved, cancelling and re-requesting them in a loop (measured: 209 requests for 19 tiles, the terrain wait
      // always timing out). At z11 the set is stable: ~9 requests, none cancelled. tileSize must be the real 256:
      // declaring 512 to fetch coarser tiles triggered the same loop.
      tileSize: 256,
      maxzoom: 11,
      attribution: 'Terrain: Mapzen / AWS Open Data',
    },
    mask: { type: 'geojson', data: EMPTY },
    village: { type: 'geojson', data: EMPTY },
  },
  layers: [
    { id: 'background', type: 'background', paint: { 'background-color': '#dbe6ec' } },
    { id: 'satellite', type: 'raster', source: 'satellite', paint: { 'raster-fade-duration': 500 } },
    { id: 'streets', type: 'raster', source: 'streets', paint: { 'raster-fade-duration': 500 }, layout: { visibility: 'none' } },
    { id: 'topo', type: 'raster', source: 'topo', paint: { 'raster-fade-duration': 500 }, layout: { visibility: 'none' } },
    { id: 'roads', type: 'raster', source: 'roads' },
    { id: 'places', type: 'raster', source: 'places' },
    {
      id: 'buildings', type: 'fill-extrusion', source: 'buildings', 'source-layer': 'building', minzoom: 13,
      filter: ['!=', ['get', 'hide_3d'], true],
      paint: {
        'fill-extrusion-color': '#f1f5f9',
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 6],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.9,
      },
    },
    { id: 'mask', type: 'fill', source: 'mask', paint: { 'fill-color': '#0b1a14', 'fill-opacity': 0.55 } },
    { id: 'parcels', type: 'fill', source: 'parcels', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.45 } },
    { id: 'parcels-line', type: 'line', source: 'parcels', paint: { 'line-color': '#334155', 'line-width': 1.5 } },
    { id: 'village-glow', type: 'line', source: 'village', paint: { 'line-color': '#ffffff', 'line-width': 9, 'line-blur': 7, 'line-opacity': 0.6 } },
    { id: 'village-outline', type: 'line', source: 'village', paint: { 'line-color': '#facc15', 'line-width': 3 } },
  ],
};

const SWAP_TIMEOUT_MS = 4000;

/**
 * Loads the base maps that are not shown, invisibly (opacity 0), for the current view, then turns them off again.
 * MapLibre keeps their tiles in its cache, so a later switch shows them without waiting on the network.
 * Skipped when the user asked to save data. `preloading` stops the base swap from hiding a base mid-preload.
 */
function preloadBases(map: MlMap, current: () => Base, preloading: Set<Base>) {
  if ((navigator as any).connection?.saveData) return;
  const pending = BASE_ORDER.filter((b) => b !== current());
  pending.forEach((b) => {
    preloading.add(b);
    map.setPaintProperty(b, 'raster-opacity', 0);
    map.setLayoutProperty(b, 'visibility', 'visible');
  });
  const done = () => {
    pending.forEach((b) => {
      preloading.delete(b);
      if (b === current()) return; // user switched to it meanwhile; the swap effect owns it now
      map.setLayoutProperty(b, 'visibility', 'none');
      map.setPaintProperty(b, 'raster-opacity', 1);
    });
  };
  map.once('idle', done);
}

const webglSupported = (() => {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
})();

/** Village shape and the "everything but the village" mask, both as GeoJSON. */
function shapes(ring: [number, number][]) {
  if (ring.length < 3) return { village: EMPTY, mask: EMPTY };
  const [fx, fy] = ring[0];
  const [lx, ly] = ring[ring.length - 1];
  const closed = fx === lx && fy === ly ? ring : [...ring, ring[0]];
  const village: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [closed] } }],
  };
  const mask: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [WORLD_RING, closed] } }],
  };
  return { village, mask };
}

/** [[west, south], [east, north]] from the stored min/max, else from the ring itself, else null. */
function villageBounds(boundary: any, ring: [number, number][]): [[number, number], [number, number]] | null {
  const f = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const [s, n, w, e] = [f(boundary?.minLat), f(boundary?.maxLat), f(boundary?.minLng), f(boundary?.maxLng)];
  if (s !== null && n !== null && w !== null && e !== null) return [[w, s], [e, n]];
  if (ring.length < 3) return null;
  const xs = ring.map((p) => p[0]);
  const ys = ring.map((p) => p[1]);
  return [[Math.min(...xs), Math.min(...ys)], [Math.max(...xs), Math.max(...ys)]];
}

/** Puts the village in the part of the map not covered by panels, in 2D or tilted 3D. */
function frame(map: MlMap, bounds: LngLatBoundsLike | null, insets: MapInsets, is3D: boolean, animateMs: number, zoomIn = LANDING_ZOOM_IN) {
  const pitch = is3D ? PITCH_3D : 0;
  const bearing = is3D ? BEARING_3D : 0;
  if (!bounds) {
    map.jumpTo({ center: COLOMBO, zoom: 12, pitch, bearing });
    return;
  }
  // The panel insets become the map's own viewport padding, so the camera centre is the middle of the visible window
  // at any pitch. (cameraForBounds' padding instead shifts the centre in flat map units, which drifts once tilted,
  // badly so on phones where the cards cover the bottom half.) The fit itself then only needs an even margin.
  map.setPadding(insets);
  const cam = map.cameraForBounds(bounds, { padding: 40, bearing, maxZoom: 16 }) ?? map.cameraForBounds(bounds, { bearing, maxZoom: 16 });
  if (!cam) return;
  // cameraForBounds frames a flat, top-down view; tilting enlarges the near edge, so back off when in 3D.
  const target = { center: cam.center, zoom: cam.zoom - (is3D ? TILT_ZOOM_OUT : 0) + zoomIn, pitch, bearing, padding: insets };
  // easeTo is skipped automatically for users with prefers-reduced-motion (they land on the final view).
  if (animateMs > 0) map.easeTo({ ...target, duration: animateMs });
  else map.jumpTo(target);
}

const VillageMap3DInner: React.FC<VillageMapProps> = (props) => {
  const { height = 520, insets, gnName, ccode, controlsScale: z = 1, landingZoomIn: zoomIn = LANDING_ZOOM_IN, controlsHidden = false } = props;
  // Controls (and the attribution) fade and slide toward their edge while hidden, e.g. when cards scroll over the map.
  const reveal = (dx: number) => ({
    opacity: controlsHidden ? 0 : 1,
    transform: controlsHidden ? `translateX(${dx}px) scale(0.96)` : 'none',
    pointerEvents: controlsHidden ? ('none' as const) : undefined,
    transition: 'opacity 260ms ease, transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
    '@media (prefers-reduced-motion: reduce)': { transition: 'opacity 120ms linear', transform: 'none' },
  });
  // Hidden start view: one level further out than the landing view, so the reveal is a short zoom-in.
  const startZoomIn = zoomIn - 1;
  // The page briefly passes `boundary` as undefined while it refetches the village (cached data being topped up).
  // Treating that as "no village" tore the map down and restarted the landing on every refetch, so the map never
  // finished loading. Hold the last known boundary through those gaps.
  const lastBoundary = useRef<any>(undefined);
  if (props.boundary !== undefined) lastBoundary.current = props.boundary;
  const boundary = props.boundary !== undefined ? props.boundary : lastBoundary.current;
  const edge = insets ?? NO_INSETS;
  // Latest panel insets for code that runs later than the render it was set up in (the landing sequence).
  const edgeRef = useRef(edge);
  edgeRef.current = edge;
  // True from the start of a village's landing until its zoom finishes; panel re-framing stays out of the way.
  const landingRef = useRef(false);
  const isDark = useTheme().palette.mode === 'dark';

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MlMap | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const [loaded, setLoaded] = useState(false);
  // The map stays hidden until both the start and the landing views are cached, then fades in and zooms.
  const [revealed, setRevealed] = useState(false);
  // Imagery is held back until the terrain heights for the view have arrived. MapLibre sends every image tile
  // (imagery and heights) through one download queue: ~120 imagery tiles queued first kept the ~20 height tiles
  // waiting ~5 s (measured), and imagery fetched before the heights is for the wrong camera altitude and gets
  // cancelled and fetched again once the ground rises.
  const [terrainReady, setTerrainReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const [base, setBase] = useState<Base>('satellite');
  // Off by default: two extra imagery layers re-fetch every tile the satellite base already loads.
  const [showRoads, setShowRoads] = useState(false);
  const [showParcels, setShowParcels] = useState(true);
  // Off by default: MapLibre 4 can't clip extrusions to the village, so buildings outside the focus area
  // render as bright specks over the dimmed surroundings.
  const [showBuildings, setShowBuildings] = useState(false);
  const [showBoundary, setShowBoundary] = useState(true);
  const shownBase = useRef<Base>('satellite');
  const preloading = useRef<Set<Base>>(new Set());
  // Name of the base map, shown briefly after switching: outside the village the map is dimmed, so a switch is
  // easy to miss without it.
  const [layerNote, setLayerNote] = useState<string | null>(null);
  const firstBase = useRef(true);
  useEffect(() => {
    if (firstBase.current) {
      firstBase.current = false;
      return;
    }
    setLayerNote(BASE_LABEL[base]);
    const t = window.setTimeout(() => setLayerNote(null), 1600);
    return () => window.clearTimeout(t);
  }, [base]);

  const ring = useMemo(() => boundaryRing(boundary?.polygons), [boundary?.polygons]);
  // Keyed on the coordinates, not the object: a refetch returns an equal boundary as a new object, which would
  // otherwise restart the landing animation.
  const [bS, bN, bW, bE] = [boundary?.minLat, boundary?.maxLat, boundary?.minLng, boundary?.maxLng];
  const bounds = useMemo(() => villageBounds({ minLat: bS, maxLat: bN, minLng: bW, maxLng: bE }, ring), [bS, bN, bW, bE, ring]);
  const insetsKey = `${edge.top},${edge.right},${edge.bottom},${edge.left}`;

  // `boundary` is undefined while the village is still loading and null when it has none.
  const villageKnown = boundary !== undefined;

  // Create the map once the village is known, starting on it: starting elsewhere would download a whole
  // view's worth of terrain and imagery tiles that are thrown away a moment later.
  // A WebGL context that fails at runtime (driver, lost GPU) falls back to the 2D map.
  useEffect(() => {
    if (!containerRef.current || !villageKnown || mapRef.current) return;
    let map: MlMap;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style,
        ...(bounds ? { bounds, fitBoundsOptions: { maxZoom: 16 } } : { center: COLOMBO, zoom: 12 }),
        pitch: PITCH_3D,
        bearing: BEARING_3D,
        maxPitch: 65,
        maxZoom: 18,
        attributionControl: { compact: true },
        // HiDPI screens would otherwise draw 2-3x the pixels every frame through the terrain pipeline.
        pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
        fadeDuration: 0,
        renderWorldCopies: false,
      });
    } catch (e) {
      console.error('3D map unavailable, using 2D map:', e);
      setFailed(true);
      return;
    }
    // MapLibre opens the compact attribution ("i" button) the first time it fills in, and only closes it after a
    // drag, so the credits popped open on every load. Close it that first time; the button still toggles it.
    const attrib = map.getContainer().querySelector('.maplibregl-ctrl-attrib');
    if (attrib) {
      const collapseOnce = new MutationObserver(() => {
        if (!attrib.classList.contains('maplibregl-compact')) return;
        attrib.classList.remove('maplibregl-compact-show');
        collapseOnce.disconnect();
      });
      collapseOnce.observe(attrib, { attributes: true, attributeFilter: ['class'] });
    }
    // Page scroll must keep working over the full-bleed map; zoom is on the buttons and pinch.
    map.scrollZoom.disable();
    // Ready as soon as the style is parsed, not on 'load': 'load' waits for every visible tile (~250), but the
    // outline, pin and controls need none of them, so they appear while imagery streams in underneath.
    // (isStyleLoaded() can't be used for this: in MapLibre 4 it also waits for all tiles.)
    map.once('style.load', () => {
      map.setTerrain({ source: 'dem', exaggeration: EXAGGERATION });
      setLoaded(true);
    });
    // Missing tiles (offline, rate-limited) are not fatal; MapLibre keeps rendering what it has.
    map.on('error', (e) => console.warn('3D map:', e.error?.message ?? e));
    mapRef.current = map;
    // Created once; later village changes go through setData and frame() below. Removed only on unmount (below).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villageKnown]);

  useEffect(
    () => () => {
      markerRef.current?.remove();
      markerRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    },
    [],
  );

  // Village shape, mask and pin follow the selected village.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const { village, mask } = shapes(ring);
    (map.getSource('village') as maplibregl.GeoJSONSource).setData(village);
    (map.getSource('mask') as maplibregl.GeoJSONSource).setData(mask);
    // Same illustrative boxes the 2D map draws; stored [lat, lng], GeoJSON wants [lng, lat].
    const parcels: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: simulatedParcels(boundary).map(({ coords, color }) => {
        const r = coords.map(([lat, lng]) => [lng, lat]);
        return { type: 'Feature', properties: { color }, geometry: { type: 'Polygon', coordinates: [[...r, r[0]]] } };
      }),
    };
    (map.getSource('parcels') as maplibregl.GeoJSONSource).setData(parcels);
    markerRef.current?.remove();
    markerRef.current = bounds
      ? new maplibregl.Marker({ color: '#e11d48' })
          .setLngLat([(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2])
          .addTo(map)
      : null;
    // Landing: whole village -> pan and zoom to the 2x view. Done naively, the zoom outran the network and the
    // close-up filled in as empty squares. So while the map is hidden: wait for terrain heights (framing before
    // they load puts the camera at sea level, far too close on hill-country villages), then load the zoomed-out
    // start view and fade in. During the zoom MapLibre draws those cached tiles stretched underneath and the sharp
    // close-up tiles fade in over them: the picture is always complete and just sharpens. (Pre-caching the
    // close-up too was measured at ~100 extra tiles and an 18 s wait on a slow connection.)
    setRevealed(false);
    setTerrainReady(false);
    landingRef.current = true;
    let cancelled = false;
    const timers: number[] = [];
    const listeners: [string, (...a: any[]) => void][] = [];
    const on = (type: string, fn: (...a: any[]) => void) => { map.on(type as any, fn); listeners.push([type, fn]); };
    // Continues once every tile for the current camera has loaded, or after the timeout. Not 'idle': on this busy
    // 3D scene it rarely fires, so each step fell through to its timeout. The first frames after a camera jump are
    // skipped because the new view's tiles are only requested during those frames.
    const loadedOrTimeout = (timeoutMs: number, next: () => void) => {
      let done = false;
      let frames = 0;
      const go = () => {
        if (done || cancelled) return;
        done = true;
        map.off('render', check);
        next();
      };
      const check = () => {
        if (++frames > 2 && map.areTilesLoaded()) go();
      };
      on('render', check);
      timers.push(window.setTimeout(go, timeoutMs));
      map.triggerRepaint();
    };

    let landed = false;
    const land = () => {
      if (landed || cancelled) return;
      landed = true;
      setTerrainReady(true);
      // Hidden start view is top-down: a tilted view reaches toward the horizon and needs ~2x the imagery tiles,
      // which kept the reveal waiting. The landing then tilts into 3D while zooming in.
      frame(map, bounds, edgeRef.current, false, 0, startZoomIn);
      loadedOrTimeout(PRECACHE_START_MS, () => {
        setRevealed(true);
        // After the landing settles, warm the other base maps so switching is near-instant. Registered before
        // the move: with reduced motion the ease is an instant jump that fires moveend at once.
        map.once('moveend', () => {
          landingRef.current = false;
          map.once('idle', () => preloadBases(map, () => shownBase.current, preloading.current));
        });
        frame(map, bounds, edgeRef.current, is3D, LANDING_MS, zoomIn);
      });
    };

    frame(map, bounds, edge, false, 0, startZoomIn);
    {
      // Wait until height tiles have actually arrived and none are still loading. Neither signal works alone:
      // isSourceLoaded('dem') is already true before any tile is requested, and queryTerrainElevation returns 0
      // (not null) for heights that have not loaded.
      let sawHeightTile = false;
      const onData = (e: maplibregl.MapSourceDataEvent) => {
        if (e.sourceId !== 'dem') return;
        if (e.tile) sawHeightTile = true;
        if (!sawHeightTile) return;
        // Only the ground under the village decides the camera height; tiles toward the horizon can stream in
        // later. Unloaded heights read as 0, so a non-zero reading means the village's tile is in (sea-level
        // villages fall back to "all height tiles loaded", or the timeout).
        const centre = bounds && ([(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2] as [number, number]);
        const villageHeightKnown = !!centre && !!map.queryTerrainElevation(centre);
        if (!villageHeightKnown && !map.isSourceLoaded('dem')) return;
        map.off('sourcedata', onData);
        land();
      };
      on('sourcedata', onData);
      timers.push(window.setTimeout(() => { map.off('sourcedata', onData); land(); }, PRECACHE_TIMEOUT_MS));
    }
    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      listeners.forEach(([type, fn]) => map.off(type as any, fn));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, ring, bounds]);

  // Panels resize with the window; keep the village in the open lane without animating every step.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    map.resize();
    // During a landing the panels often settle while the map is still hidden; jumping here replaced the zoomed-out
    // start view with the close-up, so the landing zoom had nowhere to go. The landing reads edgeRef itself.
    if (landingRef.current || map.isMoving()) return;
    frame(map, bounds, edge, is3D, 0, zoomIn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insetsKey]);

  const toggle3D = () => {
    const map = mapRef.current;
    if (!map) return;
    const next = !is3D;
    // Only the camera tilts; terrain stays on and the view keeps its centre and zoom. Toggling terrain moved the
    // ground reference by the village's height (~2.5 km for Ella with exaggeration) and re-fitting against it
    // drifted the village off screen a little more on every switch. Top-down over terrain reads as a flat 2D map.
    map.easeTo({ pitch: next ? PITCH_3D : 0, bearing: next ? BEARING_3D : 0, duration: 900 });
    setIs3D(next);
  };

  // Layer visibility follows the toolbox toggles.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const show = (id: string, on: boolean) => map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
    // Road and place labels sit on imagery; the street and topographic maps already draw their own.
    show('roads', showRoads && base === 'satellite');
    show('places', showRoads && base === 'satellite');
    show('buildings', showBuildings);
    show('parcels', showParcels);
    show('parcels-line', showParcels);
    show('mask', showBoundary);
    show('village-glow', showBoundary);
    show('village-outline', showBoundary);
  }, [loaded, base, showRoads, showParcels, showBuildings, showBoundary]);

  // Seamless base-map swap: the new base is turned on underneath/over the old one, and the old one is only
  // hidden once the map is idle again (new tiles for this view loaded), so there is never a blank or half-drawn
  // frame. A slow network still swaps after SWAP_TIMEOUT_MS rather than leaving two bases drawing forever.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    shownBase.current = base;
    if (!terrainReady) {
      map.setLayoutProperty(base, 'visibility', 'none');
      return;
    }
    map.setPaintProperty(base, 'raster-opacity', 1); // a preloaded base sits at opacity 0
    map.setLayoutProperty(base, 'visibility', 'visible');
    const hideOthers = () => {
      BASE_ORDER.forEach((b) => b !== base && !preloading.current.has(b) && map.setLayoutProperty(b, 'visibility', 'none'));
    };
    const timer = window.setTimeout(hideOthers, SWAP_TIMEOUT_MS);
    map.once('idle', hideOthers);
    return () => {
      window.clearTimeout(timer);
      map.off('idle', hideOthers);
    };
  }, [loaded, base, terrainReady]);

  const snapshot = () => {
    const map = mapRef.current;
    if (!map) return;
    // The WebGL buffer is cleared after each frame, so read it inside the next render.
    map.once('render', () => {
      const a = document.createElement('a');
      a.href = map.getCanvas().toDataURL('image/png');
      // Only strip characters filesystems reject: village names are often Sinhala or Tamil.
      const name = [gnName, ccode].filter(Boolean).map((v) => String(v).replace(/[\\/:*?"<>|\s]+/g, '-')).join('-');
      a.download = `${name || 'village'}-map.png`;
      a.click();
    });
    map.triggerRepaint();
  };

  const focusVillage = () => mapRef.current && frame(mapRef.current, bounds, edge, is3D, 900, zoomIn);
  const nextBase = BASE_ORDER[(BASE_ORDER.indexOf(base) + 1) % BASE_ORDER.length];

  if (failed) return <VillageMap {...props} />;

  const iconColor = isDark ? '#ffffff' : '#334155';
  // Same look as the original map's toolbox: small buttons, blue when the option is on.
  const tool = (title: string, onClick: () => void, icon: React.ReactNode, placement: 'left' | 'right', active = false) => (
    // describeChild keeps the label on the button only; otherwise screen readers announce each control twice.
    <Tooltip title={title} placement={placement} describeChild>
      {/* span: a disabled button fires no mouse events, so the tooltip needs a wrapper while the map loads */}
      <span>
        <IconButton
          size="small"
          aria-label={title}
          aria-pressed={active}
          onClick={onClick}
          disabled={!loaded}
          sx={{ p: 0.8, color: active ? '#3b82f6' : iconColor, '& .MuiSvgIcon-root': { fontSize: '1.15rem' } }}
        >
          {icon}
        </IconButton>
      </span>
    </Tooltip>
  );
  const group = { ...glassSx(isDark), borderRadius: '12px', display: 'flex', flexDirection: 'column' as const, overflow: 'hidden' };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height,
        background: 'radial-gradient(120% 90% at 50% 45%, #3c5a43 0%, #22362a 55%, #15231b 100%)',
        // Keep MapLibre's attribution (licence requirement) beside the panels, not under them.
        '& .maplibregl-ctrl-bottom-right': { right: `${edge.right}px`, bottom: `${edge.bottom}px`, ...reveal(12) },
      }}
    >
      {/* The fade lives on a wrapper: re-rendering the map container itself rewrote its class attribute and
          dropped MapLibre's own classes (maplibregl-map), which position the pin, controls and attribution. */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: revealed ? 1 : 0,
          transition: 'opacity 600ms ease',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        }}
      >
        {/* Explicit size: maplibre-gl.css sets .maplibregl-map { position: relative }, which can win over the inset. */}
        <Box ref={containerRef} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      </Box>
      {!revealed && (
        <Box
          role="status"
          aria-label="Loading map"
          sx={{
            position: 'absolute',
            zIndex: 2,
            top: `calc(${edge.top}px + (100% - ${edge.top + edge.bottom}px) / 2)`,
            left: `calc(${edge.left}px + (100% - ${edge.left + edge.right}px) / 2)`,
            transform: 'translate(-50%, -50%)',
            ...glassSx(isDark),
            borderRadius: '999px',
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            fontSize: '0.85rem',
            fontWeight: 600,
            color: isDark ? '#fff' : '#0f172a',
            pointerEvents: 'none',
          }}
        >
          <CircularProgress size={16} thickness={5} sx={{ color: '#16a34a' }} />
          Loading map…
        </Box>
      )}

      {/* ── LEFT FLOATING CONTROLS (+, -, Reset view, Compass) ── */}
      {/* zoom also scales offsets, so they are divided by it to keep the controls on the panel edges */}
      <Box sx={{ position: 'absolute', zoom: z, top: (edge.top + 16) / z, left: (edge.left + 16) / z, zIndex: 2, display: 'flex', flexDirection: 'column', gap: 1, ...reveal(-16) }}>
        <Box sx={group}>
          {tool('Zoom In', () => mapRef.current?.zoomIn(), <AddIcon />, 'right')}
          <Divider />
          {tool('Zoom Out', () => mapRef.current?.zoomOut(), <RemoveIcon />, 'right')}
        </Box>
        <Box sx={group}>
          {tool('Reset View', focusVillage, <FullscreenIcon />, 'right')}
          <Divider />
          {tool('North Compass', () => mapRef.current?.easeTo({ bearing: 0, duration: 600 }), <ExploreIcon sx={{ color: '#ef4444' }} />, 'right')}
        </Box>
      </Box>

      {layerNote && (
        <Box
          role="status"
          sx={{ position: 'absolute', top: edge.top + 52, right: edge.right + 72, zIndex: 2, ...glassSx(isDark), borderRadius: '999px', px: 1.6, py: 0.6,
                fontSize: '0.8rem', fontWeight: 700, color: isDark ? '#fff' : '#0f172a', pointerEvents: 'none', animation: 'fadeIn 0.2s ease both' }}
        >
          {layerNote}
        </Box>
      )}

      {/* ── RIGHT FLOATING TOOLBOX (same options as the original map) ── */}
      <Box sx={{ position: 'absolute', zoom: z, top: (edge.top + 16) / z, right: (edge.right + 16) / z, zIndex: 2, ...glassSx(isDark), borderRadius: '14px', p: 0.5, display: 'flex', flexDirection: 'column', gap: 0.5, ...reveal(16),
        // Short map windows (phones): scroll the toolbox rather than run it under the cards.
        maxHeight: `calc(${100 / z}% - ${(edge.top + edge.bottom + 32) / z}px)`, overflowY: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {tool(is3D ? 'Switch to 2D' : 'Switch to 3D', toggle3D,
          <Typography component="span" sx={{ fontWeight: 800, fontSize: '0.75rem', width: 18, lineHeight: '18px' }}>{is3D ? '2D' : '3D'}</Typography>, 'left')}
        {tool(`Map Layer: ${BASE_LABEL[base]} (next: ${BASE_LABEL[nextBase]})`, () => setBase(nextBase), <LayersIcon />, 'left', base !== 'satellite')}
        {tool('Roads & Transport Lines', () => setShowRoads((v) => !v), <AltRouteIcon />, 'left', showRoads)}
        {tool('Cadastral Parcels / Lands', () => setShowParcels((v) => !v), <GridViewIcon />, 'left', showParcels)}
        {tool('Buildings & Infrastructure', () => setShowBuildings((v) => !v), <ApartmentIcon />, 'left', showBuildings)}
        {tool('Center Village Pin', focusVillage, <LocationOnIcon />, 'left', true)}
        {tool('Village Boundaries', () => setShowBoundary((v) => !v), <MapIcon />, 'left', showBoundary)}
        {tool('Aerial Photos', () => setBase('satellite'), <PhotoLibraryIcon />, 'left', base === 'satellite')}
        {tool('Snapshot / Export Map', snapshot, <CameraAltIcon />, 'left')}
      </Box>
    </Box>
  );
};

/** 3D village map; uses the 2D Leaflet map where WebGL is unavailable. */
const VillageMap3D: React.FC<VillageMapProps> = (props) =>
  webglSupported ? <VillageMap3DInner {...props} /> : <VillageMap {...props} />;

export default VillageMap3D;

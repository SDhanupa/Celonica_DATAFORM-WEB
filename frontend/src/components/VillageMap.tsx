import React, { useEffect, useMemo, useRef, useState } from 'react';
import { glassSx } from './glass';
import { useLanguage } from '../context/LanguageContext';
import { Box, Typography, IconButton, Tooltip, Divider, useTheme } from '@mui/material';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import LayersIcon from '@mui/icons-material/Layers';
import AltRouteIcon from '@mui/icons-material/AltRoute';
import GridViewIcon from '@mui/icons-material/GridView';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

// Fix Leaflet's default marker icons in Vite/React bundling
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const customPinIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [28, 44],
  iconAnchor: [14, 44],
  popupAnchor: [1, -38],
  shadowSize: [44, 44],
});

// Custom map controls helper
export type MapInsets = { top: number; right: number; bottom: number; left: number };

const NO_INSETS: MapInsets = { top: 0, right: 0, bottom: 0, left: 0 };

/** Leaflet fit options that keep the village inside the part of the map not covered by overlay panels. */
export const fitOptions = (insets: MapInsets) => ({
  paddingTopLeft: [insets.left + 40, insets.top + 40] as [number, number],
  paddingBottomRight: [insets.right + 40, insets.bottom + 40] as [number, number],
});

function MapCustomControls({
  bounds,
  zoomIn,
  zoomOut,
  resetView,
  insets,
}: {
  bounds: [[number, number], [number, number]] | null;
  zoomIn: number;
  zoomOut: number;
  resetView: number;
  insets: MapInsets;
}) {
  const map = useMap();
  const panned = useRef<[number, number]>([0, 0]);

  // Insets change on window resize; refit only when they actually move, not on every render.
  const insetsKey = `${insets.top},${insets.right},${insets.bottom},${insets.left}`;

  useEffect(() => {
    map.invalidateSize();
    if (bounds) {
      // Instant fit: an animated fly downloads tiles for every zoom level it passes through.
      map.fitBounds(bounds, { ...fitOptions(insets), maxZoom: 16, animate: false });
      return;
    }
    // No boundary to fit: shift the centre into the visible lane, panning only by the change since last time.
    const target: [number, number] = [-(insets.left - insets.right) / 2, -(insets.top - insets.bottom) / 2];
    map.panBy([target[0] - panned.current[0], target[1] - panned.current[1]], { animate: false });
    panned.current = target;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bounds, map, insetsKey]);

  useEffect(() => {
    if (zoomIn > 0) map.zoomIn();
  }, [zoomIn, map]);

  useEffect(() => {
    if (zoomOut > 0) map.zoomOut();
  }, [zoomOut, map]);

  useEffect(() => {
    if (resetView > 0 && bounds) {
      map.flyToBounds(bounds, { ...fitOptions(insets), duration: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetView, bounds, map]);

  return null;
}

/**
 * Outer ring of a stored GN boundary, as GeoJSON [lng, lat] pairs. `polygons` is a JSON string holding a bare
 * ring, a polygon (list of rings) or a multipolygon; only the first outer ring is used. [] when missing or invalid.
 */
export function boundaryRing(polygons: unknown): [number, number][] {
  if (typeof polygons !== 'string' || !polygons) return [];
  try {
    const raw = JSON.parse(polygons);
    if (!Array.isArray(raw)) return [];
    const ring =
      Array.isArray(raw[0]?.[0]) && typeof raw[0][0][0] === 'number'
        ? raw[0]
        : Array.isArray(raw[0]?.[0]?.[0])
        ? raw[0][0]
        : raw;
    return (ring as [number, number][]).filter(
      (p) => Array.isArray(p) && Number.isFinite(p[0]) && Number.isFinite(p[1]),
    );
  } catch (e) {
    console.error('Error parsing GN polygon:', e);
    return [];
  }
}

/**
 * Six illustrative parcel boxes laid out inside the village's bounding box, as [lat, lng] rings with a fill
 * colour. Not survey data: a visual placeholder until real cadastral parcels exist.
 */
export function simulatedParcels(boundary: any): { coords: [number, number][]; color: string }[] {
  if (!boundary?.minLat || !boundary?.minLng || !boundary?.maxLat || !boundary?.maxLng) return [];
  const minLat = boundary.minLat;
  const maxLat = boundary.maxLat;
  const minLng = boundary.minLng;
  const maxLng = boundary.maxLng;

  const latSpan = maxLat - minLat;
  const lngSpan = maxLng - minLng;

  const parcels = [];
  const colors = ['#fef08a', '#fed7aa', '#bbf7d0', '#e2e8f0', '#fbcfe8', '#fed7aa'];

  for (let i = 0; i < 6; i++) {
    const pMinLat = minLat + latSpan * (0.25 + (i % 3) * 0.18);
    const pMaxLat = pMinLat + latSpan * 0.12;
    const pMinLng = minLng + lngSpan * (0.3 + Math.floor(i / 3) * 0.22);
    const pMaxLng = pMinLng + lngSpan * 0.16;

    parcels.push({
      coords: [
        [pMinLat, pMinLng],
        [pMaxLat, pMinLng],
        [pMaxLat, pMaxLng],
        [pMinLat, pMaxLng],
      ] as [number, number][],
      color: colors[i % colors.length],
    });
  }

  return parcels;
}

export interface VillageMapProps {
  gnName?: string;
  district?: string;
  dsDivision?: string;
  ccode?: string;
  boundary?: any;
  height?: number | string;
  /** Immersive/background mode: drops the card chrome (border, radius, shadow)
   *  and the "VILLAGE MAP" header pill, and lowers the floating controls so a
   *  separate app bar can sit above them. Used by the mobile map-background view. */
  immersive?: boolean;
  /** Pixels of the map hidden under overlay panels. Controls sit just inside these edges and
   *  the village is framed in the remaining visible area. Omit for the normal card layout. */
  insets?: MapInsets;
}

export const VillageMap: React.FC<VillageMapProps> = ({
  gnName,
  district,
  dsDivision,
  ccode,
  boundary,
  height = 520,
  immersive = false,
  insets,
}) => {
  const edge = insets ?? { ...NO_INSETS, top: immersive ? 80 : 54 };
  const { language } = useLanguage();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const mapTitle = language === 'si' ? 'ගම් සිතියම' : language === 'ta' ? 'கிராம வரைபடம்' : 'VILLAGE MAP';

  const [zoomInTrigger, setZoomInTrigger] = useState(0);
  const [zoomOutTrigger, setZoomOutTrigger] = useState(0);
  const [resetViewTrigger, setResetViewTrigger] = useState(0);
  const [activeLayer, setActiveLayer] = useState<'osm' | 'satellite' | 'terrain'>('osm');
  const [showCadastre, setShowCadastre] = useState(false);
  const [showRoads, setShowRoads] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);

  // Leaflet wants [lat, lng]; the stored ring is GeoJSON order [lng, lat].
  const parsedPositions = useMemo(
    () => boundaryRing(boundary?.polygons).map(([lng, lat]) => [lat, lng] as [number, number]),
    [boundary?.polygons],
  );

  const cadastralParcels = useMemo(() => simulatedParcels(boundary), [boundary]);

  // Compute center & bounding box.
  // `?? fallback` does NOT catch NaN (NaN is a number), and a single NaN in the
  // boundary would produce a NaN center and make Leaflet throw
  // "Invalid LatLng (NaN, NaN)" — which, now that the map renders as the mobile
  // background, would blank the whole page. So coerce every coordinate through a
  // finite check and fall back to Colombo when any is missing/invalid.
  const COLOMBO_LAT = 6.9271;
  const COLOMBO_LNG = 79.8612;
  const finite = (v: any): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

  const bMinLat = finite(boundary?.minLat);
  const bMaxLat = finite(boundary?.maxLat);
  const bMinLng = finite(boundary?.minLng);
  const bMaxLng = finite(boundary?.maxLng);
  const hasValidBounds = bMinLat !== null && bMaxLat !== null && bMinLng !== null && bMaxLng !== null;

  const centerLat = hasValidBounds ? (bMinLat! + bMaxLat!) / 2 : COLOMBO_LAT;
  const centerLng = hasValidBounds ? (bMinLng! + bMaxLng!) / 2 : COLOMBO_LNG;

  const bounds: [[number, number], [number, number]] | null = useMemo(() => {
    if (hasValidBounds) {
      return [
        [bMinLat!, bMinLng!],
        [bMaxLat!, bMaxLng!],
      ];
    }
    return null;
  }, [hasValidBounds, bMinLat, bMaxLat, bMinLng, bMaxLng]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: height,
        borderRadius: immersive ? 0 : '20px',
        overflow: 'hidden',
        boxShadow: immersive
          ? 'none'
          : isDark
          ? 'none'
          : '0 1px 2px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.06)',
        border: immersive
          ? 'none'
          : isDark
          ? '1px solid rgba(255,255,255,0.08)'
          : '1px solid #e5e9f0',
        bgcolor: isDark ? '#111827' : '#ffffff',
        animation: 'fadeIn 0.5s ease both',
      }}
    >
      {/* ── CARD HEADER (VILLAGE MAP / ගම් සිතියම) ────────────────── */}
      {!immersive && (
      <Box
        sx={{
          position: 'absolute',
          top: 14,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            pointerEvents: 'auto',
            ...glassSx(isDark),
            borderRadius: '20px',
            px: 3,
            py: 0.8,
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1rem',
              color: isDark ? '#ffffff' : '#0f172a',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
            }}
          >
            {mapTitle}
          </Typography>
        </Box>
      </Box>
      )}

      {/* ── LEFT FLOATING CONTROLS (+, -, Fullscreen, Compass) ──────── */}
      <Box
        sx={{
          position: 'absolute',
          top: edge.top + 16,
          left: edge.left + 16,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            ...glassSx(isDark),
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Tooltip title="Zoom In" placement="right">
            <IconButton size="small" onClick={() => setZoomInTrigger((v) => v + 1)} sx={{ p: 1 }}>
              <AddIcon sx={{ fontSize: '1.2rem', color: isDark ? '#ffffff' : '#1e293b' }} />
            </IconButton>
          </Tooltip>
          <Divider />
          <Tooltip title="Zoom Out" placement="right">
            <IconButton size="small" onClick={() => setZoomOutTrigger((v) => v + 1)} sx={{ p: 1 }}>
              <RemoveIcon sx={{ fontSize: '1.2rem', color: isDark ? '#ffffff' : '#1e293b' }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            ...glassSx(isDark),
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Tooltip title="Reset View" placement="right">
            <IconButton size="small" onClick={() => setResetViewTrigger((v) => v + 1)} sx={{ p: 1 }}>
              <FullscreenIcon sx={{ fontSize: '1.2rem', color: isDark ? '#ffffff' : '#1e293b' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ── RIGHT FLOATING TOOLBOX (Layers, Roads, Cadastre, Building, Pin) ── */}
      <Box
        sx={{
          position: 'absolute',
          top: edge.top + 16,
          right: edge.right + 16,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          ...glassSx(isDark),
          borderRadius: '14px',
          p: 0.5,
        }}
      >
        <Tooltip title="Toggle Satellite / OSM Layer" placement="left">
          <IconButton
            size="small"
            onClick={() => setActiveLayer((prev) => (prev === 'osm' ? 'satellite' : 'osm'))}
            sx={{ p: 0.8, color: activeLayer === 'satellite' ? '#3b82f6' : isDark ? '#ffffff' : '#334155' }}
          >
            <LayersIcon sx={{ fontSize: '1.15rem' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={activeLayer === 'osm' ? 'Roads are included in the street map; switch to satellite to toggle the overlay' : 'Roads & Transport Lines'} placement="left">
          <span><IconButton aria-label="Roads & Transport Lines" aria-pressed={showRoads} disabled={activeLayer === 'osm'} size="small" onClick={() => setShowRoads(v => !v)} sx={{ p: 0.8, color: showRoads ? '#3b82f6' : isDark ? '#ffffff' : '#334155' }}>
            <AltRouteIcon sx={{ fontSize: '1.15rem' }} />
          </IconButton></span>
        </Tooltip>

        <Tooltip title="Cadastral Parcels / Lands" placement="left">
          <IconButton
            size="small"
            onClick={() => setShowCadastre(!showCadastre)}
            sx={{ p: 0.8, color: showCadastre ? '#10b981' : isDark ? '#ffffff' : '#334155' }}
          >
            <GridViewIcon sx={{ fontSize: '1.15rem' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Center Village Pin" placement="left">
          <IconButton size="small" onClick={() => setResetViewTrigger((v) => v + 1)} sx={{ p: 0.8, color: '#3b82f6' }}>
            <LocationOnIcon sx={{ fontSize: '1.15rem' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Village Boundaries" placement="left">
          <IconButton aria-pressed={showBoundary} size="small" onClick={() => setShowBoundary(v => !v)} sx={{ p: 0.8, color: showBoundary ? '#3b82f6' : isDark ? '#ffffff' : '#334155' }}>
            <MapIcon sx={{ fontSize: '1.15rem' }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Aerial Photos" placement="left">
          <IconButton aria-pressed={activeLayer === 'satellite'} size="small" onClick={() => setActiveLayer('satellite')} sx={{ p: 0.8, color: activeLayer === 'satellite' ? '#3b82f6' : isDark ? '#ffffff' : '#334155' }}>
            <PhotoLibraryIcon sx={{ fontSize: '1.15rem' }} />
          </IconButton>
        </Tooltip>

      </Box>

      {/* ── LEAFLET MAP CONTAINER ─────────────────────────────────── */}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={14}
        zoomControl={false}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        {activeLayer === 'satellite' ? (
          <TileLayer
            attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {activeLayer === 'satellite' && showRoads && <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
          attribution="&copy; Esri" maxZoom={19} zIndex={2}
        />}

        <MapCustomControls
          bounds={bounds}
          zoomIn={zoomInTrigger}
          zoomOut={zoomOutTrigger}
          resetView={resetViewTrigger}
          insets={insets ?? NO_INSETS}
        />

        {/* Highlighted Boundary Polygon */}
        {showBoundary && parsedPositions.length > 0 && (
          <Polygon
            positions={parsedPositions}
            pathOptions={{
              color: '#0f172a',
              weight: 3,
              opacity: 0.95,
              fillColor: '#60a5fa',
              fillOpacity: 0.15,
            }}
          >
            <Popup>
              <Box sx={{ p: 0.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>
                  {gnName}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.3 }}>
                  {dsDivision} &bull; {district}
                </Typography>
              </Box>
            </Popup>
          </Polygon>
        )}

        {/* Cadastral Parcel Blocks Overlay */}
        {showCadastre &&
          cadastralParcels.map((parcel, idx) => (
            <Polygon
              key={idx}
              positions={parcel.coords}
              pathOptions={{
                color: '#334155',
                weight: 1.5,
                fillColor: parcel.color,
                fillOpacity: 0.45,
              }}
            />
          ))}

        {/* Center Pin Marker */}
        <Marker position={[centerLat, centerLng]} icon={customPinIcon}>
          <Popup>
            <Box sx={{ p: 0.5, minWidth: 150 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>
                {gnName}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748b', mt: 0.2 }}>
                {dsDivision ? `${dsDivision} DS Division` : ''}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', mt: 0.2 }}>
                {district} District
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                Lat: {centerLat.toFixed(4)}, Lng: {centerLng.toFixed(4)}
              </Typography>
            </Box>
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
};

export default VillageMap;

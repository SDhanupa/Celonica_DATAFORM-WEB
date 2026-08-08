import React, { useEffect, useMemo } from 'react';
import { Box, Typography, Chip, Button, IconButton, Tooltip, Divider, useTheme } from '@mui/material';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LayersIcon from '@mui/icons-material/Layers';

// Fix Leaflet's default marker icons in Vite/React bundling
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const customPinIcon = L.icon({
  iconUrl: iconMarker,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to auto-fly to bounds whenever the GN division changes
function MapAutoBounds({ bounds }: { bounds: [[number, number], [number, number]] | null }) {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.flyToBounds(bounds, {
        padding: [40, 40],
        maxZoom: 16,
        duration: 1.5
      });
    }
  }, [bounds, map]);

  return null;
}

export interface VillageMapProps {
  gnName: string;
  district: string;
  dsDivision?: string;
  ccode?: string;
  boundary?: {
    minLat?: number | null;
    maxLat?: number | null;
    minLng?: number | null;
    maxLng?: number | null;
    polygons?: string | null;
  } | null;
  height?: string | number;
}

export const VillageMap: React.FC<VillageMapProps> = ({
  gnName,
  district,
  dsDivision,
  ccode,
  boundary,
  height = 420,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Parse polygons from GeoJSON [lng, lat] to Leaflet [lat, lng] format
  const parsedPositions = useMemo(() => {
    if (!boundary?.polygons) return [];
    try {
      const raw = JSON.parse(boundary.polygons);
      // Handles Polygon [[[lng, lat], ...]] or MultiPolygon [[[[lng, lat], ...]]]
      if (Array.isArray(raw)) {
        const ring = Array.isArray(raw[0]?.[0]) && typeof raw[0][0][0] === 'number'
          ? raw[0]
          : Array.isArray(raw[0]?.[0]?.[0])
          ? raw[0][0]
          : raw;

        return ring.map((pt: [number, number]) => [pt[1], pt[0]] as [number, number]);
      }
    } catch (e) {
      console.error('Error parsing GN polygon:', e);
    }
    return [];
  }, [boundary?.polygons]);

  // Compute center & bounding box
  const minLat = boundary?.minLat ?? 6.9271;
  const maxLat = boundary?.maxLat ?? 6.9271;
  const minLng = boundary?.minLng ?? 79.8612;
  const maxLng = boundary?.maxLng ?? 79.8612;

  const centerLat = (minLat + maxLat) / 2 || 6.9271;
  const centerLng = (minLng + maxLng) / 2 || 79.8612;

  const bounds: [[number, number], [number, number]] | null = useMemo(() => {
    if (boundary?.minLat && boundary?.maxLat && boundary?.minLng && boundary?.maxLng) {
      return [
        [boundary.minLat, boundary.minLng],
        [boundary.maxLat, boundary.maxLng],
      ];
    }
    return null;
  }, [boundary]);

  const osmUrl = `https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLng}#map=15/${centerLat}/${centerLng}`;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: height,
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.15)'
          : '0 12px 36px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.08)',
        bgcolor: isDark ? '#1a1f2c' : '#f8fafc',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: isDark
            ? '0 16px 44px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.25)'
            : '0 16px 44px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.12)',
        },
      }}
    >
      {/* Top Floating Glassmorphism Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 1000,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(12px)',
          border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
          borderRadius: '16px',
          px: 2,
          py: 1,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        }}
      >
        <LocationOnIcon sx={{ fontSize: '1.25rem', color: '#3b82f6' }} />
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            fontSize: '0.92rem',
            color: isDark ? '#ffffff' : '#0f172a',
            fontFamily: "'Playfair Display', serif",
            letterSpacing: '0.3px',
          }}
        >
          {gnName || 'Grama Niladhari Division'}
        </Typography>

        {dsDivision && (
          <Chip
            size="small"
            label={dsDivision}
            sx={{
              height: 22,
              fontSize: '0.72rem',
              fontWeight: 700,
              bgcolor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(59, 130, 246, 0.12)',
              color: '#3b82f6',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          />
        )}

        {district && (
          <Chip
            size="small"
            label={district}
            sx={{
              height: 22,
              fontSize: '0.72rem',
              fontWeight: 700,
              bgcolor: isDark ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          />
        )}

        {ccode && (
          <Chip
            size="small"
            label={ccode}
            sx={{
              height: 22,
              fontSize: '0.72rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
              color: isDark ? '#e2e8f0' : '#334155',
            }}
          />
        )}
      </Box>

      {/* Top Right Actions: Open in OpenStreetMap */}
      <Box
        sx={{
          position: 'absolute',
          top: 14,
          right: 14,
          zIndex: 1000,
          display: 'flex',
          gap: 1,
        }}
      >
        <Tooltip title="View full on OpenStreetMap">
          <Button
            component="a"
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            startIcon={<OpenInNewIcon sx={{ fontSize: '0.95rem' }} />}
            sx={{
              bgcolor: isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(12px)',
              color: isDark ? '#ffffff' : '#0f172a',
              border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.12)',
              borderRadius: '14px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              px: 1.5,
              py: 0.6,
              boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
              '&:hover': {
                bgcolor: isDark ? 'rgba(30, 41, 59, 0.95)' : '#ffffff',
                transform: 'translateY(-1px)',
              },
            }}
          >
            OpenStreetMap
          </Button>
        </Tooltip>
      </Box>

      {/* Bottom Coordinates & Highlighting indicator */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 12,
          left: 14,
          zIndex: 1000,
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.82)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          px: 1.5,
          py: 0.5,
          border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <LayersIcon sx={{ fontSize: '0.9rem', color: '#2563eb' }} />
        <Typography
          sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: isDark ? '#94a3b8' : '#64748b',
            fontFamily: 'monospace',
          }}
        >
          {centerLat.toFixed(5)}° N, {centerLng.toFixed(5)}° E
        </Typography>
        {parsedPositions.length > 0 && (
          <Chip
            size="small"
            label="Boundary Highlighted"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 800,
              bgcolor: 'rgba(37, 99, 235, 0.15)',
              color: '#2563eb',
            }}
          />
        )}
      </Box>

      {/* Leaflet Map with OpenStreetMap standard tiles */}
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapAutoBounds bounds={bounds} />

        {/* Highlighted Boundary Polygon */}
        {parsedPositions.length > 0 && (
          <Polygon
            positions={parsedPositions}
            pathOptions={{
              color: '#2563eb',
              weight: 3,
              opacity: 0.9,
              fillColor: '#3b82f6',
              fillOpacity: 0.32,
              dashArray: undefined,
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
                {ccode && (
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', mt: 0.5, fontFamily: 'monospace' }}>
                    CCODE: {ccode}
                  </Typography>
                )}
              </Box>
            </Popup>
          </Polygon>
        )}

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

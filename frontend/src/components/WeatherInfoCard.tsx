import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, CircularProgress, useTheme } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CloudIcon from '@mui/icons-material/Cloud';
import GrainIcon from '@mui/icons-material/Grain';
import AirIcon from '@mui/icons-material/Air';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';

interface WeatherInfoCardProps {
  lat?: number;
  lng?: number;
  locationName?: string;
  isDarkMode?: boolean;
}

export const WeatherInfoCard: React.FC<WeatherInfoCardProps> = ({
  lat = 6.9271,
  lng = 79.8612,
  locationName,
  isDarkMode = false,
}) => {
  const [weather, setWeather] = useState<{
    temperature: number;
    rainChance: number;
    windSpeed: number;
    condition: string;
    forecast: Array<{ day: string; icon: string; text: string }>;
  }>({
    temperature: 26,
    rainChance: 30,
    windSpeed: 1.5,
    condition: 'Partly Cloudy',
    forecast: [
      { day: '1 day', icon: 'sun', text: '62% partly' },
      { day: '2 day', icon: 'rain', text: 'No rain' },
      { day: '3 day', icon: 'wind', text: 'Mild' },
    ],
  });

  useEffect(() => {
    if (lat && lng) {
      // Fetch real-time weather from Open-Meteo free API
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability&daily=temperature_2m_max,precipitation_probability_max,weather_code&timezone=auto`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data && data.current) {
            const temp = Math.round(data.current.temperature_2m ?? 26);
            const rain = data.current.precipitation_probability ?? 30;
            const wind = Math.round((data.current.wind_speed_10m ?? 1.5) * 10) / 10;
            const dailyRain = data.daily?.precipitation_probability_max ?? [30, 10, 5];

            setWeather({
              temperature: temp,
              rainChance: rain,
              windSpeed: wind,
              condition: rain > 50 ? 'Rainy' : rain > 20 ? 'Partly Cloudy' : 'Clear',
              forecast: [
                { day: '1 day', icon: dailyRain[0] > 40 ? 'rain' : 'sun', text: `${dailyRain[0] ?? 62}% chance` },
                { day: '2 day', icon: dailyRain[1] > 40 ? 'rain' : 'sun', text: dailyRain[1] > 20 ? 'Light rain' : 'No rain' },
                { day: '3 day', icon: 'wind', text: 'Mild breeze' },
              ],
            });
          }
        })
        .catch(() => {
          // Keep defaults if network fails
        });
    }
  }, [lat, lng]);

  const fahrenheit = Math.round((weather.temperature * 9) / 5 + 32);

  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: '24px',
        p: { xs: 2.5, md: 3 },
        bgcolor: isDarkMode ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(20px)',
        border: isDarkMode ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: isDarkMode
          ? '0 16px 36px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)'
          : '0 16px 36px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.6)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header & Cloud Icon */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1rem', md: '1.15rem' },
              color: isDarkMode ? '#f8fafc' : '#1e293b',
              letterSpacing: '0.3px',
              textTransform: 'uppercase',
            }}
          >
            WEATHER INFO (කාලගුණ තොරතුරු)
          </Typography>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: isDarkMode ? '#94a3b8' : '#64748b',
              mt: 0.3,
            }}
          >
            Current report for the village area.
          </Typography>
        </Box>

        {/* Big Weather Illustration */}
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(240, 244, 248, 0.95)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isDarkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
            position: 'relative',
          }}
        >
          <CloudIcon sx={{ fontSize: '2.4rem', color: isDarkMode ? '#cbd5e1' : '#475569' }} />
          <GrainIcon
            sx={{
              fontSize: '1.2rem',
              color: '#3b82f6',
              position: 'absolute',
              bottom: 12,
              left: 20,
            }}
          />
          <WbSunnyIcon
            sx={{
              fontSize: '1.3rem',
              color: '#f59e0b',
              position: 'absolute',
              top: 10,
              right: 14,
            }}
          />
        </Box>
      </Box>

      {/* Bullet Metrics */}
      <Box sx={{ my: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography sx={{ fontSize: '0.9rem', color: isDarkMode ? '#e2e8f0' : '#334155', fontWeight: 600 }}>
          &bull; Temperature: {weather.temperature} ({fahrenheit}°C)
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: isDarkMode ? '#e2e8f0' : '#334155', fontWeight: 600 }}>
          &bull; Rain chance: {weather.rainChance} %
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: isDarkMode ? '#e2e8f0' : '#334155', fontWeight: 600 }}>
          &bull; Wind speed: {weather.windSpeed} m/h
        </Typography>
      </Box>

      {/* 3-day forecast title */}
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '0.82rem',
          color: isDarkMode ? '#cbd5e1' : '#475569',
          mb: 1.2,
          mt: 2,
        }}
      >
        3-day forecast
      </Typography>

      {/* 3-Day Forecast Cards */}
      <Grid container spacing={1.5}>
        {weather.forecast.map((item, idx) => (
          <Grid item xs={4} key={idx}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: '16px',
                bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.75)',
                border: isDarkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.5,
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                },
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  color: isDarkMode ? '#94a3b8' : '#64748b',
                }}
              >
                {item.day}
              </Typography>

              {item.icon === 'sun' && <WbSunnyIcon sx={{ fontSize: '1.6rem', color: '#f59e0b' }} />}
              {item.icon === 'rain' && <GrainIcon sx={{ fontSize: '1.6rem', color: '#3b82f6' }} />}
              {item.icon === 'wind' && <AirIcon sx={{ fontSize: '1.6rem', color: '#64748b' }} />}

              <Typography
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isDarkMode ? '#cbd5e1' : '#334155',
                }}
              >
                {item.text}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default WeatherInfoCard;

import React from 'react';
import type { SvgIconComponent } from '@mui/icons-material';
import AddRoadRoundedIcon from '@mui/icons-material/AddRoadRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import CableRoundedIcon from '@mui/icons-material/CableRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import ForestRoundedIcon from '@mui/icons-material/ForestRounded';
import LocalFloristRoundedIcon from '@mui/icons-material/LocalFloristRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import NaturePeopleRoundedIcon from '@mui/icons-material/NaturePeopleRounded';
import SquareFootRoundedIcon from '@mui/icons-material/SquareFootRounded';
import TerrainRoundedIcon from '@mui/icons-material/TerrainRounded';
import WaterRoundedIcon from '@mui/icons-material/WaterRounded';

export interface CategoryVisual {
  Icon: SvgIconComponent;
  /** Mid-tone hue: dark enough for a 3:1 icon contrast on its own 10% tint. */
  color: string;
}

interface VisualRule extends CategoryVisual {
  slugs: string[];
  /** Matched against the English name when the slug is unknown, so a renamed
   *  or re-slugged category keeps a sensible icon instead of the generic one. */
  keywords: RegExp;
}

const RULES: VisualRule[] = [
  { slugs: ['location-1-1'], keywords: /boundar|division|admin/i, Icon: MapRoundedIcon, color: '#2563EB' },
  { slugs: ['location-1-2'], keywords: /\bspace\b|public|park|playground/i, Icon: NaturePeopleRoundedIcon, color: '#0D9488' },
  { slugs: ['location-1-4'], keywords: /building|residential|house/i, Icon: ApartmentRoundedIcon, color: '#475569' },
  { slugs: ['location-1-3'], keywords: /\bland\b|deed|parcel/i, Icon: SquareFootRoundedIcon, color: '#B45309' },
  { slugs: ['location-1-5'], keywords: /road|street|highway/i, Icon: AddRoadRoundedIcon, color: '#EA580C' },
  { slugs: ['location-1-6'], keywords: /geograph|mountain|rock|terrain/i, Icon: TerrainRoundedIcon, color: '#9A3412' },
  { slugs: ['location-1-7'], keywords: /natural|forest|swamp|grass/i, Icon: ForestRoundedIcon, color: '#15803D' },
  { slugs: ['location-1-8'], keywords: /water|river|sea|lake|tank/i, Icon: WaterRoundedIcon, color: '#0284C7' },
  { slugs: ['location-1-9'], keywords: /line|electric|cable|pipe/i, Icon: CableRoundedIcon, color: '#CA8A04' },
  { slugs: ['location-1-10'], keywords: /flora|plant|tree|crop/i, Icon: LocalFloristRoundedIcon, color: '#65A30D' },
];

const FALLBACK: CategoryVisual = { Icon: CategoryRoundedIcon, color: '#1677C8' };

export const getCategoryVisual = (category: { slug?: string; nameEn?: string }): CategoryVisual => {
  const bySlug = RULES.find((r) => category.slug && r.slugs.includes(category.slug));
  if (bySlug) return bySlug;
  const byName = RULES.find((r) => r.keywords.test(category.nameEn || ''));
  return byName || FALLBACK;
};

export const CategoryIcon: React.FC<{ category: { slug?: string; nameEn?: string }; size?: number }> = ({ category, size = 24 }) => {
  const { Icon, color } = getCategoryVisual(category);
  return <Icon sx={{ fontSize: size, color }} />;
};

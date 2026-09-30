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
  /**
   * Monochrome ink. The design is deliberately single-hue, so every category
   * renders in the same ink; recognition comes from the icon shape, not colour.
   * Kept in the return shape so callers can tint tiles/hover states consistently.
   */
  color: string;
}

interface VisualRule {
  Icon: SvgIconComponent;
  slugs: string[];
  /** Matched against the English name when the slug is unknown, so a renamed
   *  or re-slugged category keeps a sensible icon instead of the generic one. */
  keywords: RegExp;
}

const RULES: VisualRule[] = [
  { slugs: ['location-1-1'], keywords: /boundar|division|admin/i, Icon: MapRoundedIcon },
  { slugs: ['location-1-2'], keywords: /\bspace\b|public|park|playground/i, Icon: NaturePeopleRoundedIcon },
  { slugs: ['location-1-4'], keywords: /building|residential|house/i, Icon: ApartmentRoundedIcon },
  { slugs: ['location-1-3'], keywords: /\bland\b|deed|parcel/i, Icon: SquareFootRoundedIcon },
  { slugs: ['location-1-5'], keywords: /road|street|highway/i, Icon: AddRoadRoundedIcon },
  { slugs: ['location-1-6'], keywords: /geograph|mountain|rock|terrain/i, Icon: TerrainRoundedIcon },
  { slugs: ['location-1-7'], keywords: /natural|forest|swamp|grass/i, Icon: ForestRoundedIcon },
  { slugs: ['location-1-8'], keywords: /water|river|sea|lake|tank/i, Icon: WaterRoundedIcon },
  { slugs: ['location-1-9'], keywords: /line|electric|cable|pipe/i, Icon: CableRoundedIcon },
  { slugs: ['location-1-10'], keywords: /flora|plant|tree|crop/i, Icon: LocalFloristRoundedIcon },
];

const INK = '#0A0C0F';

export const getCategoryVisual = (category: { slug?: string; nameEn?: string }): CategoryVisual => {
  const bySlug = RULES.find((r) => category.slug && r.slugs.includes(category.slug));
  if (bySlug) return { Icon: bySlug.Icon, color: INK };
  const byName = RULES.find((r) => r.keywords.test(category.nameEn || ''));
  return { Icon: byName?.Icon || CategoryRoundedIcon, color: INK };
};

export const CategoryIcon: React.FC<{ category: { slug?: string; nameEn?: string }; size?: number }> = ({ category, size = 24 }) => {
  const { Icon } = getCategoryVisual(category);
  return <Icon sx={{ fontSize: size, color: INK }} />;
};

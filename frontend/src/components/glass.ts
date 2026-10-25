// Readable map-overlay surfaces, shared by desktop and mobile controls.
export const glassEdge = (isDark: boolean) => isDark ? '#16252d' : '#ffffff';

export const glassSx = (isDark: boolean) => ({
  background: isDark ? 'rgba(22,37,45,0.97)' : 'rgba(255,255,255,0.97)',
  border: isDark ? '1px solid #34444d' : '1px solid #dce5e2',
  boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.22)' : '0 6px 24px rgba(17,43,36,0.10)',
});

export const glassTileSx = (isDark: boolean) => ({
  background: isDark ? '#20323b' : '#f3f7f5',
  border: isDark ? '1px solid #34444d' : '1px solid #e1e9e5',
  boxShadow: 'none',
});

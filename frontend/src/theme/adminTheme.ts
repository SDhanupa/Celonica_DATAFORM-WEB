import { createTheme } from '@mui/material/styles';
import theme from './theme';

// Scoped to management screens; the public map keeps its existing theme.
const adminTheme = createTheme(theme, {
  palette: {
    primary: { main: '#087f5b', dark: '#066447', light: '#e6f3ec', contrastText: '#ffffff' },
    background: { default: '#f3f4f2', paper: '#ffffff' },
    text: { primary: '#202923', secondary: '#606b64' },
    divider: '#e9ede9',
  },
  typography: {
    h4: { fontSize: 'clamp(1.6rem, 2.6vw, 2.2rem)', fontWeight: 500, letterSpacing: '-0.035em', color: '#202923' },
    h5: { fontSize: '1.15rem', fontWeight: 600, color: '#202923' },
    body1: { color: '#202923' },
    body2: { color: '#202923' },
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 24, boxShadow: 'none', minHeight: 40, paddingInline: 18, '&:hover': { boxShadow: 'none' } } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 16 } } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 12 }, notchedOutline: { borderColor: '#dce3dd' } } },
    MuiTableCell: { styleOverrides: { root: { borderBottomColor: '#edf0ed', padding: '18px 20px' }, head: { color: '#606b64', backgroundColor: '#fafbf9', fontSize: 12, fontWeight: 500 } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 500 } } },
  },
});
export default adminTheme;

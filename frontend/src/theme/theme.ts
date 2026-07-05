import { createTheme } from '@mui/material/styles';

// AdminBite Color Palette
const colors = {
  primary: '#4798e8',
  secondary: '#6c757d',
  success: '#22c6ab',
  info: '#4798e8',
  warning: '#ffbc34',
  danger: '#ef6e6e',
  background: '#eef5f9', // AdminBite body background
  surface: '#ffffff',
  text: '#3e5569',
  textMuted: '#a1aab2',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    success: {
      main: colors.success,
    },
    info: {
      main: colors.info,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.danger,
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.text,
      secondary: colors.textMuted,
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: { fontSize: '36px', fontWeight: 500, color: colors.text },
    h2: { fontSize: '30px', fontWeight: 500, color: colors.text },
    h3: { fontSize: '22px', fontWeight: 500, color: colors.text },
    h4: { fontSize: '18px', fontWeight: 500, color: colors.text },
    h5: { fontSize: '16px', fontWeight: 500, color: colors.text },
    h6: { fontSize: '14px', fontWeight: 500, color: colors.text },
    body1: { fontSize: '0.875rem', fontWeight: 300, color: colors.text },
    body2: { fontSize: '0.875rem', fontWeight: 300, color: colors.text },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 2, // AdminBite uses subtle rounded corners (2px)
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
        },
        body: {
          backgroundColor: colors.background,
          color: colors.text,
          minHeight: '100vh',
          fontFamily: "'Poppins', sans-serif",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0, // Square cards
          boxShadow: '1px 0px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e9ecef',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '1px 0px 20px rgba(0, 0, 0, 0.08)',
          backgroundColor: colors.primary, // The topbar is usually primary blue in some AdminBite variants
          color: '#ffffff',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff', // Light sidebar
          color: colors.text,
          borderRight: '1px solid rgba(120, 130, 140, 0.13)',
          boxShadow: '1px 0px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          margin: '0px',
          padding: '12px 15px',
          color: colors.text,
          '&.Mui-selected': {
            backgroundColor: 'rgba(0,0,0,0.025)',
            color: colors.primary,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.025)',
            },
          },
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.025)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: 'inherit',
          minWidth: '35px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e9ecef',
          padding: '1rem',
          color: colors.text,
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8f9fa',
          color: '#4f5467',
        },
      },
    },
  },
});

export default theme;

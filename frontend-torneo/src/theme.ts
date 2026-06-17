import { createTheme } from '@mui/material/styles';
import { red } from '@mui/material/colors';

// Import Inter font - ensure index.html includes <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

declare module '@mui/material/styles' {
  interface Palette {
    glass?: Palette['primary'];
  }
  interface PaletteOptions {
    glass?: PaletteOptions['primary'];
  }
}

const primary = {
  main: 'hsl(210, 70%, 55%)', // azul suave
  contrastText: '#fff',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary,
    secondary: {
      main: 'hsl(340, 70%, 55%)', // rosa/acento
    },
    background: {
      default: '#121212',
      paper: 'rgba(255,255,255,0.04)',
    },
    glass: primary,
    error: {
      main: red.A400,
    },
  },
  typography: {
    fontFamily: 'Inter, Arial, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '12px',
        },
      },
    },
  },
});

export default theme;

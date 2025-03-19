// client/src/theme/index.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#E50010', // H&M Red
      dark: '#C5000D',
      light: '#FF4D4D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#222222', // Rich Black
      dark: '#000000',
      light: '#444444',
      contrastText: '#FFFFFF',
    },
    digital: {
      main: '#00A0B0', // Digital accent color for new features
      dark: '#007A85',
      light: '#4DCBDA',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F4F4F4',
    },
    text: {
      primary: '#222222',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Helvetica Neue", "Inter", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      fontSize: '2.5rem',
    },
    h4: {
      fontWeight: 500,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0, // H&M uses square buttons
          padding: '8px 16px',
        },
        contained: {
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
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid #f0f0f0',
        },
      },
    },
  },
});

export default theme;
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { customMuiTheme } from '../config/customMuiTheme';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <MuiThemeProvider theme={customMuiTheme}>
      {children}
    </MuiThemeProvider>
  );
};


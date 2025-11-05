import { createTheme } from "@mui/material";

export const customMuiTheme = createTheme({
  palette: {
    primary: {
      main: '#E65F2B',
    },
    secondary: {
      main: '#f44336',
    },
    error: {
      main: '#DD5050',
    },
    warning: {
      main: '#E01414',
    },
    grey: {
      100: '#F6F7FB',
      200: '#C7C7C7',
    },
    success: {
      main: '#2F691D',
    },
    text: {
      primary: '#5A5A65',
      secondary: '#6B7280',
    }
  },
  typography: {
    fontFamily: 'Poppins, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
    h2: {
      fontSize: '2rem',
      fontWeight: 900,
      color: "#5A5A65",
    },
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          boxShadow: "0px 0px 1px rgba(0, 0, 0, 0.1)", 
          border: "1px solid #e5e7eb" 
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          width: "100%",
          height: "100%",
          minWidth: 650,
          "& thead th": {
            backgroundColor: "#f5f6f7",
            color: "#5A5A65",
            fontWeight: 600,
            fontSize: "0.875rem",
            letterSpacing: 0.3,
            borderBottom: "1px solid #e5e7eb",
          },
          "& tbody td": {
            borderBottom: "1px solid #f0f0f0",
            fontSize: "0.9rem",
            color: "#5A5A65",
          },
          "& tbody tr:hover": {
            backgroundColor: "#fff7ee",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          fontSize: '0.875rem',
          color: "#5a5a65",
          border: "none",
          textAlign: "left",
          padding: "14px 18px",
        },
        body: {
          fontSize: '0.875rem',
          color: "#5A5A65",
          border: "none",
          padding: "20px 18px",
        },
      }
    },
    MuiTableRow: {
      styleOverrides: {
        head: {
          backgroundColor: "#f3f4f6",
          border: "none",
        },
        root: {
          borderTop: "0.5px solid #C7C7C7",
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "4px",
            backgroundColor: "#fff",
            "& fieldset": {
              borderColor: "#E0E0E0",
            },
            "&:hover fieldset": {
              borderColor: "#C94715",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#C94715",
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
          padding: '10px',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: 150,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          justifyContent: "space-between",
          '&:hover': { boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)" },
          transition: "box-shadow 0.3s ease",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
  }
});


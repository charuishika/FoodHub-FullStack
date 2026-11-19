import { createTheme } from "@mui/material/styles";

const common = {
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiAppBar: { defaultProps: { elevation: 0 } },
    MuiCard: {
      styleOverrides: { root: { boxShadow: "0 1px 4px rgba(0, 0, 0, 0.12)" } },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
  },
};

export const customerTheme = createTheme({
  ...common,
  palette: {
    primary: { main: "#1565c0" },
    secondary: { main: "#ef6c00" },
    background: { default: "#f4f6fa" },
  },
});

export const ownerTheme = createTheme({
  ...common,
  palette: {
    primary: { main: "#00796b" },
    secondary: { main: "#546e7a" },
    background: { default: "#f1f4f5" },
  },
  components: {
    ...common.components,
    MuiAppBar: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundColor: "#263238" } },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#e8eef0",
          "& .MuiTableCell-root": { fontWeight: 700 },
        },
      },
    },
  },
});

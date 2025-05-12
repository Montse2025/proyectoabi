// /*index.js */
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { orange, blue } from "@mui/material/colors"; // Importa paletas de colores de MUI

// Define tu tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: blue[500], // Un tono de azul como primario
    },
    secondary: {
      main: orange[500], // El naranja que ya usabas como secundario o acento
    },
    // Puedes definir más tonos si lo necesitas, como light, dark, contrastText
  },
  typography: {
    fontFamily: "Oswald, sans-serif", // Establece Oswald como la fuente principal
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

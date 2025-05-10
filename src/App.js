import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Typography,
  Container,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home"; // Importamos el ícono de casa
import Form1 from "./Views/Form1"; // Importamos Form1 desde su archivo correspondiente
import DataView from "./Views/DataView"; // Importa el componente correcto
import Login from "./Sesion/Login"; // Importamos Login.js
import { fakeAuth } from "./Sesion/Managements"; // Importamos fakeAuth desde Managements.js
import Principal from "./Views/Principal"; // Importamos Principal.js
import Form2 from "./Views/Form2"; // Importamos Form2.js
import Datos from "./Views/Datos"; // Importamos Datos.js

// Componente de navegación
const Navigation = ({ setUpdate }) => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  const handleLogout = () => {
    setOpenDialog(true); // Mostrar el diálogo
  };

  const confirmLogout = () => {
    fakeAuth.logout(navigate, setUpdate); // Usamos la función setUpdate pasada como prop
    setOpenDialog(false);
  };

  const cancelLogout = () => {
    setOpenDialog(false); // Cerrar sin hacer logout
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: "#FF7043" }}>
        <Toolbar sx={{ justifyContent: "center" }}>
          {/* Botón de menú principal (casa) */}
          <Button
            color="inherit"
            component={Link}
            to="/principal"
            sx={{ fontWeight: "bold", color: "#FFF" }}
          >
            <HomeIcon sx={{ mr: 1 }} /> {/* Icono de casa */}
            Menú Principal
          </Button>
        </Toolbar>
      </AppBar>

      {/* Aquí va el diálogo de confirmación */}
      <Dialog open={openDialog} onClose={cancelLogout}>
        <DialogTitle sx={{ backgroundColor: "#FF7043", color: "#FFF" }}>
          ¿Estás seguro que querés cerrar sesión?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#FF7043" }}>
            Perderás tu sesión actual.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmLogout} color="error" variant="contained">
            Cerrar sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Componente principal
const App = () => {
  const [update, setUpdate] = useState(Date.now());

  useEffect(() => {
    // Sincronizar el estado de autenticación con el valor de localStorage
    setUpdate(Date.now());
  }, [fakeAuth.isAuthenticated]);

  return (
    <Router>
      {fakeAuth.isAuthenticated && <Navigation setUpdate={setUpdate} />}{" "}
      {/* Pasamos setUpdate a Navigation */}
      <Routes>
        <Route
          path="/login"
          element={
            fakeAuth.isAuthenticated ? (
              <Navigate to="/principal" />
            ) : (
              <Login setUpdate={setUpdate} />
            )
          }
        />
        <Route
          path="/principal"
          element={
            fakeAuth.isAuthenticated ? (
              <Principal setUpdate={setUpdate} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/form1"
          element={
            fakeAuth.isAuthenticated ? (
              <Form1 setUpdate={setUpdate} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/form2/:id"
          element={
            fakeAuth.isAuthenticated ? <Form2 /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/registrar-datos"
          element={
            fakeAuth.isAuthenticated ? <Datos /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/datos"
          element={
            fakeAuth.isAuthenticated ? <DataView /> : <Navigate to="/login" />
          }
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;

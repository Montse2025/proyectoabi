/*App.js */
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
  Typography,
  Container,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MenuIcon from "@mui/icons-material/Menu";
import Form1 from "./Views/Form1";
import DataView from "./Views/DataView";
import Login from "./Sesion/Login";
import { fakeAuth } from "./Sesion/Managements";
import Principal from "./Views/Principal";
import Form2 from "./Views/Form2";
import Datos from "./Views/Datos";
import PaginaPrincipal from "./Views/PaginaPrincipal"; // Importamos el nuevo componente

// Componente de navegación
const Navigation = ({ setUpdate }) => {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  const handleLogout = () => {
    setOpenDialog(true);
  };

  const confirmLogout = () => {
    fakeAuth.logout(navigate, setUpdate);
    setOpenDialog(false);
  };

  const cancelLogout = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: "#FF7043" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Botón de gestión (ahora como página principal) */}
            <Button
              color="inherit"
              component={Link}
              to="/principal"
              sx={{ fontWeight: "bold", color: "#FFF" }}
            >
              <HomeIcon sx={{ mr: 1 }} />
              Principal
            </Button>
            {/* Botón de menú principal (ahora contendrá el contenido de "Gestión") */}
            <Button
              color="inherit"
              component={Link}
              to="/gestion"
              sx={{ fontWeight: "bold", color: "#FFF" }}
            >
              <MenuIcon sx={{ mr: 1 }} />
              Menú Principal
            </Button>
          </Box>
          {/* Botón de cerrar sesión */}
          <Button
            color="inherit"
            onClick={handleLogout}
            sx={{ fontWeight: "bold", color: "#FFF" }}
          >
            Cerrar Sesión
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
      {fakeAuth.isAuthenticated && <Navigation setUpdate={setUpdate} />}
      <Box sx={{ paddingTop: "64px" }}>
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
          {/* Moviendo el contenido de /principal a /gestion */}
          <Route
            path="/gestion"
            element={
              fakeAuth.isAuthenticated ? (
                <Principal setUpdate={setUpdate} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          {/* La ruta /principal ahora renderiza PaginaPrincipal */}
          <Route
            path="/principal"
            element={
              fakeAuth.isAuthenticated ? (
                <PaginaPrincipal /> // Usamos el nuevo componente aquí
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
      </Box>
    </Router>
  );
};

export default App;

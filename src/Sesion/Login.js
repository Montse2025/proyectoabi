import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fakeAuth } from "./Managements";
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

const Login = ({ setUpdate }) => {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!name || !pin) {
      setErrorMessage("Por favor, completa todos los campos.");
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    try {
      const isAuthenticated = await fakeAuth.login(
        name.trim(),
        pin.trim(),
        navigate,
        setUpdate
      );

      if (!isAuthenticated) {
        localStorage.setItem("userName", name.trim()); // <-- ESTA LÍNEA es clave
      } else {
        setErrorMessage("Usuario o PIN incorrectos.");
        setOpenSnackbar(true);
      }
    } catch (error) {
      setErrorMessage("Error al autenticar. Intenta nuevamente.");
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Box textAlign="center" mt={10} sx={{ maxWidth: 400, mx: "auto", p: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: "bold", color: "#FF6F00" }}
      >
        Iniciar Sesión
      </Typography>

      <TextField
        label="Ingrese su usuario"
        variant="outlined"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TextField
        label="Ingrese su PIN"
        variant="outlined"
        type={showPin ? "text" : "password"}
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        inputProps={{ maxLength: 5 }}
        fullWidth
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPin(!showPin)} edge="end">
                {showPin ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        variant="contained"
        color="warning"
        fullWidth
        onClick={handleLogin}
        disabled={loading}
        sx={{
          backgroundColor: "#FF6F00",
          "&:hover": { backgroundColor: "#E65100" },
          mb: 2,
        }}
      >
        {loading ? <CircularProgress size={24} /> : "Ingresar"}
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message={errorMessage}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "#FF7043",
            color: "#fff",
            borderRadius: "8px",
            padding: "10px",
          },
        }}
      />
    </Box>
  );
};

export default Login;

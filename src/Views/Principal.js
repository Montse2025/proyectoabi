// Principal.js
import React from "react";
import { Container, Paper, Typography, Grid, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import BookIcon from "@mui/icons-material/Book";
import LogoutIcon from "@mui/icons-material/Logout";

import { fakeAuth } from "../Sesion/Managements";

const Principal = ({ setUpdate }) => {
  // Recibimos setUpdate como prop
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Botón de Salir clickeado");
    fakeAuth.logout(navigate, () => {
      console.log("Callback de fakeAuth.logout ejecutado");
      // No necesitamos llamar a setUpdate aquí si lo hacemos después
    });
    setUpdate((prev) => !prev); // Forzamos la re-renderización de App
  };

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  const buttonsData = [
    {
      label: "Registrar Datos",
      to: "/registrar-datos",
      icon: <AssignmentIcon sx={{ fontSize: 40, color: "#FFF" }} />,
      bgColor: "#90CAF9",
    },
    ...(usuario?.role !== "verificador"
      ? [
          {
            label: "Registrar Plan",
            to: "/form1",
            icon: <PlaylistAddCheckIcon sx={{ fontSize: 40, color: "#FFF" }} />,
            bgColor: "#A5D6A7",
          },
        ]
      : []),
    {
      label: "Ver Datos",
      to: "/datos",
      icon: <BookIcon sx={{ fontSize: 40, color: "#FFF" }} />,
      bgColor: "#FFF59D",
    },
    {
      label: "Salir",
      icon: <LogoutIcon sx={{ fontSize: 40, color: "#FFF" }} />,
      onClick: handleLogout,
      bgColor: "#F44336",
    },
  ];

  const botonesMostrados = buttonsData.slice(0, 4);

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", color: "#FF6F00", mb: 4 }}
      >
        ¡Bienvenido{usuario ? `, ${usuario.name}` : ""}!
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {botonesMostrados.map((button, index) => (
          <Grid item xs={12} sm={6} md={6} key={index} sx={{ display: "flex" }}>
            <Paper
              elevation={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: 150,
                width: "100%",
                minWidth: 150,
                borderRadius: 2,
                backgroundColor: button.bgColor,
                color: "#FFF",
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.9,
                },
              }}
              component={button.to ? Link : "div"}
              to={button.to}
              onClick={button.onClick}
            >
              <Box sx={{ mb: 1 }}>{button.icon}</Box>
              <Typography
                variant="subtitle1"
                align="center"
                sx={{ fontWeight: "bold", wordBreak: "break-word" }}
              >
                {button.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Principal;

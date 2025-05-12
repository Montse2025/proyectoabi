// Views/PaginaPrincipal.js
import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { CalendarMonth, AccessTime, AddCircle } from "@mui/icons-material"; // Importamos iconos

const PaginaPrincipal = () => {
  const [usuario, setUsuario] = useState(null);
  const [fechaActual, setFechaActual] = useState(new Date());
  const [actividadesDelDia, setActividadesDelDia] = useState([]);
  const [eventosDeHoy, setEventosDeHoy] = useState([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuario"));
    setUsuario(u);

    const intervalId = setInterval(() => {
      setFechaActual(new Date());
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  const opcionesFecha = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const fechaFormateada = fechaActual.toLocaleDateString(
    undefined,
    opcionesFecha
  );

  useEffect(() => {
    if (usuario?.name) {
      obtenerActividadesYEventos(usuario.name, fechaActual);
    }
  }, [usuario, fechaActual]);

  const obtenerActividadesYEventos = async (uidDocente, fecha) => {
    // Aquí iría la consulta real a la base de datos
    // Por ahora, datos de ejemplo:
    if (fecha.getDay() === 5) {
      // Viernes
      setEventosDeHoy([
        {
          id: "1",
          horaInicio: "08:30",
          horaFin: "10:00",
          descripcion: "Clase de Química",
        },
        {
          id: "2",
          horaInicio: "10:00",
          horaFin: "11:30",
          descripcion: "Clase de Inglés",
        },
        {
          id: "3",
          horaInicio: "12:00",
          horaFin: "13:00",
          descripcion: "Almuerzo",
        },
        {
          id: "4",
          horaInicio: "13:30",
          horaFin: "15:00",
          descripcion: "Gimnasia - Tenis",
        },
        {
          id: "5",
          horaInicio: "15:30",
          horaFin: "17:30",
          descripcion: "Reunión de Cierre de Semana",
        },
      ]);
      setActividadesDelDia([
        { id: "6", descripcion: "Revisar tareas de la semana" },
        { id: "7", descripcion: "Preparar la clase de la próxima semana" },
      ]);
    } else {
      setEventosDeHoy([]);
      setActividadesDelDia([]);
    }
  };

  return (
    <Box
      sx={{
        mt: 4,
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography variant="h4" gutterBottom>
        Bienvenido, {usuario?.name || "Docente"}
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Hoy es: {fechaFormateada}
      </Typography>

      <Typography
        variant="h6"
        mt={3}
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <CalendarMonth /> Actividades del Día
      </Typography>
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        {actividadesDelDia.length === 0 ? (
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <AddCircle /> Agregar Actividades del Día
          </Button>
        ) : (
          <Paper elevation={2} sx={{ mt: 2 }}>
            <List>
              {actividadesDelDia.map((actividad) => (
                <React.Fragment key={actividad.id}>
                  <ListItem>
                    <ListItemText primary={actividad.descripcion} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      <Typography
        variant="h6"
        mt={3}
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <AccessTime /> Agenda del Día
      </Typography>
      <Box sx={{ width: "100%", maxWidth: 600 }}>
        {eventosDeHoy.length === 0 ? (
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}
          >
            <AddCircle /> Agregar Eventos a la Agenda
          </Button>
        ) : (
          <Paper elevation={2} sx={{ mt: 2 }}>
            <List>
              {eventosDeHoy.map((evento) => (
                <React.Fragment key={evento.id}>
                  <ListItem
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <ListItemText
                      primary={evento.descripcion}
                      secondary={`${evento.horaInicio} - ${evento.horaFin}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default PaginaPrincipal;

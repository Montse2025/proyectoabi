import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

const Datos = () => {
  const [form, setForm] = useState({
    facultad: "",
    nombre: "",
    cedula: "",
    carrera: "",
    materia: "",
    horasTotales: "",
    horasSemanales: "",
  });
  const [carreras, setCarreras] = useState([]);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuario"));
    setUsuario(u);
    if (u) {
      cargarDatos(u.name); // Usamos el campo name o cualquier campo único
    }
  }, []);

  const cargarDatos = async (uid) => {
    const ref = doc(db, "docentes", uid); // Si necesitas un ID único del usuario, asegúrate de tenerlo
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();

      // Solo actualizamos si los datos de Firebase son diferentes a los actuales en el estado
      setForm((prev) => ({
        ...prev,
        facultad: data.facultad || prev.facultad,
        nombre: data.nombre || prev.nombre,
        cedula: data.cedula || prev.cedula,
      }));

      // Aquí verificamos si hay carreras para actualizar, evitando sobrescribir el estado con datos vacíos
      if (data.carreras && data.carreras.length > 0) {
        setCarreras(data.carreras);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const agregarCarrera = () => {
    if (
      !form.carrera ||
      !form.materia ||
      !form.horasTotales ||
      !form.horasSemanales
    ) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    // Buscar si la carrera ya existe
    const index = carreras.findIndex((c) => c.nombre === form.carrera);
    const nuevaMateria = {
      nombre: form.materia,
      horasTotales: form.horasTotales,
      horasSemanales: form.horasSemanales,
    };

    if (index > -1) {
      // Si la carrera existe, agregar la materia
      carreras[index].materias.push(nuevaMateria);
    } else {
      // Si la carrera no existe, crearla
      carreras.push({
        nombre: form.carrera,
        materias: [nuevaMateria],
      });
    }

    setCarreras([...carreras]);
    setForm((prev) => ({
      ...prev,
      carrera: "",
      materia: "",
      horasTotales: "",
      horasSemanales: "",
    }));
  };

  const eliminarMateria = (indexCarrera, indexMateria) => {
    carreras[indexCarrera].materias.splice(indexMateria, 1);
    if (carreras[indexCarrera].materias.length === 0) {
      carreras.splice(indexCarrera, 1);
    }
    setCarreras([...carreras]);
  };

  const handleSubmit = async () => {
    if (!usuario) return alert("No hay usuario autenticado");

    const ref = doc(db, "docentes", usuario.name); // Usar el campo `name` o cualquier identificador único
    await setDoc(ref, {
      facultad: form.facultad,
      nombre: form.nombre,
      cedula: form.cedula,
      carreras: carreras,
    });
    alert("Datos guardados correctamente");
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Datos del Docente
      </Typography>

      <Grid container spacing={2}>
        {["facultad", "nombre", "cedula"].map((field) => (
          <Grid item xs={12} sm={6} key={field}>
            <TextField
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              value={form[field]}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6">Agregar Carreras y Materias</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            label="Carrera"
            name="carrera"
            value={form.carrera}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Materia"
            name="materia"
            value={form.materia}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Horas Totales"
            name="horasTotales"
            type="number"
            value={form.horasTotales}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Horas Semanales"
            name="horasSemanales"
            type="number"
            value={form.horasSemanales}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={agregarCarrera}>
            Agregar Materia
          </Button>
        </Grid>
      </Grid>

      <Box mt={2}>
        {carreras.map((carrera, i) => (
          <Box key={i} mb={2}>
            <Typography variant="subtitle1" fontWeight="bold">
              {carrera.nombre}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {carrera.materias.map((m, j) => (
                <Chip
                  key={j}
                  label={`${m.nombre} - ${m.horasTotales} horas totales, ${m.horasSemanales} horas semanales`}
                  onDelete={() => eliminarMateria(i, j)}
                  deleteIcon={<Delete />}
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleSubmit}
      >
        Guardar Datos
      </Button>
    </Box>
  );
};

export default Datos;

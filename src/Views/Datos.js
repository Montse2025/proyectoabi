import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles"; // Importa el hook para usar el tema

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
  const theme = useTheme(); // Obtén el objeto del tema

  useEffect(() => {
    // Al cargar el componente, intenta obtener la información del usuario del localStorage
    const u = JSON.parse(localStorage.getItem("usuario"));
    setUsuario(u);
    // Si hay un usuario en el localStorage, carga sus datos desde Firebase
    if (u) {
      cargarDatos(u.name); // Asumiendo que 'name' es un identificador único del usuario
    }
  }, []);

  const cargarDatos = async (uid) => {
    // Crea una referencia al documento del docente en la colección 'docentes' usando el UID
    const ref = doc(db, "docentes", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();

      // Actualiza el estado del formulario con los datos obtenidos de Firebase
      setForm((prev) => ({
        ...prev,
        facultad: data.facultad || prev.facultad,
        nombre: data.nombre || prev.nombre,
        cedula: data.cedula || prev.cedula,
      }));

      // Si hay carreras en los datos de Firebase, actualiza el estado de carreras
      if (data.carreras && data.carreras.length > 0) {
        setCarreras(data.carreras);
      }
    }
  };

  const handleChange = (e) => {
    // Actualiza el estado del formulario cuando cambia un campo de texto
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const agregarCarrera = () => {
    // Verifica que todos los campos para agregar una materia estén llenos
    if (
      !form.carrera ||
      !form.materia ||
      !form.horasTotales ||
      !form.horasSemanales
    ) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const nuevaMateria = {
      nombre: form.materia,
      horasTotales: form.horasTotales,
      horasSemanales: form.horasSemanales,
    };

    // Busca si ya existe una carrera con el mismo nombre
    const carreraIndex = carreras.findIndex((c) => c.nombre === form.carrera);

    if (carreraIndex > -1) {
      // Si la carrera existe, agrega la nueva materia a su lista de materias
      const nuevasCarreras = [...carreras];
      nuevasCarreras[carreraIndex].materias = [
        ...nuevasCarreras[carreraIndex].materias,
        nuevaMateria,
      ];
      setCarreras(nuevasCarreras);
    } else {
      // Si la carrera no existe, crea una nueva carrera con la materia
      setCarreras([
        ...carreras,
        { nombre: form.carrera, materias: [nuevaMateria] },
      ]);
    }

    // Limpia los campos para agregar materia
    setForm((prev) => ({
      ...prev,
      carrera: "",
      materia: "",
      horasTotales: "",
      horasSemanales: "",
    }));
  };

  const eliminarMateria = (indexCarrera, indexMateria) => {
    // Crea una copia del estado de carreras para no mutar el estado directamente
    const nuevasCarreras = [...carreras];
    // Elimina la materia del array de materias de la carrera específica
    nuevasCarreras[indexCarrera].materias.splice(indexMateria, 1);
    // Si la carrera se queda sin materias, también la elimina
    if (nuevasCarreras[indexCarrera].materias.length === 0) {
      nuevasCarreras.splice(indexCarrera, 1);
    }
    // Actualiza el estado de carreras con la copia modificada
    setCarreras(nuevasCarreras);
  };

  const handleSubmit = async () => {
    // Verifica que haya un usuario autenticado antes de guardar los datos
    if (!usuario) return alert("No hay usuario autenticado");

    // Crea una referencia al documento del docente usando el UID
    const ref = doc(db, "docentes", usuario.name);
    // Guarda o actualiza los datos del docente en Firebase
    await setDoc(ref, {
      facultad: form.facultad,
      nombre: form.nombre,
      cedula: form.cedula,
      carreras: carreras,
    });
    alert("Datos guardados correctamente");
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 5, p: 3 }}>
      <Typography variant="h5" gutterBottom color={theme.palette.primary.main}>
        Datos del Docente
      </Typography>

      <Grid container spacing={2}>
        {/* Campos para la información básica del docente */}
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

      <Typography variant="h6" color={theme.palette.secondary.main}>
        Agregar Carreras y Materias
      </Typography>
      <Grid container spacing={2} mt={1}>
        {/* Campos para agregar una nueva materia a una carrera */}
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
          <Button
            variant="contained"
            color="secondary"
            onClick={agregarCarrera}
          >
            Agregar Materia
          </Button>
        </Grid>
      </Grid>

      {/* Sección para mostrar las carreras y materias agregadas */}
      <Box mt={3}>
        <Typography
          variant="h6"
          color={theme.palette.primary.dark}
          gutterBottom
        >
          Carreras y Materias Registradas
        </Typography>
        {carreras.map((carrera, i) => (
          <Box
            key={i}
            mb={2}
            border={`1px solid ${theme.palette.divider}`}
            borderRadius={1}
            p={2}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color={theme.palette.text.secondary}
              gutterBottom
            >
              {carrera.nombre}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {carrera.materias.map((m, j) => (
                <Chip
                  key={j}
                  label={`${m.nombre} - ${m.horasTotales} horas totales, ${m.horasSemanales} horas semanales`}
                  onDelete={() => eliminarMateria(i, j)}
                  deleteIcon={<Delete />}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Botón para guardar todos los datos del docente */}
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={handleSubmit}
      >
        Guardar Datos del Docente
      </Button>
    </Box>
  );
};

export default Datos;

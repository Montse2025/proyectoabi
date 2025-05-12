import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Container,
  Grid,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from "@mui/material";
import { db } from "../firebaseConfig";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";
import { useTheme } from "@mui/material/styles"; // Importa el hook para el tema

const Form1 = () => {
  // Estados para el formulario de cada unidad
  const [formData, setFormData] = useState({
    unidad: "",
    objetivos: "",
    situaciones: "",
    estrategias: "",
    recursos: "",
    tiempo: "",
    carrera: "",
    materia: "",
  });

  // Estado para almacenar las unidades agregadas al plan
  const [unidades, setUnidades] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false); // Dialog para confirmar limpiar
  const [openSaveDialog, setOpenSaveDialog] = useState(false); // Dialog para confirmar guardar

  // Estados para la información del usuario y las opciones de selección
  const [usuario, setUsuario] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);
  const theme = useTheme(); // Obtén el objeto del tema

  useEffect(() => {
    // Al montar el componente, verifica la información del usuario en localStorage
    const u = JSON.parse(localStorage.getItem("usuario"));
    if (!u) {
      setErrorMessage("No se encontró información del usuario. Iniciá sesión.");
      return;
    }
    setUsuario(u);
    // Carga las carreras asociadas al docente
    cargarCarreras(u.name);
  }, []);

  const cargarCarreras = async (userName) => {
    try {
      // Obtiene la referencia al documento del docente
      const ref = doc(db, "docentes", userName);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        // Actualiza el estado de carreras con la información obtenida
        setCarreras(data.carreras || []);
      } else {
        setErrorMessage("No se encontraron datos registrados para el docente.");
      }
    } catch (error) {
      console.error("Error al obtener carreras:", error);
      setErrorMessage("Error al cargar datos del docente.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambia la carrera, actualiza las materias disponibles
    if (name === "carrera") {
      const carreraSeleccionada = carreras.find((c) => c.nombre === value);
      const materias =
        carreraSeleccionada?.materias?.map((m) => m.nombre) || [];
      setMateriasDisponibles(materias);
      // Resetea la materia al cambiar la carrera
      setFormData((prev) => ({ ...prev, carrera: value, materia: "" }));
    } else {
      // Actualiza los demás campos del formulario
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Función para validar que todos los campos de la unidad estén llenos
  const validateForm = () => {
    return Object.values(formData).every((val) => val !== "");
  };

  const handleAddUnidad = () => {
    if (!validateForm()) {
      setErrorMessage("Por favor, completá todos los campos de la unidad.");
      return;
    }
    // Agrega la unidad actual a la lista de unidades
    setUnidades((prevUnidades) => [...prevUnidades, formData]);
    // Limpia los campos del formulario para la siguiente unidad, manteniendo la carrera y materia
    setFormData({
      unidad: "",
      objetivos: "",
      situaciones: "",
      estrategias: "",
      recursos: "",
      tiempo: "",
      carrera: formData.carrera,
      materia: formData.materia,
    });
    setSuccessMessage("Unidad agregada correctamente.");
    // Limpia el mensaje de error si existía
    setErrorMessage("");
  };

  const handleDeleteUnidad = (index) => {
    // Filtra la unidad a eliminar de la lista
    setUnidades((prevUnidades) => prevUnidades.filter((_, i) => i !== index));
    setSuccessMessage("Unidad eliminada correctamente.");
  };

  const handleEditUnidad = (index) => {
    // Obtiene la unidad a editar
    const unidadToEdit = unidades[index];
    // Llena el formulario con los datos de la unidad a editar
    setFormData({ ...unidadToEdit });
    // Elimina la unidad de la lista para evitar duplicados al guardar
    setUnidades((prevUnidades) => prevUnidades.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Abre el diálogo de confirmación para guardar
    setOpenSaveDialog(true);
  };

  const handleConfirmSave = async () => {
    setIsLoading(true);

    if (unidades.length === 0) {
      setIsLoading(false);
      setErrorMessage("No se ha agregado ninguna unidad al plan.");
      return;
    }

    try {
      // Agrega un nuevo documento a la colección 'planesEducativos' en Firebase
      await addDoc(collection(db, "planesEducativos"), {
        unidades: unidades,
        timestamp: Timestamp.now(),
        uidDocente: usuario?.name || null,
        carrera: formData.carrera,
        materia: formData.materia,
      });

      setSuccessMessage("Plan registrado correctamente.");
      setErrorMessage("");
      // Limpia la lista de unidades y el formulario después de guardar
      setUnidades([]);
      setFormData({
        unidad: "",
        objetivos: "",
        situaciones: "",
        estrategias: "",
        recursos: "",
        tiempo: "",
        carrera: "",
        materia: "",
      });
    } catch (error) {
      console.error("Error al guardar plan:", error);
      setErrorMessage("Ocurrió un error al guardar. Intentá nuevamente.");
    } finally {
      setIsLoading(false);
      setOpenSaveDialog(false);
    }
  };

  const handleClear = () => {
    // Abre el diálogo de confirmación para limpiar el formulario
    setOpenDialog(true);
  };

  const handleConfirmClear = () => {
    // Limpia el formulario y la lista de unidades
    setFormData({
      unidad: "",
      objetivos: "",
      situaciones: "",
      estrategias: "",
      recursos: "",
      tiempo: "",
      carrera: "",
      materia: "",
    });
    setUnidades([]);
    setErrorMessage("");
    setSuccessMessage("Formulario limpiado exitosamente.");
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom color={theme.palette.primary.main}>
        Registrar Plan Educativo
      </Typography>

      {/* Mensajes de error y éxito */}
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Sección para seleccionar carrera y materia */}
      <Box
        sx={{ mb: 3, p: 3, backgroundColor: "#f9f9f9", borderRadius: "8px" }}
      >
        <Typography
          variant="h6"
          gutterBottom
          color={theme.palette.secondary.main}
        >
          Selección de Carrera y Materia
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Carrera</InputLabel>
              <Select
                name="carrera"
                value={formData.carrera}
                onChange={handleChange}
                label="Carrera"
              >
                {carreras.length > 0 ? (
                  carreras.map((c, i) => (
                    <MenuItem key={i} value={c.nombre}>
                      {c.nombre}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay carreras disponibles</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Materia</InputLabel>
              <Select
                name="materia"
                value={formData.materia}
                onChange={handleChange}
                label="Materia"
                disabled={!materiasDisponibles.length}
              >
                {materiasDisponibles.length > 0 ? (
                  materiasDisponibles.map((m, i) => (
                    <MenuItem key={i} value={m}>
                      {m}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay materias disponibles</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Formulario para los detalles de cada unidad */}
      <Box component="form" onSubmit={handleSubmit}>
        <Typography
          variant="h6"
          gutterBottom
          color={theme.palette.primary.dark}
        >
          Detalles de la Unidad
        </Typography>
        <Grid container spacing={3}>
          {[
            { name: "unidad", label: "Unidad y Contenidos" },
            { name: "objetivos", label: "Objetivos Didácticos" },
            {
              name: "situaciones",
              label: "Situaciones de Enseñanza y Aprendizaje",
            },
            { name: "estrategias", label: "Estrategias Metodológicas" },
            { name: "recursos", label: "Recursos Didácticos" },
            { name: "tiempo", label: "Tiempo de Ejecución" },
          ].map(({ name, label }) => (
            <Grid item xs={12} key={name}>
              <TextField
                fullWidth
                label={label}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                multiline
                required
                variant="outlined"
              />
            </Grid>
          ))}

          {/* Botones para agregar unidad y guardar plan */}
          <Grid item xs={12} sm={6}>
            <Button
              type="button"
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              onClick={handleAddUnidad}
            >
              Agregar Unidad
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Plan"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Sección para mostrar las unidades agregadas */}
      <Box sx={{ mt: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          color={theme.palette.primary.dark}
        >
          Unidades Agregadas
        </Typography>
        <Grid container spacing={2}>
          {unidades.map((unidad, index) => (
            <Grid item xs={12} key={index}>
              <Box
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: "8px",
                  mb: 1,
                  backgroundColor: "#f9f9f9",
                }}
              >
                <Typography variant="body1">
                  <strong>Unidad:</strong> {unidad.unidad}
                </Typography>
                <Typography variant="body2">
                  <strong>Objetivos:</strong> {unidad.objetivos}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleEditUnidad(index)}
                    sx={{ mr: 1 }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteUnidad(index)}
                  >
                    Eliminar
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Diálogos de confirmación */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirmar Limpieza</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas limpiar el formulario?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleConfirmClear} color="primary">
            Limpiar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
        <DialogTitle>Confirmar Guardado</DialogTitle>
        <DialogContent>
          <Typography>¿Deseás guardar este plan educativo?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmSave}
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Form1;

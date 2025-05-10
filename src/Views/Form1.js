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

const Form1 = () => {
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

  const [unidades, setUnidades] = useState([]); // Aquí se almacenarán las unidades agregadas
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);

  const [usuario, setUsuario] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState([]);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuario"));
    if (!u) {
      setErrorMessage("No se encontró información del usuario. Iniciá sesión.");
      return;
    }
    setUsuario(u);
    cargarCarreras(u.name);
  }, []);

  const cargarCarreras = async (userName) => {
    try {
      const ref = doc(db, "docentes", userName);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
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

    if (name === "carrera") {
      const carreraSeleccionada = carreras.find((c) => c.nombre === value);
      const materias =
        carreraSeleccionada?.materias?.map((m) => m.nombre) || [];
      setMateriasDisponibles(materias);
      setFormData((prev) => ({
        ...prev,
        carrera: value,
        materia: "", // Resetear materia al cambiar carrera
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const validateForm = () => {
    return Object.values(formData).every((val) => val !== "");
  };

  const handleAddUnidad = () => {
    if (!validateForm()) {
      setErrorMessage("Por favor, completá todos los campos.");
      return;
    }
    setUnidades((prevUnidades) => [...prevUnidades, formData]);
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
  };

  const handleDeleteUnidad = (index) => {
    setUnidades((prevUnidades) => prevUnidades.filter((_, i) => i !== index));
    setSuccessMessage("Unidad eliminada correctamente.");
  };

  const handleEditUnidad = (index) => {
    const unidadToEdit = unidades[index];
    setFormData({ ...unidadToEdit });
    setUnidades((prevUnidades) => prevUnidades.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenSaveDialog(true);
  };

  const handleConfirmSave = async () => {
    setIsLoading(true);

    if (unidades.length === 0) {
      setIsLoading(false);
      setErrorMessage("No se ha agregado ninguna unidad.");
      return;
    }

    try {
      await addDoc(collection(db, "planesEducativos"), {
        unidades,
        timestamp: Timestamp.now(),
        uidDocente: usuario?.name || null,
        carrera: formData.carrera,
        materia: formData.materia,
      });

      setSuccessMessage("Plan registrado correctamente.");
      setErrorMessage("");
      setUnidades([]); // Limpiar unidades después de guardar
    } catch (error) {
      console.error("Error al guardar plan:", error);
      setErrorMessage("Ocurrió un error al guardar. Intentá nuevamente.");
    } finally {
      setIsLoading(false);
      setOpenSaveDialog(false);
    }
  };

  const handleClear = () => {
    setOpenDialog(true);
  };

  const handleConfirmClear = () => {
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
    setUnidades([]); // Limpiar unidades
    setErrorMessage("");
    setSuccessMessage("Formulario limpiado exitosamente.");
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Typography variant="h6" gutterBottom>
        Registrar Plan Educativo
      </Typography>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Box
        sx={{ mb: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: "8px" }}
      >
        <Typography variant="h6" gutterBottom>
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

      {/* Detalles del plan */}
      <Box component="form" onSubmit={handleSubmit}>
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

          <Grid item xs={12} sm={6}>
            <Button
              type="button"
              variant="contained"
              color="warning"
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
              color="warning"
              fullWidth
              size="large"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Guardar Plan"}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Tabla de unidades */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Unidades Agregadas
        </Typography>
        <Grid container spacing={2}>
          {unidades.map((unidad, index) => (
            <Grid item xs={12} key={index}>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  mb: 1,
                }}
              >
                <Typography variant="body1">
                  <strong>Unidad:</strong> {unidad.unidad}
                </Typography>
                <Typography variant="body2">
                  <strong>Objetivos:</strong> {unidad.objetivos}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleEditUnidad(index)}
                >
                  Editar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleDeleteUnidad(index)}
                >
                  Eliminar
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Diálogos */}
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
          <Button onClick={handleConfirmSave} color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Form1;

import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Container,
  Divider,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { db } from "../firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "@mui/material/styles"; // Importa el hook para el tema

const Form2 = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtiene el ID del plan de la URL
  const theme = useTheme(); // Obtén el objeto del tema

  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    unidad: "",
    objetivos: "",
    situaciones: "",
    estrategias: "",
    recursos: "",
    tiempo: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false); // Diálogo de confirmación para actualizar

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        // Crea una referencia al documento del plan educativo por su ID
        const docRef = doc(db, "planesEducativos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const planData = docSnap.data();
          // Actualiza el estado del formulario con los datos del plan
          setFormData({
            unidad: planData.unidad || "",
            objetivos: planData.objetivos || "",
            situaciones: planData.situaciones || "",
            estrategias: planData.estrategias || "",
            recursos: planData.recursos || "",
            tiempo: planData.tiempo || "",
          });
        } else {
          setErrorMessage("El plan educativo no existe.");
        }
      } catch (error) {
        console.error("Error al cargar el plan:", error);
        setErrorMessage("Error al cargar los datos del plan educativo.");
      }
    };

    // Llama a la función para obtener los datos del plan al montar el componente
    fetchPlan();
  }, [id]); // El efecto se ejecuta si el ID del plan cambia

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Actualiza el estado del formulario cuando cambia un campo
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Función para validar que todos los campos del formulario estén llenos
  const validateForm = () => {
    return Object.values(formData).every((field) => field.trim() !== "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Abre el diálogo de confirmación antes de actualizar
    setOpenDialog(true);
  };

  const handleConfirmUpdate = async () => {
    if (!validateForm()) {
      setErrorMessage("Por favor, completa todos los campos.");
      setOpenDialog(false);
      return;
    }

    setIsLoading(true);
    try {
      // Crea una referencia al documento del plan educativo
      const planRef = doc(db, "planesEducativos", id);
      // Actualiza el documento con los nuevos datos del formulario
      await updateDoc(planRef, formData);
      setSuccessMessage("Plan educativo actualizado correctamente.");
      setErrorMessage("");
      // Redirige al usuario a la página de visualización de datos después de un breve tiempo
      setTimeout(() => navigate("/datos"), 1500);
    } catch (error) {
      console.error("Error al actualizar el plan:", error);
      setErrorMessage("Hubo un error al actualizar el plan educativo.");
    } finally {
      setIsLoading(false);
      setOpenDialog(false);
    }
  };

  const handleCancelUpdate = () => {
    // Cierra el diálogo de confirmación sin realizar la actualización
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, p: 3, borderRadius: 2 }}>
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        color={theme.palette.primary.main}
      >
        Editar Plan Educativo
      </Typography>

      <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

      {/* Muestra mensajes de error o éxito */}
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

      {/* Formulario para editar los detalles del plan */}
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {[
            {
              name: "unidad",
              label: "Unidad y Contenidos",
              helper: "Ingrese la unidad y los contenidos a enseñar",
            },
            {
              name: "objetivos",
              label: "Objetivos Didácticos",
              helper: "Escriba los objetivos didácticos de la unidad",
            },
            {
              name: "situaciones",
              label: "Situaciones de Enseñanza y Aprendizaje",
              helper: "Describa las situaciones de enseñanza y aprendizaje",
            },
            {
              name: "estrategias",
              label: "Estrategias Metodológicas",
              helper: "Indique las estrategias metodológicas",
            },
            {
              name: "recursos",
              label: "Recursos Didácticos",
              helper: "Especifique los recursos didácticos necesarios",
            },
            {
              name: "tiempo",
              label: "Tiempo de Ejecución",
              helper: "Indique el tiempo estimado para ejecutar el plan",
            },
          ].map(({ name, label, helper }) => (
            <Grid item xs={12} sm={6} key={name}>
              <TextField
                label={label}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                fullWidth
                multiline={name !== "tiempo"}
                required
                variant="outlined"
                helperText={helper}
              />
            </Grid>
          ))}

          {/* Botones para actualizar y cancelar */}
          <Grid item xs={12} sm={6}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={isLoading}
            >
              {isLoading ? "Guardando..." : "Actualizar Plan"}
            </Button>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Button
              type="button"
              variant="outlined"
              color="secondary"
              fullWidth
              size="large"
              onClick={() => navigate("/datos")}
            >
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Diálogo de confirmación para la actualización */}
      <Dialog open={openDialog} onClose={handleCancelUpdate}>
        <DialogTitle>Confirmar Actualización</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Está seguro de que desea actualizar este plan educativo?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUpdate} color="secondary">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmUpdate}
            color="primary"
            disabled={isLoading}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Form2;

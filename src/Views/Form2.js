import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { db } from "../firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const Form2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

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
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const docRef = doc(db, "planesEducativos", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const planData = docSnap.data();
          setFormData({
            unidad: planData.unidad || "",
            objetivos: planData.objetivos || "",
            situaciones: planData.situaciones || "",
            estrategias: planData.estrategias || "",
            recursos: planData.recursos || "",
            tiempo: planData.tiempo || "",
          });
        } else {
          setErrorMessage("El plan no existe.");
        }
      } catch (error) {
        console.error("Error al cargar el plan:", error);
        setErrorMessage("Error al cargar los datos del plan.");
      }
    };

    fetchPlan();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    return Object.values(formData).every((field) => field.trim() !== "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
      const planRef = doc(db, "planesEducativos", id);
      await updateDoc(planRef, formData);
      setSuccessMessage("Plan actualizado correctamente.");
      setErrorMessage("");
      setTimeout(() => navigate("/datos"), 1500);
    } catch (error) {
      console.error("Error al actualizar:", error);
      setErrorMessage("Hubo un error al actualizar el plan.");
    } finally {
      setIsLoading(false);
      setOpenDialog(false);
    }
  };

  const handleCancelUpdate = () => {
    setOpenDialog(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 10 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: "bold", color: "#FF7043" }}
      >
        Editar Plan Educativo
      </Typography>

      <Divider sx={{ my: 3, borderColor: "#FF7043" }} />

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ backgroundColor: "#FFCCBC", color: "#D32F2F" }}
        >
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert
          severity="success"
          sx={{ backgroundColor: "#C8E6C9", color: "#388E3C" }}
        >
          {successMessage}
        </Alert>
      )}

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
                helperText={helper}
                sx={{
                  "& .MuiInputLabel-root": { color: "#FF7043" },
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#FF7043" },
                    "&:hover fieldset": { borderColor: "#FF5722" },
                  },
                  "& .MuiInputBase-root": { color: "#333" },
                }}
              />
            </Grid>
          ))}

          <Grid item xs={12} sm={6}>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1rem",
                backgroundColor: "#FF7043",
              }}
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
              sx={{
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1rem",
                borderColor: "#FF7043",
                color: "#FF7043",
              }}
              onClick={() => navigate("/datos")}
            >
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </Box>

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
          <Button onClick={handleConfirmUpdate} color="primary">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Form2;

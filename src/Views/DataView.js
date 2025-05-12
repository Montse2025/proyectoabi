//DataView.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const DataView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [docenteData, setDocenteData] = useState({});
  const navigate = useNavigate();
  const theme = useTheme();

  const fetchData = async () => {
    setLoading(true);
    try {
      const storedUsuario = localStorage.getItem("usuario");
      if (!storedUsuario) {
        setErrorMessage(
          "No se encontró información del usuario. Por favor inicia sesión."
        );
        setLoading(false);
        return;
      }

      const usuario = JSON.parse(storedUsuario);
      const userName = usuario.name?.trim();
      if (!userName) {
        setErrorMessage("Nombre de usuario inválido.");
        setLoading(false);
        return;
      }

      // Obtener los datos de los planes educativos
      const querySnapshot = await getDocs(collection(db, "planesEducativos"));
      const dataList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const filteredData = dataList.filter(
        (plan) => plan.uidDocente?.trim() === userName
      );
      setData(filteredData);

      // Obtener los datos del docente
      const userDocRef = doc(db, "docentes", userName);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setDocenteData(docSnap.data());
      } else {
        console.warn(`No se encontró documento del docente ${userName}.`);
      }
      setErrorMessage("");
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      setErrorMessage(
        "Hubo un error al obtener los datos. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (recordToDelete) {
      try {
        await deleteDoc(doc(db, "planesEducativos", recordToDelete));
        setData(data.filter((item) => item.id !== recordToDelete));
        setOpenDialog(false);
      } catch (error) {
        setErrorMessage("Error al eliminar el registro.");
      }
    }
  };

  const openDeleteDialog = (id) => {
    setRecordToDelete(id);
    setOpenDialog(true);
  };

  const handleEdit = (plan) => {
    navigate(`/form2/${plan.id}`);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper
        elevation={5}
        sx={{ p: 4, borderRadius: 3, backgroundColor: "#FFF3E0" }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: theme.palette.secondary.main }}
        >
          Datos del Docente y Planes Educativos
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {loading ? (
          <CircularProgress
            color="secondary"
            sx={{ margin: "auto", display: "block" }}
          />
        ) : (
          <div>
            {/* Mostrar los datos del docente */}
            <Paper
              elevation={3}
              sx={{ mb: 4, p: 3, backgroundColor: "#F5F5F5" }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
              >
                Datos del Docente
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Nombre:</strong> {docenteData.nombre}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography>
                    <strong>Cédula:</strong> {docenteData.cedula}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    <strong>Facultad:</strong> {docenteData.facultad}
                  </Typography>
                </Grid>
              </Grid>

              {/* Mostrar las carreras y materias */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  mt: 2,
                  color: theme.palette.primary.main,
                }}
              >
                Carreras
              </Typography>
              {docenteData.carreras && docenteData.carreras.length > 0 ? (
                <List dense>
                  {docenteData.carreras.map((carrera, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemText
                        primaryTypographyProps={{ fontWeight: "bold" }}
                        primary={carrera.nombre}
                        secondary={
                          carrera.materias && carrera.materias.length > 0
                            ? `Materias: ${carrera.materias
                                .map((m) => m.nombre)
                                .join(", ")}`
                            : "No hay materias asignadas"
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography>No hay carreras asignadas.</Typography>
              )}
            </Paper>

            {/* Mostrar los planes educativos */}
            <TableContainer component={Paper} elevation={3}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead
                  sx={{ backgroundColor: theme.palette.secondary.main }}
                >
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "#FFF" }}
                    >
                      Carrera
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "#FFF" }}
                    >
                      Materia
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "#FFF" }}
                    >
                      Objetivos
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "#FFF" }}
                    >
                      Situaciones
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "#FFF" }}
                    >
                      Estrategias
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "#FFF" }}
                    >
                      Recursos
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "#FFF" }}
                    >
                      Tiempo
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ fontWeight: "bold", color: "#FFF" }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.length > 0 ? (
                    data.map((plan) =>
                      plan.unidades.map((unidad, index) => (
                        <TableRow
                          key={plan.id + "-" + index}
                          sx={{
                            "&:last-child td, &:last-child th": { border: 0 },
                            backgroundColor:
                              index % 2 === 0 ? "#F9F9F9" : "#FFF",
                          }}
                        >
                          <TableCell align="center" component="th" scope="row">
                            {unidad.carrera}
                          </TableCell>
                          <TableCell align="center">{unidad.materia}</TableCell>
                          <TableCell align="center">
                            {unidad.objetivos}
                          </TableCell>
                          <TableCell align="center">
                            {unidad.situaciones}
                          </TableCell>
                          <TableCell align="center">
                            {unidad.estrategias}
                          </TableCell>
                          <TableCell align="center">
                            {unidad.recursos}
                          </TableCell>
                          <TableCell align="center">{unidad.tiempo}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              color="warning"
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={() => handleEdit(plan)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => openDeleteDialog(plan.id)}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No hay planes educativos disponibles.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Dialog de confirmación para eliminar */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
              <DialogTitle>Confirmar Eliminación</DialogTitle>
              <DialogContent>
                ¿Estás seguro de que deseas eliminar este registro?
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenDialog(false)} color="primary">
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  color="error"
                  variant="contained"
                >
                  Eliminar
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )}
      </Paper>
    </Container>
  );
};

export default DataView;

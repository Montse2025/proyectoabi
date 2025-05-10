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

const DataView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [docenteData, setDocenteData] = useState({});
  const navigate = useNavigate();

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
        sx={{ p: 8, borderRadius: 3, backgroundColor: "#FFF3E0" }}
      >
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: "#FF7043" }}
        >
          Datos del Docente y Planes Educativos
        </Typography>

        {errorMessage && (
          <Alert
            severity="error"
            sx={{ backgroundColor: "#FF7043", color: "#FFF" }}
          >
            {errorMessage}
          </Alert>
        )}

        {loading ? (
          <CircularProgress
            sx={{ color: "#FF7043", margin: "auto", display: "block" }}
          />
        ) : (
          <div>
            {/* Mostrar los datos del docente */}
            <Paper sx={{ mb: 4, p: 3, backgroundColor: "#FFEBEE" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Datos del Docente
              </Typography>
              <Typography>
                <strong>Nombre:</strong> {docenteData.nombre}
              </Typography>
              <Typography>
                <strong>Cédula:</strong> {docenteData.cedula}
              </Typography>
              <Typography>
                <strong>Facultad:</strong> {docenteData.facultad}
              </Typography>

              {/* Mostrar las carreras y materias */}
              <Typography variant="h6" sx={{ fontWeight: "bold", mt: 2 }}>
                Carreras
              </Typography>
              {docenteData.carreras && docenteData.carreras.length > 0 ? (
                docenteData.carreras.map((carrera, index) => (
                  <div key={index}>
                    <Typography>
                      <strong>{carrera.nombre}</strong>
                    </Typography>
                    <ul>
                      {carrera.materias?.map((materia, idx) => (
                        <li key={idx}>{materia.nombre}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <Typography>No hay carreras asignadas.</Typography>
              )}
            </Paper>

            {/* Mostrar los planes educativos */}
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: "#FF7043" }}>
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
                        <TableRow key={plan.id + "-" + index}>
                          <TableCell align="center">{unidad.carrera}</TableCell>
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
                              sx={{ mr: 2 }}
                              onClick={() => handleEdit(plan)}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
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
          </div>
        )}

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
            <Button onClick={handleDelete} color="error">
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default DataView;

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Asegúrate de tener correctamente configurado esto

export const fakeAuth = {
  isAuthenticated: JSON.parse(localStorage.getItem("isAuthenticated")) || false,
  userRole: localStorage.getItem("userRole") || null,
  userName: localStorage.getItem("userName") || null,

  async login(username, pin, navigate, setUpdate) {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const users = querySnapshot.docs.map((doc) => doc.data());

      const user = users.find(
        (u) =>
          u.name.toLowerCase() === username.toLowerCase() &&
          u.pin === Number(pin)
      );

      if (user) {
        this.isAuthenticated = true;
        this.userRole = user.role;
        this.userName = user.name;

        // Guardar el objeto completo del usuario en localStorage
        localStorage.setItem(
          "usuario",
          JSON.stringify({
            name: user.name,
            role: user.role,
            pin: user.pin,
            // Agregar más datos si es necesario, como el ID, facultad, etc.
          })
        );

        localStorage.setItem("isAuthenticated", true);

        setUpdate((prev) => !prev); // Para refrescar el estado global
        navigate("/principal"); // Redirigir a la página principal después del login
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error al autenticar usuario:", error.message);
      throw new Error("Error de autenticación");
    }
  },

  // LOGOUT
  logout(navigate, setUpdate) {
    this.isAuthenticated = false;
    this.userRole = null;
    this.userName = null;

    // Eliminar los datos del usuario de localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("usuario"); // Eliminar el objeto completo del usuario

    setUpdate((prev) => !prev);
    navigate("/login");
  },

  // Verificación para proteger rutas
  checkAuth(navigate) {
    const isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated"));
    if (!isAuthenticated) {
      navigate("/login");
    }
  },
};

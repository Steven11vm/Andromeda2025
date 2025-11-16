import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Asegúrate de usar la importación correcta

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        return <Navigate to="/login" />;
    }

    // Decodifica el token y verifica si ha expirado
    const decodedToken = jwtDecode(token);  // Uso correcto de jwtDecode
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
        // Si el token ha expirado, redirige al login
        localStorage.removeItem('jwtToken');  // Limpia el token
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;

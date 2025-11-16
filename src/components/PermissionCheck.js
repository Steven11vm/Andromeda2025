import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/images/logo.png';

const PermissionContext = createContext([]);

export const usePermissions = () => useContext(PermissionContext);

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchPermissions = async () => {
      const roleId = localStorage.getItem('roleId');
      console.log('roleId from localStorage:', roleId);

      const publicRoutes = [
        '/login', '/register', '/forgotPassword', '/resetPassword', '/index', 
        '/shop', '/registerview', '/appointmentView', '/ordermy', '/profileview', '/404'
      ];

      // Si no hay roleId y no es una ruta pública, redirigir a login
      if (!roleId && !publicRoutes.includes(location.pathname)) {
        setLoading(false);
        setPermissions([]);
        return;
      }

      if (publicRoutes.includes(location.pathname)) {
        setLoading(false);
        setPermissions(['public']);
        return;
      }

      try {
        const permissionsRoleResponse = await axios.get('https://andromeda-api.onrender.com/api/permissionsRole');
        const permissionsResponse = await axios.get('https://andromeda-api.onrender.com/api/permissions');

        const rolePermissions = permissionsRoleResponse.data.filter(pr => pr.roleId === parseInt(roleId));
        const permissionNames = permissionsResponse.data.filter(p =>
          rolePermissions.some(rp => rp.permissionId === p.id)
        ).map(p => p.name);

        console.log('User permissions:', permissionNames);
        setPermissions([...permissionNames, `role_${roleId}`]); // Agregamos el rol como un permiso
      } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [location]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <img src={logo} alt="Logo" style={styles.logo} />
        <div style={styles.textContainer}>
          <span style={styles.loadingText}>CARGANDO...</span>
          <span style={styles.slogan}>Estilo y calidad en cada corte</span>
        </div>
      </div>
    );
  }

  return (
    <PermissionContext.Provider value={permissions}>
      {children}
    </PermissionContext.Provider>
  );
};

export const PermissionCheck = ({ requiredPermission, children }) => {
  const permissions = usePermissions();
  const location = useLocation();
  console.log(`PermissionCheck - Required: ${requiredPermission} Available:`, permissions);

  // Ignorar automáticamente las rutas de índice
  if (location.pathname.endsWith('/index')) {
    return <>{children}</>;
  }

  // Si es una ruta no válida y el usuario está autenticado, redirigir a Error404
  if (!permissions.includes(requiredPermission) && !permissions.includes('public')) {
    // Si el usuario está autenticado (tiene permisos pero no el requerido)
    if (permissions.length > 0) {
      return <Navigate to="/404" replace />;
    }
    // Si el usuario no está autenticado
    return <Navigate to="/login" replace />;
  }

  // Verificar acceso al dashboard para rol 3
  if (requiredPermission === 'Dashboard' && permissions.includes('role_3')) {
    return <Navigate to="/404" replace />;
  }

  return <>{children}</>;
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f3f0ec',
  },
  logo: {
    width: '120px',
    height: '120px',
    margin: '20px 0',
    animation: 'spin 2s linear infinite',
  },
  textContainer: {
    textAlign: 'center',
    marginTop: '10px',
  },
  loadingText: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#6b3a1e',
    fontFamily: '"Courier New", Courier, monospace',
  },
  slogan: {
    fontSize: '16px',
    color: '#3e3e3e',
    fontStyle: 'italic',
    fontFamily: 'serif',
  },
};
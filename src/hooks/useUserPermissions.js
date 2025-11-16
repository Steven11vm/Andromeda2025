import { useState, useEffect } from 'react';
import axios from 'axios';

function checkLoginStatus(setIsLoggedIn, setUserRole) {
  const token = localStorage.getItem('jwtToken');
  const roleId = localStorage.getItem('roleId');

  if (token && roleId) {
    setIsLoggedIn(true);
    setUserRole(roleId);
  } else {
    setIsLoggedIn(false);
    setUserRole('');
  }
}

export function useUserPermissions() {
  const [userPrivileges, setUserPrivileges] = useState([]);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    // Verifica si el usuario está autenticado al montar el hook
    checkLoginStatus(setIsLoggedIn, setUserRole);

    if (!isLoggedIn) {
      console.warn('Usuario no autenticado. No se cargarán privilegios.');
      return;
    }

    const fetchUserPrivileges = async () => {
      try {
        const response = await axios.get('https://andromeda-api.onrender.com/api/privilege-permission-roles', {
          params: { roleId: userRole }, // Utiliza el roleId del estado
        });

        const privileges = response.data.reduce((acc, item) => {
          if (item.Privilege && item.Privilege.name) {
            acc.push(item.Privilege.name);
          }
          return acc;
        }, []);

        setUserPrivileges(privileges);
        localStorage.setItem('userPrivileges', JSON.stringify(privileges));
      } catch (err) {
        console.error('Error al cargar privilegios:', err);
        setError(err);
      }
    };

    fetchUserPrivileges();
  }, [isLoggedIn, userRole]); // Se vuelve a ejecutar si cambia el estado de autenticación o el rol del usuario

  const hasPrivilege = (privilegeName) => {
    return userPrivileges.includes(privilegeName);
  };

  return { 
    hasPrivilege, 
    userPrivileges, 
    error 
  };
}

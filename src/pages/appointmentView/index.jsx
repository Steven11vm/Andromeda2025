'use client'

import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../App.js';
import { Calendar, Clock, Users, CheckCircle2, DollarSign, XCircle, AlertCircle } from 'lucide-react';
import logo from '../../assets/images/logo-light.png';
import MenuIcon from '@mui/icons-material/Menu';
import { toast } from 'react-toastify';
import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";
import { Avatar, Menu, MenuItem, Button, IconButton } from '@mui/material';
import Swal from 'sweetalert2';
import { GrUser } from 'react-icons/gr';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Form, Table } from 'react-bootstrap';
import { FaEye } from "react-icons/fa";

export default function CalendarioBarberia({ info }) {
  const context = useContext(MyContext);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [appointmentId, setAppointmentId] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [error, setError] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 768);

  const { isToggleSidebar } = useContext(MyContext);
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsWithDetails, setAppointmentsWithDetails] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [filterDay, setFilterDay] = useState('all');
  const [filterWeek, setFilterWeek] = useState('current'); // 'current', 'all', o una fecha específica
  const [services, setServices] = useState([]);
  const urlSales = 'https://andromeda-api.onrender.com/api/sales';
  const urlUsers = 'https://andromeda-api.onrender.com/api/users';
  const urlAppointment = 'https://andromeda-api.onrender.com/api/appointment';
  const urlServices = 'https://andromeda-api.onrender.com/api/services';
  const [detailData, setDetailData] = useState({});
  const [saleDetails, setSaleDetails] = useState({ success: true, data: [], saleInfo: {} });
  const [hasFetchedData, setHasFetchedData] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleResize = () => {
      setIsDesktop(window.innerWidth > 768);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    context.setIsHideSidebarAndHeader(true);
    context.setThemeMode(false)
    checkLoginStatus();
    fetchData();
  }, [context]);

  const getSaleDetailsByAppointmentId = async (id) => {
    try {
      const response = await axios.get(`${urlAppointment}/sale-details/${id}`);
      
      // Formatear los datos para que coincidan con lo que espera el modal
      const formattedData = response.data.data?.map((detail) => ({
        name: detail.name || detail.Product_Name || detail.serviceName || 'Sin nombre',
        quantity: detail.quantity || 0,
        price: detail.price || detail.unitPrice || 0,
        employeeName: detail.employeeName || detail.empleadoName || (detail.empleadoId ? `Empleado #${detail.empleadoId}` : 'N/A'),
        type: detail.type || (detail.serviceId ? "Servicio" : "Producto")
      })) || [];
      
      setSaleDetails({
        success: response.data.success,
        data: formattedData,
        saleInfo: response.data.data[0]?.saleInfo || {}
      });
    } catch (error) {
      console.error('Error fetching sale details:', error);
      setSaleDetails({ success: false, data: [], saleInfo: {} });
    }
  };

  const fetchData = async () => {
    try {
      const [userResponse, programmingResponse, servicesResponse] = await Promise.all([
        axios.get(urlUsers),
        axios.get(urlAppointment),
        axios.get(urlServices),
      ]);

      const usersData = userResponse.data;
      const servicesData = servicesResponse.data;
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        console.error('No userId found in localStorage');
        setHasFetchedData(true);
        return;
      }

      // Filtrar citas del cliente logueado
      const programmingData = programmingResponse.data.filter(event => 
        event.clienteId && event.clienteId.toString() === userId.toString()
      );

      // Obtener detalles de cada cita para mostrar nombres de servicios
      const appointmentsWithNames = await Promise.all(
        programmingData.map(async (appointment) => {
          try {
            const detailsResponse = await axios.get(`${urlAppointment}/sale-details/${appointment.id}`);
            const details = detailsResponse.data.data || [];
            const serviceNames = details
              .filter(d => d.serviceId)
              .map(d => {
                const service = servicesData.find(s => s.id === parseInt(d.serviceId));
                return service ? service.name : 'Servicio';
              });
            const productNames = details
              .filter(d => d.id_producto)
              .map(d => d.Product_Name || d.name || 'Producto');
            
            return {
              ...appointment,
              serviceNames: serviceNames.length > 0 ? serviceNames : ['Sin servicios'],
              productNames: productNames.length > 0 ? productNames : [],
              allNames: [...serviceNames, ...productNames].join(', ') || 'Sin detalles'
            };
          } catch (error) {
            return {
              ...appointment,
              serviceNames: [],
              productNames: [],
              allNames: 'Sin detalles'
            };
          }
        })
      );

      // Ordenar por fecha más reciente primero (usando parseDateSafe para evitar problemas de zona horaria)
      appointmentsWithNames.sort((a, b) => {
        const dateA = parseDateSafe(a.Date);
        const dateB = parseDateSafe(b.Date);
        
        if (!dateA || !dateB) return 0;
        
        // Comparar fechas primero
        const dateCompare = dateB.getTime() - dateA.getTime();
        if (dateCompare !== 0) return dateCompare;
        
        // Si las fechas son iguales, comparar horas
        const timeA = formatTime(a.Init_Time);
        const timeB = formatTime(b.Init_Time);
        
        if (timeA && timeB) {
          const [hoursA, minutesA] = timeA.split(':').map(Number);
          const [hoursB, minutesB] = timeB.split(':').map(Number);
          const timeCompare = (hoursB * 60 + minutesB) - (hoursA * 60 + minutesA);
          return timeCompare;
        }
        
        return 0;
      });

      setUsers(usersData);
      setServices(servicesData);
      setAppointments(programmingData);
      setAppointmentsWithDetails(appointmentsWithNames);
      setHasFetchedData(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setHasFetchedData(true);
    }
  };

  useEffect(() => {
    if (!hasFetchedData) {
      fetchData();
    }
    // Este cleanup es para asegurar que el estado se resetee si la ruta cambia
    return () => {
      setHasFetchedData(false);
    };
  }, [hasFetchedData]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('jwtToken');
    const storedEmail = localStorage.getItem('userName');
    const idRole = localStorage.getItem('roleId');
    const userId = localStorage.getItem('userId');
    if (token && storedEmail && idRole && userId) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      setUserRole(idRole);
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
      setUserRole('');
    }
  };


  const handleViewAppointmentDetails = async (appointment) => {
    setAppointmentId(appointment.id);
    const userName = await getUserName(users, appointment.clienteId);
    setDetailData({
      title: userName || 'Cliente Desconocido',
      Date: appointment.Date,
      status: appointment.status,
      Init_Time: appointment.Init_Time,
      Finish_Time: appointment.Finish_Time,
      time_appointment: appointment.time_appointment,
      Total: appointment.Total
    });
    await getSaleDetailsByAppointmentId(appointment.id);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completada':
        return { bg: '#d4edda', text: '#155724', icon: CheckCircle2, border: '#27ae60' };
      case 'cancelada':
        return { bg: '#f8d7da', text: '#721c24', icon: XCircle, border: '#e74c3c' };
      case 'pendiente':
        return { bg: '#fff3cd', text: '#856404', icon: AlertCircle, border: '#f39c12' };
      default:
        return { bg: '#e2e3e5', text: '#383d41', icon: AlertCircle, border: '#95a5a6' };
    }
  };

  const getAvailableMonths = () => {
    const months = new Set();
    appointmentsWithDetails.forEach(apt => {
      if (apt.Date) {
        const date = parseDateSafe(apt.Date);
        if (date && !isNaN(date.getTime())) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          months.add(monthKey);
        }
      }
    });
    return Array.from(months).sort().reverse();
  };

  const getAvailableDays = () => {
    const days = new Set();
    appointmentsWithDetails.forEach(apt => {
      if (apt.Date) {
        // Extraer fecha en formato YYYY-MM-DD sin problemas de zona horaria
        let dateOnly = apt.Date;
        if (dateOnly.includes('T')) {
          dateOnly = dateOnly.split('T')[0];
        }
        // Asegurar formato correcto usando parseDateSafe
        const date = parseDateSafe(dateOnly);
        if (date && !isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          days.add(`${year}-${month}-${day}`);
        } else {
          days.add(dateOnly);
        }
      }
    });
    return Array.from(days).sort().reverse();
  };

  // Función para obtener el inicio de la semana (lunes)
  const getWeekStart = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para que lunes sea el primer día
    return new Date(d.setDate(diff));
  };

  // Función para obtener el fin de la semana (domingo)
  const getWeekEnd = (date) => {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
  };

  // Función para verificar si una fecha está en la misma semana que otra
  const isSameWeek = (date1, date2) => {
    const weekStart1 = getWeekStart(date1);
    const weekEnd1 = getWeekEnd(date1);
    return date2 >= weekStart1 && date2 <= weekEnd1;
  };

  // Función para parsear fecha sin problemas de zona horaria
  const parseDateSafe = (dateString) => {
    if (!dateString) return null;
    
    // Si viene con hora (formato ISO), tomar solo la parte de fecha
    let dateOnly = dateString;
    if (dateString.includes('T')) {
      dateOnly = dateString.split('T')[0];
    }
    
    // Parsear manualmente YYYY-MM-DD para evitar problemas de zona horaria
    const parts = dateOnly.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Mes es 0-indexed
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    
    // Fallback a Date normal si no es formato esperado
    return new Date(dateString);
  };

  // Función mejorada para formatear hora desde BD
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Si es un timestamp completo (ISO), extraer solo la hora
    if (timeString.includes('T') || timeString.includes('Z')) {
      try {
        // Intentar extraer hora directamente del string antes de parsear
        const timeMatch = timeString.match(/(\d{2}):(\d{2})/);
        if (timeMatch) {
          return `${timeMatch[1]}:${timeMatch[2]}`;
        }
        
        // Fallback: parsear como Date pero usar UTC para evitar problemas de zona
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          // Usar UTC para evitar problemas de zona horaria
          const hours = date.getUTCHours().toString().padStart(2, '0');
          const minutes = date.getUTCMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        }
      } catch (e) {
        console.error('Error parsing time:', e);
      }
    }
    
    // Si es un string de hora (HH:MM:SS o HH:MM)
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
    
    return '';
  };

  const convertTo12HourFormat = (time) => {
    if (!time) return 'Hora no disponible';
    
    // Primero normalizar la hora usando formatTime
    const normalizedTime = formatTime(time);
    if (!normalizedTime) return 'Hora no disponible';
    
    // Ahora convertir a formato 12 horas
    const [hours, minutes] = normalizedTime.split(':').map(Number);
    
    // Validar que sean números válidos
    if (isNaN(hours) || isNaN(minutes)) {
      return 'Hora no disponible';
    }
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const standardHours = hours % 12 || 12;
    return `${standardHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const filteredAppointments = appointmentsWithDetails.filter(apt => {
    // Filtro por estado
    if (filterStatus !== 'all' && apt.status?.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }

    // Filtro por semana
    if (filterWeek !== 'all' && apt.Date) {
      const aptDate = parseDateSafe(apt.Date);
      if (!aptDate || isNaN(aptDate.getTime())) {
        return false;
      }

      if (filterWeek === 'current') {
        // Mostrar solo la semana actual
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!isSameWeek(today, aptDate)) {
          return false;
        }
      } else {
        // filterWeek es una fecha específica (YYYY-MM-DD)
        const selectedDate = parseDateSafe(filterWeek);
        if (!selectedDate || isNaN(selectedDate.getTime())) {
          return false;
        }
        if (!isSameWeek(selectedDate, aptDate)) {
          return false;
        }
      }
    }

    // Filtro por mes (solo si no hay filtro de semana)
    if (filterWeek === 'all' && filterMonth !== 'all' && apt.Date) {
      const date = parseDateSafe(apt.Date);
      if (date && !isNaN(date.getTime())) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (monthKey !== filterMonth) {
          return false;
        }
      } else {
        return false;
      }
    }

    // Filtro por día (solo si no hay filtro de semana)
    if (filterWeek === 'all' && filterDay !== 'all' && apt.Date) {
      let dayKey = apt.Date;
      if (dayKey.includes('T')) {
        dayKey = dayKey.split('T')[0];
      }
      // Normalizar usando parseDateSafe para comparación correcta
      const date = parseDateSafe(dayKey);
      if (date && !isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const normalizedDayKey = `${year}-${month}-${day}`;
        if (normalizedDayKey !== filterDay) {
          return false;
        }
      } else {
        if (dayKey !== filterDay) {
          return false;
        }
      }
    }

    return true;
  });

  const handleClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
  };


  const handleLogin = () => {
    navigate('/login');
  };

  const handledashboard = () => {
    context.setIsHideSidebarAndHeader(false);
    navigate('/services');
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };



  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('roleId');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserEmail('');
    handleMenuClose();
    toast.error('Sesión cerrada', {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      onClose: () => navigate('/index')
    });
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const handleCancelAppointment = async (appointmentId) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar cita',
        cancelButtonText: 'No, mantener cita',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
      });

      if (result.isConfirmed) {
        // Update appointment status
        const response = await axios.put(`${urlAppointment}/${appointmentId}/status`, {
          status: 'cancelada'
        });

        if (response.data.success) {
          await Swal.fire({
            title: 'Cita cancelada',
            text: 'La cita ha sido cancelada exitosamente',
            icon: 'success'
          });

          // Refresh the appointments and close the modal
          await fetchData();
          setShowDetailModal(false);
          await getProgramming();
        } else {
          await Swal.fire({
            title: 'Cita cancelada',
            text: 'La cita ha sido cancelada exitosamente',
            icon: 'success'
          });

        }
      }
    } catch (error) {
      await Swal.fire({
        title: 'Cita cancelada',
        text: 'La cita ha sido cancelada exitosamente',
        icon: 'success'
      });

    }
  };


  const getUserInitial = () => {
    return userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';
  };


  const getUserName = (users, clienteId) => {
    const userId = localStorage.getItem('userId'); // Obtener el ID del usuario logueado
    if (!userId) {
      console.error('No userId found in localStorage');
      return;
    }
    const user = users.find(user => user.id === clienteId);
    return user ? user.name : 'Desconocido';
  };


  const getProgramming = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        return;
      }

      const [programmingResponse, servicesResponse] = await Promise.all([
        axios.get(urlAppointment),
        axios.get(urlServices)
      ]);

      // Filtrar solo las citas del cliente logueado
      const programmingData = programmingResponse.data.filter(event => 
        event.clienteId && event.clienteId.toString() === userId.toString()
      );

      // Obtener detalles de cada cita para mostrar nombres de servicios
      const appointmentsWithNames = await Promise.all(
        programmingData.map(async (appointment) => {
          try {
            const detailsResponse = await axios.get(`${urlAppointment}/sale-details/${appointment.id}`);
            const details = detailsResponse.data.data || [];
            const serviceNames = details
              .filter(d => d.serviceId)
              .map(d => {
                const service = servicesResponse.data.find(s => s.id === parseInt(d.serviceId));
                return service ? service.name : 'Servicio';
              });
            const productNames = details
              .filter(d => d.id_producto)
              .map(d => d.Product_Name || d.name || 'Producto');
            
            return {
              ...appointment,
              serviceNames: serviceNames.length > 0 ? serviceNames : ['Sin servicios'],
              productNames: productNames.length > 0 ? productNames : [],
              allNames: [...serviceNames, ...productNames].join(', ') || 'Sin detalles'
            };
          } catch (error) {
            return {
              ...appointment,
              serviceNames: [],
              productNames: [],
              allNames: 'Sin detalles'
            };
          }
        })
      );
      
      // Ordenar por fecha más reciente primero
      appointmentsWithNames.sort((a, b) => {
        const dateA = new Date(a.Date + 'T' + a.Init_Time);
        const dateB = new Date(b.Date + 'T' + b.Init_Time);
        return dateB - dateA;
      });

      setAppointments(programmingData);
      setAppointmentsWithDetails(appointmentsWithNames);
    } catch (error) {
      console.error('Error fetching programming:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <header className={`header-index ${isScrolled ? 'abajo' : ''}`}>
            <style>
                {`
                  .header-index {
                 
                    background-color: #000000;
                 
                  }
                   .menu-landingPage {
                    margin-top: 10px;
                }
                .menu-item-landingPage {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .mobile-menu-icon {
                    display: none !important;
                    z-index: 1001;
                }
                .user-menu {
                    position: relative;
                    z-index: 1001;
                }
                @media (max-width: 768px) {
                    .mobile-menu-icon {
                        display: flex !important;
                    }
                    .nav-container {
                        position: fixed;
                        top: 60px;
                        left: 0;
                        right: 0;
                        height: calc(100vh - 60px);
                        background-color: #000000;
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 20px;
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                        box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                        overflow-y: auto;
                    }
                    .nav-container.nav-open {
                        transform: translateX(0);
                    }
                    .navBar-index {
                        flex-direction: column;
                        width: 100%;
                    }
                    .navBar-index a {
                        padding: 15px 0;
                        border-bottom: 1px solid #eee;
                        font-size: 16px;
                    }
                    .auth-buttons {
                        margin-left: 0;
                        margin-top: 20px;
                        width: 100%;
                    }
                    .user-menu {
                        width: 100%;
                    }
                    .user-menu .MuiButton-root {
                        width: 100%;
                        justify-content: flex-start;
                    }
                    .book-now-btn {
                        width: 100%;
                        padding: 12px !important;
                    }
                }
                `}
            </style>
            <Link to={'/'} className='logo-index'>
                <img src={logo} alt="Logo" />
                <span>Barberia Orion</span>
            </Link>
            <IconButton 
                className="mobile-menu-icon" 
                onClick={toggleNav}
                sx={{
                    color: '#000',
                    padding: '8px'
                }}
            >
                <MenuIcon />
            </IconButton>
            <div className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}>
                <nav className='navBar-index'>
                    <Link to='/index' onClick={() => setIsNavOpen(false)}>INICIO</Link>
                    
                    {userRole == 3 && (
                        <Link to='/appointmentView' onClick={() => setIsNavOpen(false)}>CITAS</Link>
                    )}
                    <Link to='/shop' onClick={() => setIsNavOpen(false)}>PRODUCTOS</Link>
                    
                </nav>
                <div className="auth-buttons">
                    {isLoggedIn && userEmail ? (
                        <div className="user-menu">
                            <Button
                                onClick={handleMenuClick}
                                className="userLoginn"
                                startIcon={
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            backgroundColor: '#b89b58'
                                        }}
                                    >
                                        {getUserInitial()}
                                    </Avatar>
                                }
                            >
                                {userEmail}
                            </Button>
                            <Menu 
                                anchorEl={anchorEl} 
                                open={Boolean(anchorEl)} 
                                onClose={handleMenuClose} 
                                className='menu-landingPage'
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                {userRole == 1 || userRole == 2 ? (
                                    <MenuItem onClick={handledashboard} className='menu-item-landingPage'>
                                        <GrUserAdmin /> Administrar
                                    </MenuItem>
                                ) : null}
                                <MenuItem component={Link} to='/profileview' onClick={() => setIsNavOpen(false)} className='menu-item-landingPage'>
                                    <GrUser /> Mi perfil
                                </MenuItem>
                                <MenuItem onClick={handleLogout} className='menu-item-landingPage'>
                                    <GiExitDoor /> Cerrar Sesión
                                </MenuItem>
                            </Menu>
                        </div>
                    ) : (
                        <Button
                            variant="contained"
                            className="book-now-btn"
                            onClick={handleLogin}
                        >
                            Iniciar sesión
                        </Button>
                    )}
                </div>
            </div>
        </header>
      <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="container py-5">
          {/* Header Section */}
          <div className="text-center mb-5">
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: '#2c3e50',
              marginBottom: '0.5rem'
            }}>
              Mis Citas
            </h1>
            <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
              Gestiona y programa tus citas de manera fácil
            </p>
          </div>

          {/* Action Button */}
          <div className="d-flex justify-content-center mb-4">
            <Button
              variant="contained"
              onClick={() => navigate('/registerview')}
              style={{
                backgroundColor: '#27ae60',
                color: 'white',
                fontWeight: '600',
                padding: '14px 32px',
                fontSize: '18px',
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#229954';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(39, 174, 96, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#27ae60';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(39, 174, 96, 0.3)';
              }}
            >
              <Calendar size={20} style={{ marginRight: '8px', marginBottom: '2px' }} />
              Crear Nueva Cita
            </Button>
          </div>

          {/* Filtros */}
          {appointmentsWithDetails.length > 0 && (
            <div className="mb-4">
              <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', padding: '20px' }}>
                {/* Filtro por Semana */}
                <div className="mb-3">
                  <h6 style={{ marginBottom: '12px', color: '#2c3e50', fontWeight: '600' }}>Filtrar por semana:</h6>
                  <div className="d-flex gap-2 flex-wrap mb-2">
                    <button
                      onClick={() => {
                        setFilterWeek('current');
                        setFilterMonth('all');
                        setFilterDay('all');
                      }}
                      style={{
                        backgroundColor: filterWeek === 'current' ? '#27ae60' : 'transparent',
                        color: filterWeek === 'current' ? 'white' : '#27ae60',
                        border: '1px solid #27ae60',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Semana Actual
                    </button>
                    <button
                      onClick={() => {
                        setFilterWeek('all');
                        setFilterMonth('all');
                        setFilterDay('all');
                      }}
                      style={{
                        backgroundColor: filterWeek === 'all' ? '#2c3e50' : 'transparent',
                        color: filterWeek === 'all' ? 'white' : '#2c3e50',
                        border: '1px solid #2c3e50',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Todas las Semanas
                    </button>
                  </div>
                  <Form.Control
                    type="date"
                    value={filterWeek !== 'current' && filterWeek !== 'all' ? filterWeek : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setFilterWeek(e.target.value);
                        setFilterMonth('all');
                        setFilterDay('all');
                      } else {
                        setFilterWeek('current');
                      }
                    }}
                    placeholder="Seleccionar fecha específica"
                    style={{
                      borderRadius: '8px',
                      border: '1px solid #ced4da',
                      padding: '8px 12px',
                      fontSize: '0.9rem',
                      maxWidth: isDesktop ? '300px' : '100%',
                      width: isDesktop ? 'auto' : '100%'
                    }}
                  />
                  {filterWeek !== 'all' && filterWeek !== 'current' && (
                    <div className="mt-2" style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                      Mostrando citas de la semana del {(() => {
                        const date = parseDateSafe(filterWeek);
                        if (date && !isNaN(date.getTime())) {
                          const weekStart = getWeekStart(date);
                          const weekEnd = getWeekEnd(date);
                          return `${weekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })} al ${weekEnd.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
                        }
                        return '';
                      })()}
                    </div>
                  )}
                </div>

                {/* Filtro por Estado */}
                <div className="mb-3">
                  <h6 style={{ marginBottom: '12px', color: '#2c3e50', fontWeight: '600' }}>Filtrar por estado:</h6>
                  <div className="d-flex gap-2 flex-wrap filter-buttons">
                    <button
                      onClick={() => setFilterStatus('all')}
                      style={{
                        backgroundColor: filterStatus === 'all' ? '#2c3e50' : 'transparent',
                        color: filterStatus === 'all' ? 'white' : '#2c3e50',
                        border: '1px solid #2c3e50',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Todas ({filteredAppointments.length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('pendiente')}
                      style={{
                        backgroundColor: filterStatus === 'pendiente' ? '#f39c12' : 'transparent',
                        color: filterStatus === 'pendiente' ? 'white' : '#856404',
                        border: '1px solid #f39c12',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Pendientes ({appointmentsWithDetails.filter(a => a.status?.toLowerCase() === 'pendiente').length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('completada')}
                      style={{
                        backgroundColor: filterStatus === 'completada' ? '#27ae60' : 'transparent',
                        color: filterStatus === 'completada' ? 'white' : '#155724',
                        border: '1px solid #27ae60',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Completadas ({appointmentsWithDetails.filter(a => a.status?.toLowerCase() === 'completada').length})
                    </button>
                    <button
                      onClick={() => setFilterStatus('cancelada')}
                      style={{
                        backgroundColor: filterStatus === 'cancelada' ? '#e74c3c' : 'transparent',
                        color: filterStatus === 'cancelada' ? 'white' : '#721c24',
                        border: '1px solid #e74c3c',
                        borderRadius: '8px',
                        padding: '6px 14px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Canceladas ({appointmentsWithDetails.filter(a => a.status?.toLowerCase() === 'cancelada').length})
                    </button>
                  </div>
                </div>

                {/* Botón para limpiar filtros */}
                {(filterStatus !== 'all' || filterWeek !== 'current') && (
                  <div className="mt-3">
                    <button
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterWeek('current');
                        setFilterMonth('all');
                        setFilterDay('all');
                      }}
                      style={{
                        backgroundColor: '#95a5a6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}
                    >
                      Limpiar Filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vista de Tarjetas de Citas */}
          {filteredAppointments.length === 0 ? (
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ 
                padding: '4rem 2rem', 
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '2px dashed #dee2e6'
              }}>
                <Calendar size={64} style={{ color: '#95a5a6', marginBottom: '1.5rem' }} />
                <h4 style={{ color: '#2c3e50', marginBottom: '1rem', fontWeight: '600' }}>
                  {appointmentsWithDetails.length === 0 ? 'No tienes citas programadas' : 'No hay citas con este filtro'}
                </h4>
                <p style={{ color: '#6c757d', marginBottom: '2rem', fontSize: '1.05rem' }}>
                  {appointmentsWithDetails.length === 0 
                    ? '¡Comienza ahora! Haz clic en el botón de arriba para crear tu primera cita.'
                    : 'Intenta cambiar el filtro para ver más citas.'}
                </p>
                {appointmentsWithDetails.length === 0 && (
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/registerview')}
                    style={{
                      borderColor: '#27ae60',
                      color: '#27ae60',
                      fontWeight: '600',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      textTransform: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#27ae60';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#27ae60';
                    }}
                  >
                    Programar Mi Primera Cita
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="row g-3 g-md-4" style={{ display: 'flex', flexWrap: 'wrap' }}>
              {filteredAppointments.map((appointment) => {
                const statusStyle = getStatusColor(appointment.status);
                const StatusIcon = statusStyle.icon;
                return (
                  <div key={appointment.id} className="col-12 col-sm-6 col-lg-4" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div 
                      className="card border-0 shadow-sm h-100 appointment-card"
                      style={{ 
                        borderRadius: '16px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        borderLeft: `5px solid ${statusStyle.border}`,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '100%'
                      }}
                      onMouseEnter={(e) => {
                        if (window.innerWidth > 768) {
                          e.currentTarget.style.transform = 'translateY(-8px)';
                          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                      }}
                      onClick={() => handleViewAppointmentDetails(appointment)}
                    >
                      <div className="card-body p-3 p-md-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div style={{ 
                            backgroundColor: statusStyle.bg, 
                            color: statusStyle.text,
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <StatusIcon size={14} />
                            {appointment.status || 'Pendiente'}
                          </div>
                        </div>
                        
                        <div className="mb-3">
                          {/* Nombre de Servicios/Productos */}
                          <div className="mb-3 pb-2 border-bottom">
                            <div style={{ 
                              fontSize: '0.85rem', 
                              color: '#6c757d', 
                              fontWeight: '500',
                              marginBottom: '4px'
                            }}>
                              Servicios/Productos:
                            </div>
                            <div style={{ 
                              fontSize: '0.95rem', 
                              color: '#2c3e50', 
                              fontWeight: '600',
                              lineHeight: '1.4'
                            }}>
                              {appointment.allNames || 'Sin detalles'}
                            </div>
                          </div>

                          <div className="d-flex align-items-center mb-2" style={{ color: '#495057' }}>
                            <Calendar size={18} className="me-2" style={{ color: '#2c3e50', flexShrink: 0 }} />
                            <div>
                              {appointment.Date ? (() => {
                                const date = parseDateSafe(appointment.Date);
                                if (!date || isNaN(date.getTime())) return 'No disponible';
                                
                                const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
                                const formattedDate = date.toLocaleDateString('es-ES', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                });
                                return (
                                  <>
                                    <strong style={{ fontSize: '0.95rem', textTransform: 'capitalize' }}>
                                      {dayName.charAt(0).toUpperCase() + dayName.slice(1)}
                                    </strong>
                                    <div style={{ fontSize: '0.85rem', color: '#6c757d', marginTop: '2px' }}>
                                      {formattedDate}
                                    </div>
                                  </>
                                );
                              })() : 'No disponible'}
                            </div>
                          </div>
                          <div className="d-flex align-items-center mb-2" style={{ color: '#495057' }}>
                            <Clock size={18} className="me-2" style={{ color: '#2c3e50', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.9rem' }}>
                              {convertTo12HourFormat(appointment.Init_Time)} - {convertTo12HourFormat(appointment.Finish_Time)}
                            </span>
                          </div>
                          <div className="d-flex align-items-center mb-2" style={{ color: '#495057' }}>
                            <Clock size={18} className="me-2" style={{ color: '#2c3e50', flexShrink: 0 }} />
                            <span style={{ fontSize: '0.9rem' }}>
                              Duración: {appointment.time_appointment || 0} min
                            </span>
                          </div>
                          <div className="d-flex align-items-center" style={{ color: '#27ae60' }}>
                            <DollarSign size={18} className="me-2" style={{ flexShrink: 0 }} />
                            <strong style={{ fontSize: '1.1rem' }}>
                              ${appointment.Total?.toLocaleString() || '0'}
                            </strong>
                          </div>
                        </div>

                        <button
                          className="btn w-100 mt-3"
                          style={{
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAppointmentDetails(appointment);
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
                        >
                          <FaEye size={14} className="me-2" />
                          Ver Detalles Completos
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Info Cards */}
          {appointmentsWithDetails.length > 0 && (
            <div className="row g-3 mt-4">
              <div className="col-12 col-md-4">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', padding: '20px' }}>
                  <div className="d-flex align-items-center">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#e8f5e9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px',
                      flexShrink: 0
                    }}>
                      <CheckCircle2 size={24} style={{ color: '#27ae60' }} />
                    </div>
                    <div>
                      <h5 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1rem' }}>
                        {appointmentsWithDetails.length}
                      </h5>
                      <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
                        Citas Totales
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', padding: '20px' }}>
                  <div className="d-flex align-items-center">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#fff3e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px',
                      flexShrink: 0
                    }}>
                      <Clock size={24} style={{ color: '#f39c12' }} />
                    </div>
                    <div>
                      <h5 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1rem' }}>
                        {appointmentsWithDetails.filter(a => a.status?.toLowerCase() === 'pendiente').length}
                      </h5>
                      <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
                        Pendientes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', padding: '20px' }}>
                  <div className="d-flex align-items-center">
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#e3f2fd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '15px',
                      flexShrink: 0
                    }}>
                      <DollarSign size={24} style={{ color: '#3498db' }} />
                    </div>
                    <div>
                      <h5 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1rem' }}>
                        ${appointmentsWithDetails.reduce((sum, apt) => sum + (apt.Total || 0), 0).toLocaleString()}
                      </h5>
                      <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
                        Total Invertido
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal
          show={showDetailModal}
          onHide={() => setShowDetailModal(false)}
          size="lg"
          backdrop="static"
          keyboard={true}
          centered
          className="appointment-detail-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title className="d-flex align-items-center text-gold">
              <i className="fa fa-credit-card me-2" aria-hidden="true"></i>
              Detalle de la Cita
            </Modal.Title>
          </Modal.Header>


          <Modal.Body className="custom-modal-body">

            <div className="mb-4">
              <h5 className="border-bottom pb-2 text-gold">Mi cita</h5>
              <div className="row">
                <div className="col-md-6">
                  <p>
                    <strong>Fecha:</strong> {detailData.Date ? (() => {
                      const date = parseDateSafe(detailData.Date);
                      if (date && !isNaN(date.getTime())) {
                        return date.toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        });
                      }
                      return detailData.Date.includes('T') ? detailData.Date.split('T')[0] : detailData.Date;
                    })() : 'No disponible'}
                  </p>
                  <p>
                    <strong>Hora inicio:</strong> {convertTo12HourFormat(detailData.Init_Time || "")}
                  </p>
                  <p>
                    <strong>Hora fin:</strong> {convertTo12HourFormat(detailData.Finish_Time || "")}
                  </p>
                  <p>
                    <strong>Estado:</strong> {detailData.status ? detailData.status.charAt(0).toUpperCase() + detailData.status.slice(1).toLowerCase() : 'Pendiente'}
                  </p>
                </div>
                <div className="col-md-6">
                  <p>
                    <strong>Duración de la cita:</strong> {detailData.time_appointment || 0}
                    <strong> Minutos</strong>
                  </p>
                  <p>
                    <strong>Total:</strong> ${detailData.Total ? detailData.Total.toLocaleString() : '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="border-bottom pb-2 text-gold">Detalle de la cita</h5>
              {saleDetails.data && saleDetails.data.length > 0 ? (
                <>

                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>

                          <th>Nombre</th>
                          <th>Cantidad</th>
                          <th>Precio unitario</th>
                          <th>Barbero</th>
                        </tr>
                      </thead>
                      <tbody>
                        {saleDetails.data.map((detail, index) => (
                          <tr key={index}>

                            <td>{detail.name}</td>
                            <td>{detail.quantity}</td>
                            <td>${detail.price.toLocaleString()}</td>
                            <td>{detail.employeeName || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-muted">No se encuentran productos en esta cita.</p>
              )}
            </div>

            <div className="mt-4 text-end">
              <button
                className="btn btn-danger"
                onClick={() => handleCancelAppointment(appointmentId)}
              >
                Cancelar cita
              </button>
            </div>
          </Modal.Body>
        </Modal>

      <style jsx global>{`
 * {
    box-sizing: border-box;
}

.calendar-container {
    position: relative;
    background: #1a1a1a;
    border-radius: 20px;
    box-shadow: 
        0 10px 30px rgba(0, 0, 0, 0.2), 
        inset 0 0 15px rgba(255, 255, 255, 0.05),
        0 5px 20px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    perspective: 1000px;
    transition: all 0.4s ease;
    transform: translateY(0);
}

.calendar-container:hover {
    transform: translateY(-15px);
    box-shadow: 
        0 25px 50px rgba(0, 0, 0, 0.3), 
        inset 0 0 20px rgba(255, 255, 255, 0.1),
        0 20px 40px rgba(0, 0, 0, 0.2);
}

.fc {
    font-family: system-ui, -apple-system, sans-serif;
    background: transparent;
    color: #2c3e50;
}

.fc .fc-toolbar {
    padding: 1.5rem;
    background: transparent;
    border-bottom: 1px solid #e9ecef;
    margin-bottom: 1rem;
}

.fc .fc-toolbar-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #2c3e50 !important;
    text-transform: capitalize;
}

.fc .fc-button {
    background-color: white !important;
    border: 1px solid #dee2e6 !important;
    color: #2c3e50 !important;
    padding: 0.5rem 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
    border-radius: 8px;
    font-size: 0.9rem;
}

.fc .fc-button:hover {
    background-color: #f8f9fa !important;
    border-color: #27ae60 !important;
    color: #27ae60 !important;
    transform: translateY(-1px);
}

.fc .fc-button-primary:not(:disabled):active,
.fc .fc-button-primary:not(:disabled).fc-button-active {
    background-color: #27ae60 !important;
    border-color: #27ae60 !important;
    color: white !important;
}

.fc-theme-standard .fc-scrollgrid {
    border-color: #e9ecef;
    background: white;
    border-radius: 8px;
}

.fc .fc-day {
    background: white;
    transition: all 0.2s ease;
}

.fc .fc-day:hover {
    background: #f8f9fa;
}

.fc .fc-day-today {
    background: #e8f5e9 !important;
    border-radius: 8px;
}

.fc .fc-day-today .fc-daygrid-day-number {
    color: #27ae60;
    font-weight: 700;
}

.fc .fc-daygrid-day-number {
    color: #2c3e50;
    padding: 0.5rem;
    transition: all 0.2s ease;
    font-weight: 500;
}

.fc .fc-daygrid-day:hover .fc-daygrid-day-number {
    color: #27ae60;
}

/* Estilos para eventos clickeables */
.fc-event {
    cursor: pointer !important;
    border: none !important;
    padding: 0 !important;
    margin: 2px 0 !important;
}

.fc-event:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

.fc-event-main {
    cursor: pointer !important;
}

/* Mejorar visibilidad en desktop */
@media (min-width: 769px) {
    .fc-event {
        margin: 3px 0 !important;
    }
    
    .fc-event:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
    }
}

.fc .fc-col-header-cell {
    background: #f8f9fa;
    color: #2c3e50 !important;
    font-weight: 600;
    text-transform: capitalize;
    padding: 0.75rem 0;
    border-color: #e9ecef;
}

.fc-day-other {
    background: #f8f9fa;
}

.fc-day-other .fc-daygrid-day-number {
    color: #adb5bd;
}

@media (max-width: 640px) {
    .calendar-container:hover {
        transform: translateY(-10px);
    }
}

/* Estilos específicos para este modal que no interferirán con otras modales */
.appointment-detail-modal .modal-content {
    background-color: #f4f4f4;
    color: #333;
    border-radius: 15px;
    border: 2px solid #a38928;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.appointment-detail-modal .modal-header {
    border-bottom: 2px solid #a38928;
    background-color: #f9f9f9;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
}

.appointment-detail-modal .modal-title {
    color: #a38928;
    display: flex;
    align-items: center;
    font-weight: 600;
}

.appointment-detail-modal .modal-title i {
    margin-right: 10px;
    color: #a38928;
}

.appointment-detail-modal .btn-close {
    background-color: rgba(163, 137, 40, 0.1);
    border-radius: 50%;
    opacity: 0.7;
}

.appointment-detail-modal .btn-close:hover {
    background-color: rgba(163, 137, 40, 0.2);
    opacity: 1;
}

.appointment-detail-modal .modal-body {
    background-color: #ffffff;
    padding: 1.5rem;
}

.appointment-detail-modal h5 {
    color: #a38928;
    border-bottom-color: #a38928 !important;
}

.appointment-detail-modal .table {
    background-color: #ffffff;
    color: #333;
}

.appointment-detail-modal .table thead {
    background-color: #f1f1f1;
    color: #a38928;
}

.appointment-detail-modal .table-striped tbody tr:nth-of-type(odd) {
    background-color: rgba(163, 137, 40, 0.05);
}

.appointment-detail-modal .table-hover tbody tr:hover {
    background-color: rgba(163, 137, 40, 0.1);
}

.appointment-detail-modal .text-gold {
    color: #a38928 !important;
}
.view-button {
    background: none;
    border: none;
    color: gold;
    cursor: pointer;
}

.view-button:hover {
    color: darkgoldenrod;
}
.calendar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(145deg, #1e1e2e, #161623);
  border-radius: 20px;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.2), 
    inset 0 0 15px rgba(255, 255, 255, 0.05),
    0 5px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  perspective: 1000px;
  transition: all 0.4s ease;
  transform: translateY(0);
}

.calendar-container:hover {
  transform: translateY(-15px);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.3), 
    inset 0 0 20px rgba(255, 255, 255, 0.1),
    0 20px 40px rgba(0, 0, 0, 0.2);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  background: linear-gradient(90deg, rgba(30, 30, 46, 0.8), rgba(22, 22, 35, 0.8));
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.calendar-title {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.view-selector {
  background-color: #000000;
  color: #b89b58;
  border: 1px solid #b89b58/30;
  border-radius: 10px;
  padding: 0.6rem 1.2rem;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  appearance-none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b89b58'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.view-selector:hover {
  background-color: #00000;
  color: #b89b58;
  transform: translateY(-2px) scale(0.97);
  box-shadow: 
    0 4px 8px rgba(0, 0, 0, 0.2), 
    inset 0 0 15px rgba(0, 0, 0, 0.1);
}

.calendar-content {
  width: 100%;
  background: #1a1a1a;
  border-radius: 15px;
  padding: 1.5rem;
}
   .header-index {
                 
                    background-color: #000000;
                 
                  }
                   .menu-landingPage {
                    margin-top: 10px;
                }
                .menu-item-landingPage {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .mobile-menu-icon {
                    display: none !important;
                    z-index: 1001;
                }
                .user-menu {
                    position: relative;
                    z-index: 1001;
                }
                @media (max-width: 768px) {
                    .mobile-menu-icon {
                        display: flex !important;
                    }
                    .nav-container {
                        position: fixed;
                        top: 60px;
                        left: 0;
                        right: 0;
                        height: calc(100vh - 60px);
                        background-color: #000000;
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 20px;
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                        box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                        overflow-y: auto;
                    }
                    .nav-container.nav-open {
                        transform: translateX(0);
                    }
                    .navBar-index {
                        flex-direction: column;
                        width: 100%;
                    }
                    .navBar-index a {
                        padding: 15px 0;
                        border-bottom: 1px solid #eee;
                        font-size: 16px;
                    }
                    .auth-buttons {
                        margin-left: 0;
                        margin-top: 20px;
                        width: 100%;
                    }
                    .user-menu {
                        width: 100%;
                    }
                    .user-menu .MuiButton-root {
                        width: 100%;
                        justify-content: flex-start;
                    }
                    .book-now-btn {
                        width: 100%;
                        padding: 12px !important;
                    }
                }

                /* Estilos para móvil - Filtros */
                @media (max-width: 768px) {
                    .filter-buttons {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }
                    .filter-buttons button {
                        width: 100%;
                        text-align: center;
                    }
                    .filter-select {
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                }

                /* Mejoras para tarjetas en móvil */
                @media (max-width: 576px) {
                    .appointment-card {
                        margin-bottom: 1rem;
                    }
                    .appointment-card .card-body {
                        padding: 1rem !important;
                    }
                    .appointment-card .btn {
                        font-size: 0.85rem;
                        padding: 8px 12px;
                    }
                }
`}</style>

    </div>
  );
}
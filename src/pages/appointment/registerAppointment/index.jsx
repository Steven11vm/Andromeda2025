
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { BsCalendar2DateFill } from "react-icons/bs";
import { FaMoneyBillWave, FaExclamationTriangle, FaEdit } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import Button from '@mui/material/Button';
import { IoTrashSharp } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { Form, Col, Row, Modal, Alert, Badge } from 'react-bootstrap';
import { show_alerta } from '../../../assets/functions';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import '../appointment.css';
import CustomTimeSelector from '../../sales/registerSales/CustomTimeSelector/CustomTimeSelector';

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
  height: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightRegular,
  '&:hover, &:focus': {
    backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.06),
  },
  '&:active': {
    boxShadow: theme.shadows[1],
    backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.12),
  },
}));

export default function RegisterAppointment() {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Todos los usuarios (clientes y empleados)
  const [employees, setEmployees] = useState([]); // Solo empleados
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictAppointment, setConflictAppointment] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false);
  const [selectedAppointmentToEdit, setSelectedAppointmentToEdit] = useState(null);
  const [editAppointmentFormData, setEditAppointmentFormData] = useState({
    Date: '',
    Init_Time: '',
    Finish_Time: '',
    status: ''
  });
  const [savingAppointment, setSavingAppointment] = useState(false);
  const clientSearchRef = useRef(null);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    clienteId: '',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '',
    horaFin: '',
    citaFija: false,
    frecuencia: 'semanal', // semanal, quincenal, mensual
    cantidadCitas: 4, // cantidad de citas a crear
  });

  const urlServices = 'https://andromeda-api.onrender.com/api/services';
  const urlUsers = 'https://andromeda-api.onrender.com/api/users';
  const urlAppointments = 'https://andromeda-api.onrender.com/api/appointment';
  const urlSales = 'https://andromeda-api.onrender.com/api/sales';

  useEffect(() => {
    getUsers();
    getServices();
  }, []);

  // Cargar citas cuando los servicios estén disponibles
  useEffect(() => {
    if (services.length > 0) {
      getAppointments();
    }
  }, [services]);

  // Calcular hora fin automáticamente cuando cambian servicios o hora inicio
  useEffect(() => {
    if (formData.horaInicio && selectedServices.length > 0) {
      calculateEndTime();
    } else {
      setFormData(prev => ({ ...prev, horaFin: '' }));
    }
  }, [formData.horaInicio, selectedServices, services]);

  // Validar conflictos cuando cambian fecha, hora inicio o servicios
  useEffect(() => {
    if (formData.fecha && formData.horaInicio && formData.horaFin && selectedServices.length > 0 && appointments.length > 0) {
      checkConflicts();
    } else {
      setConflicts([]);
    }
  }, [formData.fecha, formData.horaInicio, formData.horaFin, selectedServices, appointments, allUsers]);

  // Actualizar slots ocupados cuando cambian las citas o la fecha
  useEffect(() => {
    if (appointments.length > 0 && formData.fecha && allUsers.length > 0) {
      updateOccupiedSlots();
    } else {
      setOccupiedSlots([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointments, formData.fecha, allUsers]);

  useEffect(() => {
    // Filtrar clientes según el término de búsqueda
    if (clientSearchTerm.trim() === '') {
      setFilteredClients([]);
      setShowClientDropdown(false);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(clientSearchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
      setShowClientDropdown(filtered.length > 0);
    }
  }, [clientSearchTerm, users]);

  useEffect(() => {
    // Cerrar dropdown al hacer clic fuera
    const handleClickOutside = (event) => {
      if (clientSearchRef.current && !clientSearchRef.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUsers = async () => {
    try {
      const response = await axios.get(urlUsers);
      const allUsersData = response.data;
      setAllUsers(allUsersData);
      // Clientes (roleId === 3)
      setUsers(allUsersData.filter(user => user.roleId === 3));
      // Empleados (roleId === 2)
      setEmployees(allUsersData.filter(user => user.roleId === 2));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getServices = async () => {
    try {
      const response = await axios.get(urlServices);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const getAppointments = async () => {
    try {
      const [appointmentsResponse, salesResponse] = await Promise.all([
        axios.get(urlAppointments),
        axios.get(urlSales)
      ]);
      
      const appointmentsData = appointmentsResponse.data;
      const salesData = salesResponse.data;
      
      // Mapear información de ventas a citas
      const appointmentSaleMap = {};
      salesData.forEach(sale => {
        sale.SaleDetails.forEach(detail => {
          if (detail.appointmentId) {
            if (!appointmentSaleMap[detail.appointmentId]) {
              appointmentSaleMap[detail.appointmentId] = {
                saleId: sale.id,
                services: []
              };
            }
            if (detail.serviceId) {
              const service = services.find(s => s.id === detail.serviceId);
              appointmentSaleMap[detail.appointmentId].services.push({
                serviceId: detail.serviceId,
                serviceName: service?.name || 'Servicio',
                empleadoId: detail.empleadoId
              });
            }
          }
        });
      });
      
      // Enriquecer citas con información de ventas
      const enrichedAppointments = appointmentsData.map(apt => ({
        ...apt,
        saleInfo: appointmentSaleMap[apt.id] || null
      }));
      
      setAppointments(enrichedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const updateOccupiedSlots = () => {
    if (!formData.fecha || appointments.length === 0) {
      setOccupiedSlots([]);
      return;
    }

    // Función auxiliar para normalizar fecha a YYYY-MM-DD
    const normalizeDate = (dateString) => {
      if (!dateString) return '';
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          return `${year}-${month}-${day}`;
        }
      } catch (e) {
        console.error('Error normalizing date:', e);
      }
      return dateString;
    };

    const normalizedCurrentDate = normalizeDate(formData.fecha);

    // Filtrar solo las citas de la fecha seleccionada que no estén canceladas
    const occupied = appointments
      .filter(appointment => {
        const appointmentDateNormalized = normalizeDate(appointment.Date);
        const isSameDate = appointmentDateNormalized === normalizedCurrentDate;
        const isNotCancelled = appointment.status?.toLowerCase() !== 'cancelada';
        return isSameDate && isNotCancelled;
      })
      .map(appointment => {
        // Normalizar horas usando formatTime
        const normalizedStartTime = formatTime(appointment.Init_Time) || appointment.Init_Time;
        const normalizedEndTime = formatTime(appointment.Finish_Time) || appointment.Finish_Time;

        // Asegurar formato HH:MM:SS para comparaciones
        const startTime = normalizedStartTime.includes(':') && normalizedStartTime.split(':').length === 2
          ? normalizedStartTime + ':00'
          : normalizedStartTime;
        const endTime = normalizedEndTime.includes(':') && normalizedEndTime.split(':').length === 2
          ? normalizedEndTime + ':00'
          : normalizedEndTime;

        // Obtener información del cliente
        const client = allUsers.find(u => u.id === appointment.clienteId);
        const clientName = client?.name || 'Cliente Desconocido';

        return {
          startTime: startTime,
          endTime: endTime,
          date: normalizeDate(appointment.Date),
          appointmentId: appointment.id,
          clientName: clientName,
          clientId: appointment.clienteId,
          status: appointment.status
        };
      });

    setOccupiedSlots(occupied);
  };

  // Función para normalizar hora desde BD
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

  const calculateEndTime = () => {
    if (!formData.horaInicio || selectedServices.length === 0) {
      return;
    }

    // Calcular duración total de todos los servicios
    const totalDuration = selectedServices.reduce((sum, service) => {
      const serviceData = services.find(s => s.id === parseInt(service.serviceId));
      return sum + (serviceData ? serviceData.time : 0);
    }, 0);

    if (totalDuration === 0) {
      setFormData(prev => ({ ...prev, horaFin: '' }));
      return;
    }

    // Normalizar hora inicio (asegurar formato HH:MM)
    const horaInicioNormalized = formData.horaInicio.includes(':') 
      ? formData.horaInicio.substring(0, 5)
      : formData.horaInicio + ':00';

    // Calcular hora fin
    const [hours, minutes] = horaInicioNormalized.split(':').map(Number);
    const startTime = new Date(2000, 0, 1, hours, minutes);
    const endTime = new Date(startTime.getTime() + totalDuration * 60000);
    const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    
    setFormData(prev => ({ ...prev, horaFin: endTimeStr }));
  };

  const checkConflicts = () => {
    if (!formData.fecha || !formData.horaInicio || !formData.horaFin) {
      setConflicts([]);
      return;
    }

    // Normalizar hora inicio (asegurar formato HH:MM:SS)
    const horaInicioNormalized = formData.horaInicio.includes(':') 
      ? (formData.horaInicio.length === 5 ? formData.horaInicio + ':00' : formData.horaInicio)
      : formData.horaInicio + ':00:00';
    
    const horaFinNormalized = formData.horaFin.includes(':')
      ? (formData.horaFin.length === 5 ? formData.horaFin + ':00' : formData.horaFin)
      : formData.horaFin + ':00:00';

    const newStart = new Date(`${formData.fecha}T${horaInicioNormalized}`);
    const newEnd = new Date(`${formData.fecha}T${horaFinNormalized}`);

    const foundConflicts = [];

    appointments.forEach(apt => {
      // Solo verificar citas del mismo día y que no estén canceladas
      const aptDate = apt.Date.split('T')[0];
      if (aptDate === formData.fecha && apt.status?.toLowerCase() !== 'cancelada') {
        // Normalizar horas de la cita existente
        const aptInitTime = apt.Init_Time.includes(':')
          ? (apt.Init_Time.length === 5 ? apt.Init_Time + ':00' : apt.Init_Time)
          : apt.Init_Time + ':00:00';
        const aptFinishTime = apt.Finish_Time.includes(':')
          ? (apt.Finish_Time.length === 5 ? apt.Finish_Time + ':00' : apt.Finish_Time)
          : apt.Finish_Time + ':00:00';

        const aptStart = new Date(`${aptDate}T${aptInitTime}`);
        const aptEnd = new Date(`${aptDate}T${aptFinishTime}`);

        // Verificar si hay solapamiento o si es la misma hora exacta
        const sameStartTime = aptStart.getTime() === newStart.getTime();
        const hasOverlap = (
          (newStart >= aptStart && newStart < aptEnd) ||
          (newEnd > aptStart && newEnd <= aptEnd) ||
          (newStart <= aptStart && newEnd >= aptEnd)
        );

        if (sameStartTime || hasOverlap) {
          // Verificar conflictos por empleado
          selectedServices.forEach(selectedService => {
            if (selectedService.empleadoId && apt.saleInfo) {
              apt.saleInfo.services.forEach(aptService => {
                if (aptService.empleadoId?.toString() === selectedService.empleadoId.toString()) {
                  const clientName = allUsers.find(u => u.id === apt.clienteId)?.name || 'Desconocido';
                  const conflictType = sameStartTime ? 'Misma hora exacta' : 'Solapamiento de horarios';
                  foundConflicts.push({
                    appointmentId: apt.id,
                    clientName,
                    startTime: apt.Init_Time.includes(':') ? apt.Init_Time.substring(0, 5) : apt.Init_Time,
                    endTime: apt.Finish_Time.includes(':') ? apt.Finish_Time.substring(0, 5) : apt.Finish_Time,
                    serviceName: aptService.serviceName,
                    empleadoId: selectedService.empleadoId,
                    empleadoName: allUsers.find(u => u.id === parseInt(selectedService.empleadoId))?.name || 'Desconocido',
                    conflictType
                  });
                }
              });
            }
          });
        }
      }
    });

    setConflicts(foundConflicts);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Si cambia la hora inicio, se recalculará automáticamente en el useEffect
  };

  const handleClientSearch = (e) => {
    const value = e.target.value;
    setClientSearchTerm(value);
    if (!value) {
      setSelectedClient(null);
      setFormData(prev => ({ ...prev, clienteId: '' }));
    }
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setClientSearchTerm(client.name);
    setFormData(prev => ({ ...prev, clienteId: client.id }));
    setShowClientDropdown(false);
  };

  const handleAddService = () => {
    setSelectedServices([...selectedServices, { serviceId: '', empleadoId: '' }]);
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...selectedServices];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedServices(updated);
    // El useEffect calculará automáticamente la hora fin
  };

  const handleRemoveService = (index) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => {
      const serviceData = services.find(s => s.id === parseInt(service.serviceId));
      return total + (serviceData ? serviceData.price : 0);
    }, 0);
  };

  // Función auxiliar para formatear fecha sin problemas de zona horaria
  const formatDateSafe = (dateInput) => {
    let dateStr = '';
    if (typeof dateInput === 'string') {
      dateStr = dateInput;
    } else if (dateInput instanceof Date) {
      // Formatear manualmente para evitar problemas de zona horaria
      const year = dateInput.getFullYear();
      const month = (dateInput.getMonth() + 1).toString().padStart(2, '0');
      const day = dateInput.getDate().toString().padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    } else {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      dateStr = `${year}-${month}-${day}`;
    }
    
    // Asegurar formato YYYY-MM-DD
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    return dateStr;
  };

  // Función auxiliar para parsear fecha sin problemas de zona horaria
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

  const generateAppointmentDates = () => {
    const dates = [];
    
    if (!formData.citaFija) {
      // Si no es cita fija, solo retornar la fecha seleccionada
      return [formatDateSafe(formData.fecha)];
    }

    // Parsear fecha inicial de forma segura
    const startDate = parseDateSafe(formData.fecha);
    
    // Calcular fechas según la frecuencia
    for (let i = 0; i < formData.cantidadCitas; i++) {
      const currentDate = new Date(startDate);
      
      if (formData.frecuencia === 'semanal') {
        // Cada semana (7 días)
        currentDate.setDate(currentDate.getDate() + (i * 7));
      } else if (formData.frecuencia === 'quincenal') {
        // Cada 15 días
        currentDate.setDate(currentDate.getDate() + (i * 15));
      } else if (formData.frecuencia === 'mensual') {
        // Cada mes (aproximadamente 30 días)
        currentDate.setDate(currentDate.getDate() + (i * 30));
      }
      
      // Formatear fecha de forma segura sin problemas de zona horaria
      dates.push(formatDateSafe(currentDate));
    }
    
    return dates;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones simples
    if (!formData.clienteId) {
      show_alerta('Debe seleccionar un cliente', 'warning');
      return;
    }

    if (selectedServices.length === 0) {
      show_alerta('Debe agregar al menos un servicio', 'warning');
      return;
    }

    // Validar que todos los servicios tengan servicio y empleado seleccionado
    const incompleteServices = selectedServices.some(s => !s.serviceId || !s.empleadoId);
    if (incompleteServices) {
      show_alerta('Todos los servicios deben tener servicio y empleado seleccionados', 'warning');
      return;
    }

    if (!formData.fecha || !formData.horaInicio || !formData.horaFin) {
      show_alerta('Debe completar la fecha y horario de la cita', 'warning');
      return;
    }

    // Validar que la hora inicio esté en punto (minutos = 00)
    const horaInicioParts = formData.horaInicio.split(':');
    if (horaInicioParts.length > 1 && parseInt(horaInicioParts[1]) !== 0) {
      show_alerta('La hora de inicio debe ser en punto (ej: 09:00, 10:00). Los minutos se calculan automáticamente según los servicios.', 'warning');
      return;
    }

    // Validar conflictos antes de enviar
    if (conflicts.length > 0) {
      const sameTimeConflicts = conflicts.filter(c => c.conflictType === 'Misma hora exacta');
      if (sameTimeConflicts.length > 0) {
        show_alerta('No se puede agendar una cita a la misma hora y el mismo día si ya hay una cita en ese horario. Por favor, seleccione otro horario.', 'error');
      } else {
        show_alerta('Existen conflictos de horario. Por favor, revise los conflictos antes de continuar.', 'warning');
      }
      return;
    }

    try {
      // Calcular duración total
      const totalDuration = selectedServices.reduce((sum, service) => {
        const serviceData = services.find(s => s.id === parseInt(service.serviceId));
        return sum + (serviceData ? serviceData.time : 0);
      }, 0);

      // Generar fechas de citas
      const appointmentDates = generateAppointmentDates();
      
      // Crear todas las citas
      const promises = appointmentDates.map(async (date, index) => {
        const billNumber = Math.floor(100 + Math.random() * 900).toString();
        
        // Asegurarse de usar exactamente la fecha seleccionada sin problemas de zona horaria
        const selectedDateStr = formatDateSafe(date);
        
        const saleInfoToSend = {
          Billnumber: billNumber,
          SaleDate: selectedDateStr,
          total_price: calculateTotal(),
          status: 'Pendiente',
          id_usuario: parseInt(formData.clienteId),
          appointmentData: {
            Init_Time: formData.horaInicio.includes(':') 
              ? (formData.horaInicio.length === 5 ? formData.horaInicio + ':00' : formData.horaInicio)
              : formData.horaInicio + ':00:00',
            Finish_Time: formData.horaFin.includes(':')
              ? (formData.horaFin.length === 5 ? formData.horaFin + ':00' : formData.horaFin)
              : formData.horaFin + ':00:00',
            Date: selectedDateStr,
            time_appointment: totalDuration
          },
          saleDetails: selectedServices.map(service => {
            const serviceData = services.find(s => s.id === parseInt(service.serviceId));
            return {
              quantity: 1,
              unitPrice: serviceData ? parseFloat(serviceData.price) : 0,
              total_price: serviceData ? parseFloat(serviceData.price) : 0,
              id_producto: null,
              empleadoId: service.empleadoId ? parseInt(service.empleadoId) : null,
              serviceId: service.serviceId ? parseInt(service.serviceId) : null
            };
          })
        };

        return axios.post('https://andromeda-api.onrender.com/api/sales', saleInfoToSend);
      });

      await Promise.all(promises);
      
      const mensaje = formData.citaFija 
        ? `${appointmentDates.length} citas ${formData.frecuencia === 'semanal' ? 'semanales' : formData.frecuencia === 'quincenal' ? 'quincenales' : 'mensuales'} registradas con éxito`
        : 'Cita registrada con éxito';
      
      show_alerta(mensaje, 'success');
      navigate('/appointment');
    } catch (error) {
      console.error('Error al registrar la cita:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Error al registrar la cita';
      show_alerta(`Error: ${errorMessage}`, 'error');
    }
  };

  return (
    <div className="right-content w-100">
      <div className="row d-flex align-items-center w-100">
        <div className='spacing d-flex align-items-center'>
          <div className='col-sm-5'>
            <span className='Title'>Registrar Cita</span>
          </div>
          <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
            <Breadcrumbs aria-label="breadcrumb">
              <StyledBreadcrumb component="a" href="#" label="Home" icon={<HomeIcon fontSize="small" />} />
              <StyledBreadcrumb component="a" href="#" label="Salidas" icon={<FaMoneyBillWave fontSize="small" />} />
              <StyledBreadcrumb component="a" href="#" label="Citas" icon={<BsCalendar2DateFill fontSize="small" />} />
            </Breadcrumbs>
          </div>
        </div>

        <div className='card border-0 p-3 shadow'>
          <Form onSubmit={handleSubmit}>
            <div className='row'>
              {/* Columna izquierda - Información básica */}
              <div className='col-md-6'>
                <div className='card-detail shadow border-0 mb-4'>
                  <div className="cont-title w-100 p-3">
                    <span className='Title'>Información de la Cita</span>
                  </div>
                  <div className='p-4'>
                    <Form.Group className="mb-3" ref={clientSearchRef}>
                      <Form.Label className='required'>Cliente</Form.Label>
                      <div className="position-relative">
                        <div className="d-flex align-items-center">
                          <IoSearch className="position-absolute ms-2" style={{ zIndex: 10, color: '#6c757d' }} />
                          <Form.Control
                            type="text"
                            placeholder="Buscar cliente por nombre o email..."
                            value={clientSearchTerm}
                            onChange={handleClientSearch}
                            onFocus={() => {
                              if (filteredClients.length > 0) {
                                setShowClientDropdown(true);
                              }
                            }}
                            style={{ paddingLeft: '35px' }}
                            required
                          />
                        </div>
                        {showClientDropdown && filteredClients.length > 0 && (
                          <div 
                            className="position-absolute w-100 bg-white border rounded shadow-lg"
                            style={{ 
                              zIndex: 1000, 
                              maxHeight: '200px', 
                              overflowY: 'auto',
                              marginTop: '2px'
                            }}
                          >
                            {filteredClients.map(client => (
                              <div
                                key={client.id}
                                className="p-2 cursor-pointer hover-bg-light"
                                onClick={() => selectClient(client)}
                                style={{
                                  cursor: 'pointer',
                                  borderBottom: '1px solid #eee'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                              >
                                <div className="fw-bold">{client.name}</div>
                                {client.email && (
                                  <div className="text-muted small">{client.email}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {selectedClient && (
                        <Form.Text className="text-muted">
                          Cliente seleccionado: <strong>{selectedClient.name}</strong>
                        </Form.Text>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className='required'>Fecha</Form.Label>
                      <Form.Control
                        type="date"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className='required'>Hora Inicio</Form.Label>
                      <CustomTimeSelector
                        name="horaInicio"
                        value={formData.horaInicio.includes(':') ? formData.horaInicio.substring(0, 5) : formData.horaInicio}
                        onChange={(time) => {
                          if (time) {
                            // Asegurar formato HH:MM:SS para el estado interno
                            const normalizedTime = time.includes(':') && time.split(':').length === 2
                              ? time + ':00'
                              : time;
                            setFormData(prev => ({ ...prev, horaInicio: normalizedTime }));
                          } else {
                            setFormData(prev => ({ ...prev, horaInicio: '', horaFin: '' }));
                          }
                        }}
                        occupiedSlots={occupiedSlots}
                        selectedDate={formData.fecha}
                        onEditAppointment={(appointment) => {
                          setSelectedAppointmentToEdit(appointment);
                          const apt = appointments.find(a => a.id === appointment.appointmentId);
                          if (apt) {
                            // Normalizar fecha
                            let appointmentDate = apt.Date;
                            if (appointmentDate.includes('T')) {
                              appointmentDate = appointmentDate.split('T')[0];
                            }
                            
                            // Normalizar horas para el input
                            const initTime = formatTime(apt.Init_Time);
                            const finishTime = formatTime(apt.Finish_Time);
                            
                            setEditAppointmentFormData({
                              Date: appointmentDate,
                              Init_Time: initTime,
                              Finish_Time: finishTime,
                              status: apt.status || 'Pendiente'
                            });
                          }
                          setShowEditAppointmentModal(true);
                        }}
                      />
                      {occupiedSlots.length > 0 && (
                        <Form.Text className="text-muted d-block mt-2" style={{ fontSize: '0.85rem' }}>
                          <span style={{ color: '#dc3545' }}>⚠️</span> Las horas en rojo ya están ocupadas. Haz clic para ver detalles y editar.
                        </Form.Text>
                      )}
                      <Form.Text className="text-muted">
                        Seleccione una hora en punto. La hora fin se calculará automáticamente según los servicios seleccionados
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Hora Fin (Calculada automáticamente)</Form.Label>
                      <Form.Control
                        type="text"
                        name="horaFin"
                        value={formData.horaFin ? convertTo12HourFormat(formData.horaFin) : ''}
                        disabled
                        style={{ 
                          fontSize: '16px',
                          padding: '12px',
                          borderRadius: '8px',
                          backgroundColor: '#f8f9fa',
                          cursor: 'not-allowed'
                        }}
                      />
                      {formData.horaFin && selectedServices.length > 0 && (
                        <Form.Text className="text-success">
                          Duración total: {selectedServices.reduce((sum, s) => {
                            const serviceData = services.find(sv => sv.id === parseInt(s.serviceId));
                            return sum + (serviceData ? serviceData.time : 0);
                          }, 0)} minutos
                        </Form.Text>
                      )}
                    </Form.Group>

                    {/* Mostrar conflictos si existen */}
                    {conflicts.length > 0 && (
                      <Alert variant="warning" className="mt-3">
                        <Alert.Heading>
                          <FaExclamationTriangle /> Conflictos de Horario Detectados
                        </Alert.Heading>
                        <p>Se encontraron {conflicts.length} conflicto(s) de horario:</p>
                        <ul className="mb-0">
                          {conflicts.map((conflict, idx) => (
                            <li key={idx} className="mb-2">
                              <Badge bg={conflict.conflictType === 'Misma hora exacta' ? 'danger' : 'warning'} className="mb-2">
                                {conflict.conflictType}
                              </Badge>
                              <br />
                              <strong>Empleado:</strong> {conflict.empleadoName}<br />
                              <strong>Cliente:</strong> {conflict.clientName}<br />
                              <strong>Servicio:</strong> {conflict.serviceName}<br />
                              <strong>Horario:</strong> {convertTo12HourFormat(conflict.startTime)} - {convertTo12HourFormat(conflict.endTime)}
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                className="ms-2"
                                onClick={() => {
                                  setConflictAppointment(conflict);
                                  setShowConflictModal(true);
                                }}
                              >
                                <FaEdit /> Ver/Editar
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </Alert>
                    )}

                    {/* Cita Fija */}
                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        label="Cita Fija (Repetir cita)"
                        name="citaFija"
                        checked={formData.citaFija}
                        onChange={handleInputChange}
                      />
                      {formData.citaFija && (
                        <div className="mt-3 p-3 bg-light rounded">
                          <Form.Group className="mb-2">
                            <Form.Label>Frecuencia</Form.Label>
                            <Form.Select
                              name="frecuencia"
                              value={formData.frecuencia}
                              onChange={handleInputChange}
                            >
                              <option value="semanal">Semanal (cada 7 días)</option>
                              <option value="quincenal">Quincenal (cada 15 días)</option>
                              <option value="mensual">Mensual (cada 30 días)</option>
                            </Form.Select>
                          </Form.Group>
                          <Form.Group>
                            <Form.Label>Cantidad de citas a crear</Form.Label>
                            <Form.Control
                              type="number"
                              name="cantidadCitas"
                              value={formData.cantidadCitas}
                              onChange={handleInputChange}
                              min="1"
                              max="52"
                            />
                            <Form.Text className="text-muted">
                              Se crearán {formData.cantidadCitas} citas {formData.frecuencia === 'semanal' ? 'semanales' : formData.frecuencia === 'quincenal' ? 'quincenales' : 'mensuales'} a partir de la fecha seleccionada
                            </Form.Text>
                          </Form.Group>
                        </div>
                      )}
                    </Form.Group>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Servicios */}
              <div className='col-md-6'>
                <div className='card-detail shadow border-0 mb-4'>
                  <div className="cont-title w-100 p-4">
                    <span className='Title' style={{ fontSize: '18px', fontWeight: 600 }}>Servicios</span>
                  </div>
                  <div className='p-4'>
                    {selectedServices.length === 0 ? (
                      <div className="text-center p-4 text-muted">
                        <p>No hay servicios agregados. Haz clic en "Agregar Servicio" para comenzar.</p>
                      </div>
                    ) : (
                      <div className='services-table-wrapper'>
                        <div className='table-responsive services-table-container'>
                          <table className='table table-bordered table-hover services-table'>
                            <thead className='table-light'>
                              <tr>
                                <th style={{ padding: '16px', fontSize: '15px', fontWeight: 600, width: '35%' }}>Servicio</th>
                                <th style={{ padding: '16px', fontSize: '15px', fontWeight: 600, width: '30%' }}>Empleado</th>
                                <th style={{ padding: '16px', fontSize: '15px', fontWeight: 600, width: '20%' }}>Precio</th>
                                <th style={{ padding: '16px', fontSize: '15px', fontWeight: 600, width: '15%' }}>Acción</th>
                              </tr>
                            </thead>
                          <tbody>
                            {selectedServices.map((service, index) => {
                              const serviceData = services.find(s => s.id === parseInt(service.serviceId));
                              return (
                                <tr key={index}>
                                  <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                                    <Form.Select
                                      value={service.serviceId}
                                      onChange={(e) => handleServiceChange(index, 'serviceId', e.target.value)}
                                      required
                                      className="service-select"
                                      style={{
                                        fontSize: '15px',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        width: '100%',
                                        minHeight: '44px'
                                      }}
                                    >
                                      <option value="">Seleccionar servicio</option>
                                      {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                      ))}
                                    </Form.Select>
                                  </td>
                                  <td style={{ padding: '14px', verticalAlign: 'middle' }}>
                                    <Form.Select
                                      value={service.empleadoId}
                                      onChange={(e) => handleServiceChange(index, 'empleadoId', e.target.value)}
                                      required
                                      className="employee-select"
                                      style={{
                                        fontSize: '15px',
                                        padding: '10px 16px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        width: '100%',
                                        minHeight: '44px'
                                      }}
                                    >
                                      <option value="">Seleccionar empleado</option>
                                      {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                      ))}
                                    </Form.Select>
                                  </td>
                                  <td style={{ padding: '14px', verticalAlign: 'middle', fontSize: '15px', fontWeight: 500 }}>
                                    {serviceData ? `$${serviceData.price.toLocaleString()}` : '-'}
                                  </td>
                                  <td style={{ padding: '14px', verticalAlign: 'middle', textAlign: 'center' }}>
                                    <Button 
                                      variant="contained"
                                      color='error' 
                                      size="large"
                                      onClick={() => handleRemoveService(index)}
                                      sx={{
                                        padding: '12px 16px',
                                        minWidth: '56px',
                                        minHeight: '56px',
                                        backgroundColor: '#d32f2f',
                                        '&:hover': {
                                          backgroundColor: '#b71c1c',
                                        },
                                        boxShadow: '0 2px 8px rgba(211, 47, 47, 0.3)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      title="Eliminar servicio"
                                    >
                                      <IoTrashSharp style={{ fontSize: '22px', display: 'block' }} />
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        </div>
                      </div>
                    )}
                    <div className="d-flex justify-content-start mt-4 mb-3">
                      <Button
                        onClick={handleAddService}
                        variant="contained"
                        color="success"
                        startIcon={<FaPlus />}
                        sx={{
                          padding: '12px 24px',
                          fontSize: '16px',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: '8px',
                          gap: '8px'
                        }}
                      >
                        Agregar Servicio
                      </Button>
                    </div>
                    <div className='d-flex align-items-center justify-content-end mt-4 p-3 bg-light rounded'>
                      <span className='valor' style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1976d2' }}>
                        Total: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className='d-flex justify-content-end gap-2 p-3'>
              <Button
                variant="outlined"
                onClick={() => navigate('/appointment')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Registrar Cita
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Modal de conflicto */}
      <Modal show={showConflictModal} onHide={() => setShowConflictModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="text-warning me-2" />
            Conflicto de Horario
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {conflictAppointment && (
            <div>
              <Alert variant="warning">
                Ya existe una cita programada en este horario:
              </Alert>
              <div className="p-3 bg-light rounded">
                <p><strong>Cliente:</strong> {conflictAppointment.clientName}</p>
                <p><strong>Empleado:</strong> {conflictAppointment.empleadoName}</p>
                <p><strong>Servicio:</strong> {conflictAppointment.serviceName}</p>
                <p><strong>Horario:</strong> {convertTo12HourFormat(conflictAppointment.startTime)} - {convertTo12HourFormat(conflictAppointment.endTime)}</p>
              </div>
              <div className="mt-3">
                <p className="text-muted">
                  Puedes editar esta cita existente o cambiar el horario de la nueva cita.
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outlined" onClick={() => setShowConflictModal(false)}>
            Cerrar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              if (conflictAppointment) {
                setShowConflictModal(false);
                navigate('/appointment');
                setTimeout(() => {
                  show_alerta(`Cita en conflicto ID: ${conflictAppointment.appointmentId}. Puedes editarla desde la lista de citas.`, 'info');
                }, 500);
              }
            }}
          >
            <FaEdit /> Ir a Lista de Citas
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar cita ocupada */}
      <Modal show={showEditAppointmentModal} onHide={() => setShowEditAppointmentModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="text-primary me-2" />
            Editar Cita
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAppointmentToEdit && (() => {
            const appointment = appointments.find(apt => apt.id === selectedAppointmentToEdit.appointmentId);
            if (!appointment) return <p>Cargando información de la cita...</p>;
            
            return (
              <div>
                <Alert variant="info" className="mb-4">
                  <strong>Cliente:</strong> {selectedAppointmentToEdit.clientName || 'Cliente Desconocido'}
                </Alert>
                
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label className="required">Fecha</Form.Label>
                    <Form.Control
                      type="date"
                      value={editAppointmentFormData.Date}
                      onChange={(e) => setEditAppointmentFormData({
                        ...editAppointmentFormData,
                        Date: e.target.value
                      })}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="required">Hora Inicio</Form.Label>
                    <Form.Control
                      type="time"
                      value={editAppointmentFormData.Init_Time}
                      onChange={(e) => {
                        const newInitTime = e.target.value;
                        setEditAppointmentFormData({
                          ...editAppointmentFormData,
                          Init_Time: newInitTime
                        });
                        
                        // Calcular hora fin automáticamente si hay servicios
                        if (appointment.saleInfo && appointment.saleInfo.services && appointment.saleInfo.services.length > 0) {
                          const totalDuration = appointment.saleInfo.services.reduce((sum, service) => {
                            const serviceData = services.find(s => s.id === parseInt(service.serviceId));
                            return sum + (serviceData ? serviceData.time : 0);
                          }, 0);
                          
                          if (totalDuration > 0 && newInitTime) {
                            const [hours, minutes] = newInitTime.split(':').map(Number);
                            const startTime = new Date(2000, 0, 1, hours, minutes);
                            const endTime = new Date(startTime.getTime() + totalDuration * 60000);
                            const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
                            setEditAppointmentFormData(prev => ({
                              ...prev,
                              Finish_Time: endTimeStr
                            }));
                          }
                        }
                      }}
                      required
                    />
                    <Form.Text className="text-muted">
                      Hora actual: {convertTo12HourFormat(appointment.Init_Time)}
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label className="required">Hora Fin</Form.Label>
                    <Form.Control
                      type="time"
                      value={editAppointmentFormData.Finish_Time}
                      onChange={(e) => setEditAppointmentFormData({
                        ...editAppointmentFormData,
                        Finish_Time: e.target.value
                      })}
                      required
                    />
                    <Form.Text className="text-muted">
                      Hora actual: {convertTo12HourFormat(appointment.Finish_Time)}
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Estado</Form.Label>
                    <Form.Select
                      value={editAppointmentFormData.status}
                      onChange={(e) => setEditAppointmentFormData({
                        ...editAppointmentFormData,
                        status: e.target.value
                      })}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Completada">Completada</option>
                      <option value="cancelada">Cancelada</option>
                    </Form.Select>
                  </Form.Group>
                </Form>
              </div>
            );
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outlined" 
            onClick={() => setShowEditAppointmentModal(false)}
            disabled={savingAppointment}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={async () => {
              if (!selectedAppointmentToEdit) return;
              
              // Validar campos
              if (!editAppointmentFormData.Date || !editAppointmentFormData.Init_Time || !editAppointmentFormData.Finish_Time) {
                show_alerta('Por favor, complete todos los campos requeridos', 'warning');
                return;
              }
              
              setSavingAppointment(true);
              
              try {
                const appointment = appointments.find(apt => apt.id === selectedAppointmentToEdit.appointmentId);
                if (!appointment) {
                  show_alerta('No se encontró la cita', 'error');
                  setSavingAppointment(false);
                  return;
                }
                
                // Normalizar horas antes de enviar
                const normalizeTimeForDB = (timeString) => {
                  if (!timeString) return '';
                  if (timeString.includes(':') && timeString.split(':').length === 3) {
                    return timeString;
                  }
                  if (timeString.includes(':') && timeString.split(':').length === 2) {
                    return timeString + ':00';
                  }
                  return timeString;
                };
                
                const normalizedInitTime = normalizeTimeForDB(editAppointmentFormData.Init_Time);
                const normalizedFinishTime = normalizeTimeForDB(editAppointmentFormData.Finish_Time);
                
                // Intentar obtener saleId desde las ventas si no está en saleInfo
                let saleId = null;
                if (appointment.saleInfo && appointment.saleInfo.saleId) {
                  saleId = appointment.saleInfo.saleId;
                } else {
                  // Buscar saleId desde las ventas
                  try {
                    const salesResponse = await axios.get(urlSales);
                    const salesData = salesResponse.data;
                    for (const sale of salesData) {
                      const hasAppointment = sale.SaleDetails?.some(detail => 
                        detail.appointmentId === selectedAppointmentToEdit.appointmentId
                      );
                      if (hasAppointment) {
                        saleId = sale.id;
                        break;
                      }
                    }
                  } catch (error) {
                    console.error('Error fetching sales:', error);
                  }
                }
                
                // Intentar actualizar a través de la venta si existe saleId
                let response;
                if (saleId) {
                  response = await axios.put(`${urlSales}/${saleId}/appointments/${selectedAppointmentToEdit.appointmentId}`, {
                    saleId: saleId,
                    appointmentData: {
                      id: selectedAppointmentToEdit.appointmentId,
                      Init_Time: normalizedInitTime,
                      Finish_Time: normalizedFinishTime,
                      Date: formatDateSafe(editAppointmentFormData.Date),
                      status: editAppointmentFormData.status
                    }
                  });
                } else {
                  // Fallback: actualizar directamente la cita
                  response = await axios.put(`${urlAppointments}/${selectedAppointmentToEdit.appointmentId}`, {
                    Init_Time: normalizedInitTime,
                    Finish_Time: normalizedFinishTime,
                    Date: formatDateSafe(editAppointmentFormData.Date),
                    status: editAppointmentFormData.status
                  });
                }
                
                // Verificar respuesta
                if (response && (response.status === 200 || response.status === 204 || (response.data && response.data.success !== false))) {
                  show_alerta('Cita actualizada exitosamente', 'success');
                  setShowEditAppointmentModal(false);
                  // Refrescar citas y slots ocupados
                  await getAppointments();
                  if (formData.fecha && allUsers.length > 0) {
                    updateOccupiedSlots();
                  }
                } else {
                  const errorMsg = response?.data?.message || 'Error al actualizar la cita';
                  show_alerta(errorMsg, 'error');
                }
              } catch (error) {
                console.error('Error updating appointment:', error);
                if (error.response?.status === 200) {
                  show_alerta('Cita actualizada exitosamente', 'success');
                  setShowEditAppointmentModal(false);
                  await getAppointments();
                  if (formData.fecha && allUsers.length > 0) {
                    updateOccupiedSlots();
                  }
                } else {
                  const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar la cita. Por favor, intente nuevamente.';
                  show_alerta(errorMessage, 'error');
                }
              } finally {
                setSavingAppointment(false);
              }
            }}
            disabled={savingAppointment}
          >
            {savingAppointment ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

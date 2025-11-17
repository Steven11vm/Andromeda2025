
import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import axios from 'axios';
import { MyContext } from '../../App';
import { Modal, Form, Table, Badge } from 'react-bootstrap';
import Button from '@mui/material/Button';
import { FaMoneyBillWave, FaEdit, FaTrash, FaEye, FaCalendarDay, FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa';
import { BsCalendar2DateFill, BsPlusSquareFill } from 'react-icons/bs';
import { IoSearch } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../components/PermissionCheck';
import { show_alerta } from '../../assets/functions';
import './appointment.css';

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor = theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3), 
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
});

const Appointment = () => {
    const urlUsers = 'https://andromeda-api.onrender.com/api/users';
    const urlAppointment = 'https://andromeda-api.onrender.com/api/appointment';
    const urlSales = 'https://andromeda-api.onrender.com/api/sales';
    const navigate = useNavigate();
    const { isToggleSidebar } = useContext(MyContext);
    
    const [appointments, setAppointments] = useState([]);
    const [users, setUsers] = useState([]);
    const [sales, setSales] = useState([]);
    const [selectedView, setSelectedView] = useState('day'); // 'day', 'week', 'month'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedClient, setSelectedClient] = useState('');
    const [clientSearchTerm, setClientSearchTerm] = useState('');
    const [filteredClients, setFilteredClients] = useState([]);
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const clientSearchRef = useRef(null);
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [detailData, setDetailData] = useState({});
    const [saleDetails, setSaleDetails] = useState({ success: true, data: [], saleInfo: {} });
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [selectedSaleId, setSelectedSaleId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        Init_Time: '',
        Finish_Time: '',
        Date: '',
        status: ''
    });
    const permissions = usePermissions();

    useEffect(() => {
        const roleId = localStorage.getItem('roleId');
        const currentUserId = localStorage.getItem('userId');
        setUserRole(roleId);
        setUserId(currentUserId || '');
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const [userResponse, appointmentResponse, salesResponse] = await Promise.all([
                axios.get(urlUsers),
                axios.get(urlAppointment),
                axios.get(urlSales)
            ]);

            const usersData = userResponse.data;
            const appointmentData = appointmentResponse.data;
            const salesData = salesResponse.data;

            setUsers(usersData);
            setSales(salesData);

            // Mapear empleados y saleId a citas
            const appointmentEmployeeMap = {};
            const appointmentSaleMap = {};
            salesData.forEach(sale => {
                sale.SaleDetails.forEach(detail => {
                    if (detail.appointmentId && detail.empleadoId) {
                        appointmentEmployeeMap[detail.appointmentId] = detail.empleadoId;
                    }
                    if (detail.appointmentId) {
                        appointmentSaleMap[detail.appointmentId] = sale.id;
                    }
                });
            });

            // Transformar datos de citas
            let transformedAppointments = appointmentData.map(appointment => ({
                id: appointment.id,
                clienteId: appointment.clienteId,
                Date: appointment.Date,
                Init_Time: appointment.Init_Time,
                Finish_Time: appointment.Finish_Time,
                status: appointment.status,
                Total: appointment.Total,
                time_appointment: appointment.time_appointment,
                empleadoId: appointmentEmployeeMap[appointment.id],
                saleId: appointmentSaleMap[appointment.id]
            }));

            // Filtrar por rol
            const currentUserRole = userRole || localStorage.getItem('roleId');
            const currentUserId = userId || localStorage.getItem('userId') || '';
            
            if (currentUserRole === '2' && currentUserId) {
                transformedAppointments = transformedAppointments.filter(apt =>
                    apt.empleadoId?.toString() === currentUserId
                );
            }

            // No filtrar por cliente aquí, se hará en getFilteredAppointments
            // Esto permite ver todas las citas cuando no hay filtro de cliente

            setAppointments(transformedAppointments);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [userRole, userId]);

    useEffect(() => {
        fetchData();
    }, [fetchData, selectedDate, selectedView]);

    // Filtrar clientes según el término de búsqueda
    useEffect(() => {
        if (clientSearchTerm.trim() === '') {
            setFilteredClients([]);
            setShowClientDropdown(false);
            setSelectedClient('');
        } else {
            const filtered = FiltrarUsers().filter(user =>
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

    const getUserName = (clienteId) => {
        const user = users.find(user => user.id === clienteId);
        return user ? user.name : 'Desconocido';
    };

    const getStatusBadge = (status) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower === 'completada') {
            return <Badge bg="success">{status}</Badge>;
        } else if (statusLower === 'cancelada') {
            return <Badge bg="danger">{status}</Badge>;
        } else {
            return <Badge bg="warning">{status || 'Pendiente'}</Badge>;
        }
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

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = parseDateSafe(dateString);
        if (!date || isNaN(date.getTime())) return '';
        
        return date.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
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

    // Función para convertir hora de BD al formato del input time (HH:MM)
    const formatTimeForInput = (timeString) => {
        if (!timeString) return '';
        
        // Si viene en formato HH:MM:SS, tomar solo HH:MM
        if (timeString.includes(':')) {
            const parts = timeString.split(':');
            if (parts.length >= 2) {
                const hours = parts[0].padStart(2, '0');
                const minutes = parts[1].padStart(2, '0');
                return `${hours}:${minutes}`;
            }
        }
        
        // Si es un timestamp, parsearlo
        if (timeString.includes('T') || timeString.includes('Z')) {
            try {
                const date = new Date(timeString);
                if (!isNaN(date.getTime())) {
                    const hours = date.getHours().toString().padStart(2, '0');
                    const minutes = date.getMinutes().toString().padStart(2, '0');
                    return `${hours}:${minutes}`;
                }
            } catch (e) {
                console.error('Error parsing time:', e);
            }
        }
        
        return '';
    };

    const getFilteredAppointments = () => {
        let filtered = appointments;

        // Filtrar por cliente si está seleccionado
        if (selectedClient) {
            filtered = filtered.filter(apt =>
                apt.clienteId.toString() === selectedClient
            );
        }

        // Filtrar por vista (día, semana, mes)
        if (selectedView === 'day') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const normalizedSelectedDate = new Date(selectedDate);
            normalizedSelectedDate.setHours(0, 0, 0, 0);

            filtered = filtered.filter(apt => {
                const aptDate = parseDateSafe(apt.Date);
                if (!aptDate || isNaN(aptDate.getTime())) return false;
                aptDate.setHours(0, 0, 0, 0);
                return aptDate.getTime() === normalizedSelectedDate.getTime();
            });
        } else if (selectedView === 'week') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            startOfWeek.setHours(0, 0, 0, 0);
            
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            filtered = filtered.filter(apt => {
                const aptDate = parseDateSafe(apt.Date);
                if (!aptDate || isNaN(aptDate.getTime())) return false;
                return aptDate >= startOfWeek && aptDate <= endOfWeek;
            });
        } else if (selectedView === 'month') {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            startOfMonth.setHours(0, 0, 0, 0);
            
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            endOfMonth.setHours(23, 59, 59, 999);

            filtered = filtered.filter(apt => {
                const aptDate = parseDateSafe(apt.Date);
                if (!aptDate || isNaN(aptDate.getTime())) return false;
                return aptDate >= startOfMonth && aptDate <= endOfMonth;
            });
        }

        // Ordenar por fecha y hora
        return filtered.sort((a, b) => {
            const dateA = parseDateSafe(a.Date);
            const dateB = parseDateSafe(b.Date);
            
            if (!dateA || !dateB) return 0;
            
            const dateCompare = dateA.getTime() - dateB.getTime();
            if (dateCompare !== 0) return dateCompare;
            
            const timeA = formatTime(a.Init_Time);
            const timeB = formatTime(b.Init_Time);
            
            if (timeA && timeB) {
                const [hoursA, minutesA] = timeA.split(':').map(Number);
                const [hoursB, minutesB] = timeB.split(':').map(Number);
                return (hoursA * 60 + minutesA) - (hoursB * 60 + minutesB);
            }
            
            return 0;
        });
    };

    const handleClientSearch = (e) => {
        const value = e.target.value;
        setClientSearchTerm(value);
        if (!value) {
            setSelectedClient('');
        }
    };

    const selectClient = (client) => {
        setSelectedClient(client.id.toString());
        setClientSearchTerm(client.name);
        setShowClientDropdown(false);
    };

    const clearClientFilter = () => {
        setSelectedClient('');
        setClientSearchTerm('');
        setShowClientDropdown(false);
    };

    const handleViewDetails = async (appointment) => {
        setDetailData({
            title: getUserName(appointment.clienteId),
            Date: appointment.Date,
            Init_Time: appointment.Init_Time,
            Finish_Time: appointment.Finish_Time,
            status: appointment.status,
            time_appointment: appointment.time_appointment,
            Total: appointment.Total
        });
        
        try {
            const response = await axios.get(`${urlAppointment}/sale-details/${appointment.id}`);
            setSaleDetails({
                success: response.data.success,
                data: response.data.data,
                saleInfo: response.data.data[0]?.saleInfo || {}
            });
        } catch (error) {
            console.error('Error fetching sale details:', error);
            setSaleDetails({ success: false, data: [], saleInfo: {} });
        }    
        
        setShowDetailModal(true);
    };

    const handleEdit = (appointment) => {
        setSelectedAppointmentId(appointment.id);
        setSelectedSaleId(appointment.saleId);
        
        // Normalizar fecha - asegurar formato YYYY-MM-DD sin problemas de zona horaria
        let appointmentDate = appointment.Date;
        if (appointmentDate.includes('T')) {
            appointmentDate = appointmentDate.split('T')[0];
        }
        
        // Asegurar que la fecha esté en formato correcto
        const dateObj = parseDateSafe(appointmentDate);
        if (dateObj && !isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
            const day = dateObj.getDate().toString().padStart(2, '0');
            appointmentDate = `${year}-${month}-${day}`;
        }
        
        // Usar formatTimeForInput para asegurar formato correcto para el input type="time"
        setEditFormData({
            Init_Time: formatTimeForInput(appointment.Init_Time),
            Finish_Time: formatTimeForInput(appointment.Finish_Time),
            Date: appointmentDate,
            status: appointment.status || 'Pendiente'
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        try {
            // Validar que los campos requeridos estén llenos
            if (!editFormData.Date || !editFormData.Init_Time || !editFormData.Finish_Time) {
                show_alerta('Por favor, complete todos los campos requeridos', 'warning');
                return;
            }

            // Normalizar horas antes de enviar - asegurar formato HH:MM:SS
            const normalizeTimeForDB = (timeString) => {
                if (!timeString) return '';
                // Si ya tiene formato HH:MM:SS, devolverlo
                if (timeString.includes(':') && timeString.split(':').length === 3) {
                    return timeString;
                }
                // Si tiene formato HH:MM, agregar :00
                if (timeString.includes(':') && timeString.split(':').length === 2) {
                    return timeString + ':00';
                }
                return timeString;
            };

            const normalizedInitTime = normalizeTimeForDB(editFormData.Init_Time);
            const normalizedFinishTime = normalizeTimeForDB(editFormData.Finish_Time);

            let response;
            // Intentar actualizar a través de la venta si existe saleId
            if (selectedSaleId) {
                response = await axios.put(`${urlSales}/${selectedSaleId}/appointments/${selectedAppointmentId}`, {
                    saleId: selectedSaleId,
                    appointmentData: {
                        id: selectedAppointmentId,
                        Init_Time: normalizedInitTime,
                        Finish_Time: normalizedFinishTime,
                        Date: editFormData.Date,
                        status: editFormData.status
                    }
                });
            } else {
                // Fallback: actualizar directamente la cita
                response = await axios.put(`${urlAppointment}/${selectedAppointmentId}`, {
                    Init_Time: normalizedInitTime,
                    Finish_Time: normalizedFinishTime,
                    Date: editFormData.Date,
                    status: editFormData.status
                });
            }

            // Verificar respuesta - considerar éxito si el status es 200 o 204, o si no hay error explícito
            if (response && (response.status === 200 || response.status === 204 || (response.data && response.data.success !== false))) {
                setShowEditModal(false);
                await fetchData();
                show_alerta('Cita actualizada exitosamente', 'success');
            } else {
                const errorMsg = response?.data?.message || 'Error al actualizar la cita';
                show_alerta(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Error updating appointment:', error);
            // Si el error es 200, considerar éxito (algunos servidores devuelven 200 con error en el body)
            if (error.response?.status === 200) {
                setShowEditModal(false);
                await fetchData();
                show_alerta('Cita actualizada exitosamente', 'success');
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar la cita. Por favor, intente nuevamente.';
                show_alerta(errorMessage, 'error');
            }
        }
    };

    const handleCancel = (appointmentId) => {
        setSelectedAppointmentId(appointmentId);
        setShowCancelModal(true);
    };

    const confirmCancel = async () => {
        try {
            const response = await axios.put(`${urlAppointment}/${selectedAppointmentId}/status`, {
                status: "cancelada"
            });
            
            // Considerar éxito si el status es 200/204, o si no hay error explícito en el body
            if (response && (response.status === 200 || response.status === 204 || (response.data && response.data.success !== false))) {
                setShowCancelModal(false);
                await fetchData();
                show_alerta('Cita cancelada exitosamente', 'success');
            } else {
                // Si la respuesta indica error, mostrar mensaje
                const errorMsg = response?.data?.message || 'Error al cancelar la cita';
                show_alerta(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Error canceling appointment:', error);
            // Si el error es 200, considerar éxito (algunos servidores devuelven 200 con error en el body)
            if (error.response?.status === 200) {
                setShowCancelModal(false);
                await fetchData();
                show_alerta('Cita cancelada exitosamente', 'success');
            } else {
                // Intentar actualizar de todas formas si el error no es crítico
                const statusCode = error.response?.status;
                if (statusCode && statusCode < 500) {
                    // Errores 4xx pueden ser de validación, pero intentar actualizar la UI
                    setShowCancelModal(false);
                    await fetchData();
                    show_alerta('La cita puede haber sido cancelada. Por favor, verifique el estado.', 'warning');
                } else {
                    const errorMessage = error.response?.data?.message || error.message || 'Error al cancelar la cita';
                    show_alerta(errorMessage, 'error');
                }
            }
        }
    };

    const handleComplete = async (appointmentId) => {
        try {
            const response = await axios.put(`${urlAppointment}/${appointmentId}/status`, {
                status: "Completada"
            });
            
            // Considerar éxito si el status es 200/204, o si no hay error explícito en el body
            if (response && (response.status === 200 || response.status === 204 || (response.data && response.data.success !== false))) {
                await fetchData();
                show_alerta('Cita completada exitosamente', 'success');
            } else {
                const errorMsg = response?.data?.message || 'Error al completar la cita';
                show_alerta(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Error completing appointment:', error);
            // Si el error es 200, considerar éxito (algunos servidores devuelven 200 con error en el body)
            if (error.response?.status === 200) {
                await fetchData();
                show_alerta('Cita completada exitosamente', 'success');
            } else {
                // Intentar actualizar de todas formas si el error no es crítico
                const statusCode = error.response?.status;
                if (statusCode && statusCode < 500) {
                    // Errores 4xx pueden ser de validación, pero intentar actualizar la UI
                    await fetchData();
                    show_alerta('La cita puede haber sido completada. Por favor, verifique el estado.', 'warning');
                } else {
                    const errorMessage = error.response?.data?.message || error.message || 'Error al completar la cita';
                    show_alerta(errorMessage, 'error');
                }
            }
        }
    };

    const FiltrarUsers = () => {
        return users.filter(user => user.roleId === 3);
    };

    const filteredAppointments = getFilteredAppointments();

    return (
        <div className="right-content w-100">
            <div className="row d-flex align-items-center w-100">
                <div className="spacing d-flex align-items-center">
                    <div className='col-sm-5'>
                        <span className='Title'>Citas</span>
                    </div>
                    <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
                        <div role="presentation">
                            <Breadcrumbs aria-label="breadcrumb">
                                <StyledBreadcrumb
                                    component="a"
                                    href="#"
                                    label="Home"
                                    icon={<HomeIcon fontSize="small" />}
                                />
                                <StyledBreadcrumb
                                    component="a"
                                    href="#"
                                    label="Salidas"
                                    icon={<FaMoneyBillWave fontSize="small" />}
                                />
                                <StyledBreadcrumb
                                    component="a"
                                    href="#"
                                    label="Citas"
                                    icon={<BsCalendar2DateFill fontSize="small" />}
                                />
                            </Breadcrumbs>
                        </div>
                    </div>
                </div>
                <div className='card shadow border-0'>
                    <div className='d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3'>
                        <div className='d-flex gap-3 flex-wrap align-items-center'>
                            <Button
                                className='btn-register'
                                onClick={() => navigate('/appointmentRegister')}
                                variant="contained"
                                color="primary"
                                sx={{ 
                                    padding: '12px 24px',
                                    fontSize: '16px',
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    gap: '8px'
                                }}
                            >
                                <BsPlusSquareFill style={{ fontSize: '18px' }} /> Registrar Cita
                            </Button>
                            
                            <div className="btn-group appointment-view-buttons" role="group">
                                <Button
                                    variant={selectedView === 'day' ? 'contained' : 'outlined'}
                                    color={selectedView === 'day' ? 'primary' : 'inherit'}
                                    onClick={() => setSelectedView('day')}
                                    sx={{
                                        padding: '10px 20px',
                                        fontSize: '15px',
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        borderRadius: '8px 0 0 8px',
                                        borderRight: 'none',
                                        gap: '6px',
                                        minWidth: '100px'
                                    }}
                                >
                                    <FaCalendarDay style={{ fontSize: '16px' }} /> DÍA
                                </Button>
                                <Button
                                    variant={selectedView === 'week' ? 'contained' : 'outlined'}
                                    color={selectedView === 'week' ? 'primary' : 'inherit'}
                                    onClick={() => setSelectedView('week')}
                                    sx={{
                                        padding: '10px 20px',
                                        fontSize: '15px',
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        borderRadius: 0,
                                        borderRight: 'none',
                                        gap: '6px',
                                        minWidth: '120px'
                                    }}
                                >
                                    <FaCalendarWeek style={{ fontSize: '16px' }} /> SEMANA
                                </Button>
                                <Button
                                    variant={selectedView === 'month' ? 'contained' : 'outlined'}
                                    color={selectedView === 'month' ? 'primary' : 'inherit'}
                                    onClick={() => setSelectedView('month')}
                                    sx={{
                                        padding: '10px 20px',
                                        fontSize: '15px',
                                        fontWeight: 500,
                                        textTransform: 'none',
                                        borderRadius: '0 8px 8px 0',
                                        gap: '6px',
                                        minWidth: '100px'
                                    }}
                                >
                                    <FaCalendarAlt style={{ fontSize: '16px' }} /> MES
                                </Button>
                            </div>

                            {selectedView === 'day' && (
                                <Form.Control
                                    type="date"
                                    value={selectedDate.toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    className="date-picker-input"
                                    style={{ 
                                        width: 'auto', 
                                        padding: '10px 16px',
                                        fontSize: '15px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd'
                                    }}
                                />
                            )}
                        </div>
                        
                        <div className="position-relative" ref={clientSearchRef} style={{ minWidth: '250px' }}>
                            <div className="position-relative">
                                <IoSearch className="position-absolute" style={{ 
                                    left: '12px', 
                                    top: '50%', 
                                    transform: 'translateY(-50%)', 
                                    color: '#6c757d',
                                    zIndex: 10,
                                    fontSize: '18px'
                                }} />
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar cliente..."
                                    value={clientSearchTerm}
                                    onChange={handleClientSearch}
                                    onFocus={() => {
                                        if (filteredClients.length > 0) {
                                            setShowClientDropdown(true);
                                        }
                                    }}
                                    style={{ 
                                        paddingLeft: '40px',
                                        paddingRight: selectedClient ? '40px' : '12px',
                                        fontSize: '15px',
                                        borderRadius: '8px',
                                        border: '1px solid #ddd',
                                        height: '42px'
                                    }}
                                />
                                {selectedClient && (
                                    <button
                                        onClick={clearClientFilter}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '18px',
                                            color: '#6c757d',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            zIndex: 10
                                        }}
                                        title="Limpiar filtro"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            {showClientDropdown && filteredClients.length > 0 && (
                                <div 
                                    className="position-absolute w-100 bg-white border rounded shadow-lg"
                                    style={{ 
                                        zIndex: 1000, 
                                        maxHeight: '250px', 
                                        overflowY: 'auto',
                                        marginTop: '4px',
                                        top: '100%',
                                        left: 0
                                    }}
                                >
                                    {filteredClients.map(client => (
                                        <div
                                            key={client.id}
                                            className="p-3 cursor-pointer"
                                            onClick={() => selectClient(client)}
                                            style={{
                                                cursor: 'pointer',
                                                borderBottom: '1px solid #eee',
                                                transition: 'background-color 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                        >
                                            <div className="fw-semibold" style={{ fontSize: '14px' }}>{client.name}</div>
                                            {client.email && (
                                                <div className="text-muted small" style={{ fontSize: '12px' }}>{client.email}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {selectedClient && (
                                <div className="mt-2">
                                    <Badge bg="primary" style={{ fontSize: '12px', padding: '4px 8px' }}>
                                        {clientSearchTerm}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Resumen de citas */}
                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', padding: '16px' }}>
                                <div className="d-flex align-items-center">
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: '#e3f2fd',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px'
                                    }}>
                                        <BsCalendar2DateFill style={{ color: '#1976d2', fontSize: '20px' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>
                                            {filteredAppointments.length}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6c757d' }}>Citas encontradas</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', padding: '16px' }}>
                                <div className="d-flex align-items-center">
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: '#fff3cd',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px'
                                    }}>
                                        <FaCalendarDay style={{ color: '#856404', fontSize: '18px' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>
                                            {filteredAppointments.filter(a => a.status?.toLowerCase() === 'pendiente').length}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6c757d' }}>Pendientes</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', padding: '16px' }}>
                                <div className="d-flex align-items-center">
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: '#d4edda',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px'
                                    }}>
                                        <span style={{ color: '#155724', fontSize: '20px', fontWeight: 'bold' }}>✓</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>
                                            {filteredAppointments.filter(a => a.status?.toLowerCase() === 'completada').length}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6c757d' }}>Completadas</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card border-0 shadow-sm" style={{ borderRadius: '12px', padding: '16px' }}>
                                <div className="d-flex align-items-center">
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: '#f8d7da',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '12px'
                                    }}>
                                        <span style={{ color: '#721c24', fontSize: '20px', fontWeight: 'bold' }}>×</span>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2c3e50' }}>
                                            {filteredAppointments.filter(a => a.status?.toLowerCase() === 'cancelada').length}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6c757d' }}>Canceladas</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='table-responsive mt-3'>
                        {filteredAppointments.length === 0 ? (
                            <div className="text-center p-5" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                                <BsCalendar2DateFill style={{ fontSize: '48px', color: '#95a5a6', marginBottom: '16px' }} />
                                <p className="text-muted" style={{ fontSize: '16px', margin: 0 }}>No hay citas programadas para esta vista</p>
                            </div>
                        ) : (
                            <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <Table hover responsive className="appointment-table mb-0" style={{ margin: 0 }}>
                                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Cliente</th>
                                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Fecha</th>
                                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Hora Inicio</th>
                                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Hora Fin</th>
                                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Duración</th>
                                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Total</th>
                                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6' }}>Estado</th>
                                            <th style={{ padding: '16px', fontSize: '14px', fontWeight: 600, color: '#495057', borderBottom: '2px solid #dee2e6', textAlign: 'center' }}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAppointments.map((appointment, index) => (
                                            <tr 
                                                key={appointment.id}
                                                style={{ 
                                                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa',
                                                    transition: 'background-color 0.2s'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8f9fa'}
                                            >
                                                <td style={{ padding: '16px', fontSize: '14px', verticalAlign: 'middle', fontWeight: 500 }}>{getUserName(appointment.clienteId)}</td>
                                                <td style={{ padding: '16px', fontSize: '14px', verticalAlign: 'middle', color: '#495057' }}>{formatDate(appointment.Date)}</td>
                                                <td style={{ padding: '16px', fontSize: '14px', verticalAlign: 'middle', color: '#495057', fontWeight: 500 }}>{convertTo12HourFormat(appointment.Init_Time)}</td>
                                                <td style={{ padding: '16px', fontSize: '14px', verticalAlign: 'middle', color: '#495057', fontWeight: 500 }}>{convertTo12HourFormat(appointment.Finish_Time)}</td>
                                                <td style={{ padding: '16px', fontSize: '14px', verticalAlign: 'middle', color: '#495057' }}>{appointment.time_appointment} min</td>
                                                <td style={{ padding: '16px', fontSize: '14px', verticalAlign: 'middle', fontWeight: 600, color: '#27ae60' }}>${appointment.Total?.toLocaleString() || '0'}</td>
                                                <td style={{ padding: '16px', verticalAlign: 'middle' }}>{getStatusBadge(appointment.status)}</td>
                                                <td style={{ padding: '16px', verticalAlign: 'middle', textAlign: 'center' }}>
                                                    <div className="d-flex gap-2 justify-content-center flex-wrap">
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => handleViewDetails(appointment)}
                                                            title="Ver detalles"
                                                            sx={{
                                                                padding: '6px 10px',
                                                                minWidth: '36px',
                                                                fontSize: '12px'
                                                            }}
                                                        >
                                                            <FaEye style={{ fontSize: '14px' }} />
                                                        </Button>
                                                        {appointment.status?.toLowerCase() !== 'cancelada' && 
                                                         appointment.status?.toLowerCase() !== 'completada' && (
                                                            <>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="warning"
                                                                    onClick={() => handleEdit(appointment)}
                                                                    title="Editar"
                                                                    sx={{
                                                                        padding: '6px 10px',
                                                                        minWidth: '36px',
                                                                        fontSize: '12px'
                                                                    }}
                                                                >
                                                                    <FaEdit style={{ fontSize: '14px' }} />
                                                                </Button>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="error"
                                                                    onClick={() => handleCancel(appointment.id)}
                                                                    title="Cancelar"
                                                                    sx={{
                                                                        padding: '6px 10px',
                                                                        minWidth: '36px',
                                                                        fontSize: '12px'
                                                                    }}
                                                                >
                                                                    <FaTrash style={{ fontSize: '14px' }} />
                                                                </Button>
                                                                <Button
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="success"
                                                                    onClick={() => handleComplete(appointment.id)}
                                                                    title="Completar"
                                                                    sx={{
                                                                        padding: '6px 10px',
                                                                        minWidth: '36px',
                                                                        fontSize: '14px',
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                >
                                                                    ✓
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de Detalles */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Detalle de la venta y la cita <i className="fa fa-credit-card" aria-hidden="true"></i></Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">
                        <h5 className="border-bottom pb-2">Información de la cita</h5>
                        <div className="row">
                            <div className="col-md-6">
                                <p><strong>Cliente:</strong> {detailData.title}</p>
                                <p><strong>Fecha:</strong> {formatDate(detailData.Date)}</p>
                                <p><strong>Hora inicio:</strong> {convertTo12HourFormat(detailData.Init_Time)}</p>
                                <p><strong>Hora fin:</strong> {convertTo12HourFormat(detailData.Finish_Time)}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Duración de la cita:</strong> {detailData.time_appointment}<strong> Minutos</strong></p>
                                <p><strong>Total:</strong> ${detailData.Total?.toLocaleString() || '0'}</p>
                                <p><strong>Estado:</strong> {getStatusBadge(detailData.status)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h5 className="border-bottom pb-2">Detalle de la venta</h5>
                        {saleDetails.data && saleDetails.data.length > 0 ? (
                            <>
                                <div className="mb-3">
                                    <p><strong>Número de factura:</strong> {saleDetails.saleInfo.billNumber}</p>
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>Tipo</th>
                                                <th>Nombre</th>
                                                <th>Cantidad</th>
                                                <th>Precio unit</th>
                                                <th>Empleado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {saleDetails.data.map((detail, index) => (
                                                <tr key={index}>
                                                    <td>{detail.type}</td>
                                                    <td>{detail.name}</td>
                                                    <td>{detail.quantity}</td>
                                                    <td>${detail.price.toLocaleString()}</td>
                                                    <td>{detail.employeeName || '-'}</td>
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
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outlined" onClick={() => setShowDetailModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de Edición */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Cita</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label className="required">Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                value={editFormData.Date}
                                onChange={(e) => setEditFormData({ ...editFormData, Date: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="required">Hora Inicio</Form.Label>
                            <Form.Control
                                type="time"
                                value={editFormData.Init_Time}
                                onChange={(e) => setEditFormData({ ...editFormData, Init_Time: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="required">Hora Fin</Form.Label>
                            <Form.Control
                                type="time"
                                value={editFormData.Finish_Time}
                                onChange={(e) => setEditFormData({ ...editFormData, Finish_Time: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Estado</Form.Label>
                            <Form.Select
                                value={editFormData.status}
                                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            >
                                <option value="Pendiente">Pendiente</option>
                                <option value="Completada">Completada</option>
                                <option value="cancelada">Cancelada</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outlined" onClick={() => setShowEditModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSaveEdit}>
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de Confirmación de Cancelación */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Cancelación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>¿Está seguro de que desea cancelar esta cita?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outlined" onClick={() => setShowCancelModal(false)}>
                        No, mantener
                    </Button>
                    <Button variant="contained" color="error" onClick={confirmCancel}>
                        Sí, cancelar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Appointment;

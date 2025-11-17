'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMoneyBillWave, FaPlus, FaMinus } from "react-icons/fa";
import { IoSearch, IoTrashSharp } from "react-icons/io5";
import Button from '@mui/material/Button';
import { IoRefreshSharp } from 'react-icons/io5';

import Header from './Header1';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Form, Col, Row, Table } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { show_alerta } from '../../../assets/functions';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BsCalendar2DateFill } from 'react-icons/bs';
import CustomTimeSelector from '../../sales/registerSales/CustomTimeSelector/CustomTimeSelector';
import logo from '../../../assets/images/logo.png';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Scissors, Calendar, Clock, Trash2, Plus, Minus, Save, X, Eye, CheckCircle2, XCircle, AlertCircle, DollarSign } from 'lucide-react'
import { Modal } from 'react-bootstrap';

export default function Component() {
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [services, setServices] = useState([]);
    const [minTime, setMinTime] = useState("07:00");
    const [maxTime, setMaxTime] = useState("22:00");
    const [timeSlots, setTimeSlots] = useState([]);
    const [prevState, setPrevState] = useState([]);

    // Función auxiliar para obtener fecha de hoy sin problemas de zona horaria
    const getTodayDateStr = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState(null);
    const [saleInfo, setSaleInfo] = useState({
        Billnumber: '',
        SaleDate: getTodayDateStr(),
        total_price: 0,
        status: 'Pendiente',
        id_usuario: '',
        appointmentData: {
            Init_Time: '',
            Finish_Time: '',
            Date: getTodayDateStr(),
            time_appointment: 0
        },
        saleDetails: []
    });
    const [currentDate, setCurrentDate] = useState(getTodayDateStr());
    const [occupiedSlots, setOccupiedSlots] = useState([]);

    const [errors, setErrors] = useState({});
    const urlServices = 'https://andromeda-api.onrender.com/api/services';
    const urlUsers = 'https://andromeda-api.onrender.com/api/users';
    const [subtotalProducts, setSubtotalProducts] = useState(0);
    const [selectedProducts, setSelectedProducts] = useState(() => {
        const saved = localStorage.getItem('selectedProducts');
        return saved ? JSON.parse(saved) : [];
    });
    const [subtotalServices, setSubtotalServices] = useState(0);
    const [absences, setAbsences] = useState([]);
    const urlAbsences = 'https://andromeda-api.onrender.com/api/absences';
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 768);
    const [appointments, setAppointments] = useState([]);
    const [userAppointments, setUserAppointments] = useState([]);
    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [selectedAppointmentDetails, setSelectedAppointmentDetails] = useState(null);
    const [saleDetails, setSaleDetails] = useState({ success: true, data: [], saleInfo: {} });
    const urlAppointment = 'https://andromeda-api.onrender.com/api/appointment';

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = () => {
        const token = localStorage.getItem('jwtToken');
        const userId = localStorage.getItem('userId');

        if (token && userId) {
            setIsLoggedIn(true);
            setSaleInfo(prevState => ({ ...prevState, id_usuario: userId }));
            fetchInitialData(userId);
        } else {
            setIsLoggedIn(false);
            setLoading(false);
            show_alerta('No has iniciado sesión. Por favor, inicia sesión para crear una cita.', 'warning');
        }
    };

    const [state, setState] = useState({
        saleDetails: [],
        otherFields: {}
    });

    const generateTimeSlots = () => {
        const slots = [];
        const [minHour, minMinute] = minTime.split(':').map(Number);
        const [maxHour, maxMinute] = maxTime.split(':').map(Number);

        for (let hour = minHour; hour <= maxHour; hour++) {
            const startMinute = (hour === minHour) ? minMinute : 0;
            const endMinute = (hour === maxHour) ? maxMinute : 59;

            for (let minute = startMinute; minute <= endMinute; minute += 30) {
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                if (timeString <= maxTime) {
                    slots.push(timeString);
                }
            }
        }
        return slots;
    };

    const isSlotOccupied = (timeSlot) => {
        return occupiedSlots?.some(slot => {
            const slotStart = new Date(`${currentDate}T${slot.startTime}`);
            const slotEnd = new Date(`${currentDate}T${slot.endTime}`);
            const currentSlot = new Date(`${currentDate}T${timeSlot}`);
            return currentSlot >= slotStart && currentSlot < slotEnd;
        });
    };

    const isSlotInPast = (timeSlot) => {
        const now = new Date();
        const slotTime = new Date(`${currentDate}T${timeSlot}`);
        return slotTime < now;
    };

    const fetchInitialData = async (userId) => {
        try {
            await Promise.all([
                getUsers(),
                getProducts(),
                getServices(),
                getAbsences(),
                getAppointments(),
                getUserAppointments(userId)
            ]);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setLoading(false);
            show_alerta('Error al cargar los datos iniciales', 'error');
        }
    };

    const getUserAppointments = async (userId) => {
        try {
            const response = await axios.get(urlAppointment);
            const userAppts = response.data.filter(appointment => 
                appointment.clienteId && appointment.clienteId.toString() === userId.toString()
            );
            // Ordenar por fecha más reciente primero
            userAppts.sort((a, b) => {
                const dateA = new Date(a.Date + 'T' + a.Init_Time);
                const dateB = new Date(b.Date + 'T' + b.Init_Time);
                return dateB - dateA;
            });
            setUserAppointments(userAppts);
        } catch (error) {
            console.error('Error fetching user appointments:', error);
        }
    };

    const getSaleDetailsByAppointmentId = async (id) => {
        try {
            const response = await axios.get(`${urlAppointment}/sale-details/${id}`);
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

    const handleViewAppointmentDetails = async (appointment) => {
        setSelectedAppointmentDetails(appointment);
        await getSaleDetailsByAppointmentId(appointment.id);
        setShowAppointmentModal(true);
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

    const getStatusColor = (status) => {
        switch(status?.toLowerCase()) {
            case 'completada':
                return { bg: '#d4edda', text: '#155724', icon: CheckCircle2 };
            case 'cancelada':
                return { bg: '#f8d7da', text: '#721c24', icon: XCircle };
            case 'pendiente':
                return { bg: '#fff3cd', text: '#856404', icon: AlertCircle };
            default:
                return { bg: '#e2e3e5', text: '#383d41', icon: AlertCircle };
        }
    };


    useEffect(() => {
        const randomNumber = Math.floor(100 + Math.random() * 900).toString();
        setSaleInfo((prevState) => ({ ...prevState, Billnumber: randomNumber }));
    }, []);

    const getAbsences = async () => {
        try {
            const response = await axios.get(urlAbsences);
            setAbsences(response.data);
        } catch (error) {
            console.error("Error fetching absences:", error);
        }
    };

    const updateFinishTime = (startTime, duration) => {
        if (startTime) {
            // Normalizar startTime para asegurar formato HH:MM
            const normalizedStart = startTime.includes(':') 
                ? startTime.substring(0, 5) // Tomar solo HH:MM
                : startTime + ':00';
            
            const [hours, minutes] = normalizedStart.split(':').map(Number);
            
            // Crear fecha base para cálculos
            const baseDate = new Date(2000, 0, 1, hours, minutes);
            const endDate = new Date(baseDate.getTime() + duration * 60000);
            
            // Formatear hora fin en formato HH:MM:SS
            const endHours = endDate.getHours().toString().padStart(2, '0');
            const endMinutes = endDate.getMinutes().toString().padStart(2, '0');
            const endTime = `${endHours}:${endMinutes}:00`;

            setSaleInfo(prevState => ({
                ...prevState,
                appointmentData: {
                    ...prevState.appointmentData,
                    Finish_Time: endTime
                }
            }));
        }
    };

    const getUsers = async () => {
        const response = await axios.get(urlUsers);
        setUsers(response.data);
    };

    const getProducts = async () => {
        try {
            const response = await axios.get('https://andromeda-api.onrender.com/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
        }
    };

    const getServices = async () => {
        try {
            const response = await axios.get(urlServices);
            setServices(response.data);
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    };

    const getAppointments = async () => {
        try {
            const response = await axios.get('https://andromeda-api.onrender.com/api/appointment');
            setAppointments(response.data);
            updateOccupiedSlots(response.data);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        }
    };

    const updateOccupiedSlots = (appointmentsData) => {
        const userId = localStorage.getItem('userId');
        
        // Función auxiliar para normalizar fecha a YYYY-MM-DD
        const normalizeDate = (dateString) => {
            if (!dateString) return '';
            // Si tiene formato ISO con T, tomar solo la parte de fecha
            if (dateString.includes('T')) {
                return dateString.split('T')[0];
            }
            // Si ya es YYYY-MM-DD, devolverlo
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return dateString;
            }
            // Intentar parsear y formatear
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
        
        // Normalizar currentDate para comparación
        const normalizedCurrentDate = normalizeDate(currentDate);
        
        // Filtrar solo las citas del cliente logueado y las de la fecha seleccionada
        const occupied = appointmentsData
            .filter(appointment => {
                // Normalizar ambas fechas para comparación
                const appointmentDateNormalized = normalizeDate(appointment.Date);
                const isSameDate = appointmentDateNormalized === normalizedCurrentDate;
                
                const isSameClient = appointment.clienteId && appointment.clienteId.toString() === userId?.toString();
                return isSameDate && isSameClient;
            })
            .map(appointment => {
                // Normalizar horas usando formatTime para asegurar formato consistente
                const normalizedStartTime = formatTime(appointment.Init_Time) || appointment.Init_Time;
                const normalizedEndTime = formatTime(appointment.Finish_Time) || appointment.Finish_Time;
                
                // Asegurar formato HH:MM:SS para comparaciones
                const startTime = normalizedStartTime.includes(':') && normalizedStartTime.split(':').length === 2
                    ? normalizedStartTime + ':00'
                    : normalizedStartTime;
                const endTime = normalizedEndTime.includes(':') && normalizedEndTime.split(':').length === 2
                    ? normalizedEndTime + ':00'
                    : normalizedEndTime;
                
                return {
                    startTime: startTime,
                    endTime: endTime,
                    date: normalizeDate(appointment.Date)
                };
            });
        setOccupiedSlots(occupied);
    };

    const handleProductSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredProducts = products.filter(product =>
        product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedProducts.some(sp => sp.id === product.id)
    );

    useEffect(() => {
        setTimeSlots(generateTimeSlots());
    }, [minTime, maxTime]);

    useEffect(() => {
        // Sincronizar currentDate con la fecha del formulario al inicio
        if (saleInfo.appointmentData.Date && saleInfo.appointmentData.Date !== currentDate) {
            setCurrentDate(saleInfo.appointmentData.Date);
        }
    }, [saleInfo.appointmentData.Date]);

    useEffect(() => {
        // Actualizar slots ocupados cuando cambia la fecha o las citas
        if (appointments.length > 0) {
            updateOccupiedSlots(appointments);
        }
    }, [currentDate, appointments]);

    const addProduct = (product) => {
        const existingProduct = selectedProducts.find(p => p.id === product.id);
        if (existingProduct) {
            if (existingProduct.quantity + 1 > product.Stock) {
                show_alerta(`No hay suficiente stock para ${product.Product_Name}`, 'error');
                return;
            }
            const updatedProducts = selectedProducts.map(p =>
                p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
            );
            setSelectedProducts(updatedProducts);
            calculateTotals(updatedProducts, saleInfo.saleDetails);
        } else {
            const updatedProducts = [...selectedProducts, { ...product, quantity: 1 }];
            setSelectedProducts(updatedProducts);
            calculateTotals(updatedProducts, saleInfo.saleDetails);
        }
    };

    const removeProduct = (productId) => {
        const updatedProducts = selectedProducts.filter(p => p.id !== productId);
        setSelectedProducts(updatedProducts);
        calculateTotals(updatedProducts, saleInfo.saleDetails);
    };

    const validateAppointmentTime = () => {
        const now = new Date();
        const appointmentDate = new Date(saleInfo.appointmentData.Date);
        const appointmentTime = new Date(saleInfo.appointmentData.Date + 'T' + saleInfo.appointmentData.Init_Time);

        if (appointmentDate.toDateString() === now.toDateString()) {
            if (appointmentTime <= now) {
                return {
                    isValid: false,
                    message: 'No se puede elegir una hora anterior a la actual para citas en el mismo día'
                };
            }
        }

        const startTime = parseInt(saleInfo.appointmentData.Init_Time.split(':')[0]);
        // Validar rango: 7 AM a 10 PM, pero excluir 1 PM, 2 PM y 3 PM (almuerzo)
        if (startTime < 7 || startTime > 22) {
            return {
                isValid: false,
                message: 'Las citas solo se pueden agendar entre las 7:00 AM y las 10:00 PM'
            };
        }
        // Validar que no sea hora de almuerzo (13:00, 14:00 o 15:00) - de 1 PM a 3 PM
        if (startTime === 13 || startTime === 14 || startTime === 15) {
            return {
                isValid: false,
                message: 'No se pueden agendar citas entre la 1:00 PM y las 3:00 PM (hora de almuerzo)'
            };
        }

        return { isValid: true };
    };

    const validateAppointmentAvailability = () => {
        const userId = localStorage.getItem('userId');
        
        // Función auxiliar para normalizar fecha
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
        
        // Normalizar hora a formato HH:MM:SS
        const normalizeTime = (timeString) => {
            if (!timeString) return '';
            if (timeString.includes(':') && timeString.split(':').length === 3) {
                return timeString;
            }
            if (timeString.includes(':') && timeString.split(':').length === 2) {
                return timeString + ':00';
            }
            return timeString;
        };
        
        const selectedDateNormalized = normalizeDate(saleInfo.appointmentData.Date);
        const normalizedInitTime = normalizeTime(saleInfo.appointmentData.Init_Time);
        const normalizedFinishTime = normalizeTime(saleInfo.appointmentData.Finish_Time);
        
        const newAppointmentStart = new Date(`${selectedDateNormalized}T${normalizedInitTime}`);
        const newAppointmentEnd = new Date(`${selectedDateNormalized}T${normalizedFinishTime}`);

        // Filtrar solo las citas del mismo cliente y la misma fecha
        const clientAppointments = appointments.filter(appointment => {
            const appointmentDateNormalized = normalizeDate(appointment.Date);
            const isSameDate = appointmentDateNormalized === selectedDateNormalized;
            const isSameClient = appointment.clienteId && appointment.clienteId.toString() === userId?.toString();
            return isSameDate && isSameClient;
        });

        for (const appointment of clientAppointments) {
            const appointmentDateNormalized = normalizeDate(appointment.Date);
            const normalizedExistingInitTime = normalizeTime(formatTime(appointment.Init_Time) || appointment.Init_Time);
            const normalizedExistingFinishTime = normalizeTime(formatTime(appointment.Finish_Time) || appointment.Finish_Time);
            
            const existingStart = new Date(`${appointmentDateNormalized}T${normalizedExistingInitTime}`);
            const existingEnd = new Date(`${appointmentDateNormalized}T${normalizedExistingFinishTime}`);

            // Verificar solapamiento: cualquier intersección entre los rangos
            if (
                (newAppointmentStart >= existingStart && newAppointmentStart < existingEnd) ||
                (newAppointmentEnd > existingStart && newAppointmentEnd <= existingEnd) ||
                (newAppointmentStart <= existingStart && newAppointmentEnd >= existingEnd)
            ) {
                return {
                    isValid: false,
                    message: 'Ya tienes una cita registrada a esta misma hora. Por favor, selecciona otra hora.'
                };
            }
        }

        return { isValid: true };
    };

    const updateQuantity = (productId, change) => {
        const product = products.find(p => p.id === productId);
        const updatedProducts = selectedProducts.map(p => {
            if (p.id === productId) {
                const newQuantity = Math.max(1, p.quantity + change);
                if (newQuantity > product.Stock) {
                    Swal.fire('Error', `No hay suficiente stock para ${product.Product_Name}`, 'error');
                    return p;
                }
                return { ...p, quantity: newQuantity };
            }
            return p;
        });
        setSelectedProducts(updatedProducts);
        calculateTotals(updatedProducts, saleInfo.saleDetails);
    };

    const calculateTotals = (currentProducts, currentSaleDetails) => {
        const productDetails = currentProducts.map(product => ({
            quantity: product.quantity,
            unitPrice: product.Price,
            total_price: product.Price * product.quantity,
            id_producto: product.id,
            empleadoId: null,
            serviceId: null
        }));

        const productsSubtotal = productDetails.reduce((sum, item) => sum + item.total_price, 0);

        const serviceDetails = currentSaleDetails.filter(detail =>
            detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null)
        );

        const servicesSubtotal = serviceDetails.reduce((sum, detail) => {
            if (detail.serviceId) {
                const service = services.find(s => s.id === parseInt(detail.serviceId));
                return sum + (service ? service.price : 0);
            }
            return sum;
        }, 0);

        setSubtotalProducts(productsSubtotal);
        setSubtotalServices(servicesSubtotal);

        const totalDuration = serviceDetails.reduce((sum, detail) => {
            if (detail.serviceId) {
                const service = services.find(s => s.id === parseInt(detail.serviceId));
                return sum + (service ? service.time : 0);
            }
            return sum;
        }, 0);

        setSaleInfo(prevState => ({
            ...prevState,
            saleDetails: [...productDetails, ...serviceDetails],
            total_price: productsSubtotal + servicesSubtotal,
            appointmentData: {
                ...prevState.appointmentData,
                time_appointment: totalDuration
            }
        }));

        // Fix: Check if prevState.appointmentData exists before accessing Init_Time
        if (prevState.appointmentData && prevState.appointmentData.Init_Time) {
            updateFinishTime(prevState.appointmentData.Init_Time, totalDuration);
        }
    };

    const handleAddService = () => {
        setServices((prevState) => [
            ...prevState,
        ]);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setSaleInfo(prevState => {
            if (name === 'SaleDate') {
                return {
                    ...prevState,
                    [name]: value,
                    appointmentData: {
                        ...prevState.appointmentData,
                        Date: value
                    }
                };
            }
            return {
                ...prevState,
                [name]: value
            };
        });
        validateField(name, value);
    };

    const handleAppointmentChange = (event) => {
        const { name, value } = event.target;
        setSaleInfo(prevState => ({
            ...prevState,
            appointmentData: {
                ...prevState.appointmentData,
                [name]: value
            }
        }));

        if (name === 'Date') {
            setCurrentDate(value);
        }

        if (name === 'Init_Time') {
            updateFinishTime(value, saleInfo.appointmentData.time_appointment);
        }
    };

    const validateField = (fieldName, value) => {
        let error = '';

        switch (fieldName) {
            case 'Billnumber':
                if (!value || value.length === 0) {
                    error = 'El número de Comprobante es requerido';
                } else if (value.length !== 3) {
                    error = 'El número de Comprobante debe tener exactamente 3 dígitos';
                } else if (!/^\d+$/.test(value)) {
                    error = 'El número de Comprobante debe contener solo dígitos';
                }
                break;
            default:
                break;
        }

        setErrors(prevErrors => ({ ...prevErrors, [fieldName]: error }));
        return error;
    };

    const handleServiceRemove = (index) => {
        setSaleInfo(prevState => {
            const serviceDetails = prevState.saleDetails.filter(detail =>
                detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null)
            );

            const updatedServiceDetails = serviceDetails.filter((_, i) => i !== index);

            const productDetails = selectedProducts.map(product => ({
                quantity: product.quantity,
                unitPrice: product.Price,
                total_price: product.Price * product.quantity,
                id_producto: product.id,
                empleadoId: null,
                serviceId: null
            }));

            const allDetails = [...productDetails, ...updatedServiceDetails];
            const totalPrice = allDetails.reduce((sum, item) => sum + (item.total_price || 0), 0);

            return {
                ...prevState,
                saleDetails: allDetails,
                total_price: totalPrice
            };
        });
    };

    const validateEmployeeAvailability = () => {
        const appointmentDate = saleInfo.appointmentData.Date;
        const appointmentStart = saleInfo.appointmentData.Init_Time;
        const appointmentEnd = saleInfo.appointmentData.Finish_Time;

        const serviceDetails = saleInfo.saleDetails.filter(detail =>
            detail.serviceId !== null && detail.empleadoId !== null
        );

        for (const detail of serviceDetails) {
            const employee = users.find(user => user.id === parseInt(detail.empleadoId));
            if (!employee) continue;

            const hasAbsence = absences.some(absence =>
                absence.userId === parseInt(detail.empleadoId) &&
                absence.date === appointmentDate &&
                absence.startTime <= appointmentEnd &&
                absence.endTime >= appointmentStart
            );

            if (hasAbsence) {
                return {
                    isValid: false,
                    message: `El empleado ${employee.name} tiene una ausencia registrada para este horario`
                };
            }
        }

        return { isValid: true };
    };


    useEffect(() => {
        const handleResize = () => {
            setIsSmallScreen(window.innerWidth < 768);
        };
    
        window.addEventListener('resize', handleResize);
    
        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!isLoggedIn) {
            show_alerta('Debes iniciar sesión para crear una cita', 'warning');
            return;
        }

        // Validar campos requeridos
        const billnumberError = validateField('Billnumber', saleInfo.Billnumber);

        if (billnumberError || !saleInfo.Billnumber || saleInfo.Billnumber.length !== 3) {
            show_alerta('Por favor, corrija los errores antes de continuar', 'warning');
            return;
        }

        if (saleInfo.saleDetails.length === 0) {
            show_alerta('Debe agregar al menos un servicio', 'warning');
            return;
        }

        const hasServicesWithEmployees = saleInfo.saleDetails.some(detail =>
            detail.serviceId !== null && detail.empleadoId !== null
        );

        if (hasServicesWithEmployees) {
            if (!saleInfo.appointmentData.Init_Time ||
                !saleInfo.appointmentData.Finish_Time ||
                !saleInfo.appointmentData.Date) {
                show_alerta('Debe especificar el horario completo de la cita (fecha, hora inicio y hora fin) para los servicios', 'warning');
                return;
            }

            // Validar disponibilidad del empleado
            const { isValid: isEmployeeAvailable, message: employeeMessage } = validateEmployeeAvailability();
            if (!isEmployeeAvailable) {
                show_alerta(employeeMessage, 'error');
                return;
            }

            // Validar tiempo de la cita
            const { isValid: isTimeValid, message: timeMessage } = validateAppointmentTime();
            if (!isTimeValid) {
                show_alerta(timeMessage, 'error');
                return;
            }

            // Validar disponibilidad de la cita
            const { isValid: isAppointmentAvailable, message: appointmentMessage } = validateAppointmentAvailability();
            if (!isAppointmentAvailable) {
                show_alerta(appointmentMessage, 'error');
                return;
            }
        }

        // Función para formatear fecha sin problemas de zona horaria
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

        // Asegurarse de usar exactamente la fecha seleccionada sin problemas de zona horaria
        const selectedDateStr = formatDateSafe(saleInfo.appointmentData.Date);

        // Normalizar formato de horas a HH:MM:SS
        const normalizeTime = (timeString) => {
            if (!timeString) return '';
            // Si ya tiene formato HH:MM:SS, devolverlo tal cual
            if (timeString.includes(':') && timeString.split(':').length === 3) {
                return timeString;
            }
            // Si tiene formato HH:MM, agregar :00
            if (timeString.includes(':') && timeString.split(':').length === 2) {
                return timeString + ':00';
            }
            // Si solo tiene HH, agregar :00:00
            if (timeString.length === 2) {
                return timeString + ':00:00';
            }
            return timeString;
        };

        const normalizedInitTime = normalizeTime(saleInfo.appointmentData.Init_Time);
        const normalizedFinishTime = normalizeTime(saleInfo.appointmentData.Finish_Time);

        // Crear una copia del saleInfo para no modificar el estado original
        const saleInfoToSend = {
            ...saleInfo,
            SaleDate: selectedDateStr,
            appointmentData: {
                ...saleInfo.appointmentData,
                Date: selectedDateStr,
                Init_Time: normalizedInitTime,
                Finish_Time: normalizedFinishTime
            }
        };

        try {
            await axios.post('https://andromeda-api.onrender.com/api/sales', saleInfoToSend);
            show_alerta('Cita registrada con éxito', 'success');
            
            // Actualizar la lista de citas del usuario y las citas ocupadas
            const userId = localStorage.getItem('userId');
            if (userId) {
                await getUserAppointments(userId);
                // Recargar todas las citas para actualizar los slots ocupados
                await getAppointments();
            }
            
            // Limpiar localStorage
            localStorage.removeItem('selectedProducts');
            localStorage.removeItem('saleInfo');
            localStorage.removeItem('subtotalProducts');
            localStorage.removeItem('subtotalServices');
            
            // Función auxiliar para obtener fecha de hoy sin problemas de zona horaria
            const getTodayDateStr = () => {
                const today = new Date();
                const year = today.getFullYear();
                const month = (today.getMonth() + 1).toString().padStart(2, '0');
                const day = today.getDate().toString().padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            setSaleInfo({
                Billnumber: '',
                SaleDate: getTodayDateStr(),
                total_price: 0,
                status: 'Pendiente',
                id_usuario: saleInfo.id_usuario,
                appointmentData: {
                    Init_Time: '',
                    Finish_Time: '',
                    Date: getTodayDateStr(),
                    time_appointment: 0
                },
                saleDetails: []
            });
            setSelectedProducts([]);
            setSubtotalProducts(0);
            setSubtotalServices(0);

            // No navegar, solo mostrar las citas actualizadas
            // navigate('/appointmentView');
        } catch (error) {
            console.error('Error al registrar la cita:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error al registrar la cita';
            show_alerta(`Error: ${errorMessage}`, 'error');
        }
    };


    const handleServiceAdd = () => {
        setSaleInfo(prevState => {
            const serviceDetails = prevState.saleDetails.filter(detail =>
                detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null)
            );

            const newServiceDetail = {
                quantity: 1,
                unitPrice: 0,
                total_price: 0,
                id_producto: null,
                empleadoId: null,
                serviceId: null
            };

            const updatedServiceDetails = [...serviceDetails, newServiceDetail];

            const productDetails = selectedProducts.map(product => ({
                quantity: product.quantity,
                unitPrice: product.Price,
                total_price: product.Price * product.quantity,
                id_producto: product.id,
                empleadoId: null,
                serviceId: null
            }));

            return {
                ...prevState,
                saleDetails: [...productDetails, ...updatedServiceDetails]
            };
        });
    };

    const handleAddProduct = () => {
        setState((prevState) => {
            const productDetails = selectedProducts.map(product => ({
                quantity: product.quantity,
                unitPrice: product.Price,
                total_price: product.Price * product.quantity,
                id_producto: product.id,
                empleadoId: null,
                serviceId: null
            }));

            return {
                ...prevState,
                saleDetails: [...prevState.saleDetails, ...productDetails]
            };
        });
    };

    useEffect(() => {
        localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
    }, [selectedProducts]);

    const resetTableStates = () => {
        // Función auxiliar para obtener fecha de hoy sin problemas de zona horaria
        const getTodayDateStr = () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        setSaleInfo({
            ...saleInfo,
            appointmentData: {
                Date: getTodayDateStr(), // Reinicia la fecha a hoy sin problemas de zona horaria
                Init_Time: '',
                Finish_Time: '',
                time_appointment: 0,
            }
        });
        console.log('Tabla reiniciada');
    };

    const handleServiceChange = (index, field, value) => {
        setSaleInfo(prevState => {
            // Verificar si el servicio ya ha sido seleccionado en otro detalle
            if (field === 'serviceId') {
                const serviceAlreadySelected = prevState.saleDetails.some(
                    (detail, idx) => detail.serviceId === value && idx !== index
                );

                if (serviceAlreadySelected) {
                    // Usar SweetAlert2 para la alerta
                    Swal.fire({
                        icon: 'error',
                        title: 'Servicio ya seleccionado',
                        text: 'No puedes elegir el mismo servicio dos veces.',
                        confirmButtonText: 'Aceptar',
                        confirmButtonColor: '#d33',
                        background: '#f8d7da',
                        color: '#721c24',
                        iconColor: '#721c24',
                        showConfirmButton: true
                    });
                    return prevState; // Prevenir la actualización
                }
            }

            // Filtrar los detalles del servicio
            const serviceDetails = prevState.saleDetails.filter(detail =>
                detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null)
            );

            if (serviceDetails[index]) {
                serviceDetails[index] = { ...serviceDetails[index], [field]: value };

                if (field === 'serviceId') {
                    const service = services.find(s => s.id === parseInt(value));
                    if (service) {
                        serviceDetails[index].unitPrice = service.price;
                        serviceDetails[index].total_price = service.price;
                        serviceDetails[index].quantity = 1;
                        setSelectedService(service);
                    }
                }
            }

            // Crear detalles de productos
            const productDetails = selectedProducts.map(product => ({
                quantity: product.quantity,
                unitPrice: product.Price,
                total_price: product.Price * product.quantity,
                id_producto: product.id,
                empleadoId: null,
                serviceId: null
            }));

            const allDetails = [...productDetails, ...serviceDetails];

            // Calcular duración total
            const totalDuration = serviceDetails.reduce((sum, detail) => {
                if (detail.serviceId) {
                    const service = services.find(s => s.id === parseInt(detail.serviceId));
                    return sum + (service ? service.time : 0);
                }
                return sum;
            }, 0);

            // Calcular subtotales
            const productsSubtotal = productDetails.reduce((sum, item) => sum + item.total_price, 0);
            const servicesSubtotal = serviceDetails.reduce((sum, detail) => {
                if (detail.serviceId) {
                    const service = services.find(s => s.id === parseInt(detail.serviceId));
                    return sum + (service ? service.price : 0);
                }
                return sum;
            }, 0);

            setSubtotalProducts(productsSubtotal);
            setSubtotalServices(servicesSubtotal);

            // Actualizar hora de finalización
            updateFinishTime(prevState.appointmentData.Init_Time, totalDuration);

            return {
                ...prevState,
                saleDetails: allDetails,
                total_price: productsSubtotal + servicesSubtotal,
                appointmentData: {
                    ...prevState.appointmentData,
                    time_appointment: totalDuration
                }
            };
        });
    };


    const productDetails = selectedProducts.map(product => ({
        quantity: product.quantity,
        unitPrice: product.Price,
        total_price: product.Price * product.quantity,
        id_producto: product.id,
        empleadoId: null,
        serviceId: null
    }));

    const isTimeSlotOccupied = (date, time) => {
        return appointments.some(appointment =>
            appointment.Date === date &&
            appointment.Init_Time <= time &&
            appointment.Finish_Time > time
        );
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        if (hours > 0) {
            return `${hours} hora${hours > 1 ? 's' : ''} ${remainingMinutes > 0 ? `y ${remainingMinutes} minutos` : ''}`;
        }
        return `${minutes} minutos`;
    };

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

    if (!isLoggedIn) {
        return (
            <div>
                <p>Debes iniciar sesión para crear una cita.</p>
                {/* Add a login button or redirect to login page */}
            </div>
        );
    }

    return (
        <>
            <Header />
            <div style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
                <div className='container py-4'>
                    {/* Sección de Mis Citas */}
                    {userAppointments.length > 0 && (
                        <div className='mb-5'>
                            <div className='card border-0 shadow-sm' style={{ borderRadius: '12px' }}>
                                <div className="card-header border-0" style={{ 
                                    backgroundColor: '#2c3e50', 
                                    color: 'white', 
                                    borderRadius: '12px 12px 0 0',
                                    padding: '20px'
                                }}>
                                    <h4 className="mb-0 d-flex align-items-center">
                                        <Calendar size={24} className="me-2" />
                                        Mis Citas Registradas
                                    </h4>
                                </div>
                                <div className='card-body p-4'>
                                    <div className='row g-3'>
                                        {userAppointments.map((appointment) => {
                                            const statusStyle = getStatusColor(appointment.status);
                                            const StatusIcon = statusStyle.icon;
                                            return (
                                                <div key={appointment.id} className='col-md-6 col-lg-4'>
                                                    <div 
                                                        className='card border-0 shadow-sm h-100'
                                                        style={{ 
                                                            borderRadius: '12px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s ease',
                                                            borderLeft: `4px solid ${statusStyle.text}`
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(-5px)';
                                                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                                                        }}
                                                        onClick={() => handleViewAppointmentDetails(appointment)}
                                                    >
                                                        <div className='card-body p-3'>
                                                            <div className='d-flex justify-content-between align-items-start mb-2'>
                                                                <div style={{ 
                                                                    backgroundColor: statusStyle.bg, 
                                                                    color: statusStyle.text,
                                                                    padding: '4px 12px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '600',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    <StatusIcon size={12} />
                                                                    {appointment.status || 'Pendiente'}
                                                                </div>
                                                            </div>
                                                            <div className='mb-2'>
                                                                <div className='d-flex align-items-center mb-1' style={{ color: '#495057' }}>
                                                                    <Calendar size={16} className='me-2' />
                                                                    <small className='fw-semibold'>
                                                                        {appointment.Date ? appointment.Date.split('T')[0] : 'No disponible'}
                                                                    </small>
                                                                </div>
                                                                <div className='d-flex align-items-center mb-1' style={{ color: '#495057' }}>
                                                                    <Clock size={16} className='me-2' />
                                                                    <small>
                                                                        {convertTo12HourFormat(appointment.Init_Time)} - {convertTo12HourFormat(appointment.Finish_Time)}
                                                                    </small>
                                                                </div>
                                                                <div className='d-flex align-items-center mb-1' style={{ color: '#495057' }}>
                                                                    <Clock size={16} className='me-2' />
                                                                    <small>Duración: {appointment.time_appointment || 0} min</small>
                                                                </div>
                                                                <div className='d-flex align-items-center' style={{ color: '#27ae60' }}>
                                                                    <DollarSign size={16} className='me-2' />
                                                                    <strong>${appointment.Total?.toLocaleString() || '0'}</strong>
                                                                </div>
                                                            </div>
                                                            <button
                                                                className='btn btn-sm w-100 mt-2'
                                                                style={{
                                                                    backgroundColor: '#3498db',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.85rem',
                                                                    padding: '6px 12px'
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewAppointmentDetails(appointment);
                                                                }}
                                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
                                                            >
                                                                <Eye size={14} className='me-1' />
                                                                Ver Detalles
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className='row g-4'>
                        {/* Columna de Servicios y Productos */}
                        <div className='col-md-6'>
                            <div className='card border-0 shadow-sm mb-4' style={{ borderRadius: '12px' }}>
                                <div className="card-header border-0" style={{ 
                                    backgroundColor: '#2c3e50', 
                                    color: 'white', 
                                    borderRadius: '12px 12px 0 0',
                                    padding: '20px'
                                }}>
                                    <h5 className="mb-0 d-flex align-items-center">
                                        <Scissors size={20} className="me-2" />
                                        Servicios y Productos
                                    </h5>
                                </div>

                                <div className='card-body p-4'>
                                    {/* Servicios */}
                                    <h6 className="mb-3 fw-bold" style={{ color: '#495057' }}>Servicios</h6>
                                    <div className="table-responsive">
                                        <Table responsive className="mb-0" style={{ fontSize: '0.9rem' }}>
                                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                <tr>
                                                    <th style={{ fontWeight: '600', fontSize: '0.85rem' }}>Servicio</th>
                                                    <th style={{ fontWeight: '600', fontSize: '0.85rem' }}>Barbero</th>
                                                    <th style={{ fontWeight: '600', fontSize: '0.85rem' }}>Duración</th>
                                                    <th style={{ fontWeight: '600', fontSize: '0.85rem' }}>Precio</th>
                                                    <th style={{ fontWeight: '600', fontSize: '0.85rem', width: '80px' }}>Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {saleInfo.saleDetails
                                                    .filter(detail => detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null))
                                                    .map((detail, index) => (
                                                        <tr key={index} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                            <td>
                                                                <Form.Select
                                                                    value={detail.serviceId || ''}
                                                                    onChange={(e) => handleServiceChange(index, 'serviceId', e.target.value)}
                                                                    className="form-select form-select-sm"
                                                                    style={{ border: '1px solid #ced4da', borderRadius: '6px' }}
                                                                >
                                                                    <option value="">Seleccione...</option>
                                                                    {services.map(service => (
                                                                        <option key={service.id} value={service.id}>{service.name}</option>
                                                                    ))}
                                                                </Form.Select>
                                                            </td>
                                                            <td>
                                                                <Form.Select
                                                                    value={detail.empleadoId || ''}
                                                                    onChange={(e) => handleServiceChange(index, 'empleadoId', e.target.value)}
                                                                    className="form-select form-select-sm"
                                                                    style={{ border: '1px solid #ced4da', borderRadius: '6px' }}
                                                                >
                                                                    <option value="">Seleccione...</option>
                                                                    {users.filter(user => user.roleId === 2).map(employee => (
                                                                        <option key={employee.id} value={employee.id}>{employee.name}</option>
                                                                    ))}
                                                                </Form.Select>
                                                            </td>
                                                            <td className="text-muted">{detail.serviceId ? formatDuration(services.find(s => s.id === parseInt(detail.serviceId))?.time || 0) : '-'}</td>
                                                            <td className="fw-semibold">{detail.serviceId ? `$${services.find(s => s.id === parseInt(detail.serviceId))?.price.toFixed(2)}` : '-'}</td>
                                                            <td>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleServiceRemove(index)}
                                                                    variant="outline-danger"
                                                                    className="p-1"
                                                                    style={{ border: 'none', minWidth: '32px' }}
                                                                    title="Eliminar servicio"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                    <button
                                        className="btn w-100 mt-3 d-flex align-items-center justify-content-center"
                                        style={{ 
                                            backgroundColor: '#3498db', 
                                            color: 'white',
                                            borderRadius: '8px',
                                            border: 'none',
                                            padding: '10px',
                                            fontWeight: '500',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#2980b9'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#3498db'}
                                        onClick={handleServiceAdd}
                                    >
                                        <Plus size={18} className="me-2" />
                                        Agregar Servicio
                                    </button>

                                    {/* Productos */}
                                    <h6 className="mt-4 mb-3 fw-bold" style={{ color: '#495057' }}>Productos</h6>
                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            type="text"
                                            placeholder="Buscar productos..."
                                            value={searchTerm}
                                            onChange={handleProductSearch}
                                            className="form-control"
                                            style={{ borderRadius: '8px', border: '1px solid #ced4da' }}
                                        />
                                    </Form.Group>
                                    {searchTerm && (
                                        <div className="mb-3 border rounded p-2" style={{ backgroundColor: '#fff', maxHeight: '200px', overflowY: 'auto' }}>
                                            {filteredProducts
                                                .filter(product => product.Stock >= 1)
                                                .map(product => (
                                                    <div
                                                        key={product.id}
                                                        className="p-2 border-bottom"
                                                        onClick={() => addProduct(product)}
                                                        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                                                    >
                                                        {product.Product_Name}
                                                    </div>
                                                ))}
                                        </div>
                                    )}
                                    {selectedProducts.length > 0 && (
                                        <div className="table-responsive">
                                            <Table responsive className="mb-0" style={{ fontSize: '0.9rem' }}>
                                                <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                    <tr>
                                                        <th style={{ fontWeight: '600', fontSize: '0.85rem' }}>Producto</th>
                                                        <th style={{ fontWeight: '600', fontSize: '0.85rem' }}>Cantidad</th>
                                                        <th style={{ fontWeight: '600', fontSize: '0.85rem' }}>Precio</th>
                                                        <th style={{ fontWeight: '600', fontSize: '0.85rem' }}>Subtotal</th>
                                                        <th style={{ fontWeight: '600', fontSize: '0.85rem', width: '120px' }}>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedProducts.map(product => (
                                                        <tr key={product.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                                                            <td>{product.Product_Name}</td>
                                                            <td className="fw-semibold">{product.quantity}</td>
                                                            <td className="text-muted">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price)}</td>
                                                            <td className="fw-semibold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price * product.quantity)}</td>
                                                            <td>
                                                                <div className="d-flex gap-1">
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => updateQuantity(product.id, 1)}
                                                                        variant="outline-primary"
                                                                        className="p-1"
                                                                        style={{ border: 'none', minWidth: '28px' }}
                                                                        title="Aumentar cantidad"
                                                                    >
                                                                        <Plus size={14} />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => updateQuantity(product.id, -1)}
                                                                        variant="outline-secondary"
                                                                        className="p-1"
                                                                        style={{ border: 'none', minWidth: '28px' }}
                                                                        title="Disminuir cantidad"
                                                                    >
                                                                        <Minus size={14} />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => removeProduct(product.id)}
                                                                        variant="outline-danger"
                                                                        className="p-1"
                                                                        style={{ border: 'none', minWidth: '28px' }}
                                                                        title="Eliminar producto"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </Button>
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





                    </div >

                        {/* Columna de Información de Cita */}
                        <div className='col-md-6'>
                            <div className='card border-0 shadow-sm mb-4' style={{ borderRadius: '12px' }}>
                                <div className="card-header border-0 d-flex justify-content-between align-items-center" style={{ 
                                    backgroundColor: '#2c3e50', 
                                    color: 'white', 
                                    borderRadius: '12px 12px 0 0',
                                    padding: '20px'
                                }}>
                                    <h5 className="mb-0 d-flex align-items-center">
                                        <Calendar size={20} className="me-2" />
                                        Información de la Cita
                                    </h5>
                                    <IoRefreshSharp
                                        size={18}
                                        style={{ cursor: 'pointer', opacity: 0.8 }}
                                        title="Reiniciar formulario"
                                        onClick={resetTableStates}
                                        onMouseEnter={(e) => e.target.style.opacity = '1'}
                                        onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                                    />
                                </div>
                                <div className='card-body p-4'>
                                    <Form>
                                        <Row className="g-3">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold mb-2">Fecha de la cita</Form.Label>
                                                    <DatePicker
                                                        selected={saleInfo.appointmentData.Date ? (() => {
                                                            // Parsear fecha de forma segura sin problemas de zona horaria
                                                            const dateParts = saleInfo.appointmentData.Date.split('-');
                                                            if (dateParts.length === 3) {
                                                                return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
                                                            }
                                                            return new Date(saleInfo.appointmentData.Date);
                                                        })() : new Date()}
                                                        onChange={(date) => {
                                                            // Formatear fecha sin problemas de zona horaria
                                                            const year = date.getFullYear();
                                                            const month = (date.getMonth() + 1).toString().padStart(2, '0');
                                                            const day = date.getDate().toString().padStart(2, '0');
                                                            const dateStr = `${year}-${month}-${day}`;
                                                            setCurrentDate(dateStr);
                                                            handleAppointmentChange({
                                                                target: { name: "Date", value: dateStr },
                                                            });
                                                        }}
                                                        className="form-control"
                                                        minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                                                        popperPlacement={isSmallScreen ? "bottom" : "left-end"}
                                                        locale={es}
                                                        popperClassName="datepicker-zindex"
                                                        popperModifiers={{
                                                            offset: { enabled: true, offset: "0, 5" },
                                                            preventOverflow: { enabled: true, boundariesElement: "viewport" },
                                                        }}
                                                        filterDate={(date) => date.getDay() !== 1}
                                                        style={{ borderRadius: '8px' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold mb-2">Hora de la cita</Form.Label>
                                                    <CustomTimeSelector
                                                        name="Init_Time"
                                                        value={saleInfo.appointmentData.Init_Time}
                                                        onChange={(time) => handleAppointmentChange({
                                                            target: { name: 'Init_Time', value: time }
                                                        })}
                                                        occupiedSlots={occupiedSlots}
                                                        selectedDate={saleInfo.appointmentData.Date}
                                                    />
                                                    {occupiedSlots.length > 0 && (
                                                        <Form.Text className="text-muted d-block mt-2" style={{ fontSize: '0.85rem' }}>
                                                            <span style={{ color: '#dc3545' }}>⚠️</span> Las horas en rojo ya están ocupadas
                                                        </Form.Text>
                                                    )}
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold mb-2">Hora fin (estimada)</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={saleInfo.appointmentData.Finish_Time || '-'}
                                                        readOnly
                                                        className="form-control"
                                                        style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="fw-semibold mb-2">Duración total</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={formatDuration(saleInfo.appointmentData.time_appointment)}
                                                        readOnly
                                                        className="form-control"
                                                        style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </Form>
                                </div>
                            </div>
                            <div className='card border-0 shadow-sm' style={{ borderRadius: '12px' }}>
                                <div className="card-header border-0" style={{ 
                                    backgroundColor: '#27ae60', 
                                    color: 'white', 
                                    borderRadius: '12px 12px 0 0',
                                    padding: '20px'
                                }}>
                                    <h5 className="mb-0">Resumen</h5>
                                </div>
                                <div className='card-body p-4'>
                                    <div className="mb-3 pb-3 border-bottom">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Subtotal Servicios:</span>
                                            <span className="fw-semibold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotalServices)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-muted">Subtotal Productos:</span>
                                            <span className="fw-semibold">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotalProducts)}</span>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="fw-bold fs-5">Total:</span>
                                        <span className="fw-bold fs-5" style={{ color: '#27ae60' }}>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saleInfo.total_price)}</span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn flex-fill d-flex align-items-center justify-content-center"
                                            onClick={() => navigate('/appointmentView')}
                                            style={{
                                                padding: '12px',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                borderRadius: '8px',
                                                backgroundColor: '#95a5a6',
                                                color: 'white',
                                                border: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#7f8c8d'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#95a5a6'}
                                        >
                                            <X size={18} className="me-2" />
                                            Cancelar
                                        </button>
                                        <button
                                            className="btn flex-fill d-flex align-items-center justify-content-center"
                                            onClick={handleSubmit}
                                            style={{
                                                padding: '12px',
                                                fontSize: '16px',
                                                fontWeight: '500',
                                                borderRadius: '8px',
                                                backgroundColor: '#27ae60',
                                                color: 'white',
                                                border: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#229954'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#27ae60'}
                                        >
                                            <Save size={18} className="me-2" />
                                            Guardar Cita
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Detalles de Cita */}
            <Modal
                show={showAppointmentModal}
                onHide={() => setShowAppointmentModal(false)}
                size="lg"
                backdrop="static"
                keyboard={true}
                centered
            >
                <Modal.Header closeButton style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <Modal.Title className="d-flex align-items-center" style={{ color: '#2c3e50' }}>
                        <Calendar size={20} className="me-2" />
                        Detalle de la Cita
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: '#fff' }}>
                    {selectedAppointmentDetails && (
                        <>
                            <div className="mb-4">
                                <h5 className="border-bottom pb-2 mb-3" style={{ color: '#2c3e50' }}>Información de la Cita</h5>
                                <div className="row">
                                    <div className="col-md-6">
                                        <p className="mb-2">
                                            <strong>Fecha:</strong> {selectedAppointmentDetails.Date ? selectedAppointmentDetails.Date.split('T')[0] : 'No disponible'}
                                        </p>
                                        <p className="mb-2">
                                            <strong>Hora inicio:</strong> {convertTo12HourFormat(selectedAppointmentDetails.Init_Time || "")}
                                        </p>
                                        <p className="mb-2">
                                            <strong>Hora fin:</strong> {convertTo12HourFormat(selectedAppointmentDetails.Finish_Time || "")}
                                        </p>
                                    </div>
                                    <div className="col-md-6">
                                        <p className="mb-2">
                                            <strong>Duración:</strong> {selectedAppointmentDetails.time_appointment || 0} minutos
                                        </p>
                                        <p className="mb-2">
                                            <strong>Total:</strong> <span style={{ color: '#27ae60', fontWeight: '600' }}>
                                                ${selectedAppointmentDetails.Total?.toLocaleString() || '0'}
                                            </span>
                                        </p>
                                        <p className="mb-2">
                                            <strong>Estado:</strong> 
                                            <span className="ms-2" style={{
                                                backgroundColor: getStatusColor(selectedAppointmentDetails.status).bg,
                                                color: getStatusColor(selectedAppointmentDetails.status).text,
                                                padding: '4px 12px',
                                                borderRadius: '20px',
                                                fontSize: '0.85rem',
                                                fontWeight: '600'
                                            }}>
                                                {selectedAppointmentDetails.status || 'Pendiente'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h5 className="border-bottom pb-2 mb-3" style={{ color: '#2c3e50' }}>Detalle de Servicios y Productos</h5>
                                {saleDetails.data && saleDetails.data.length > 0 ? (
                                    <div className="table-responsive">
                                        <Table striped bordered hover>
                                            <thead style={{ backgroundColor: '#f8f9fa' }}>
                                                <tr>
                                                    <th>Nombre</th>
                                                    <th>Cantidad</th>
                                                    <th>Precio Unitario</th>
                                                    <th>Barbero</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {saleDetails.data.map((detail, index) => (
                                                    <tr key={index}>
                                                        <td>{detail.name}</td>
                                                        <td>{detail.quantity}</td>
                                                        <td>${detail.price.toLocaleString()}</td>
                                                        <td>{detail.employeeName || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <p className="text-muted">No se encuentran productos o servicios en esta cita.</p>
                                )}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer style={{ backgroundColor: '#f8f9fa', borderTop: '2px solid #dee2e6' }}>
                    <button
                        className="btn"
                        onClick={() => setShowAppointmentModal(false)}
                        style={{
                            backgroundColor: '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 20px'
                        }}
                    >
                        Cerrar
                    </button>
                </Modal.Footer>
            </Modal>

        </>
    );
}



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
    datepickerZIndex: {
        zIndex: 1050, // Alto para garantizar prioridad visual
        position: 'relative',
    },
};





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
import { motion } from 'framer-motion';
import { Scissors, Calendar, Clock, Trash2, Plus, Minus, Save, X } from 'lucide-react'

export default function Component() {
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [services, setServices] = useState([]);
    const [minTime, setMinTime] = useState("07:00");
    const [maxTime, setMaxTime] = useState("21:00");
    const [timeSlots, setTimeSlots] = useState([]);
    const [prevState, setPrevState] = useState([]);

    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState(null);
    const [saleInfo, setSaleInfo] = useState({
        Billnumber: '',
        SaleDate: new Date().toISOString().split('T')[0],
        total_price: 0,
        status: 'Pendiente',
        id_usuario: '',
        appointmentData: {
            Init_Time: '',
            Finish_Time: '',
            Date: new Date().toISOString().split('T')[0],
            time_appointment: 0
        },
        saleDetails: []
    });
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
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
                getAppointments()
            ]);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching initial data:', error);
            setLoading(false);
            show_alerta('Error al cargar los datos iniciales', 'error');
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
            const [hours, minutes] = startTime.split(':').map(Number);
            const endDate = new Date(2000, 0, 1, hours, minutes + duration);
            const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

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
        const occupied = appointmentsData.map(appointment => ({
            startTime: appointment.Init_Time,
            endTime: appointment.Finish_Time
        }));
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
        if (startTime < 7 || startTime >= 21) {
            return {
                isValid: false,
                message: 'Las citas solo se pueden agendar entre las 7:00 AM y las 9:00 PM'
            };
        }

        return { isValid: true };
    };

    const validateAppointmentAvailability = () => {
        const newAppointmentStart = new Date(saleInfo.appointmentData.Date + 'T' + saleInfo.appointmentData.Init_Time);
        const newAppointmentEnd = new Date(saleInfo.appointmentData.Date + 'T' + saleInfo.appointmentData.Finish_Time);

        for (const appointment of appointments) {
            const existingStart = new Date(appointment.Date + 'T' + appointment.Init_Time);
            const existingEnd = new Date(appointment.Date + 'T' + appointment.Finish_Time);

            if (
                (newAppointmentStart >= existingStart && newAppointmentStart < existingEnd) ||
                (newAppointmentEnd > existingStart && newAppointmentEnd <= existingEnd) ||
                (newAppointmentStart <= existingStart && newAppointmentEnd >= existingEnd)
            ) {
                return {
                    isValid: false,
                    message: 'El horario seleccionado ya está ocupado por otra cita'
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

        if (name === 'Init_Time') {
            updateFinishTime(value, saleInfo.appointmentData.time_appointment);
        }
    };

    const validateField = (fieldName, value) => {
        let newErrors = { ...errors };

        switch (fieldName) {
            case 'Billnumber':
                if (value.length === 0) {
                    newErrors.Billnumber = 'El número de Comprobante es requerido';
                } else if (value.length !== 3) {
                    newErrors.Billnumber = 'El número de Comprobante debe tener exactamente 3 dígitos';
                } else if (!/^\d+$/.test(value)) {
                    newErrors.Billnumber = 'El número de Comprobante debe contener solo dígitos';
                } else {
                    newErrors.Billnumber = '';
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
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

        validateField('Billnumber', saleInfo.Billnumber);

        if (errors.Billnumber) {
            show_alerta('Por favor, corrija los errores antes de continuar', 'warning');
            return;
        }

        if (saleInfo.saleDetails.length === 0) {
            show_alerta('Debe agregar al menos un servicio', 'warning');
            return;
        }

        const { isValid: isEmployeeAvailable, message: employeeMessage } = validateEmployeeAvailability();
        if (!isEmployeeAvailable) {
            show_alerta(employeeMessage, 'error');
            return;
        }

        const { isValid: isTimeValid, message: timeMessage } = validateAppointmentTime();
        if (!isTimeValid) {
            show_alerta(timeMessage, 'error');
            return;
        }

        const { isValid: isAppointmentAvailable, message: appointmentMessage } = validateAppointmentAvailability();
        if (!isAppointmentAvailable) {
            show_alerta(appointmentMessage, 'error');
            return;
        }

        const hasServicesWithEmployees = saleInfo.saleDetails.some(detail =>
            detail.serviceId !== null && detail.empleadoId !== null
        );

        if (hasServicesWithEmployees &&
            (!saleInfo.appointmentData.Init_Time ||
                !saleInfo.appointmentData.Finish_Time)) {
            show_alerta('Debe especificar el horario de la cita para los servicios', 'warning');
            return;
        }

        // Asegurarse de usar exactamente la fecha seleccionada
        const selectedDate = new Date(saleInfo.appointmentData.Date);
        selectedDate.setHours(0, 0, 0, 0); // Resetear horas para evitar problemas de zona horaria

        // Crear una copia del saleInfo para no modificar el estado original
        const saleInfoToSend = {
            ...saleInfo,
            SaleDate: selectedDate.toISOString().split('T')[0],
            appointmentData: {
                ...saleInfo.appointmentData,
                Date: selectedDate.toISOString().split('T')[0]
            }
        };

        try {
            await axios.post('https://andromeda-api.onrender.com/api/sales', saleInfoToSend);
            show_alerta('Cita registrada con éxito', 'success');
            setSaleInfo({
                Billnumber: '',
                SaleDate: new Date().toISOString().split('T')[0],
                total_price: 0,
                status: 'Pendiente',
                id_usuario: saleInfo.id_usuario,
                appointmentData: {
                    Init_Time: '',
                    Finish_Time: '',
                    Date: new Date().toISOString().split('T')[0],
                    time_appointment: 0
                },
                saleDetails: []
            });
            setSelectedProducts([]);

            navigate('/appointmentView');
        } catch (error) {
            console.error('Error al registrar la cita:', error);
            show_alerta('Error al registrar la cita', 'error');
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
        setSaleInfo({
            ...saleInfo,
            appointmentData: {
                Date: new Date().toISOString().split('T')[0], // Reinicia la fecha a hoy
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
            <br /><br /><br /><br />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className='container mt-5'
            >
                <div className='row'>
                    {/* Columna de Servicios y Productos */}
                    <div className='col-md-6'>
                        <br /><br /><br /><br />
                        <motion.div
                            className='card mb-4 shadow-lg'
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="card-header" style={{ backgroundColor: '#000000', color: 'white', display: 'flex', alignItems: 'center' }}>
                                <Scissors className="mr-2" />
                                <h5 className="mb-0">SERVCIOS Y PRODUCTOS</h5>

                            </div>

                            <div className='card-body'>
                                {/* Servicios */}
                                <h6 className="mb-3 font-weight-bold text-secondary">Servicios</h6>
                                <Table responsive bordered hover className="shadow-sm">
                                    <thead style={{ backgroundColor: '#f5f5f5' }}>
                                        <tr>
                                            <th>Servicio</th>
                                            <th>Barbero</th>
                                            <th>Duración</th>
                                            <th>Precio</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {saleInfo.saleDetails
                                            .filter(detail => detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null))
                                            .map((detail, index) => (
                                                <motion.tr
                                                    key={index}
                                                    initial={{ opacity: 0, y: -20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <td>
                                                        <Form.Select
                                                            value={detail.serviceId || ''}
                                                            onChange={(e) => handleServiceChange(index, 'serviceId', e.target.value)}
                                                            className="form-control-sm"
                                                        >
                                                            <option value="">Seleccione un servicio</option>
                                                            {services.map(service => (
                                                                <option key={service.id} value={service.id}>{service.name}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </td>
                                                    <td>
                                                        <Form.Select
                                                            value={detail.empleadoId || ''}
                                                            onChange={(e) => handleServiceChange(index, 'empleadoId', e.target.value)}
                                                            className="form-control-sm"
                                                        >
                                                            <option value="">Seleccione el barbero</option>
                                                            {users.filter(user => user.roleId === 2).map(employee => (
                                                                <option key={employee.id} value={employee.id}>{employee.name}</option>
                                                            ))}
                                                        </Form.Select>
                                                    </td>
                                                    <td>{detail.serviceId ? formatDuration(services.find(s => s.id === parseInt(detail.serviceId))?.time || 0) : '-'}</td>
                                                    <td>{detail.serviceId ? `$${services.find(s => s.id === parseInt(detail.serviceId))?.price.toFixed(2)}` : '-'}</td>
                                                    <td>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleServiceRemove(index)}
                                                            className="d-flex align-items-center justify-content-center"
                                                            style={{ backgroundColor: '#b22222', color: 'white' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                    </tbody>
                                </Table>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn mt-3 d-flex align-items-center"
                                    style={{ backgroundColor: '#d4af37', color: 'white' }}
                                    onClick={handleServiceAdd}
                                >
                                    <Plus size={16} className="mr-2" />
                                    Agregar Servicio
                                </motion.button>

                                {/* Productos */}
                                <h6 className="mt-4 mb-3 font-weight-bold text-secondary">Productos</h6>
                                <Form.Group className="mb-3">
                                    <Form.Control
                                        type="text"
                                        placeholder="Buscar productos..."
                                        value={searchTerm}
                                        onChange={handleProductSearch}
                                        className="form-control-sm"
                                    />
                                </Form.Group>
                                {searchTerm && (
                                    <motion.div
                                        className="mb-3 border p-2 rounded shadow-sm"
                                        style={{ backgroundColor: '#f5f5f5' }}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {filteredProducts
                                            .filter(product => product.Stock >= 1) // Filtrar productos con stock >= 1
                                            .map(product => (
                                                <motion.div
                                                    key={product.id}
                                                    className="p-2 border-bottom cursor-pointer hover:bg-light"
                                                    onClick={() => addProduct(product)}
                                                    whileHover={{ scale: 1.02 }}
                                                >
                                                    {product.Product_Name}
                                                </motion.div>
                                            ))}
                                    </motion.div>

                                )}
                                <Table responsive bordered hover className="shadow-sm">
                                    <thead style={{ backgroundColor: '#f5f5f5' }}>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Imagen</th>
                                            <th>Precio unitario</th>
                                            <th>Subtotal</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedProducts.map(product => (
                                            <motion.tr
                                                key={product.id}
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                            >
                                                <td>{product.Product_Name}</td>
                                                <td>{product.quantity}</td>
                                                <td className="p-2 text-center">
                                                    {product.Image ? (
                                                        <div className="inline-block">
                                                            <img
                                                                src={product.Image}
                                                                alt={product.Product_Name}
                                                                className="w-[50px] h-[50px] object-cover rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                                                                style={{
                                                                    width: '50px',
                                                                    height: '50px',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-[50px] h-[50px] inline-flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 border border-gray-100">
                                                            <span className="text-sm">No</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price)}</td>
                                                <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price * product.quantity)}</td>
                                                <td>
                                                    <div className="d-flex">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => removeProduct(product.id)}
                                                            className="d-flex align-items-center justify-content-center"
                                                            style={{ backgroundColor: '#b22222', color: 'white' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => updateQuantity(product.id, 1)}
                                                            className="mr-1"
                                                            style={{ backgroundColor: '#d4af37', color: 'white' }}
                                                        >
                                                            <Plus size={16} />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => updateQuantity(product.id, -1)}
                                                            style={{ backgroundColor: '#a9a9a9', color: 'white' }}
                                                        >
                                                            <Minus size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </motion.div>





                    </div >

                    {/* Columna de Información de Cita */}
                    <div className='col-md-6'>
                        <br /><br /><br /><br />
                        <motion.div
                            className='card mb-4 shadow-lg'
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="card-header" style={{ backgroundColor: '#000000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Calendar className="mr-2" />
                                    <h5 className="mb-0">INFORMACION DE LA CITA </h5>
                                </div>
                                <IoRefreshSharp
                                    size={20}
                                    style={{ cursor: 'pointer', color: 'white' }}
                                    title="Reiniciar estados de la tabla"
                                    onClick={resetTableStates}
                                />
                            </div>
                            <div className='card-body'>
                                <Form>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Fecha de la cita</Form.Label>
                                                <DatePicker
                                                    selected={new Date(saleInfo.appointmentData.Date)}
                                                    onChange={(date) =>
                                                        handleAppointmentChange({
                                                            target: { name: "Date", value: date.toISOString().split("T")[0] },
                                                        })
                                                    }
                                                    className="form-control form-control-sm"
                                                    minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                                                    popperPlacement={isSmallScreen ? "bottom" : "left-end"} // Usando el estado de pantalla pequeña
                                                    locale={es}
                                                    popperClassName="datepicker-zindex"
                                                    popperModifiers={{
                                                        offset: {
                                                            enabled: true,
                                                            offset: "0, 5",
                                                        },
                                                        preventOverflow: {
                                                            enabled: true,
                                                            boundariesElement: "viewport",
                                                        },
                                                    }}
                                                    filterDate={(date) => date.getDay() !== 1}
                                                />
                                            </Form.Group>



                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Hora de la cita</Form.Label>
                                                <CustomTimeSelector
                                                    name="Init_Time"
                                                    value={saleInfo.appointmentData.Init_Time}
                                                    onChange={(time) => handleAppointmentChange({
                                                        target: { name: 'Init_Time', value: time }
                                                    })}
                                                    className="form-control form-control-sm"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Hora fin de la cita (estimada)</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="Finish_Time"
                                                    value={saleInfo.appointmentData.Finish_Time}
                                                    readOnly
                                                    className="form-control-sm"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Duración total</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={formatDuration(saleInfo.appointmentData.time_appointment)}
                                                    readOnly
                                                    className="form-control-sm"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Form>
                            </div>
                        </motion.div>
                        <motion.div
                            className='card mb-4 shadow-lg'
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <div className="card-header" style={{ backgroundColor: '#000000', color: 'white', display: 'flex', alignItems: 'center' }}>
                                <h5 className="mb-0">RESUMEN DE LA CITA </h5>
                            </div>
                            <div className='card-body'>
                                <h6>Subtotal Servicios: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotalServices)}</h6>
                                <h6>Subtotal Productos: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotalProducts)}</h6>
                                <h6>Total: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saleInfo.total_price)}</h6>
                                <div className="d-flex justify-content-end">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="btn btn-secondary mr-2 d-flex align-items-center"
                                        onClick={() => (window.location.href = '/appointmentView')}
                                        style={{
                                            minWidth: '150px',
                                            padding: '10px 20px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: 'white',
                                            borderRadius: 20,
                                            backgroundColor: '#6c757d',
                                        }}
                                    >
                                        <X size={20} className="mr-2" />
                                        Cancelar
                                    </motion.button>


                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSubmit}
                                        style={{
                                            minWidth: '150px',
                                            padding: '10px 20px',
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#212529',
                                            borderRadius: 20,
                                            backgroundColor: '#d4af37', color: 'white',
                                        }}
                                    >
                                        <Save size={20} className="mr-2" />
                                        Guardar Cita
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div >
                </div >
            </motion.div >


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





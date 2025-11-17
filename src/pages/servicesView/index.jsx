
import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { GiHairStrands } from "react-icons/gi";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp, IoSearch } from "react-icons/io5";
import axios from 'axios';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Switch from '@mui/material/Switch';
import { Modal, Form, Col, Row } from 'react-bootstrap';
import Pagination from '../../components/pagination/index';
import { usePermissions } from '../../components/PermissionCheck';
import './services.css';

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
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

const Services = () => {
    const url = 'https://andromeda-api.onrender.com/api/services';
    const [services, setServices] = useState([]);
    const [formValues, setFormValues] = useState({
        id: '',
        name: '',
        price: '',
        description: '',
        time: '',
        status: 'A'
    });
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState({});
    const [search, setSearch] = useState('');
    const [dataQt, setDataQt] = useState(3);
    const [currentPages, setCurrentPages] = useState(1);
    const permissions = usePermissions();

    const [errors, setErrors] = useState({
        name: '',
        price: '',
        description: '',
        time: '',
    });

    const [touched, setTouched] = useState({
        name: false,
        price: false,
        description: false,
        time: false,
    });

    useEffect(() => {
        getServices();
    }, []);

    const getServices = async () => {
        try {
            const response = await axios.get(url);
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
            show_alerta('Error al obtener los servicios', 'error');
        }
    };

    const searcher = (e) => {
        setSearch(e.target.value);
    };

    let results = [];
    if (!search) {
        results = services;
    } else {
        results = services.filter((dato) => {
            const searchTerm = search.toLowerCase();
            return (
                dato.name.toLowerCase().includes(searchTerm) ||
                dato.price.toString().includes(searchTerm) ||
                dato.time.toString().includes(searchTerm)
            );
        });
    }

    const indexEnd = currentPages * dataQt;
    const indexStart = indexEnd - dataQt;

    const nPages = Math.ceil(results.length / dataQt);

    results = results.slice(indexStart, indexEnd);

    const openModal = (op, service = {}) => {
        setOperation(op);
        setTitle(op === 1 ? 'Registrar servicio' : 'Editar servicio');
        setFormValues(op === 1 ? {
            id: '',
            name: '',
            price: '',
            description: '',
            time: '',
            status: 'A'
        } : {
            id: service.id,
            name: service.name,
            price: service.price,
            description: service.description,
            time: service.time,
            status: service.status
        });
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setErrors({
            name: '',
            price: '',
            description: '',
            time: '',
        });
        setTouched({
            name: false,
            price: false,
            description: false,
            time: false,
        });
    };

    const handleValidation = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                error = value.trim() === '' ? 'El nombre del servicio es requerido' : '';
                break;
            case 'price':
                error = value <= 1000 ? 'El precio debe ser mayor a 1000' : '';
                break;
            case 'description':
                error = value.length < 5 || value.length > 500 ? 'La descripción debe tener entre 5 y 500 caracteres' : '';
                break;
            case 'time':
                error = value === '' ? 'Debe seleccionar el tiempo del servicio' : '';
                break;
            default:
                break;
        }
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prevValues => ({ ...prevValues, [name]: value }));
        handleValidation(name, value);
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
        handleValidation(name, e.target.value);
    };

    const checkIfServiceExists = async (name) => {
        try {
            const response = await axios.get(`${url}`, {
                params: { name }
            });
            return response.data.some(service => service.name.trim().toLowerCase() === name.trim().toLowerCase());
        } catch (error) {
            console.error('Error al verificar la existencia del servicio:', error);
            return false;
        }
    };

    const validar = async () => {
        const { name, price, description, time } = formValues;

        if (errors.name || !name.trim()) {
            show_alerta(errors.name || 'Por favor, complete el nombre del servicio.', 'warning');
            return;
        }
        if (errors.price || !price) {
            show_alerta(errors.price || 'Por favor, ingrese un precio válido.', 'warning');
            return;
        }
        if (errors.description || !description.trim()) {
            show_alerta(errors.description || 'Por favor, ingrese una descripción válida.', 'warning');
            return;
        }
        if (errors.time || !time) {
            show_alerta(errors.time || 'Por favor, seleccione el tiempo del servicio.', 'warning');
            return;
        }

        if (operation === 1) {
            const serviceExists = await checkIfServiceExists(name.trim());
            if (serviceExists) {
                show_alerta('El servicio con este nombre ya existe. Por favor, elija otro nombre.', 'warning');
                return;
            }
        }

        const parametros = {
            name: name.trim(),
            price: parseFloat(price),
            description: description.trim(),
            time: parseInt(time),
            status: 'A'
        };

        if (operation === 2) {
            parametros.id = formValues.id;
        }

        const metodo = operation === 1 ? 'POST' : 'PUT';
        enviarSolicitud(metodo, parametros);
    };

    const enviarSolicitud = async (metodo, parametros) => {
        const urlWithId = metodo === 'PUT' || metodo === 'DELETE' ? `${url}/${parametros.id}` : url;
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            console.log('Request details:', {
                method: metodo,
                url: urlWithId,
                data: parametros
            });

            const response = await axios({
                method: metodo,
                url: urlWithId,
                data: parametros,
                ...config
            });

            console.log('Response:', response.data);

            show_alerta('Operación exitosa', 'success');
            if (metodo === 'PUT' || metodo === 'POST') {
                handleClose();
            }
            getServices();
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                data: parametros
            });

            const errorMessage = error.response?.data?.message || 'Error en la solicitud';
            show_alerta(errorMessage, 'error');
        }
    };

    const handleSwitchChange = async (serviceId, checked) => {
        const serviceToUpdate = services.find(service => service.id === serviceId);
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: `¿Estás seguro que deseas ${checked ? 'activar' : 'desactivar'} el servicio "${serviceToUpdate.name}"?`,
            icon: 'question',
            text: 'Esta acción puede afectar la disponibilidad del servicio.',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedService = {
                    ...serviceToUpdate,
                    status: checked ? 'A' : 'I'
                };
                try {
                    const response = await axios.put(`${url}/${serviceId}`, updatedService);
                    if (response.status === 200) {
                        setServices(services.map(service =>
                            service.id === serviceId ? { ...service, status: updatedService.status } : service
                        ));
                        show_alerta('Estado del servicio actualizado exitosamente', 'success');
                    }
                } catch (error) {
                    console.error('Error updating service status:', error);
                    show_alerta('Error al actualizar el estado del servicio', 'error');
                }
            } else {
                setServices(services.map(service =>
                    service.id === serviceId ? { ...service, status: !checked ? 'A' : 'I' } : service
                ));
                show_alerta('Estado del servicio no cambiado', 'info');
            }
        });
    };

    const deleteService = async (id, name) => {
        try {
            const appointmentsResponse = await axios.get('https://andromeda-api.onrender.com/api/appointment');
            const pendingAppointments = appointmentsResponse.data.filter(appointment => appointment.status === 'pendiente');
            const isServiceInUse = pendingAppointments.some(appointment => appointment.serviceId === id);

            const salesResponse = await axios.get('https://andromeda-api.onrender.com/api/sales');
            const pendingSales = salesResponse.data.filter(sales => sales.status === 'Pendiente');
            const isServiceInSale = pendingSales.some(sale =>
                sale.SaleDetails.some(detail => detail.serviceId === id)
            );

            const Myswal = withReactContent(Swal);

            if (isServiceInUse || isServiceInSale) {
                Myswal.fire({
                    title: 'No se puede eliminar',
                    text: `El servicio "${name}" está asociado a una o más citas o ventas existentes pendientes y no puede ser eliminado.`,
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            Myswal.fire({
                title: `¿Estás seguro que desea eliminar el servicio ${name}?`,
                icon: 'question',
                text: 'No se podrá dar marcha atrás',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    enviarSolicitud('DELETE', { id: id });
                } else {
                    show_alerta('El servicio NO fue eliminado', 'info');
                }
            });
        } catch (error) {
            console.error('Error checking service associations:', error);
            show_alerta('Error al verificar las asociaciones del servicio', 'error');
        }
    };

    const handleViewDetails = (service) => {
        setDetailData(service);
        setShowDetailModal(true);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
    };

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Servicios</span>
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
                                        label="Servicios"
                                        icon={<GiHairStrands fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-5 d-flex align-items-center'>
                                <Button className='btn-register' onClick={() => openModal(1)} variant="contained">
                                    <BsPlusSquareFill />Registrar
                                </Button>
                            </div>
                            <div className='col-sm-7 d-flex align-items-center justify-content-end'>
                                <div className="searchBox position-relative d-flex align-items-center">
                                    <IoSearch className="mr-2" />
                                    <input value={search} onChange={searcher} type="text" placeholder='Buscar...' className='form-control' />
                                </div>
                            </div>
                        </div>
                        <div className='table-responsive mt-3'>
                            <table className='table table-bordered table-hover v-align table-striped'>
                                <thead className='table-primary'>
                                    <tr>
                                        <th>#</th>
                                        <th>Nombre</th>
                                        <th>Precio</th>
                                        <th>Descripción</th>
                                        <th>Tiempo(Minutos)</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.length > 0 ? (
                                        results.map((service, i) => (
                                            <tr key={service.id}>
                                                <td>{(i + 1)}</td>
                                                <td>{service.name}</td>
                                                <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(service.price)}</td>
                                                <td>{service.description}</td>
                                                <td>{service.time}</td>
                                                <td><span className={`serviceStatus ${service.status === 'A' ? '' : 'Inactive'}`}>{service.status === 'A' ? 'Activo' : 'Inactivo'}</span></td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <Switch
                                                            checked={service.status === 'A'}
                                                            onChange={(e) => handleSwitchChange(service.id, e.target.checked)}
                                                        />
                                                        <Button color='primary' className='primary' onClick={() => handleViewDetails(service)}><FaEye /></Button>
                                                        {service.status === 'A' && (
                                                            <>
                                                                <Button color="secondary" className='secondary' onClick={() => openModal(2, service)}><FaPencilAlt /></Button>
                                                                <Button color='error' className='delete' onClick={() => deleteService(service.id, service.name)}><IoTrashSharp /></Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className='text-center'>No hay Servicios disponibles</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {results.length > 0 && (
                                <div className="d-flex table-footer">
                                    <Pagination
                                        setCurrentPages={setCurrentPages}
                                        currentPages={currentPages}
                                        nPages={nPages}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <Modal show={showModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className='pb-3'>
                                <Form.Label className='required'>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formValues.name}
                                    placeholder="Nombre"
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.name && !!errors.name}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.name}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group as={Row} className="mb-3">
                                <Col sm="6">
                                    <Form.Label className='required'>Precio</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        value={formValues.price}
                                        placeholder="Precio"
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.price && !!errors.price}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.price}
                                    </Form.Control.Feedback>
                                </Col>
                                <Col sm="6">
                                    <Form.Label className='required'>Tiempo</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="time"
                                        value={formValues.time}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        isInvalid={touched.time && !!errors.time}
                                    >
                                        <option hidden="">Tiempo</option>
                                        <option value="20">20 Minutos</option>
                                        <option value="30">30 Minutos</option>
                                        <option value="45">45 Minutos</option>
                                        <option value="60">60 Minutos</option>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.time}
                                    </Form.Control.Feedback>
                                </Col>
                            </Form.Group>
                            <Form.Group className='pb-2'>
                                <Form.Label className='required'>Descripción</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    name="description"
                                    value={formValues.description}
                                    placeholder="Descripcion"
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.description && !!errors.description}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.description}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose} className='btn-red'>
                            Cerrar
                        </Button>
                        <Button variant="primary" onClick={validar} className='btn-sucess'>
                            Guardar
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal show={showDetailModal} onHide={handleCloseDetail}>
                    <Modal.Header closeButton>
                        <Modal.Title>Detalle Servicio</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p><strong>Nombre:</strong> {detailData.name}</p>
                        <p><strong>Precio:</strong> {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(detailData.price)}</p>
                        <p><strong>Descripción:</strong> {detailData.description}</p>
                        <p><strong>Tiempo:</strong> {detailData.time} Minutos</p>
                        <p><strong>Estado:</strong> {detailData.status === 'A' ? 'Activo' : 'Inactivo'}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseDetail}>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
};

export default Services;

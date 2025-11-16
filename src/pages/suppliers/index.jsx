import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import axios from 'axios';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { GiHairStrands } from "react-icons/gi";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { IoSearch } from "react-icons/io5";
import Pagination from '../../components/pagination/index';
import { show_alerta } from '../../assets/functions';
import { usePermissions } from '../../components/PermissionCheck';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { alpha } from '@mui/material/styles';
import { blue } from '@mui/material/colors';
import Switch from '@mui/material/Switch';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { Modal, Form, Col, Row } from 'react-bootstrap';
import { MdOutlineSave } from "react-icons/md";
import { IoCart } from "react-icons/io5";
import { useState, useEffect } from 'react';

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

const BlueSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: blue[600],
        '&:hover': {
            backgroundColor: alpha(blue[600], theme.palette.action.hoverOpacity),
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: blue[600],
    },
}));

const Suppliers = () => {
    const url = 'https://andromeda-api.onrender.com/api/suppliers';
    const [suppliers, setSuppliers] = useState([]);
    const [formValues, setFormValues] = useState({
        id: '',
        Supplier_Name: '',
        Phone_Number: '',
        Email: '',
        Address: '',
        status: 'A'
    });
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');
    const [search, setSearch] = useState('');
    const [dataQt, setDataQt] = useState(3);
    const [currentPages, setCurrentPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const permissions = usePermissions();
    const [errors, setErrors] = useState({
        Supplier_Name: '',
        Phone_Number: '',
        Email: '',
        Address: '',
    });
    const [touched, setTouched] = useState({
        Supplier_Name: false,
        Phone_Number: false,
        Email: false,
        Address: false,
    });

    useEffect(() => {
        getSuppliers();
    }, []);

    const getSuppliers = async () => {
        try {
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setSuppliers(response.data);
        } catch (error) {
            console.error('Error fetching suppliers:', error.response || error);
            show_alerta(`Error al obtener proveedores: ${error.response?.data?.message || error.message}`, 'error');
            setSuppliers([]);
        }
    };

    const searcher = (e) => {
        setSearch(e.target.value);
    };

    const indexEnd = currentPages * dataQt;
    const indexStart = indexEnd - dataQt;

    const nPages = Math.ceil(suppliers.length / dataQt);

    let results = [];
    if (!search) {
        results = suppliers.slice(indexStart, indexEnd);
    } else {
        results = suppliers.filter((dato) => dato.Supplier_Name.toLowerCase().includes(search.toLocaleLowerCase()));
    }

    const openModal = (op, supplier = {}) => {
        setOperation(op);
        setTitle(op === 1 ? 'Registrar proveedor' : 'Editar proveedor');
        setFormValues(op === 1 ? {
            id: '',
            Supplier_Name: '',
            Phone_Number: '',
            Email: '',
            Address: '',
            status: 'A'
        } : {
            id: supplier.id,
            Supplier_Name: supplier.Supplier_Name,
            Phone_Number: supplier.Phone_Number,
            Email: supplier.Email,
            Address: supplier.Address,
            status: supplier.status
        });
        setShowModal(true);
    };
    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const handleClose = () => {
        setShowModal(false);
        setErrors({
            Supplier_Name: '',
            Phone_Number: '',
            Email: '',
            Address: '',
        });
        setTouched({
            Supplier_Name: false,
            Phone_Number: false,
            Email: false,
            Address: false,
        });
    };

    const handleValidation = (name, value) => {
        let error = '';
        switch (name) {
            case 'Supplier_Name':
                error = value.trim() === '' ? 'El nombre del proveedor es requerido' : '';
                break;
            case 'Phone_Number':
                error = !/^\d+$/.test(value) ? 'El número de teléfono debe contener solo dígitos' : '';
                break;
            case 'Email':
                error = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Ingrese un correo electrónico válido' : '';
                break;
            case 'Address':
                error = value.trim() === '' ? 'La dirección es requerida' : '';
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

    const validar = async () => {
        if (errors.Supplier_Name || !formValues.Supplier_Name.trim()) {
            show_alerta(errors.Supplier_Name || 'Por favor, complete el nombre del proveedor.', 'warning');
            return;
        }
        if (errors.Phone_Number || !formValues.Phone_Number.trim()) {
            show_alerta(errors.Phone_Number || 'Por favor, ingrese un número de teléfono válido.', 'warning');
            return;
        }
        if (errors.Email || !formValues.Email.trim()) {
            show_alerta(errors.Email || 'Por favor, ingrese un correo electrónico válido.', 'warning');
            return;
        }
        if (errors.Address || !formValues.Address.trim()) {
            show_alerta(errors.Address || 'Por favor, ingrese la dirección.', 'warning');
            return;
        }

        const parametros = {
            Supplier_Name: formValues.Supplier_Name.trim(),
            Phone_Number: formValues.Phone_Number.trim(),
            Email: formValues.Email.trim(),
            Address: formValues.Address.trim(),
            status: 'A'
        };

        if (operation === 2) {
            parametros.id = formValues.id;
        }

        const metodo = operation === 1 ? 'POST' : 'PUT';
        enviarSolicitud(metodo, parametros);
    };

    const checkIfSupplierExists = async (email) => {
        try {
            const response = await axios.get(`${url}`);
            return response.data.some(supplier => supplier.Email.trim().toLowerCase() === email.trim().toLowerCase());
        } catch (error) {
            console.error('Error al verificar la existencia del proveedor:', error);
            return false;
        }
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
            getSuppliers();
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

    const handleSwitchChange = async (supplierId, checked) => {
        const supplierToUpdate = suppliers.find(supplier => supplier.id === supplierId);
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: `¿Estás seguro que deseas ${checked ? 'activar' : 'desactivar'} el proveedor "${supplierToUpdate.Supplier_Name}"?`,
            icon: 'question',
            text: 'Esta acción puede afectar la disponibilidad del proveedor.',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'Cancelar'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const updatedSupplier = {
                    ...supplierToUpdate,
                    status: checked ? 'A' : 'I'
                };
                try {
                    const response = await axios.put(`${url}/${supplierId}`, updatedSupplier);
                    if (response.status === 200) {
                        setSuppliers(suppliers.map(supplier =>
                            supplier.id === supplierId ? { ...supplier, status: updatedSupplier.status } : supplier
                        ));
                        show_alerta('Estado del proveedor actualizado exitosamente', 'success');
                    }
                } catch (error) {
                    if (error.response) {
                        console.log('Error details:', error.response.data);
                        show_alerta('Error al actualizar el estado del proveedor: ' + JSON.stringify(error.response.data.errors), 'error');
                    } else {
                        console.log('Error details:', error.message);
                        show_alerta('Error al actualizar el estado del proveedor', 'error');
                    }
                }
            } else {
                setSuppliers(suppliers.map(supplier =>
                    supplier.id === supplierId ? { ...supplier, status: !checked ? 'A' : 'I' } : supplier
                ));
                show_alerta('Estado del proveedor no cambiado', 'info');
            }
        });
    };

    const deleteSupplier = async (id, Supplier_Name) => {
        const Myswal = withReactContent(Swal);
        Myswal.fire({
            title: `¿Estás seguro que deseas eliminar el proveedor ${Supplier_Name}?`,
            icon: 'question',
            text: 'No se podrá dar marcha atrás',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                enviarSolicitud('DELETE', { id: id });
            } else {
                show_alerta('El proveedor NO fue eliminado', 'info');
            }
        });
    };

    const handleViewDetails = (supplier) => {
        Swal.fire({
            title: 'Detalles del Proveedor',
            html: `
                <div class="text-left">
                    <p><strong>Nombre:</strong> ${supplier.Supplier_Name}</p>
                    <p><strong>Teléfono:</strong> ${supplier.Phone_Number}</p>
                    <p><strong>Email:</strong> ${supplier.Email}</p>
                    <p><strong>Dirección:</strong> ${supplier.Address}</p>
                    <p><strong>Estado:</strong> ${supplier.status === 'A' ? 'Activo' : 'Inactivo'}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Cerrar'
        });
    };

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Proveedores</span>
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
                                        label="Ingresos"
                                        icon={<IoCart fontSize="small" />}
                                    />
                                    <StyledBreadcrumb
                                        component="a"
                                        href="#"
                                        label="Proveedores"
                                        icon={<GiHairStrands fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-5 d-flex align-items-center'>
                                {
                                    
                                        <Button
                                            className='btn-register'
                                            onClick={() => openModal(1)}
                                            variant="contained"
                                            color="primary"
                                        >
                                            <BsPlusSquareFill /> Registrar
                                        </Button>
                                  
                                }
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
                                        <th>Teléfono</th>
                                        <th>Email</th>
                                        <th>Dirección</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((supplier, i) => (
                                        <tr key={supplier.id}>
                                            <td>{(i + 1)}</td>
                                            <td>{supplier.Supplier_Name}</td>
                                            <td>{supplier.Phone_Number}</td>
                                            <td>{supplier.Email}</td>
                                            <td>{supplier.Address}</td>
                                            <td>
                                                <span className={`serviceStatus ${supplier.status === 'A' ? '' : 'Inactive'}`}>
                                                    {supplier.status === 'A' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className='actions d-flex align-items-center'>
                                                    {
                                                      
                                                            <BlueSwitch
                                                                checked={supplier.status === 'A'}
                                                                onChange={(e) => handleSwitchChange(supplier.id, e.target.checked)}
                                                            />
                                                       
                                                    }
                                                    {
                                                      
                                                            <Button
                                                                color='primary'
                                                                className='primary'
                                                                onClick={() => handleViewDetails(supplier)}
                                                            >
                                                                <FaEye />
                                                            </Button>
                                                    
                                                    }
                                                    {
                                                        supplier.status === 'A'  && (
                                                            <Button
                                                                color="secondary"
                                                                className='secondary'
                                                                onClick={() => openModal(2, supplier)}
                                                            >
                                                                <FaPencilAlt />
                                                            </Button>
                                                        )
                                                    }
                                                    {
                                                        supplier.status === 'A' &&  (
                                                            <Button
                                                                color='error'
                                                                className='delete'
                                                                onClick={async () => {
                                                                    try {
                                                                        // Consultar compras asociadas
                                                                        const response = await axios.get('https://andromeda-api.onrender.com/api/shopping');
                                                                        const purchases = response.data;

                                                                        // Verificar si el proveedor está asociado a alguna compra
                                                                        const isAssociated = purchases.some((purchase) => purchase.supplierId === supplier.id);

                                                                        if (isAssociated) {
                                                                            // Mostrar alerta si está asociado
                                                                            Swal.fire({
                                                                                title: 'No se puede eliminar',
                                                                                text: `El proveedor "${supplier.Supplier_Name}" está asociado a una compra y no puede ser eliminado.`,
                                                                                icon: 'warning',
                                                                                confirmButtonText: 'Entendido'
                                                                            });
                                                                        } else {
                                                                            // Mostrar confirmación de eliminación
                                                                            const confirmDelete = await Swal.fire({
                                                                                title: '¿Estás seguro?',
                                                                                text: `Se eliminará el proveedor "${supplier.Supplier_Name}". Esta acción no se puede deshacer.`,
                                                                                icon: 'warning',
                                                                                showCancelButton: true,
                                                                                confirmButtonText: 'Eliminar',
                                                                                cancelButtonText: 'Cancelar'
                                                                            });

                                                                            if (confirmDelete.isConfirmed) {
                                                                                // Llamar a la función de eliminación
                                                                                deleteSupplier(supplier.id, supplier.Supplier_Name);
                                                                            }
                                                                        }
                                                                    } catch (error) {
                                                                        console.error('Error al verificar compras:', error);
                                                                        Swal.fire({
                                                                            title: 'Error',
                                                                            text: 'No se pudo verificar si el proveedor está asociado a una compra. Inténtalo de nuevo más tarde.',
                                                                            icon: 'error',
                                                                            confirmButtonText: 'Cerrar'
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                <IoTrashSharp />
                                                            </Button>

                                                        )
                                                    }
                                                </div>

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {
                                results.length > 0 ? (
                                    <div className="d-flex table-footer">
                                        <Pagination
                                            setCurrentPages={setCurrentPages}
                                            currentPages={currentPages}
                                            nPages={nPages} />
                                    </div>
                                ) : (<div className="d-flex table-footer">
                                </div>)
                            }
                        </div>
                    </div>
                </div>

                <Modal show={showModal} onHide={handleClose}>
                    <Modal.Header>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Row className="mb-3">
                                <Col sm="6">
                                    <Form.Group>
                                        <Form.Label className='required'>Nombre</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Supplier_Name"
                                            value={formValues.Supplier_Name}
                                            placeholder="Nombre del proveedor"
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.Supplier_Name && !!errors.Supplier_Name}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.Supplier_Name}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col sm="6">
                                    <Form.Group>
                                        <Form.Label className='required'>Teléfono</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Phone_Number"
                                            value={formValues.Phone_Number}
                                            placeholder="Número de teléfono"
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.Phone_Number && !!errors.Phone_Number}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.Phone_Number}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row className="mb-3">
                                <Col sm="6">
                                    <Form.Group>
                                        <Form.Label className='required'>Email</Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="Email"
                                            value={formValues.Email}
                                            placeholder="Correo electrónico"
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.Email && !!errors.Email}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.Email}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                                <Col sm="6">
                                    <Form.Group>
                                        <Form.Label className='required'>Dirección</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="Address"
                                            value={formValues.Address}
                                            placeholder="Dirección"
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            isInvalid={touched.Address && !!errors.Address}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.Address}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className='btn-red' onClick={handleClose}>
                            Cerrar
                        </Button>
                        <Button variant="primary" className='btn-sucess' onClick={validar}>
                            Guardar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
};

export default Suppliers;


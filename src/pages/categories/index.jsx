
import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import Button from '@mui/material/Button';
import { MdCategory } from "react-icons/md";
import { IoCart } from "react-icons/io5";
import { FaEye } from "react-icons/fa";
import { FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import axios from 'axios';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Switch from '@mui/material/Switch';
import { Modal, Form } from 'react-bootstrap';
import { IoSearch } from "react-icons/io5";
import Pagination from '../../components/pagination/index';
import { BsPlusSquareFill } from "react-icons/bs";
import { usePermissions } from '../../components/PermissionCheck';

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

const Categories = () => {
    const url = 'https://andromeda-api.onrender.com/api/categories';
    const [categories, setCategories] = useState([]);
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('A');
    const [operation, setOperation] = useState(1);
    const [title, setTitle] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [value, setValue] = useState([]);
    const [search, setSearch] = useState('');
    const [dataQt, setDataQt] = useState(5);
    const [currentPages, setCurrentPages] = useState(1);
    const permissions = usePermissions();

    const [errors, setErrors] = useState({
        name: '',
        description: '',
    });

    const [touched, setTouched] = useState({
        name: false,
        description: false,
    });

    useEffect(() => {
        getCategories();
    }, []);

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const getCategories = async () => {
        try {
            const response = await axios.get(url);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            show_alerta('Error al obtener las categorías', 'error');
        }
    };

    const searcher = (e) => {
        setSearch(e.target.value);
        console.log(e.target.value);
    };

    const indexEnd = currentPages * dataQt;
    const indexStart = indexEnd - dataQt;

    const nPages = Math.ceil(categories.length / dataQt);

    let results = [];
    if (!search) {
        results = categories.slice(indexStart, indexEnd);
    } else {
        results = categories.filter((dato) => dato.name.toLowerCase().includes(search.toLocaleLowerCase()));
    }

    const openModal = (op, id, name, description) => {
        setId('');
        setName('');
        setDescription('');
        setStatus('A');
        setOperation(op);

        if (op === 1) {
            setTitle('Registrar categoria');
        } else if (op === 2) {
            setTitle('Editar categoria');
            setId(id);
            setName(name);
            setDescription(description);
        }
        setShowModal(true);
    };

    const handleClose = () => {
        setId('');
        setName('');
        setDescription('');
        setStatus('A');

        setErrors({
            name: '',
            description: '',
        });
        setTouched({
            name: false,
            description: false,
        });

        setShowModal(false);
    };

    const validateName = (value) => {
        const regex = /^[a-zA-ZñÑ\s]+$/;

        if (!regex.test(value)) {
            return 'El nombre solo debe contener letras';
        }

        if (value.length < 0 || value.length > 100) {
            return 'Complete el campo';
        }
        return '';
    };

    const checkIfCategoryExists = async (name) => {
        try {
            const response = await axios.get(`${url}`);
            return response.data.some(category => category.name.trim().toLowerCase() === name.trim().toLowerCase());
        } catch (error) {
            console.error('Error al verificar la existencia de la categoría:', error);
            return false;
        }
    };

    const validateDescription = (value) => {
        if (value.length < 10 || value.length > 500) {
            return 'La descripción debe tener entre 10 y 500 caracteres';
        }
        return '';
    };

    const handleValidation = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                error = validateName(value);
                break;
            case 'description':
                error = validateDescription(value);
                break;
            default:
                break;
        }
        setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        handleValidation(name, value);

        switch (name) {
            case 'name':
                setName(value);
                break;
            case 'description':
                setDescription(value);
                break;
            default:
                break;
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
        handleValidation(name, e.target.value);
    };

    const validar = async () => {
        if (errors.name || !name.trim()) {
            show_alerta(errors.name || 'Por favor, complete el nombre de la categoría.', 'warning');
            return;
        }
    
        if (errors.description || !description.trim()) {
            show_alerta(errors.description || 'Por favor, complete la descripción de la categoría.', 'warning');
            return;
        }
    
        if (operation === 1) {
            const categoryExists = await checkIfCategoryExists(name.trim());
    
            if (categoryExists) {
                show_alerta('La categoría con este nombre ya existe. Por favor, elija otro nombre.', 'warning');
                return;
            }
        }
    
        const parametros = {
            name: name.trim(),
            description: description.trim(),
            status: 'A'
        };
    
        if (operation === 2) {
            parametros.id = id;
        }
    
        const metodo = operation === 2 ? 'PUT' : 'POST';
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
                document.getElementById('btnCerrar')?.click();
            }
            getCategories();
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

    const deleteCategory = async (id, name) => {
        try {
            const productsResponse = await axios.get('https://andromeda-api.onrender.com/api/products');
            const isCategoryInUse = productsResponse.data.some(product =>
                product.Category_Id === id
            );

            const Myswal = withReactContent(Swal);

            if (isCategoryInUse) {
                Myswal.fire({
                    title: 'No se puede eliminar',
                    text: `La categoría "${name}" está asociada a uno o más productos existentes y no puede ser eliminada.`,
                    icon: 'error',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            Myswal.fire({
                title: `¿Estás seguro que deseas eliminar la categoría ${name}?`,
                icon: 'question',
                text: 'No se podrá dar marcha atrás',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    setId(id);
                    enviarSolicitud('DELETE', { id: id });

                    const totalItems = categories.length - 1;
                    const newTotalPages = Math.ceil(totalItems / dataQt);

                    if (currentPages > newTotalPages) {
                        setCurrentPages(Math.max(1, currentPages - 1));
                    }
                } else {
                    show_alerta('La categoría NO fue eliminada', 'info');
                }
            });
        } catch (error) {
            console.error('Error checking category associations:', error);
            show_alerta('Error al verificar las asociaciones de la categoría', 'error');
        }
    };

    const handleSwitchChange = async (categoryId, checked) => {
        const categoryToUpdate = categories.find(category => category.id === categoryId);
        const Myswal = withReactContent(Swal);

        try {
            const associationCheck = await axios.get(`${url}/check-association/${categoryId}`);

            if (associationCheck.data.isAssociated) {
                Myswal.fire({
                    title: 'No se puede cambiar el estado',
                    text: `La categoría "${categoryToUpdate.name}" está asociada a uno o más productos.`,
                    icon: 'warning',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }

            Myswal.fire({
                title: `¿Estás seguro que deseas ${checked ? 'activar' : 'desactivar'} la categoría "${categoryToUpdate.name}"?`,
                icon: 'question',
                text: 'Esta acción puede afectar la disponibilidad de la categoría.',
                showCancelButton: true,
                confirmButtonText: 'Sí, confirmar',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const updatedCategory = {
                        ...categoryToUpdate,
                        status: checked ? 'A' : 'I'
                    };
                    try {
                        const response = await axios.put(`${url}/${categoryId}`, updatedCategory);
                        if (response.status === 200) {
                            setCategories(categories.map(category =>
                                category.id === categoryId ? { ...category, status: updatedCategory.status } : category
                            ));
                            show_alerta('Estado de la categoría actualizado exitosamente', 'success');
                        }
                    } catch (error) {
                        if (error.response) {
                            console.log('Error details:', error.response.data);
                            show_alerta('Error al actualizar el estado de la categoría: ' + JSON.stringify(error.response.data.errors), 'error');
                        } else {
                            console.log('Error details:', error.message);
                            show_alerta('Error al actualizar el estado de la categoría', 'error');
                        }
                    }
                } else {
                    setCategories(categories.map(category =>
                        category.id === categoryId ? { ...category, status: !checked ? 'A' : 'I' } : category
                    ));
                    show_alerta('Estado de la categoría no cambiado', 'info');
                }
            });
        } catch (error) {
            console.log('Error al verificar asociación de la categoría:', error);
            show_alerta('Error al verificar asociación de la categoría', 'error');
        }
    };

    return (
        <>
            <div className="right-content w-100">
                <div className="row d-flex align-items-center w-100">
                    <div className="spacing d-flex align-items-center">
                        <div className='col-sm-5'>
                            <span className='Title'>Categorias</span>
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
                                        label="Categorias"
                                        icon={<MdCategory fontSize="small" />}
                                    />
                                </Breadcrumbs>
                            </div>
                        </div>
                    </div>
                    <div className='card shadow border-0 p-3'>
                        <div className='row'>
                            <div className='col-sm-5 d-flex align-items-center'>
                                <Button className='btn-register' onClick={() => openModal(1)} variant="contained">
                                    <BsPlusSquareFill /> Registrar
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
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.length > 0 ? (
                                        results.map((category, i) => (
                                            <tr key={category.id}>
                                                <td>{(i + 1)}</td>
                                                <td>{category.name}</td>
                                                <td>{category.description}</td>
                                                <td><span className={`serviceStatus ${category.status === 'A' ? '' : 'Inactive'}`}>{category.status === 'A' ? 'Activo' : 'Inactivo'}</span></td>
                                                <td>
                                                    <div className='actions d-flex align-items-center'>
                                                        <Switch
                                                            checked={category.status === 'A'}
                                                            onChange={(e) => handleSwitchChange(category.id, e.target.checked)}
                                                        />
                                                        {category.status === 'A' && (
                                                            <>
                                                                <Button color="secondary" className='secondary' onClick={() => openModal(2, category.id, category.name, category.description)}>
                                                                    <FaPencilAlt />
                                                                </Button>
                                                                <Button color='error' className='delete' onClick={() => deleteCategory(category.id, category.name)}>
                                                                    <IoTrashSharp />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className='text-center'>
                                                No hay categorias disponibles
                                            </td>
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
                <Modal show={showModal}>
                    <Modal.Header>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group className='pb-2'>
                                <Form.Label className='required'>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={name}
                                    placeholder="Nombre"
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    isInvalid={touched.name && !!errors.name}
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.name}
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className='pb-2'>
                                <Form.Label className='required'>Descripción</Form.Label>
                                <Form.Control
                                    as="textarea" rows={2}
                                    name="description"
                                    value={description}
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
                        <Button variant="primary" onClick={validar} className='btn-sucess'>
                            Guardar
                        </Button>
                        <Button variant="secondary" onClick={handleClose} id='btnCerrar' className='btn-red'>
                            Cerrar
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </>
    );
};

export default Categories;

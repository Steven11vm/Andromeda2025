import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { IoCart } from "react-icons/io5";
import { FaCartPlus } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import Button from '@mui/material/Button';
import { Form, Col, Row } from 'react-bootstrap';
import { IoTrashSharp } from "react-icons/io5";
import { FaPlus, FaMinus } from "react-icons/fa6";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { show_alerta } from '../../../assets/functions';


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

const RegisterShopping = () => {
    const urlShopping = 'https://andromeda-api.onrender.com/api/shopping';
    const urlSuppliers = 'https://andromeda-api.onrender.com/api/suppliers';
    const urlProducts = 'https://andromeda-api.onrender.com/api/products';
    const navigate = useNavigate();

    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [shoppingDetails, setShoppingDetails] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [realTimeErrors, setRealTimeErrors] = useState({});

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        defaultValues: {
            code: '',
            purchaseDate: new Date().toISOString().split("T")[0],
            supplierId: '',
        }
    });

    useEffect(() => {
        getSuppliers();
        getProducts();
        loadSavedData();
    }, []);

    const getSuppliers = async () => {
        try {
            const response = await axios.get(urlSuppliers);
            setSuppliers(response.data.filter(supplier => supplier.status === 'A'));
        } catch (error) {
            console.error('Error al obtener proveedores', error);
        }
    };

    const getProducts = async () => {
        try {
            const response = await axios.get(urlProducts);
            setProducts(response.data.filter(product => product.status === 'A'));
        } catch (error) {
            console.error('Error al obtener productos', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'purchaseDate') {
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (selectedDate > today) {
                setRealTimeErrors(prev => ({
                    ...prev,
                    purchaseDate: 'No se puede registrar compras para fechas futuras.'
                }));
            } else {
                setRealTimeErrors(prev => ({ ...prev, purchaseDate: '' }));
            }
        }

        if (name === 'code') {
            if (value.trim() === '') {
                setRealTimeErrors(prev => ({ ...prev, code: 'El código no puede estar vacío' }));
            } else if (value.length > 15) {
                setRealTimeErrors(prev => ({ ...prev, code: 'El código no puede tener más de 15 caracteres' }));
            } else {
                setRealTimeErrors(prev => ({ ...prev, code: '' }));
            }
        }

        if (name === 'supplierId') {
            if (!value) {
                setRealTimeErrors(prev => ({ ...prev, supplierId: 'Debe seleccionar un proveedor' }));
            } else {
                setRealTimeErrors(prev => ({ ...prev, supplierId: '' }));
            }
        }

        setValue(name, value);
        saveData({ ...watch(), [name]: value }, shoppingDetails);
    };

    const handleProductSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredProducts = products.filter(product =>
        product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !shoppingDetails.some(item => item.product_id === product.id)
    );

    const addProductToDetails = (product) => {
        const newShoppingDetails = [...shoppingDetails, {
            product_id: product.id,
            Product_Name: product.Product_Name,
            quantity: 1,
            unitPrice: parseFloat(product.Price),
            total_price: parseFloat(product.Price)
        }];
        setShoppingDetails(newShoppingDetails);
        saveData(watch(), newShoppingDetails);
        setSearchTerm('');
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity > 50) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'La cantidad no puede ser mayor a 50.',
            });
            return;
        }
        setShoppingDetails(shoppingDetails.map(item => {
            if (item.product_id === productId) {
                const validQuantity = Math.max(1, Math.min(50, newQuantity));
                const newTotalPrice = item.unitPrice * validQuantity;
                return { ...item, quantity: validQuantity, total_price: newTotalPrice };
            }
            return item;
        }));
    };

    const handleUnitPriceChange = (productId, event) => {
        const newUnitPrice = parseFloat(event.target.value) || 0;
        setShoppingDetails(shoppingDetails.map(item => {
            if (item.product_id === productId) {
                const newTotalPrice = newUnitPrice * item.quantity;
                return { ...item, unitPrice: newUnitPrice, total_price: newTotalPrice };
            }
            return item;
        }));
    };

    const handleQuantityChange = (productId, event) => {
        const newQuantity = parseInt(event.target.value) || 1;
        updateQuantity(productId, newQuantity);
    };

    const removeProduct = (productId) => {
        const updatedDetails = shoppingDetails.filter(item => item.product_id !== productId);
        setShoppingDetails(updatedDetails);
        saveData(watch(), updatedDetails);
    };

    const calculateTotal = () => {
        return shoppingDetails.reduce((total, item) => total + item.total_price, 0);
    };

    const checkIfShopExists = async (code) => {
        try {
            const response = await axios.get(`${urlShopping}`, {
                params: { code }
            });
            return response.data.some(shoppi => shoppi.code.trim().toLowerCase() === code.trim().toLowerCase());
        } catch (error) {
            console.error('Error al verificar la existencia de la compra:', error);
            return false;
        }
    };

    const onSubmit = async (data) => {
        if (shoppingDetails.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Por favor, agregue al menos un producto.',
            });
            return;
        }

        const serviceExists = await checkIfShopExists(data.code.trim());

        if (serviceExists) {
            show_alerta('El codigo de esta compra ya existe. Por favor, ingrese el codigo correcto', 'warning');
            return;
        }

        const shoppingData = {
            ...data,
            status: "completada",
            shoppingDetails: shoppingDetails.map(({ Product_Name, ...item }) => item)
        };

        try {
            await axios.post(urlShopping, shoppingData);
            localStorage.removeItem('shoppingFormData');
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Compra registrada con éxito',
            }).then(() => {
                navigate('/Shopping');
            });

            setValue('code', '');
            setValue('purchaseDate', new Date().toISOString().split("T")[0]);
            setValue('supplierId', '');
            setShoppingDetails([]);
        } catch (error) {
            console.error('Error al registrar la compra', error);

            if (error.response && error.response.data && error.response.data.message) {
                if (error.response.data.message.toLowerCase().includes('código')) {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Código Duplicado',
                        text: 'Ya existe una compra registrada con este código.',
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response.data.message || 'Error al registrar la compra',
                    });
                }
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al registrar la compra',
                });
            }
        }
    };

    const saveData = (formData, shoppingDetails) => {
        localStorage.setItem('shoppingFormData', JSON.stringify({ formData, shoppingDetails }));
    };

    const loadSavedData = () => {
        const savedData = localStorage.getItem('shoppingFormData');
        if (savedData) {
            const { formData: savedFormData, shoppingDetails: savedShoppingDetails } = JSON.parse(savedData);
            Object.keys(savedFormData).forEach(key => setValue(key, savedFormData[key]));
            setShoppingDetails(savedShoppingDetails);
        }
    };

    const handleClose = () => {
        localStorage.removeItem('shoppingFormData');
        navigate('/Shopping');
    };

    return (
        <div className="right-content w-100">
            <div className="row d-flex align-items-center w-100">
                <div className="spacing d-flex align-items-center">
                    <div className='col-sm-5'>
                        <span className='Title'>Registrar Compra</span>
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
                                    label="Compras"
                                    icon={<FaCartPlus fontSize="small" />}
                                />
                            </Breadcrumbs>
                        </div>
                    </div>
                </div>
                <div className='card border-0 p-3 d-flex colorTransparent'>
                    <div className='row'>
                        <div className='col-sm-7'>
                            <div className='card-detail shadow border-0'>
                                <div className='row p-3'>
                                    <div className='bcg-w col-sm-7 d-flex align-items-center'>
                                        <div className="position-relative d-flex align-items-center">
                                            <span className='Title'>Detalle de compra</span>
                                        </div>
                                    </div>
                                    <div className='col-sm-5 d-flex align-items-center justify-content-end'>
                                        <div className="searchBox position-relative d-flex align-items-center">
                                            <IoSearch className="mr-2" />
                                            <input
                                                type="text"
                                                placeholder='Buscar producto...'
                                                className='form-control'
                                                value={searchTerm}
                                                onChange={handleProductSearch}
                                            />
                                        </div>
                                    </div>
                                    <div className='d-flex aline-items-center justify-content-end'>
                                        <div className="product-search-results">
                                            {searchTerm && filteredProducts.map(product => (
                                                <div key={product.id} className="product-item shadow border-0" onClick={() => addProductToDetails(product)}>
                                                    {product.Product_Name} - ${product.Price}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className='table-responsive mt-3 p-3'>
                                    <table className='table table-bordered table-hover v-align table-striped'>
                                        <thead className='table-light'>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cantidad</th>
                                                <th>Precio unt</th>
                                                <th>Subtotal</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shoppingDetails.map((item) => (
                                                <tr key={item.product_id}>
                                                    <td>{item.Product_Name}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(item.product_id, e)}
                                                            min="1"
                                                            max="50"
                                                            className="form-control"
                                                            style={{ width: '65px' }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleUnitPriceChange(item.product_id, e)}
                                                            className="form-control"
                                                            style={{ width: '110px' }}
                                                        />
                                                    </td>
                                                    <td>{item.total_price.toFixed(2)}</td>
                                                    <td>
                                                        <div className='d-flex align-items-center'>
                                                            <Button color='error' className='delete' onClick={() => removeProduct(item.product_id)}><IoTrashSharp /></Button>
                                                            <div className='actions-quantity'>
                                                                <Button className='primary' onClick={() => updateQuantity(item.product_id, item.quantity + 1)}><FaPlus /></Button>
                                                                <Button className='primary' onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}><FaMinus /></Button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className='d-flex align-items-center justify-content-end Monto-content p-4'>
                                    <span className='valor'>Total: ${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <div className='col-sm-5'>
                            <div className='card-detail shadow border-0'>
                                <div className="cont-title w-100">
                                    <span className='Title'>Info de compra</span>
                                </div>
                                <div className='d-flex align-items-center'>
                                    <div className="d-flex align-items-center w-100 p-4">
                                        <Form className='form' onSubmit={handleSubmit(onSubmit)}>
                                            <Form.Group as={Row} className="mb-3">
                                                <Col sm="6">
                                                    <Form.Label>Codigo</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Ingrese el código"
                                                        {...register("code", {
                                                            required: "El código es requerido",
                                                            validate: (value) => value.trim() !== '' || "El código no puede estar vacío",
                                                            maxLength: { value: 15, message: "El código no puede tener más de 15 caracteres" }
                                                        })}
                                                        onChange={handleInputChange}
                                                        className={
                                                            errors.code || realTimeErrors.code
                                                                ? 'form-control is-invalid'
                                                                : 'form-control'
                                                        }
                                                    />
                                                    {(errors.code || realTimeErrors.code) &&
                                                        <Form.Text className="text-danger">
                                                            {errors.code?.message || realTimeErrors.code}
                                                        </Form.Text>
                                                    }
                                                </Col>
                                                <Col sm="6">
                                                    <Form.Label>Fecha Compra</Form.Label>
                                                    <Form.Control
                                                        type="date"
                                                        placeholder="Fecha Compra"
                                                        {...register("purchaseDate", {
                                                            required: "La fecha de compra es requerida",
                                                            validate: value => {
                                                                const selectedDate = new Date(value);
                                                                const today = new Date();
                                                                today.setHours(0, 0, 0, 0);
                                                                return selectedDate <= today || "No se puede registrar compras para fechas futuras.";
                                                            }
                                                        })}
                                                        onChange={handleInputChange}
                                                        max={new Date().toISOString().split("T")[0]}
                                                        className={
                                                            errors.purchaseDate || realTimeErrors.purchaseDate
                                                                ? 'form-control is-invalid'
                                                                : 'form-control'
                                                        }
                                                    />
                                                    {(errors.purchaseDate || realTimeErrors.purchaseDate) &&
                                                        <Form.Text className="text-danger">
                                                            {errors.purchaseDate?.message || realTimeErrors.purchaseDate}
                                                        </Form.Text>
                                                    }
                                                </Col>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Proveedor</Form.Label>
                                                <Form.Select
                                                    {...register("supplierId", { required: "Debe seleccionar un proveedor" })}
                                                    onChange={handleInputChange}
                                                    className={
                                                        errors.supplierId || realTimeErrors.supplierId
                                                            ? 'form-control is-invalid'
                                                            : 'form-control'
                                                    }
                                                >
                                                    <option value="">Seleccionar proveedor</option>
                                                    {suppliers.map((supplier) => (
                                                        <option key={supplier.id} value={supplier.id}>
                                                            {supplier.Supplier_Name}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                {(errors.supplierId || realTimeErrors.supplierId) &&
                                                    <Form.Text className="text-danger">
                                                        {errors.supplierId?.message || realTimeErrors.supplierId}
                                                    </Form.Text>
                                                }
                                            </Form.Group>
                                            <Form.Group className='d-flex align-items-center justify-content-end'>
                                                <Button variant="secondary" className='btn-red' onClick={handleClose}>
                                                    Cerrar
                                                </Button>
                                                <Button variant="primary" type="submit" className='btn-sucess'>
                                                    Guardar
                                                </Button>
                                            </Form.Group>
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterShopping;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { FcSalesPerformance } from "react-icons/fc";
import { FaMoneyBillWave } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import Button from '@mui/material/Button';
import { IoTrashSharp } from "react-icons/io5";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { Form, Col, Row } from 'react-bootstrap';
import Swal from 'sweetalert2';
import { show_alerta } from '../../../assets/functions';
import 'bootstrap/dist/css/bootstrap.min.css';

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

export default function Component({ saleId }) {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [saleInfo, setSaleInfo] = useState({
    Billnumber: '',
    SaleDate: new Date().toISOString().split('T')[0],
    total_price: 0,
    status: 'Pendiente',
    id_usuario: '',
    appointmentData: {
      id: '',
      Init_Time: '',
      Finish_Time: '',
      Date: new Date().toISOString().split('T')[0],
      time_appointment: 60,
      status: 'Pendiente'
    },
    saleDetails: []
  });

  useEffect(() => {
    if (saleId) {
      fetchSaleData();
    }
  }, [saleId]);

  const [errors, setErrors] = useState({});
  const urlServices = 'https://andromeda-api.onrender.com/api/services';
  const urlUsers = 'https://andromeda-api.onrender.com/api/users';

  useEffect(() => {
    getUsers();
    getProducts();
    getServices();
    if (saleId) {
      fetchSaleData();
    }
  }, [saleId]);

  const fetchSaleData = async () => {
    try {
      const response = await axios.get(`https://andromeda-api.onrender.com/api/sales/${saleId}`);
      const saleData = response.data;
      setSaleInfo({
        ...saleData,
        appointmentData: {
          ...saleData.appointmentData,
          Date: saleData.appointmentData.Date.split('T')[0],
          Init_Time: saleData.appointmentData.Init_Time.slice(0, 5),
          Finish_Time: saleData.appointmentData.Finish_Time.slice(0, 5),
        },
      });
    } catch (error) {
      console.error('Error fetching sale data:', error);
      show_alerta('Error al cargar los datos de la venta', 'error');
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

  const handleProductSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter(product =>
    product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedProducts.some(sp => sp.id === product.id)
  );

  const addProduct = (product) => {
    const existingProduct = selectedProducts.find(p => p.id === product.id);
    if (existingProduct) {
      if (existingProduct.quantity + 1 > product.Stock) {
        show_alerta(`No hay suficiente stock para ${product.Product_Name}`, 'error');
        return;
      }
      setSelectedProducts(selectedProducts.map(p =>
        p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p
      ));
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
    updateSaleDetails();
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    updateSaleDetails();
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
    updateSaleDetails();
  };

  const updateSaleDetails = () => {
    const details = selectedProducts.map(product => ({
      quantity: product.quantity,
      unitPrice: product.Price,
      total_price: product.Price * product.quantity,
      id_producto: product.id,
      empleadoId: null,
      serviceId: null
    }));
    setSaleInfo(prevState => ({
      ...prevState,
      saleDetails: [...details, ...prevState.saleDetails.filter(d => d.serviceId)],
      total_price: details.reduce((sum, item) => sum + item.total_price, 0)
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSaleInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
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
      case 'id_usuario':
        if (!value) {
          newErrors.id_usuario = 'Debe seleccionar un cliente';
        } else {
          newErrors.id_usuario = '';
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`https://andromeda-api.onrender.com/api/sales/${saleId}/appointments/${saleInfo.appointmentData.id}`, {
        saleId: saleId,
        appointmentData: {
          ...saleInfo.appointmentData,
          Init_Time: saleInfo.appointmentData.Init_Time + ':00',
          Finish_Time: saleInfo.appointmentData.Finish_Time + ':00',
        },
        saleDetails: saleInfo.saleDetails
      });
      show_alerta('Venta actualizada con éxito', 'success');
    } catch (error) {
      console.error('Error al actualizar la venta:', error);
      show_alerta('Error al actualizar la venta', 'error');
    }
  };

  const handleServiceChange = (index, field, value) => {
    setSaleInfo(prevState => {
      const newDetails = [...prevState.saleDetails];
      newDetails[index] = { ...newDetails[index], [field]: value };
      if (field === 'serviceId') {
        const service = services.find(s => s.id === parseInt(value));
        if (service) {
          newDetails[index].unitPrice = service.price;
          newDetails[index].total_price = service.price * newDetails[index].quantity;
        }
      }
      return {
        ...prevState,
        saleDetails: newDetails,
        total_price: newDetails.reduce((sum, item) => sum + item.total_price, 0)
      };
    });
  };

  const handleServiceRemove = (index) => {
    setSaleInfo(prevState => ({
      ...prevState,
      saleDetails: prevState.saleDetails.filter((_, i) => i !== index),
      total_price: prevState.saleDetails.reduce((sum, item, i) => i !== index ? sum + item.total_price : sum, 0)
    }));
  };

  return (
    <div className="right-content w-100">
      <div className="row d-flex align-items-center w-100">
        <div className="spacing d-flex align-items-center">
          <div className='col-sm-5'>
            <span className='Title'>Editar Venta</span>
          </div>
          <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
            <Breadcrumbs aria-label="breadcrumb">
              <StyledBreadcrumb component="a" href="#" label="Home" icon={<HomeIcon fontSize="small" />} />
              <StyledBreadcrumb component="a" href="#" label="Salidas" icon={<FaMoneyBillWave fontSize="small" />} />
              <StyledBreadcrumb component="a" href="#" label="Ventas" icon={<FcSalesPerformance fontSize="small" />} />
            </Breadcrumbs>
          </div>
        </div>
        <div className='card border-0 p-3 d-flex colorTransparent'>
          <div className='row'>
            <div className='col-sm-7'>
              <div className='card-detail shadow border-0'>
                <div className='row p-3'>
                  <div className='bcg-w col-sm-7 d-flex align-items-center'>
                    <div className="position-relative d-flex align-items-center">
                      <span className='Tittle'>Detalle de venta</span>
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
                        <div key={product.id}>
                          {product.Stock > 0 && (
                            <div className="product-item shadow border-0" onClick={() => addProduct(product)}>
                              {product.Product_Name} - {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className='table-responsive mt-3 p-3'>
                  <table className='table table-bordered table-hover v-align table-striped '>
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
                      {selectedProducts.map(product => (
                        <tr key={product.id}>
                          <td>{product.Product_Name}</td>
                          <td>{product.quantity}</td>
                          <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price)}</td>
                          <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price * product.quantity)}</td>
                          <td>
                            <div className='d-flex align-items-center position-static'>
                              <Button color='error' className='delete' onClick={() => removeProduct(product.id)}><IoTrashSharp /></Button>
                              <div className='actions-quantity'>
                                <Button className='primary' onClick={() => updateQuantity(product.id, 1)}><FaPlus /></Button>
                                <Button className='primary' onClick={() => updateQuantity(product.id, -1)}><FaMinus /></Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className='bcg-w col-sm-7 d-flex align-items-center'>
                  <div className="position-relative d-flex align-items-center">
                    <span className='Tittle'>Servicios</span>
                  </div>
                </div>
                <div className='table-responsive mt-3 w-80 p-3'>
                  <table className='table table-bordered table-hover v-align table-striped'>
                    <thead className='table-light'>
                      <tr>
                        <th>Servicio</th>
                        <th>Empleado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleInfo.saleDetails.filter(detail => detail.serviceId !== null || (detail.id_producto === null && detail.empleadoId === null)).map((detail, index) => (
                        <tr key={index}>
                          <td>
                            <Form.Select
                              value={detail.serviceId || ''}
                              onChange={(e) => handleServiceChange(index, 'serviceId', e.target.value)}
                            >
                              <option value="">Seleccionar servicio</option>
                              {services.map(service => (
                                <option key={service.id} value={service.id}>{service.name}</option>
                              ))}
                            </Form.Select>
                          </td>
                          <td>
                            <Form.Select
                              value={detail.empleadoId || ''}
                              onChange={(e) => handleServiceChange(index, 'empleadoId', e.target.value)}
                            >
                              <option value="">Seleccionar empleado</option>
                              {users.filter(user => user.roleId === 2).map(employee => (
                                <option key={employee.id} value={employee.id}>{employee.name}</option>
                              ))}
                            </Form.Select>
                          </td>
                          <td>
                            <div className='d-flex align-items-center'>
                              <Button color='error' className='delete' onClick={() => handleServiceRemove(index)}><IoTrashSharp /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className='d-flex align-items-center justify-content-end Monto-content p-4'>
                  <span className='Monto'>Total:</span>
                  <span className='valor'>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saleInfo.total_price)}</span>
                </div>
              </div>
            </div>
            <div className='col-sm-5'>
            <div className="card-detail shadow border-0">
      <div className="cont-title w-100">
        <span className='Title'>Editar Venta</span>
      </div>
      <div className='d-flex align-items-center'>
        <div className="d-flex align-items-center w-100 p-4">
          <Form className='form' onSubmit={handleSubmit}>
            <Form.Group as={Row} className="mb-3">
              <Col sm="6">
                <Form.Label className='required'># Comprobante</Form.Label>
                <Form.Control
                  type="text"
                  name="Billnumber"
                  value={saleInfo.Billnumber}
                  onChange={handleInputChange}
                  disabled
                />
              </Col>
              <Col sm="6">
                <Form.Label className='required'>Fecha venta</Form.Label>
                <Form.Control
                  type="date"
                  name="SaleDate"
                  value={saleInfo.SaleDate}
                  onChange={handleInputChange}
                  disabled
                />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3">
              <Col sm="6">
                <Form.Label>Hora inicio</Form.Label>
                <Form.Control
                  type="time"
                  name="Init_Time"
                  value={saleInfo.appointmentData.Init_Time}
                  onChange={handleAppointmentChange}
                />
              </Col>
              <Col sm="6">
                <Form.Label>Hora fin</Form.Label>
                <Form.Control
                  type="time"
                  name="Finish_Time"
                  value={saleInfo.appointmentData.Finish_Time}
                  onChange={handleAppointmentChange}
                />
              </Col>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado de la cita</Form.Label>
              <Form.Select
                name="status"
                value={saleInfo.appointmentData.status}
                onChange={handleAppointmentChange}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className='d-flex align-items-center justify-content-end'>
              <Button variant="secondary" className='btn-red' id='btn-red' href="/Sales">
                Cerrar
              </Button>
              <Button variant="primary" type="submit" className='btn-sucess'>
                Actualizar
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
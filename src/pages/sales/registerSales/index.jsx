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
import CustomTimeSelector from './CustomTimeSelector/CustomTimeSelector';
import { Link, useNavigate } from 'react-router-dom';

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

export default function Component() {
  // Initialize state from localStorage or default values
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(() => {
    const saved = localStorage.getItem('selectedProducts');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const [saleInfo, setSaleInfo] = useState(() => {
    const saved = localStorage.getItem('saleInfo');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      Billnumber: '',
      SaleDate: new Date().toISOString().split('T')[0],
      total_price: 0,
      status: 'Pendiente',
      id_usuario: '',
      appointmentData: {
        Init_Time: '',
        Finish_Time: '',
        Date: new Date().toISOString().split('T')[0],
        time_appointment: 60
      },
      saleDetails: []
    };
  });
  const [errors, setErrors] = useState({});
  const urlServices = 'https://andromeda-api.onrender.com/api/services';
  const urlUsers = 'https://andromeda-api.onrender.com/api/users';
  const [subtotalProducts, setSubtotalProducts] = useState(() => {
    const saved = localStorage.getItem('subtotalProducts');
    return saved ? parseFloat(saved) : 0;
  });
  const [subtotalServices, setSubtotalServices] = useState(() => {
    const saved = localStorage.getItem('subtotalServices');
    return saved ? parseFloat(saved) : 0;
  });

  // Save to localStorage whenever these values change
  useEffect(() => {
    localStorage.setItem('selectedProducts', JSON.stringify(selectedProducts));
  }, [selectedProducts]);

  useEffect(() => {
    localStorage.setItem('saleInfo', JSON.stringify(saleInfo));
  }, [saleInfo]);

  useEffect(() => {
    localStorage.setItem('subtotalProducts', subtotalProducts.toString());
  }, [subtotalProducts]);

  useEffect(() => {
    localStorage.setItem('subtotalServices', subtotalServices.toString());
  }, [subtotalServices]);

  useEffect(() => {
    getUsers();
    getProducts();
    getServices();
  }, []);

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

    setSaleInfo(prevState => ({
      ...prevState,
      saleDetails: [...productDetails, ...serviceDetails],
      total_price: productsSubtotal + servicesSubtotal
    }));
  };

  useEffect(() => {
    if (!saleInfo.Billnumber) {
      const randomBillNumber = Math.floor(100 + Math.random() * 900).toString();
      setSaleInfo((prevState) => ({ ...prevState, Billnumber: randomBillNumber }));
    }
  }, []);

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
    setSaleInfo(prevState => {
      const newState = {
        ...prevState,
        appointmentData: {
          ...prevState.appointmentData,
          [name]: value
        }
      };

      if (name === 'Init_Time' && selectedService) {
        const startTime = new Date(`2000-01-01T${value}`);
        startTime.setMinutes(startTime.getMinutes() + selectedService.time);
        const endTime = startTime.toTimeString().slice(0, 5);
        newState.appointmentData.Finish_Time = endTime;
      }

      return newState;
    });
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

    validateField('Billnumber', saleInfo.Billnumber);
    validateField('id_usuario', saleInfo.id_usuario);

    if (errors.Billnumber || errors.id_usuario) {
      show_alerta('Por favor, corrija los errores antes de enviar', 'warning');
      return;
    }

    if (saleInfo.saleDetails.length === 0) {
      show_alerta('Debe agregar al menos un producto o servicio al detalle de la venta', 'warning');
      return;
    }

    try {
      await axios.post('https://andromeda-api.onrender.com/api/sales', saleInfo);
      show_alerta('Venta registrada con éxito', 'success');

      // Clear localStorage
      localStorage.removeItem('selectedProducts');
      localStorage.removeItem('saleInfo');
      localStorage.removeItem('subtotalProducts');
      localStorage.removeItem('subtotalServices');

      // Reset state
      setSaleInfo({
        Billnumber: '',
        SaleDate: new Date().toISOString().split('T')[0],
        total_price: 0,
        status: 'Pendiente',
        id_usuario: '',
        appointmentData: {
          Init_Time: '',
          Finish_Time: '',
          Date: new Date().toISOString().split('T')[0],
          time_appointment: 60
        },
        saleDetails: []
      });
      setSelectedProducts([]);
      setSubtotalProducts(0);
      setSubtotalServices(0);
      navigate('/sales')
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      show_alerta('Error al registrar la venta', 'error');
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

  const handleServiceChange = (index, field, value) => {
    setSaleInfo(prevState => {
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

            // Calculate total appointment time
            const totalTime = serviceDetails.reduce((sum, detail) => {
              if (detail.serviceId) {
                const selectedService = services.find(s => s.id === parseInt(detail.serviceId));
                return sum + (selectedService ? selectedService.time : 0);
              }
              return sum;
            }, 0);

            // Update appointment times
            if (prevState.appointmentData.Init_Time) {
              const startTime = new Date(`2000-01-01T${prevState.appointmentData.Init_Time}`);
              const endTime = new Date(startTime.getTime() + totalTime * 60000);
              const formattedEndTime = endTime.toTimeString().slice(0, 5);

              return {
                ...prevState,
                appointmentData: {
                  ...prevState.appointmentData,
                  Finish_Time: formattedEndTime,
                  time_appointment: totalTime
                },
                saleDetails: serviceDetails
              };
            }
          }
        }
      }

      const productDetails = selectedProducts.map(product => ({
        quantity: product.quantity,
        unitPrice: product.Price,
        total_price: product.Price * product.quantity,
        id_producto: product.id,
        empleadoId: null,
        serviceId: null
      }));

      const allDetails = [...productDetails, ...serviceDetails];

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

      return {
        ...prevState,
        saleDetails: allDetails,
        total_price: productsSubtotal + servicesSubtotal
      };
    });
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

  const NextRegister = () => {
    localStorage.removeItem('selectedProducts');
    localStorage.removeItem('saleInfo');
    localStorage.removeItem('subtotalProducts');
    localStorage.removeItem('subtotalServices');
    navigate('/sales');
  }

  return (
    <div className="right-content w-100">
      <div className="row d-flex align-items-center w-100">
        {/* Breadcrumbs section remains the same */}
        <div className='spacing d-flex align-items-center'>
          <div className='col-sm-5'>
            <span className='Title'>Registrar Ventas</span>
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
            {/* Products Card */}
            <div className='col-sm-6'>
              <div className='card-detail shadow border-0 mb-4'>
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
                  {/* Product search results */}
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
                {/* Products table */}
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
                <div className='d-flex align-items-center justify-content-end Monto-content p-4'>
                  <span className='valor'>Subtotal Productos: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotalProducts)}</span>
                </div>
              </div>

              {/* Services Card */}
              <div className='card-detail shadow border-0 mb-4'>
                <div className='bcg-w col-sm-12 p-3'>
                  <div className="position-relative d-flex align-items-center">
                    <span className='Tittle'>Servicios</span>
                  </div>
                </div>
                <div className='table-responsive p-3'>
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
                              {services
                                .filter(service => !saleInfo.saleDetails.some(
                                  d => d.serviceId === service.id.toString() && d !== detail
                                ))
                                .map(service => (
                                  <option key={service.id} value={service.id}>{service.name}</option>
                                ))
                              }
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
                  <div className="d-flex justify-content-start mt-2 px-3">
                    <Button
                      onClick={handleServiceAdd}
                      style={{
                        backgroundColor: '#198754',
                        color: 'white',
                        margin: '5px',
                        border: '2px solid #198754',
                        borderRadius: '5px',
                        padding: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FaPlus />
                    </Button>
                  </div>
                </div>
                <div className='d-flex align-items-center justify-content-end Monto-content p-4'>
                  <span className='valor'>Subtotal Servicios: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(subtotalServices)}</span>
                </div>
              </div>
            </div>

            {/* Sale Info Card */}
            <div className='col-sm-6'>
              <div className='card-detail shadow border-0 mb-4'>
                <div className="cont-title w-100">
                  <span className='Title'>Info de venta</span>
                </div>
                <div className='d-flex align-items-center'>
                  <div className="d-flex align-items-center w-100 p-4">
                    <Form className='form w-100'>
                      <Form.Group as={Row} className="mb-3">
                        <Col sm="6">
                          <Form.Label className='required'># Comprobante</Form.Label>
                          <Form.Control
                            type="text"
                            name="Billnumber"
                            value={saleInfo.Billnumber}
                            isInvalid={!!errors.Billnumber}
                            readOnly
                            disabled
                          />

                          <Form.Control.Feedback type="invalid">
                            {errors.Billnumber}
                          </Form.Control.Feedback>
                        </Col>
                        <Col sm="6">
                          <Form.Label className='required'>Fecha venta</Form.Label>
                          <Form.Control
                            type="date"
                            name="SaleDate"
                            value={saleInfo.SaleDate}
                            onChange={handleInputChange}
                          />
                        </Col>
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label className='required'>Cliente</Form.Label>
                        <Form.Select
                          name="id_usuario"
                          value={saleInfo.id_usuario}
                          onChange={handleInputChange}
                          isInvalid={!!errors.id_usuario}
                        >
                          <option value="">Seleccionar cliente</option>
                          {users.filter(user => user.roleId === 3).map(user => (
                            <option key={user.id} value={user.id}>{user.name}</option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.id_usuario}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Form>
                  </div>
                </div>
              </div>

              {/* Appointment Time Card */}
              <div className='card-detail shadow border-0 mb-4'>
                <div className="cont-title w-100">
                  <span className='Title'>Horario de cita</span>
                </div>
                <div className='d-flex align-items-center'>
                  <div className="d-flex align-items-center w-100 p-4">
                    <Form className='form w-100'>
                      <Form.Group as={Row} className="mb-3">
                        <Col sm="6">
                          <Form.Label>Hora inicio</Form.Label>
                          <CustomTimeSelector
                            name="Init_Time"
                            value={saleInfo.appointmentData.Init_Time}
                            onChange={(time) => handleAppointmentChange({ target: { name: 'Init_Time', value: time } })}
                          />
                        </Col>
                        <Col sm="6">
                          <Form.Label>Hora fin</Form.Label>
                          <CustomTimeSelector
                            name="Finish_Time"
                            value={saleInfo.appointmentData.Finish_Time}
                            onChange={(time) => handleAppointmentChange({ target: { name: 'Finish_Time', value: time } })}
                            disabled={true}
                          />
                        </Col>
                      </Form.Group>
                      {selectedService && (
                        <Form.Group as={Row} className="mb-3">
                          <Col sm="12">
                            <Form.Text>
                              Duración del servicio: {selectedService.time} minutos
                            </Form.Text>
                          </Col>
                        </Form.Group>
                      )}
                    </Form>
                  </div>
                </div>
              </div>
              <div className='spacing d-flex align-items-center footer-total'>
                <div className="row">
                  <div className="col-sm-6 d-flex align-items-center justify-content-start padding-monto">
                    <div className='Monto-content'>
                      <span className='valor'>Total General: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(saleInfo.total_price)}</span>
                    </div>
                  </div>
                  <div className="col-sm-5 d-flex align-items-center justify-content-end">
                    <div className='d-flex align-items-center justify-content-end'>
                      <Button
                        variant="secondary"
                        className='btn-red'
                        id='btn-red'
                        onClick={()=>NextRegister()}
                        style={{ minWidth: '100px' }}
                      >
                        Cerrar
                      </Button>
                      <Button
                        variant="primary"
                        className='btn-sucess'
                        onClick={handleSubmit}
                        style={{ minWidth: '100px' }}
                      >
                        Guardar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
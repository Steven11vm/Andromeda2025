
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { BsCalendar2DateFill } from "react-icons/bs";
import { FaMoneyBillWave } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import Button from '@mui/material/Button';
import { IoTrashSharp } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { Form, Col, Row } from 'react-bootstrap';
import { show_alerta } from '../../../assets/functions';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import '../appointment.css';

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
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [filteredClients, setFilteredClients] = useState([]);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
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

  useEffect(() => {
    getUsers();
    getServices();
  }, []);

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
      setUsers(response.data.filter(user => user.roleId === 3));
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
    
    // Si se selecciona un servicio, calcular hora fin automáticamente
    if (field === 'serviceId' && value && formData.horaInicio) {
      const service = services.find(s => s.id === parseInt(value));
      if (service) {
        const [hours, minutes] = formData.horaInicio.split(':').map(Number);
        const startTime = new Date(2000, 0, 1, hours, minutes);
        const endTime = new Date(startTime.getTime() + service.time * 60000);
        const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
        setFormData(prev => ({ ...prev, horaFin: endTimeStr }));
      }
    }
    
    setSelectedServices(updated);
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

  const generateAppointmentDates = () => {
    const dates = [];
    const startDate = new Date(formData.fecha);
    
    if (!formData.citaFija) {
      // Si no es cita fija, solo retornar la fecha seleccionada
      return [formData.fecha];
    }

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
      
      dates.push(currentDate.toISOString().split('T')[0]);
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
        const billNumber = Math.floor(100 + Math.random() * 900).toString() + index.toString();
        
        const saleInfo = {
          Billnumber: billNumber,
          SaleDate: date,
          total_price: calculateTotal(),
          status: 'Pendiente',
          id_usuario: formData.clienteId,
          appointmentData: {
            Init_Time: formData.horaInicio,
            Finish_Time: formData.horaFin,
            Date: date,
            time_appointment: totalDuration
          },
          saleDetails: selectedServices.map(service => {
            const serviceData = services.find(s => s.id === parseInt(service.serviceId));
            return {
              quantity: 1,
              unitPrice: serviceData ? serviceData.price : 0,
              total_price: serviceData ? serviceData.price : 0,
              id_producto: null,
              empleadoId: service.empleadoId,
              serviceId: service.serviceId
            };
          })
        };

        return axios.post('https://andromeda-api.onrender.com/api/sales', saleInfo);
      });

      await Promise.all(promises);
      
      const mensaje = formData.citaFija 
        ? `${appointmentDates.length} citas ${formData.frecuencia === 'semanal' ? 'semanales' : formData.frecuencia === 'quincenal' ? 'quincenales' : 'mensuales'} registradas con éxito`
        : 'Cita registrada con éxito';
      
      show_alerta(mensaje, 'success');
      navigate('/appointment');
    } catch (error) {
      console.error('Error al registrar la cita:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al registrar la cita';
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

                    <Form.Group as={Row} className="mb-3">
                      <Col sm="6">
                        <Form.Label className='required'>Hora Inicio</Form.Label>
                        <Form.Control
                          type="time"
                          name="horaInicio"
                          value={formData.horaInicio}
                          onChange={handleInputChange}
                          required
                        />
                      </Col>
                      <Col sm="6">
                        <Form.Label className='required'>Hora Fin</Form.Label>
                        <Form.Control
                          type="time"
                          name="horaFin"
                          value={formData.horaFin}
                          onChange={handleInputChange}
                          required
                        />
                      </Col>
                    </Form.Group>

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
                  <div className="cont-title w-100 p-3">
                    <span className='Title'>Servicios</span>
                  </div>
                  <div className='p-3'>
                    <div className='table-responsive'>
                      <table className='table table-bordered table-hover'>
                        <thead className='table-light'>
                          <tr>
                            <th>Servicio</th>
                            <th>Empleado</th>
                            <th>Precio</th>
                            <th>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedServices.map((service, index) => {
                            const serviceData = services.find(s => s.id === parseInt(service.serviceId));
                            return (
                              <tr key={index}>
                                <td>
                                  <Form.Select
                                    value={service.serviceId}
                                    onChange={(e) => handleServiceChange(index, 'serviceId', e.target.value)}
                                    required
                                  >
                                    <option value="">Seleccionar</option>
                                    {services.map(s => (
                                      <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                  </Form.Select>
                                </td>
                                <td>
                                  <Form.Select
                                    value={service.empleadoId}
                                    onChange={(e) => handleServiceChange(index, 'empleadoId', e.target.value)}
                                    required
                                  >
                                    <option value="">Seleccionar</option>
                                    {users.filter(u => u.roleId === 2).map(emp => (
                                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                  </Form.Select>
                                </td>
                                <td>
                                  {serviceData ? `$${serviceData.price.toLocaleString()}` : '-'}
                                </td>
                                <td>
                                  <Button 
                                    color='error' 
                                    size="small"
                                    onClick={() => handleRemoveService(index)}
                                  >
                                    <IoTrashSharp />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="d-flex justify-content-start mt-2">
                      <Button
                        onClick={handleAddService}
                        variant="contained"
                        color="success"
                        startIcon={<FaPlus />}
                      >
                        Agregar Servicio
                      </Button>
                    </div>
                    <div className='d-flex align-items-center justify-content-end mt-3 p-3'>
                      <span className='valor' style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
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
    </div>
  );
}

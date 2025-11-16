import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Row, Col, Spinner } from 'react-bootstrap';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// API Configuration
const api = axios.create({
  baseURL: 'https://andromeda-api.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function EnhancedProfileEditor() {
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    status: 'A',
    roleId: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    phone: false,
  });

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('jwtToken');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      setIsLoggedIn(true);
      fetchUserData(userId);
    } else {
      setIsLoggedIn(false);
      setLoading(false);
      setError('No has iniciado sesión. Por favor, inicia sesión para ver tu perfil.');
    }
  };

  const fetchUserData = async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      setUserData(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Error al cargar los datos del perfil');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo cargar el perfil del usuario',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
    handleValidation(name, value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    handleValidation('password', e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (Object.values(errors).some(error => error !== '')) {
        Swal.fire({
            icon: 'warning',
            title: '¡Advertencia!',
            text: 'Por favor, corrija los errores en el formulario',
        });
        return;
    }

    setIsSubmitting(true);
    setLoading(true);

    try {
        const dataToUpdate = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            ...(password && { password })
        };

        const response = await api.put(`/users/profile/${userData.id}`, dataToUpdate);

        if (response.data.token) {
            // Update token in localStorage
            localStorage.setItem('jwtToken', response.data.token);
        }

        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Perfil actualizado exitosamente',
        }).then((result) => {
            if (result.isConfirmed) {
                if (password) {
                    // If password was changed, force re-login
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userId');
                    window.location.href = '/login';
                } else {
                    // Just reload the profile
                    window.location.reload();
                }
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Error al actualizar el perfil',
        });
    } finally {
        setIsSubmitting(false);
        setLoading(false);
    }
};


  const validateName = (value) => {
    const regex = /^[A-Za-z\s]{3,}$/;
    return regex.test(value) ? '' : 'El nombre debe contener al menos 3 letras';
  };

  const validateEmail = (value) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(value) ? '' : 'El correo no es válido';
  };

  const validatePassword = (value) => {
    if (value === '') return '';
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(value) ? '' : 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números';
  };

  const validatePhone = (value) => {
    const regex = /^\d{10}$/;
    return regex.test(value) ? '' : 'El teléfono debe contener 10 números';
  };

  const handleValidation = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    handleValidation(name, e.target.value);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center mt-5">
        <h2>Acceso Denegado</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <Card className="shadow-lg">
        <Card.Header className="bg-primary text-white text-center py-4">
          <h2 className="mb-0">Mi Perfil</h2>
          <p className="text-white-50 mb-0">Gestiona tu información personal</p>
        </Card.Header>

        <Card.Body className="p-4">
          <div className="text-center mb-4">
            <div
              className="avatar-circle mx-auto"
              style={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                backgroundColor: '#007bff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s ease',
              }}
            >
              {userData.name ? userData.name.charAt(0).toUpperCase() : ''}
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            <Row className="g-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <User size={18} className="me-2" />
                    Nombre
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && !!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <Mail size={18} className="me-2" />
                    Correo electrónico
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.email && !!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <Phone size={18} className="me-2" />
                    Teléfono
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.phone && !!errors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="d-flex align-items-center">
                    <Lock size={18} className="me-2" />
                    Nueva contraseña
                  </Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={handleBlur}
                      isInvalid={touched.password && !!errors.password}
                      placeholder="Dejar en blanco para mantener la actual"
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="text-center mt-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting || Object.values(errors).some(error => error !== '')}
                className="px-5 py-2"
                style={{
                  background: 'linear-gradient(135deg, #0d6efd, #0a58ca)',
                  border: 'none',
                  transition: 'transform 0.3s ease',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
    
  );
}


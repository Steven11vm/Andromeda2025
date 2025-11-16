'use client'

import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { Box, Container, Grid } from '@mui/material';
import Header from './Header1';
import Swal from 'sweetalert2';

export default function EnhancedProfileEditor() {
    const url = 'https://andromeda-api.onrender.com/api/users';
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
        setLoading(true);
        try {
            const response = await fetch(`${url}/${userId}`);
            const data = await response.json();
            setUserData(data);
            setError('');
        } catch (err) {
            setError('Error al cargar los datos del perfil');
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

        if (isSubmitting) return;

        setIsSubmitting(true);
        setLoading(true);

        try {
            const dataToUpdate = {
                            name: userData.name,
                            email: userData.email,
                            phone: userData.phone,
                            ...(password && { password })
            };
            
            const response = await fetch(`${url}/profile/${userData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
                },
                body: JSON.stringify(dataToUpdate),
            });

            if (response.data.token) {
                // Update token in localStorage
                localStorage.setItem('jwtToken', response.data.token);
            }

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Perfil actualizado exitosamente',
                });
                return;
                if (password) {
                    // If password was changed, force re-login
                    localStorage.removeItem('jwtToken');
                    localStorage.removeItem('userId');
                    window.location.href = '/login';
                } else {
                    // Just reload the profile
                    window.location.reload();
                }
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (err) {
           Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Perfil actualizado exitosamente',
                });
                return;
        } finally {
            setIsSubmitting(false);
            setLoading(false);
        }
    };

    const validateName = (value) => {
        const regex = /^[A-Za-z\s]+$/;
        return regex.test(value) ? '' : 'El nombre solo debe contener letras';
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
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress sx={{ color: '#FFD700' }} />
            </Box>
        );
    }

    if (!isLoggedIn) {
        return (
            <Box textAlign="center" mt={8}>
                <h2>Acceso Denegado</h2>
                <p>{error}</p>
            </Box>
        );
    }

    return (
        <>
            <Header />

            <Container maxWidth="md" sx={{ py: 12 }}>
                <Card elevation={3} sx={{ backgroundColor: 'white', borderRadius: '16px' }}>
                    <div className='d-flex align-items-center justify-content-center mt-5'>
                        <h2 className='tittle-landingPage'>Información Personal</h2>
                    </div>
                    <p className='description-landingPage'>Actualiza tus datos personales y mantén tu perfil al día</p>

                    <CardContent sx={{ mt: 4 }}>
                        <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
                            <Box className='avatar-container'>
                                {userData.name ? userData.name.charAt(0).toUpperCase() : ''}
                            </Box>
                        </Box>

                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Nombre"
                                        name="name"
                                        value={userData.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.name && Boolean(errors.name)}
                                        helperText={touched.name && errors.name}
                                        sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#000000' } } }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Correo electrónico"
                                        name="email"
                                        type="email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.email && Boolean(errors.email)}
                                        helperText={touched.email && errors.email}
                                        sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#000000' } } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Contraseña"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        onBlur={handleBlur}
                                        error={touched.password && Boolean(errors.password)}
                                        helperText={touched.password && errors.password}
                                        sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#000000' } } }}
                                        InputProps={{
                                            endAdornment: (
                                                <IconButton
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    edge="end"
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Teléfono"
                                        name="phone"
                                        value={userData.phone}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.phone && Boolean(errors.phone)}
                                        helperText={touched.phone && errors.phone}
                                        sx={{ '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#000000' } } }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={isSubmitting || Object.values(errors).some(error => error !== '')}
                                            className="btn-landing"
                                        >
                                            {isSubmitting ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <CircularProgress size={20} color="inherit" />
                                                    <span>Guardando...</span>
                                                </Box>
                                            ) : (
                                                'Guardar Cambios'
                                            )}
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>
            </Container>

            <style jsx>{`
        .tittle-landingPage {
          color: #DAA520;
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .description-landingPage {
          color: #B8860B;
          text-align: center;
          margin-bottom: 2rem;
          padding: 0 1rem;
        }

        .avatar-container {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(45deg, #FFD700, #DAA520);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2.5rem;
          font-weight: bold;
          box-shadow: 0 4px 20px rgba(218,165,32,0.4);
        }

        .btn-landing {
          min-width: 200px;
          padding: 1rem 2rem;
          border-radius: 8px;
          background: linear-gradient(45deg, #FFD700, #DAA520) !important;
          color: white;
          text-transform: none;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .btn-landing:hover {
          background: linear-gradient(45deg, #DAA520, #FFD700) !important;
          transform: translateY(-2px);
        }

        .btn-landing:disabled {
          background: rgba(218,165,32,0.4) !important;
          transform: none;
        }
      `}</style>
        </>
    );
}
import axios from 'axios';
import { Button, Link } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logo.png'
import { MyContext } from '../../App';
import patern from '../../assets/images/pattern.webp';
import { MdEmail } from "react-icons/md";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [inputIndex, setInputIndex] = useState(null);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
    }, [context]);

    const focusInput = (index) => {
        setInputIndex(index);
    }

    const validateEmail = (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(value) ? '' : 'Correo electrónico inválido';
    };

    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setEmail(emailValue);
        setEmailError(validateEmail(emailValue));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validar email
        const validationError = validateEmail(email);
        if (validationError) {
            setEmailError(validationError);
            return;
        }

        const emailToSend = email.trim().toLowerCase();
        setEmailError('');

        try {
            const response = await axios.post('https://andromeda-api.onrender.com/api/users/forgot-password', {
                email: emailToSend
            });
    
            // Éxito: mostrar mensaje y limpiar formulario
            toast.success('Correo de restablecimiento enviado. Revisa tu bandeja de entrada.', {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            
            // Limpiar el campo después de enviar
            setEmail('');
            setEmailError('');
        } catch (error) {
            console.error('Error al enviar correo:', error);
            
            let errorMessage = 'Error al enviar el correo. Por favor, intenta nuevamente.';
            
            if (error.response) {
                // El servidor respondió con un error
                const serverMessage = error.response.data?.message || 
                                     error.response.data?.error || 
                                     error.response.data?.msg;
                
                if (serverMessage) {
                    // Usar el mensaje del servidor directamente
                    errorMessage = serverMessage;
                    
                    // Mensajes específicos según el contenido del mensaje
                    if (serverMessage.toLowerCase().includes('no encontrado') || 
                        serverMessage.toLowerCase().includes('usuario no encontrado')) {
                        errorMessage = 'El correo electrónico no está registrado en el sistema.';
                    } else if (serverMessage.toLowerCase().includes('autenticación') ||
                               serverMessage.toLowerCase().includes('credenciales')) {
                        errorMessage = 'Error de configuración del servidor de correo. Contacta al administrador.';
                    } else if (serverMessage.toLowerCase().includes('conexión') ||
                               serverMessage.toLowerCase().includes('connection')) {
                        errorMessage = 'Error de conexión con el servidor de correo. Intenta más tarde.';
                    } else if (serverMessage.toLowerCase().includes('configuración') ||
                               serverMessage.toLowerCase().includes('no disponible')) {
                        errorMessage = 'El servicio de correo no está disponible. Contacta al administrador.';
                    }
                } else {
                    // Si no hay mensaje específico, usar códigos de estado
                    if (error.response.status === 404) {
                        errorMessage = 'El correo electrónico no está registrado en el sistema.';
                    } else if (error.response.status === 500) {
                        errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
                    }
                }
            } else if (error.request) {
                // La petición se hizo pero no hubo respuesta
                errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
            }
            
            setEmailError(errorMessage);
            toast.error(errorMessage, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    return (
        <>
            <img src={patern} className='loginPatern' alt="Login Pattern" />
            <section className="loginSection">
                <div className="loginBox text-center">
                    <div className='logo'>
                        <img src={Logo} alt="logo" />
                        <h5 className='fw-bolder'>Restablecer Contraseña</h5>
                    </div>
                    <div className='wrapper mt-3 card border p-4'>
                        <form onSubmit={handleSubmit}>
                            <div className={`form-group mb-3 position-relative ${inputIndex === 0 && 'focus'}`}>
                                <span className='icon'><MdEmail /></span>
                                <input
                                    type="email"
                                    className={`form-control ${emailError ? 'is-invalid' : ''}`}
                                    placeholder='Ingrese su correo electrónico'
                                    value={email}
                                    onChange={handleEmailChange}
                                    onFocus={() => focusInput(0)}
                                    onBlur={() => setInputIndex(null)}
                                />
                                {emailError && <div className="invalid-feedback">{emailError}</div>}
                            </div>
                            <div className='form-group'>
                                <Button type="submit" className='btn-submit btn-big btn-lg w-100'>
                                    Enviar Correo
                                </Button>
                            </div>
                            <div className='form-group text-center mt-3 p-10'>
                                <Link onClick={handleBackToLogin} className='link'>
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}

export default ForgotPassword;

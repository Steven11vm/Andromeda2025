import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Logo from '../../assets/images/logo.png'
import { MyContext } from '../../App';
import patern from '../../assets/images/pattern.webp';
import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Button, Link } from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User } from 'lucide-react';

const Login = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [inputIndex, setInputIndex] = useState(null);
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    

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

    const validatePassword = (value) => {
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return regex.test(value) ? '' : 'La contraseña debe tener al menos 8 caracteres, una letra y un número';
    };

    const handleEmailChange = (e) => {
        const emailValue = e.target.value;
        setEmail(emailValue);
        setEmailError(validateEmail(emailValue));
    };

    const handlePasswordChange = (e) => {
        const passwordValue = e.target.value;
        setPassword(passwordValue);
        setPasswordError(validatePassword(passwordValue));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://andromeda-api.onrender.com/api/users/login', {
                email,
                password
            });
    
            const { user, token } = response.data;
    
            if (token && user.roleId) {
                localStorage.setItem('jwtToken', token);
                localStorage.setItem('roleId', user.roleId.toString()); // Guardar el roleId del usuario
                localStorage.setItem('userId', user.id.toString()); // Guardar el ID del usuario
                localStorage.setItem('userName', user.name); // Guardar el nombre del usuario
                console.log('Token, roleId y userId almacenados:', { token, roleId: user.roleId, userId: user.id });
                toast.success('Bienvenido, ' + user.name, {
                    position: "top-right",
                    autoClose: 1000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    onClose: () => navigate('/index')  // Navega a /index al cerrar la alerta
                });
                context.setIsHideSidebarAndHeader(true);
            } else {
                throw new Error('Token o roleId no recibidos');
            }
        } catch (error) {
            console.error('Error durante el login:', error);
            toast.error('Correo o contraseña incorrectos.', {
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
    

    const handleRegister = () => {
        navigate('/register');
    };

    const handleReestablish = () => {
        navigate('/forgotPassword');
    };

    return (
        <>
            <img src={patern} className='loginPatern' alt="Login Pattern" />
            <section className="loginSection">
                <div className="loginBox text-center">
                    <div className='logo'>
                        <img src={Logo} alt="logo" />
                        <h5 className='fw-bolder'>Ingresar a Barberia Orion</h5>
                    </div>
                    <div className='wrapper mt-3 card border p-4'>
                        <form onSubmit={handleLogin} autoComplete="on">
                            <div className={`form-group mb-3 position-relative ${inputIndex === 0 && 'focus'}`}>
                                <span className='icon'><MdEmail /></span>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    autoComplete="username"
                                    className={`form-control ${emailError ? 'is-invalid' : ''}`}
                                    placeholder='Ingrese su correo'
                                    value={email}
                                    onChange={handleEmailChange}
                                    onFocus={() => focusInput(0)}
                                    onBlur={() => setInputIndex(null)}
                                />
                                {emailError && <div className="invalid-feedback">{emailError}</div>}
                            </div>
                            <div className={`form-group mb-3 position-relative ${inputIndex === 1 && 'focus'}`}>
                                <span className='icon'><RiLockPasswordFill /></span>
                                <input
                                    type={isShowPassword ? 'text' : 'password'}
                                    name="password"
                                    id="password"
                                    autoComplete="current-password"
                                    className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                                    placeholder='Ingrese su contraseña'
                                    value={password}
                                    onChange={handlePasswordChange}
                                    onFocus={() => focusInput(1)}
                                    onBlur={() => setInputIndex(null)}
                                />
                                <span className='toggleShowPassword' onClick={() => setIsShowPassword(!isShowPassword)}>
                                    {isShowPassword ? <IoMdEyeOff /> : <IoMdEye />}
                                </span>
                                {passwordError && <div className="invalid-feedback">{passwordError}</div>}
                            </div>
                            <div className='form-group'>
                                <Button type="submit" className='btn-submit btn-big btn-lg w-100'>
                                    Ingresar
                                </Button>
                            </div>
                            <div className='form-group text-center mt-3 p-10'>
                                <Link onClick={handleReestablish} className='link'>
                                    ¿Olvidaste la contraseña?
                                </Link>
                            </div>
                        </form>
                    </div>
                    <div className='wrapper mt-3 card border footer p-3'>
                        <span className='text-center'>
                            ¿No estas registrado?
                            <Link className='link color' onClick={handleRegister}>
                                Registrarme
                            </Link>
                        </span>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Login;
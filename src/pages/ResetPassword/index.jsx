import { Button, TextField, Alert } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logo.png';
import { MyContext } from '../../App';
import patern from '../../assets/images/pattern.webp';
import { FaKey } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MySwal = withReactContent(Swal);

const ResetPassword = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [inputIndex, setInputIndex] = useState(null);
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isShowPasswordConfirm, setIsShowPasswordConfirm] = useState(false);
    const [yourToken, setYourToken] = useState('');
    const [yourPassword, setYourPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [tokenError, setTokenError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
    }, []);

    const focusInput = (index) => {
        setInputIndex(index);
    };

    const validateToken = (token) => {
        if (!token) {
            setTokenError('El token no puede estar vacío');
        } else {
            setTokenError('');
        }
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            setPasswordError('La contraseña debe tener al menos 8 caracteres, incluyendo letras y números');
        } else {
            setPasswordError('');
        }
    };

    const validateConfirmPassword = (confirmPassword) => {
        if (confirmPassword !== yourPassword) {
            setConfirmPasswordError('Las contraseñas no coinciden');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        validateToken(yourToken);
        validatePassword(yourPassword);
        validateConfirmPassword(confirmPassword);

        if (tokenError || passwordError || confirmPasswordError) {
            return;
        }

        try {
            const response = await fetch('https://andromeda-api.onrender.com/api/users/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: yourToken,
                    newPassword: yourPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al restablecer la contraseña');
            }

            // Mostrar alerta de éxito con SweetAlert y redirigir al login
            toast.success('Se ha restablecido su contraseña correctamente', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                onClose: () => navigate('/login')  // Navega a /resetPassword al cerrar la alerta
            });
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    };

    return (
        <>
            <img src={patern} className='loginPatern' />
            <section className="loginSection">
                <div className="loginBox text-center">
                    <div className='logo'>
                        <img src={Logo} width="60px" alt="logo" />
                        <h5 className='fw-bolder'>Restablecer Contraseña</h5>
                    </div>
                    <div className='wrapper mt-3 card border p-4'>
                        <form onSubmit={handleSubmit}>
                            <div className={`form-group mb-3 position-relative ${inputIndex === 0 && 'focus'}`}>
                                <span className='icon'><FaKey /></span>
                                <input
                                    type="text"
                                    className={`form-control ${tokenError ? 'is-invalid' : ''}`}
                                    value={yourToken}
                                    onChange={(e) => setYourToken(e.target.value)}
                                    onBlur={() => validateToken(yourToken)}
                                    placeholder="Ingrese su token"
                                    onFocus={() => focusInput(0)}
                                    required
                                />
                                {tokenError && <div className="invalid-feedback">{tokenError}</div>}
                            </div>
                            <div className={`form-group mb-3 position-relative ${inputIndex === 1 && 'focus'}`}>
                                <span className='icon'><RiLockPasswordFill /></span>
                                <input
                                    type={isShowPassword ? 'text' : 'password'}
                                    className={`form-control ${passwordError ? 'is-invalid' : ''}`}
                                    value={yourPassword}
                                    onChange={(e) => setYourPassword(e.target.value)}
                                    onBlur={() => validatePassword(yourPassword)}
                                    placeholder="Ingrese nueva contraseña"
                                    onFocus={() => focusInput(1)}
                                    required
                                />
                                {passwordError && <div className="invalid-feedback">{passwordError}</div>}
                                <span className='toggleShowPassword' onClick={() => setIsShowPassword(!isShowPassword)}>
                                    {isShowPassword ? <IoMdEyeOff /> : <IoMdEye />}
                                </span>
                            </div>
                            <div className={`form-group mb-3 position-relative ${inputIndex === 2 && 'focus'}`}>
                                <span className='icon'><RiLockPasswordFill /></span>
                                <input
                                    type={isShowPasswordConfirm ? 'text' : 'password'}
                                    className={`form-control ${confirmPasswordError ? 'is-invalid' : ''}`}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={() => validateConfirmPassword(confirmPassword)}
                                    placeholder="Confirme nueva contraseña"
                                    onFocus={() => focusInput(2)}
                                    required
                                />
                                {confirmPasswordError && <div className="invalid-feedback">{confirmPasswordError}</div>}
                                <span className='toggleShowPassword' onClick={() => setIsShowPasswordConfirm(!isShowPasswordConfirm)}>
                                    {isShowPasswordConfirm ? <IoMdEyeOff /> : <IoMdEye />}
                                </span>
                            </div>
                            <div className='form-group'>
                                <Button type="submit" variant="contained" className='btn-submit btn-big btn-lg w-100'>
                                    Restablecer contraseña
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ResetPassword;

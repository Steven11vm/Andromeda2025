import axios from 'axios';
import { Button, TextField, Alert } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logo.png'
import { MyContext } from '../../App';
import patern from '../../assets/images/pattern.webp';
import { MdEmail } from "react-icons/md";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MySwal = withReactContent(Swal);

const ForgotPassword = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [inputIndex, setInputIndex] = useState(null)
    const [isShowPassword, setIsShowPassword] = useState(false)
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
    }, []);

    const focusInput = (index) => {
        setInputIndex(index);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://andromeda-api.onrender.com/api/users/forgot-password', { email });
            setMessage(response.data.message);
            setError('');
            toast.success('Revisa tu bandeja de entrada para restablecer tu contraseña.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                onClose: () => navigate('/resetPassword')  // Navega a /resetPassword al cerrar la alerta
            });
        } catch (err) {
            toast.error('Error al enviar el correo.', {
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

    return (
        <>
                <img src={patern} className='loginPatern' />
                    <section className="loginSection">
                        <div className="loginBox text-center">
                            <div className='logo'>
                                <img src={Logo} width="60px" alt="logo" />
                                <h5 className='fw-bolder'>Restablecer a Barberia Orion</h5>
                            </div>
                            <div className='wrapper mt-3 card border p-4'>
                                <form onSubmit={handleSubmit}>
                                    <div className={`form-group mb-3 position-relative ${inputIndex === 0 && 'focus'}`}>
                                        <span className='icon'><MdEmail /></span>
                                        <input
                                            label="Correo Electrónico"
                                            className={`form-control`}
                                            placeholder='Enter your email'
                                            type="email"
                                            fullWidth
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onFocus={() => focusInput(0)}
                                            onBlur={() => setInputIndex(null)}
                                            
                                        />
                                    </div>
                                    <div className='form-group'>
                                            <Button type="submit" variant="contained" className='btn-submit btn-big btn-lg w-100' >
                                                Enviar Correo
                                            </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
        </>
    );
}

export default ForgotPassword;

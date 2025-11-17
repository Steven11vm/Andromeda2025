import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../../App.js';
import logo from '../../../assets/images/logo-light.png';
import { Avatar, Menu, MenuItem, Button, IconButton } from '@mui/material';
import { toast } from 'react-toastify';
import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";
import { GrUser } from 'react-icons/gr';
import MenuIcon from '@mui/icons-material/Menu';

const Header = ({ scrollToServices, scrollToContact }) => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
        context.setThemeMode(false);
        checkLoginStatus();
    }, [context]);

    const checkLoginStatus = () => {
        const token = localStorage.getItem('jwtToken');
        const storedEmail = localStorage.getItem('userName');
        const idRole = localStorage.getItem('roleId');
        if (token && storedEmail && idRole) {
            setIsLoggedIn(true);
            setUserEmail(storedEmail);
            setUserRole(idRole);
        } else {
            setIsLoggedIn(false);
            setUserEmail('');
            setUserRole('');
        }
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handledashboard = () => {
        context.setIsHideSidebarAndHeader(false);
        navigate('/services');
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('roleId');
        localStorage.removeItem('userEmail');
        setIsLoggedIn(false);
        setUserEmail('');
        handleMenuClose();
        toast.error('Sesion cerrada', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            onClose: () => navigate('/index')
        });
    };

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    const getUserInitial = () => {
        return userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';
    };

    return (
        <header className={`header-index ${isScrolled ? 'abajo' : ''}`}>
            <style>
                {`
            
                .menu-landingPage {
                    margin-top: 10px;
                }
                    
                .menu-item-landingPage {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .mobile-menu-icon {
                    display: none !important;
                    z-index: 1001;
                }
                .user-menu {
                    position: relative;
                    z-index: 1001;
                }
                @media (max-width: 768px) {
                    .mobile-menu-icon {
                        display: flex !important;
                    }
                    .nav-container {
                        position: fixed;
                        top: 70px;
                        left: 0;
                        right: 0;
                        height: calc(100vh - 70px);
                        background-color: rgba(0, 0, 0, 0.98);
                        backdrop-filter: blur(10px);
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 30px 20px;
                        transform: translateX(-100%);
                        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 4px 0 20px rgba(0,0,0,0.3);
                        overflow-y: auto;
                        z-index: 1000;
                    }
                    .nav-container.nav-open {
                        transform: translateX(0);
                    }
                    .navBar-index {
                        flex-direction: column;
                        width: 100%;
                        gap: 0;
                    }
                    .navBar-index a {
                        padding: 18px 0;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                        font-size: 16px;
                        font-weight: 500;
                        letter-spacing: 1.5px;
                        transition: all 0.3s ease;
                        width: 100%;
                    }
                    .navBar-index a:hover {
                        padding-left: 15px;
                        color: #b89b58 !important;
                    }
                    .auth-buttons {
                        margin-left: 0;
                        margin-top: 30px;
                        width: 100%;
                    }
                    .user-menu {
                        width: 100%;
                    }
                    .user-menu .MuiButton-root {
                        width: 100%;
                        justify-content: flex-start;
                        padding: 12px 0;
                    }
                    .book-now-btn {
                        width: 100%;
                        padding: 14px 24px !important;
                        font-size: 15px !important;
                        font-weight: 600 !important;
                        letter-spacing: 1px !important;
                    }
                    .logo-index {
                        font-size: 20px;
                    }
                    .logo-index img {
                        width: 40px;
                    }
                    .logo-index span {
                        font-size: 18px;
                    }
                }
                @media (max-width: 480px) {
                    .nav-container {
                        top: 60px;
                        padding: 25px 15px;
                    }
                    .navBar-index a {
                        padding: 16px 0;
                        font-size: 15px;
                    }
                    .book-now-btn {
                        padding: 12px 20px !important;
                        font-size: 14px !important;
                    }
                    .logo-index {
                        font-size: 18px;
                    }
                    .logo-index img {
                        width: 35px;
                    }
                    .logo-index span {
                        font-size: 16px;
                    }
                }
                `}
            </style>
            <Link to={'/'} className='logo-index'>
                <img src={logo} alt="Logo" />
                <span>Barberia Orion</span>
            </Link>
            <IconButton 
                className="mobile-menu-icon" 
                onClick={toggleNav}
                sx={{
                    color: isScrolled ? '#fff' : '#fff',
                    padding: '10px',
                    backgroundColor: isScrolled ? 'rgba(184, 155, 88, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(184, 155, 88, 0.2)',
                        transform: 'scale(1.1)'
                    }
                }}
            >
                <MenuIcon sx={{ fontSize: '28px' }} />
            </IconButton>
            <div className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}>
                <nav className='navBar-index'>
                    <Link to='/index' onClick={() => setIsNavOpen(false)}>INICIO</Link>
                    <Link to='#' onClick={() => { scrollToServices(); setIsNavOpen(false); }}>SERVICIOS</Link>
                    {userRole == 3 && (
                        <Link to='/appointmentView' onClick={() => setIsNavOpen(false)}>CITAS</Link>
                    )}
                    <Link to='/shop' onClick={() => setIsNavOpen(false)}>PRODUCTOS</Link>
                    <Link to='#' onClick={() => { scrollToContact(); setIsNavOpen(false); }}>CONTACTO</Link>
                </nav>
                <div className="auth-buttons">
                    {isLoggedIn && userEmail ? (
                        <div className="user-menu">
                            <Button
                                onClick={handleMenuClick}
                                className="userLoginn"
                                startIcon={
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            backgroundColor: '#b89b58'
                                        }}
                                    >
                                        {getUserInitial()}
                                    </Avatar>
                                }
                            >
                                {userEmail}
                            </Button>
                            <Menu 
                                anchorEl={anchorEl} 
                                open={Boolean(anchorEl)} 
                                onClose={handleMenuClose} 
                                className='menu-landingPage'
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                {userRole == 1 || userRole == 2 ? (
                                    <MenuItem onClick={handledashboard} className='menu-item-landingPage'>
                                        <GrUserAdmin /> Administrar
                                    </MenuItem>
                                ) : null}
                                <MenuItem component={Link} to='/profileview' onClick={() => setIsNavOpen(false)} className='menu-item-landingPage'>
                                    <GrUser /> Mi perfil
                                </MenuItem>
                                <MenuItem onClick={handleLogout} className='menu-item-landingPage'>
                                    <GiExitDoor /> Cerrar Sesión
                                </MenuItem>
                            </Menu>
                        </div>
                    ) : (
                        <Button
                            variant="contained"
                            className="book-now-btn"
                            onClick={handleLogin}
                        >
                            Iniciar sesión
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

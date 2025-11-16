import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../../../App.js';
import logo from '../../../../assets/images/logo-light.png';
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
                  .header-index {
                 
                    background-color: #000000;
                 
                  }
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
                        top: 60px;
                        left: 0;
                        right: 0;
                        height: calc(100vh - 60px);
                        background-color: #000000;
                        flex-direction: column;
                        align-items: flex-start;
                        padding: 20px;
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                        box-shadow: 2px 0 5px rgba(0,0,0,0.1);
                        overflow-y: auto;
                    }
                    .nav-container.nav-open {
                        transform: translateX(0);
                    }
                    .navBar-index {
                        flex-direction: column;
                        width: 100%;
                    }
                    .navBar-index a {
                        padding: 15px 0;
                        border-bottom: 1px solid #eee;
                        font-size: 16px;
                    }
                    .auth-buttons {
                        margin-left: 0;
                        margin-top: 20px;
                        width: 100%;
                    }
                    .user-menu {
                        width: 100%;
                    }
                    .user-menu .MuiButton-root {
                        width: 100%;
                        justify-content: flex-start;
                    }
                    .book-now-btn {
                        width: 100%;
                        padding: 12px !important;
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
                    color: '#000',
                    padding: '8px'
                }}
            >
                <MenuIcon />
            </IconButton>
            <div className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}>
                <nav className='navBar-index'>
                    <Link to='/index' onClick={() => setIsNavOpen(false)}>INICIO</Link>
                    
                    {userRole == 3 && (
                        <Link to='/appointmentView' onClick={() => setIsNavOpen(false)}>CITAS</Link>
                    )}
                    <Link to='/shop' onClick={() => setIsNavOpen(false)}>PRODUCTOS</Link>
                    
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


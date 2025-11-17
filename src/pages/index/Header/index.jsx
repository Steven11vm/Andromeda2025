import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MyContext } from '../../../App.js';
import logo from '../../../assets/images/logo-light.png';
import { Avatar, Menu, MenuItem, Button, IconButton } from '@mui/material';
import { toast } from 'react-toastify';
import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";
import { GrUser } from 'react-icons/gr';
import MenuIcon from '@mui/icons-material/Menu';
import './header.css';

const Header = ({ scrollToServices, scrollToContact }) => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const open = Boolean(anchorEl);
    const isAdminOrEmployee = useMemo(() => userRole === '1' || userRole === '2', [userRole]);
    const isClient = useMemo(() => userRole === '3', [userRole]);

    // Check login status
    const checkLoginStatus = useCallback(() => {
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
    }, []);

    // Scroll handler
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Initialize context and check login
    useEffect(() => {
        context.setIsHideSidebarAndHeader(true);
        context.setThemeMode(false);
        checkLoginStatus();
    }, [context, checkLoginStatus]);

    // Menu handlers - Defined first to avoid initialization errors
    const handleMenuClick = useCallback((event) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    // Navigation handlers
    const handleLogin = useCallback(() => {
        navigate('/login');
    }, [navigate]);

    const handleDashboard = useCallback(() => {
        handleMenuClose();
        context.setIsHideSidebarAndHeader(false);
        navigate('/services');
        setIsNavOpen(false);
    }, [context, navigate, handleMenuClose]);

    // Logout handler
    const handleLogout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('roleId');
        localStorage.removeItem('userEmail');
        setIsLoggedIn(false);
        setUserEmail('');
        handleMenuClose();
        setIsNavOpen(false);
        
        toast.error('Sesión cerrada', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClose: () => navigate('/index')
        });
    }, [navigate, handleMenuClose]);

    // Navigation toggle
    const toggleNav = useCallback(() => {
        setIsNavOpen(prev => !prev);
    }, []);

    const closeNav = useCallback(() => {
        setIsNavOpen(false);
    }, []);

    // Scroll handlers
    const handleScrollToServices = useCallback(() => {
        scrollToServices?.();
        closeNav();
    }, [scrollToServices, closeNav]);

    const handleScrollToContact = useCallback(() => {
        scrollToContact?.();
        closeNav();
    }, [scrollToContact, closeNav]);

    // Handle profile navigation
    const handleProfileClick = useCallback(() => {
        handleMenuClose();
        closeNav();
    }, [handleMenuClose, closeNav]);

    // Get user initial
    const getUserInitial = useCallback(() => {
        return userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';
    }, [userEmail]);

    return (
        <header className={`header-index ${isScrolled ? 'abajo' : ''}`}>
            {/* Logo */}
            <Link to="/" className="logo-index" aria-label="Ir al inicio">
                <img 
                    src={logo} 
                    alt="Barberia Orion Logo" 
                    loading="eager"
                    width="50"
                    height="50"
                />
                <span>Barberia Orion</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <IconButton 
                className="mobile-menu-icon" 
                onClick={toggleNav}
                aria-label="Abrir menú de navegación"
                aria-expanded={isNavOpen}
                aria-controls="nav-container"
            >
                <MenuIcon />
            </IconButton>

            {/* Navigation Container */}
            <div 
                id="nav-container"
                className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}
                aria-hidden={!isNavOpen}
            >
                {/* Navigation Links */}
                <nav className="navBar-index" aria-label="Navegación principal">
                    <Link 
                        to="/index" 
                        onClick={closeNav}
                        aria-label="Ir a inicio"
                    >
                        INICIO
                    </Link>
                    <Link 
                        to="#" 
                        onClick={handleScrollToServices}
                        aria-label="Ver servicios"
                    >
                        SERVICIOS
                    </Link>
                    {isClient && (
                        <Link 
                            to="/appointmentView" 
                            onClick={closeNav}
                            aria-label="Ver mis citas"
                        >
                            CITAS
                        </Link>
                    )}
                    <Link 
                        to="/shop" 
                        onClick={closeNav}
                        aria-label="Ver productos"
                    >
                        PRODUCTOS
                    </Link>
                    <Link 
                        to="#" 
                        onClick={handleScrollToContact}
                        aria-label="Ver contacto"
                    >
                        CONTACTO
                    </Link>
                </nav>

                {/* Auth Buttons */}
                <div className="auth-buttons">
                    {isLoggedIn && userEmail ? (
                        <div className="user-menu">
                            <Button
                                onClick={handleMenuClick}
                                className="user-login-btn"
                                aria-label="Menú de usuario"
                                aria-expanded={open}
                                aria-haspopup="true"
                                startIcon={
                                    <Avatar
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            backgroundColor: '#b89b58',
                                            fontSize: '14px',
                                            fontWeight: 600
                                        }}
                                        aria-label={`Avatar de ${userEmail}`}
                                    >
                                        {getUserInitial()}
                                    </Avatar>
                                }
                            >
                                {userEmail}
                            </Button>
                            <Menu 
                                anchorEl={anchorEl} 
                                open={open} 
                                onClose={handleMenuClose}
                                className="menu-landingPage"
                                MenuListProps={{
                                    'aria-labelledby': 'user-menu-button',
                                }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                PaperProps={{
                                    elevation: 0,
                                    sx: {
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        background: '#171614 !important',
                                        color: '#fff !important',
                                        mt: '10px',
                                        minWidth: '200px',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                        '& .MuiMenuItem-root': {
                                            color: '#fff !important',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 0.1) !important',
                                            }
                                        }
                                    }
                                }}
                            >
                                {isAdminOrEmployee && (
                                    <MenuItem 
                                        onClick={handleDashboard} 
                                        className="menu-item-landingPage"
                                    >
                                        <GrUserAdmin /> Administrar
                                    </MenuItem>
                                )}
                                <MenuItem 
                                    component={Link} 
                                    to="/profileview" 
                                    onClick={handleProfileClick} 
                                    className="menu-item-landingPage"
                                >
                                    <GrUser /> Mi perfil
                                </MenuItem>
                                <MenuItem 
                                    onClick={handleLogout} 
                                    className="menu-item-landingPage"
                                >
                                    <GiExitDoor /> Cerrar Sesión
                                </MenuItem>
                            </Menu>
                        </div>
                    ) : (
                        <Button
                            variant="contained"
                            className="book-now-btn"
                            onClick={handleLogin}
                            aria-label="Iniciar sesión"
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

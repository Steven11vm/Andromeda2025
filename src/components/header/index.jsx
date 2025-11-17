import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import logo from '../../assets/images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { MdMenuOpen, MdOutlineMenu, MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import { BsChevronRight } from 'react-icons/bs';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Logout from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import { MyContext } from '../../App';
import { toast } from 'react-toastify';
import { BsHouseFill } from 'react-icons/bs';
import { Scissors } from 'lucide-react';
import './header.css';

import 'react-toastify/dist/ReactToastify.css';

const MOBILE_BREAKPOINT = 768;

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_BREAKPOINT);

    const context = useContext(MyContext);
    const navigate = useNavigate();
    const open = Boolean(anchorEl);

    // Memoize role badge color calculation
    const roleBadgeColor = useMemo(() => {
        switch(userRole) {
            case '1': return '#c59d5f'; // Administrador - dorado
            case '2': return '#4a90e2'; // Empleado - azul
            default: return '#95a5a6'; // Usuario - gris
        }
    }, [userRole]);

    // Memoize role label
    const roleLabel = useMemo(() => {
        switch(userRole) {
            case '1': return 'Administrador';
            case '2': return 'Empleado';
            default: return 'Usuario';
        }
    }, [userRole]);

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

    // Handle window resize
    useEffect(() => {
        checkLoginStatus();
        
        const handleResize = () => {
            setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [checkLoginStatus]);

    // Menu handlers
    const handleMenuClick = useCallback((event) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    // Logout handler
    const handleLogout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('roleId');
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
        setUserEmail('');
        handleMenuClose();
        
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

    // Navigation handlers
    const handleGoToHome = useCallback(() => {
        navigate('/index');
        handleMenuClose();
    }, [navigate, handleMenuClose]);

    // Sidebar toggle handler
    const handleSidebarToggle = useCallback(() => {
        const newValue = !context.isToggleSidebar;
        context.setIsToggleSidebar(newValue);
        if (context.onSidebarToggle) {
            context.onSidebarToggle(newValue);
        }
    }, [context]);

    // Theme toggle handler
    const handleThemeToggle = useCallback(() => {
        context.setThemeMode(!context.themeMode);
    }, [context]);

    // Get user initial
    const getUserInitial = useCallback(() => {
        return userEmail && userEmail.length > 0 ? userEmail[0].toUpperCase() : '?';
    }, [userEmail]);

    return (
        <header className="responsive-header">
            <div className="header-background-decoration" aria-hidden="true"></div>
            <div className="container-fluid header-container">
                <div className="header-row">
                    {/* Logo Section */}
                    <div className="header-logo-container">
                        <Link to="/" className="header-logo" aria-label="Ir al inicio">
                            <div className="logo-wrapper">
                                <img 
                                    src={logo} 
                                    alt="Barberia Orion Logo" 
                                    loading="eager"
                                    width="40"
                                    height="40"
                                />
                                <div className="logo-glow" aria-hidden="true"></div>
                            </div>
                            <span className="logo-text">
                                <span className="logo-text-main">Barberia </span>
                                <span className="logo-text-accent">Orion</span>
                            </span>
                        </Link>
                    </div>

                    {/* Menu Toggle Button */}
                    <div className="header-menu-toggle">
                        <Button
                            className={`menu-toggle-btn ${context.isToggleSidebar ? 'menu-open' : ''}`}
                            onClick={handleSidebarToggle}
                            aria-label="Alternar menú lateral"
                            aria-expanded={context.isToggleSidebar}
                        >
                            {isMobile ? (
                                <BsChevronRight />
                            ) : (
                                context.isToggleSidebar ? <MdOutlineMenu /> : <MdMenuOpen />
                            )}
                        </Button>
                    </div>

                    {/* Actions Section */}
                    <div className="header-actions">
                        {/* Theme Toggle */}
                        <Button 
                            className="theme-toggle-btn" 
                            onClick={handleThemeToggle}
                            aria-label={context.themeMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        >
                            {context.themeMode ? <MdOutlineDarkMode /> : <MdOutlineLightMode />}
                        </Button>

                        {/* User Account */}
                        <div className="user-account-wrapper">
                            <Button 
                                className={`user-account-btn ${isLoggedIn ? 'logged-in' : ''}`} 
                                onClick={handleMenuClick}
                                aria-label="Menú de usuario"
                                aria-expanded={open}
                                aria-haspopup="true"
                            >
                                <div className="user-avatar-container">
                                    {isLoggedIn ? (
                                        <Avatar 
                                            sx={{ 
                                                width: '100%', 
                                                height: '100%',
                                                bgcolor: roleBadgeColor,
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                                            }}
                                            aria-label={`Avatar de ${userEmail}`}
                                        >
                                            {getUserInitial()}
                                        </Avatar>
                                    ) : (
                                        <div className="avatar-placeholder" aria-hidden="true">
                                            <Scissors size={18} strokeWidth={2} />
                                        </div>
                                    )}
                                    {isLoggedIn && (
                                        <div 
                                            className="role-badge" 
                                            style={{ backgroundColor: roleBadgeColor }}
                                            aria-label={`Rol: ${roleLabel}`}
                                        ></div>
                                    )}
                                </div>
                                <div className="user-info">
                                    {isLoggedIn ? (
                                        <>
                                            <p className="user-email" title={userEmail}>
                                                {userEmail}
                                            </p>
                                            <p 
                                                className="user-role"
                                                style={{ color: roleBadgeColor }}
                                                title={roleLabel}
                                            >
                                                {roleLabel}
                                            </p>
                                        </>
                                    ) : (
                                        <p className="user-not-logged">No está logueado</p>
                                    )}
                                </div>
                            </Button>

                            {/* User Menu */}
                            <Menu
                                anchorEl={anchorEl}
                                id="account-menu"
                                open={open}
                                onClose={handleMenuClose}
                                onClick={handleMenuClose}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                PaperProps={{
                                    sx: {
                                        borderRadius: '12px',
                                        marginTop: '8px',
                                        minWidth: '200px',
                                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                                        border: '1px solid rgba(197, 157, 95, 0.2)',
                                        overflow: 'hidden',
                                        '& .MuiMenuItem-root': {
                                            padding: '12px 16px',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(197, 157, 95, 0.1)',
                                                paddingLeft: '20px'
                                            }
                                        }
                                    }
                                }}
                                MenuListProps={{
                                    'aria-labelledby': 'account-menu-button',
                                }}
                            >
                                <MenuItem onClick={handleGoToHome}>
                                    <ListItemIcon>
                                        <BsHouseFill style={{ color: '#c59d5f' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Volver al inicio" />
                                </MenuItem>
                                <Divider sx={{ margin: '4px 0' }} />
                                <MenuItem onClick={handleLogout}>
                                    <ListItemIcon>
                                        <Logout fontSize="small" style={{ color: '#e74c3c' }} />
                                    </ListItemIcon>
                                    <ListItemText primary="Cerrar sesión" />
                                </MenuItem>
                            </Menu>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
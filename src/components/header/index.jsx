import React, { useContext, useEffect, useState } from 'react';
import logo from '../../assets/images/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import { MdMenuOpen, MdOutlineMenu, MdOutlineLightMode, MdOutlineMailOutline } from 'react-icons/md';
import { BsCart3, BsShieldFillExclamation } from 'react-icons/bs';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Logout from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import { MyContext } from '../../App';
import { toast } from 'react-toastify';
import { BsHouseFill } from 'react-icons/bs';
import './header.css';

import 'react-toastify/dist/ReactToastify.css';

const Header = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const context = useContext(MyContext);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        checkLoginStatus();
    }, []);

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

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('roleId');
        localStorage.removeItem('userName');
        setIsLoggedIn(false);
        setUserEmail('');
        handleClose();
        toast.error('Sesión cerrada', {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClose: () => navigate('/index')
        });
    };

    const handleGoToHome = () => {
        navigate('/index');
    };

    const handleAdminDashboard = () => {
        navigate('/services');
    };

    return (
        <>
            <header className="d-flex align-items-center responsive-header">
                <div className="container-fluid w-100">
                    <div className='row d-flex align-items-center'>
                        <div className="col-12 col-sm-2 parte1 logo-container">
                            <Link to={'/'} className='d-flex align-items-center logo'>
                                <img src={logo} alt="Barberia Orion Logo" />
                                <span className='ml-2'>Barberia Orion</span>
                            </Link>
                        </div>
                        <div className="col-12 col-sm-3 d-flex align-items-center justify-content-end parte2 menu-toggle">
                            <Button
                                className='rounded-circle mr-3'
                                onClick={() => {
                                    const newValue = !context.isToggleSidebar;
                                    context.setIsToggleSidebar(newValue);
                                    if (context.onSidebarToggle) {
                                        context.onSidebarToggle(newValue);
                                    }
                                }}
                            >
                                {context.isToggleSidebar ? <MdOutlineMenu /> : <MdMenuOpen />}
                            </Button>
                        </div>
                        <div className="col-12 col-sm-7 d-flex align-items-center justify-content-end parte3 header-actions">
                            <div className="d-flex align-items-center">
                                <Button className='rounded-circle mr-3 theme-toggle' onClick={() => context.setThemeMode(!context.themeMode)}>
                                    <MdOutlineLightMode />
                                </Button>
                                <div className='MyAccWrapper'>
                                    <Button className='MyAcc d-flex align-items-center' onClick={handleClick}>
                                        <div className='ImgUser'>
                                            <span className='rounded-circle'>
                                                <img src='https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg' alt="User Avatar" />
                                            </span>
                                        </div>
                                        <div className="userInfo" style={{ textAlign: 'center', margin: '0 auto' }}>
                                            {isLoggedIn ? (
                                                <>
                                                    <p className="text-sm font-medium" style={{ margin: '0', fontWeight: 'bold' }}>{userEmail}</p>
                                                    <p className="text-xs text-gray-500" style={{ margin: '0', fontSize: '12px' }}>
                                                        {userRole === '1' ? 'Administrador' : userRole === '2' ? 'Empleado' : 'Usuario'}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-sm" style={{ margin: '0' }}>No está logueado</p>
                                            )}
                                        </div>
                                    </Button>
                                    <Menu
                                        anchorEl={anchorEl}
                                        id="account-menu"
                                        open={open}
                                        onClose={handleClose}
                                        onClick={handleClose}
                                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                                    >
                                        <MenuItem onClick={handleGoToHome}>
                                            <ListItemIcon>
                                                <BsHouseFill />
                                            </ListItemIcon>
                                            Volver al inicio
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            <ListItemIcon>
                                                <Logout fontSize="small" />
                                            </ListItemIcon>
                                            Cerrar sesión
                                        </MenuItem>
                                    </Menu>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
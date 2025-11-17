import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaAngleRight, FaAngleDown } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { IoCart } from "react-icons/io5";
import { RxScissors } from "react-icons/rx";
import { FaMoneyBillWave } from "react-icons/fa";
import { GiExitDoor } from "react-icons/gi";
import { MyContext } from '../../App';
import { usePermissions } from '../PermissionCheck';
import { BsFillPersonVcardFill } from "react-icons/bs";
import './Sidebar.css';

const Sidebar = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isToggleSubmenu, setIsToggleSubmenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const context = useContext(MyContext);
  const permissions = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isOpensubMenu = (index) => {
    setActiveTab(index);
    setIsToggleSubmenu(!isToggleSubmenu);
  };

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    // Cerrar el menú móvil cuando se hace clic en un enlace
    if (window.innerWidth <= 768) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <IconButton
        className="mobile-menu-toggle"
        onClick={toggleMobileMenu}
      >
        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
      </IconButton>
      {isMobileMenuOpen && (
        <div 
          className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        />
      )}
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <ul>
          {hasPermission('Dashboard') && (
            <li>
              <Link to="/dashboard" onClick={handleLinkClick}>
                <Button className={`w-100 ${activeTab === 0 ? 'active' : ''}`} onClick={() => isOpensubMenu(0)}>
                  <span className='icon'><TbLayoutDashboardFilled /></span>
                  <span className='sidebar-option'>Panel de control</span>
                  <span className='arrow'></span>
                </Button>
              </Link>
            </li>
          )}
          {hasPermission('Dashboard') && (
            <li>
              <Link to="/profile" onClick={handleLinkClick}>
                <Button className={`w-100 ${activeTab === 1 ? 'active' : ''}`} onClick={() => isOpensubMenu(1)}>
                  <span className='icon'><BsFillPersonVcardFill /></span>
                  <span className='sidebar-option'>Mi perfil</span>
                  <span className='arrow'></span>
                </Button>
              </Link>
            </li>
          )}
          {hasPermission('Roles') && (
            <li>
              <Button className={`w-100 ${activeTab === 2 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpensubMenu(2)}>
                <span className='icon'><IoMdSettings /></span>
                <span className='sidebar-option'>Configuración</span>
                <span className='arrow'>{isToggleSubmenu && activeTab === 2 ? <FaAngleDown /> : <FaAngleRight />}</span>
              </Button>
              <div className={`submenuWrapper ${activeTab === 2 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                <ul className='submenu'>
                  <li>
                    <Link to="/roles" onClick={handleLinkClick}>Roles</Link>
                  </li>
                </ul>
              </div>
            </li>
          )}
          {hasPermission('Usuarios') && (
            <li>
              <Button className={`w-100 ${activeTab === 3 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpensubMenu(3)}>
                <span className='icon'><FaUser /></span>
                <span className='sidebar-option'>Usuarios</span>
                <span className='arrow'>{isToggleSubmenu && activeTab === 3 ? <FaAngleDown /> : <FaAngleRight />}</span>
              </Button>
              <div className={`submenuWrapper ${activeTab === 3 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                <ul className='submenu'>
                  <li>
                    <Link to="/users" onClick={handleLinkClick}>Usuarios</Link>
                  </li>
                </ul>
              </div>
            </li>
          )}
          {(hasPermission('Categorias') || hasPermission('Productos') || hasPermission('Proveedores') || hasPermission('Compras')) && (
            <li>
              <Button className={`w-100 ${activeTab === 4 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpensubMenu(4)}>
                <span className='icon'><IoCart /></span>
                <span className='sidebar-option'>Ingresos</span>
                <span className='arrow'>{isToggleSubmenu && activeTab === 4 ? <FaAngleDown /> : <FaAngleRight />}</span>
              </Button>
              <div className={`submenuWrapper ${activeTab === 4 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                <ul className='submenu'>
                  {hasPermission('Categorias') && (
                    <li>
                      <Link to="/categories" onClick={handleLinkClick}>Categorías</Link>
                    </li>
                  )}
                  {hasPermission('Productos') && (
                    <li>
                      <Link to="/products" onClick={handleLinkClick}>Productos</Link>
                    </li>
                  )}
                  {hasPermission('Proveedores') && (
                    <li>
                      <Link to="/suppliers" onClick={handleLinkClick}>Proveedores</Link>
                    </li>
                  )}
                  {hasPermission('Compras') && (
                    <li>
                      <Link to="/shopping" onClick={handleLinkClick}>Compras</Link>
                    </li>
                  )}
                </ul>
              </div>
            </li>
          )}
          {(hasPermission('Servicios') || hasPermission('Programacion de empleado') || hasPermission('Ausencias')) && (
            <li>
              <Button className={`w-100 ${activeTab === 5 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpensubMenu(5)}>
                <span className='icon'><RxScissors /></span>
                <span className='sidebar-option'>Servicios</span>
                <span className='arrow'>{isToggleSubmenu && activeTab === 5 ? <FaAngleDown /> : <FaAngleRight />}</span>
              </Button>
              <div className={`submenuWrapper ${activeTab === 5 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                <ul className='submenu'>
                  {hasPermission('Servicios') && (
                    <li>
                      <Link to="/services" onClick={handleLinkClick}>Servicios</Link>
                    </li>
                  )}
                 
                
                </ul>
              </div>
            </li>
          )}
          {(hasPermission('Citas') || hasPermission('Pedidos') || hasPermission('Ventas')) && (
            <li>
              <Button className={`w-100 ${activeTab === 6 && isToggleSubmenu ? 'active' : ''}`} onClick={() => isOpensubMenu(6)}>
                <span className='icon'><FaMoneyBillWave /></span>
                <span className='sidebar-option'>Salidas</span>
                <span className='arrow'>{isToggleSubmenu && activeTab === 6 ? <FaAngleDown /> : <FaAngleRight />}</span>
              </Button>
              <div className={`submenuWrapper ${activeTab === 6 && isToggleSubmenu ? 'colapse' : 'colapsed'}`}>
                <ul className='submenu'>
                  {hasPermission('Citas') && (
                    <li>
                      <Link to="/appointment" onClick={handleLinkClick}>Citas</Link>
                    </li>
                  )}
                  {hasPermission('Pedidos') && (
                    <li>
                      <Link to="/orders" onClick={handleLinkClick}>Pedidos</Link>
                    </li>
                  )}
                  {hasPermission('Ventas') && (
                    <li>
                      <Link to="/sales" onClick={handleLinkClick}>Ventas</Link>
                    </li>
                  )}
                </ul>
              </div>
            </li>
          )}
        </ul>
        <div className='logoutWrapper'>
          <div className='logoutBox'>
            <Link to="/tango" onClick={handleLinkClick}>
              <Button variant="contained" className='btn-golden' >Guia de Usuarios</Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;


import React, { createContext, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';
import './index.css';
import Dashboard from './pages/Dashboard';
import Header from './components/header';
import Sidebar from './components/sidebar';
import Categories from './pages/categories';
import Appointment from './pages/appointment';
import Orders from './pages/orders';
import Products from './pages/products';
import Programming from './pages/programming';
import Sales from './pages/sales';
import ServicesView from './pages/servicesView';
import AppointmentView from './pages/appointmentView';
import RegisterView from './pages/appointmentView/registerView';
import Shopping from './pages/shopping';
import Suppliers from './pages/suppliers';
import Users from './pages/users';
import Roles from './pages/roles';
import Absences from './pages/absences';
import RegisterSales from './pages/sales/registerSales';
import RegisterShopping from './pages/shopping/registerShopping';
import ViewShopping from './pages/shopping/viewShopping';
import RegisterAppointment from './pages/appointment/registerAppointment';
import UpdateAppointment from './pages/appointment/updateAppointment';
import Ordermy from './pages/ordermy';
import Login from './pages/Login';
import Shop from './pages/shop';
import Index from './pages/index';
import Profileview from './pages/profileview';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/profile'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PermissionProvider, PermissionCheck } from './components/PermissionCheck';
import Error404 from './pages/404'
import Tango from './pages/ayudas';

export const MyContext = createContext();

function App() {
  const [isToggleSidebar, setIsToggleSidebar] = useState(false);
  const [themeMode, setThemeMode] = useState('true');
  const [isLogin, setIsLogin] = useState(false);
  const [isHideSidebarAndHeader, setIsHideSidebarAndHeader] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      setIsLogin(true);
      if (!window.location.pathname.includes('/404')) {
        setIsHideSidebarAndHeader(false);
      }
    } else {
      setIsLogin(false);
      setIsHideSidebarAndHeader(true);
    }
  }, []);

  useEffect(() => {
    if (themeMode === true) {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      localStorage.setItem('themeMode', 'dark');
    } else {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      localStorage.setItem('themeMode', 'light');
    }
  }, [themeMode]);

  const values = {
    isToggleSidebar,
    setIsToggleSidebar,
    themeMode,
    setThemeMode,
    setIsLogin,
    isLogin,
    setIsHideSidebarAndHeader,
    isHideSidebarAndHeader
  };

  return (
    <BrowserRouter>
      <MyContext.Provider value={values}>
        <PermissionProvider>
          {!isHideSidebarAndHeader && <Header />}
          <div className='main d-flex'>
            {!isHideSidebarAndHeader && (
              <div className={`sidebarWrapper ${isToggleSidebar ? 'toggle' : ''}`}>
                <Sidebar />
              </div>
            )}
            <div className={`content ${isHideSidebarAndHeader === true && 'full'} ${isToggleSidebar === true ? 'toggle' : ''}`}>
              <Routes>
                <Route path="/login" element={<PermissionCheck requiredPermission="public"><Login /></PermissionCheck>} />
                <Route path="/RegisterView" element={<PermissionCheck requiredPermission="public"><RegisterView /></PermissionCheck>} />
                <Route path="/index" element={<PermissionCheck requiredPermission="public"><Index /></PermissionCheck>} />
                <Route path="/register" element={<PermissionCheck requiredPermission="public"><Register /></PermissionCheck>} />
                <Route path="/profileview" element={<PermissionCheck requiredPermission="public">< Profileview /></PermissionCheck>} />
                <Route path="/forgotPassword" element={<PermissionCheck requiredPermission="public"><ForgotPassword /></PermissionCheck>} />
                <Route path="/resetPassword" element={<PermissionCheck requiredPermission="public"><ResetPassword /></PermissionCheck>} />
                <Route path="/" element={<Navigate to="/index" replace />} />


                <Route path="/404" element={
                  <PermissionCheck requiredPermission="public">
                    <Error404 />
                  </PermissionCheck>
                } />
                <Route path="*" element={<Navigate to="/404" replace />} />


                <Route path="/profile" element={
                  <PermissionCheck requiredPermission="Perfil">
                    <Profile />
                  </PermissionCheck>
                } />
                <Route path="/dashboard" element={
                  <PermissionCheck requiredPermission="Dashboard">
                    <Dashboard />
                  </PermissionCheck>
                } />
                <Route path="/categories" element={
                  <PermissionCheck requiredPermission="Categorias">
                    <Categories />
                  </PermissionCheck>
                } />
                <Route path="/appointment" element={
                  <PermissionCheck requiredPermission="Citas">
                    <Appointment />
                  </PermissionCheck>
                } />
                <Route path="/appointmentView" element={
                  <PermissionCheck requiredPermission="Citas">
                    <AppointmentView />
                  </PermissionCheck>
                } />
                <Route path="/appointmentRegister" element={
                  <PermissionCheck requiredPermission="Citas registrar">
                    <RegisterAppointment />
                  </PermissionCheck>
                } />
                <Route path="/appointmentUpdate/:appointmentId" element={
                  <PermissionCheck requiredPermission="Citas">
                    <UpdateAppointment />
                  </PermissionCheck>
                } />
                <Route path="/orders" element={
                  <PermissionCheck requiredPermission="Pedidos">
                    <Orders />
                  </PermissionCheck>
                } />
                <Route path="/products" element={
                  <PermissionCheck requiredPermission="Productos">
                    <Products />
                  </PermissionCheck>
                } />
                <Route path="/programming" element={
                  <PermissionCheck requiredPermission="Programacion de empleado">
                    <Programming />
                  </PermissionCheck>
                } />
                <Route path="/sales" element={
                  <PermissionCheck requiredPermission="Ventas">
                    <Sales />
                  </PermissionCheck>
                } />
                <Route path="/salesRegister" element={
                  <PermissionCheck requiredPermission="Ventas">
                    <RegisterSales />
                  </PermissionCheck>
                } />
                <Route path="/services" element={
                  <PermissionCheck requiredPermission="Servicios">
                    <ServicesView />
                  </PermissionCheck>
                } />
                <Route path="/shopping" element={
                  <PermissionCheck requiredPermission="Compras">
                    <Shopping />
                  </PermissionCheck>
                } />
                <Route path="/shoppingRegister" element={
                  <PermissionCheck requiredPermission="Compras">
                    <RegisterShopping />
                  </PermissionCheck>
                } />
                <Route path="/viewShopping/:shoppingId" element={
                  <PermissionCheck requiredPermission="Compras">
                    <ViewShopping />
                  </PermissionCheck>
                } />
                <Route path="/shop" element={
                  <PermissionCheck requiredPermission="public">
                    <Shop />
                  </PermissionCheck>
                } />
                <Route
                  path="/ordermy" element={
                    <PermissionCheck requiredPermission="public">
                      <Ordermy />
                    </PermissionCheck>
                  } />
                <Route path="/suppliers" element={
                  <PermissionCheck requiredPermission="Proveedores">
                    <Suppliers />
                  </PermissionCheck>
                } />
                <Route path="/users" element={
                  <PermissionCheck requiredPermission="Usuarios">
                    <Users />
                  </PermissionCheck>
                } />
                <Route path="/roles" element={
                  <PermissionCheck requiredPermission="Roles">
                    <Roles />
                  </PermissionCheck>
                } />

                <Route path="/absences" element={
                  <PermissionCheck requiredPermission="Ausencias">
                    <Absences />
                  </PermissionCheck>
                } />

                <Route path="/tango" element={
                  <PermissionCheck requiredPermission="Ausencias">
                    <Tango />
                  </PermissionCheck>
                } />
              </Routes>
            </div>
          </div>
          <ToastContainer />
        </PermissionProvider>
      </MyContext.Provider>
    </BrowserRouter>
  );
}

export default App;
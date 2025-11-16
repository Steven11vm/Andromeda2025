import React, { useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MyContext } from '../../App'; 
import { GrUser } from 'react-icons/gr';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Menu,
  MenuItem,
  TablePagination
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../assets/images/logo-light.png';
import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";
import { FaShoppingBag, FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import Swal from 'sweetalert2';

export default function Component() {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const servicesRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    checkLoginStatus();
    context.setIsHideSidebarAndHeader(true);
    context.setThemeMode(false);
    fetchProducts();
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchOrders();
    }
  }, [isLoggedIn, userId]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('jwtToken');
    const storedEmail = localStorage.getItem('userName');
    const idRole = localStorage.getItem('roleId');
    const storedUserId = localStorage.getItem('userId');

    if (token && storedEmail && idRole && storedUserId) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      setUserRole(idRole);
      setUserId(parseInt(storedUserId, 10));
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
      setUserRole('');
      setUserId(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pendiente':
        return '#fbbf24';
      case 'completada':
        return '#22c55e';
      case 'cancelada':
        return '#ef4444';
      default:
        return '#3b82f6';
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://andromeda-api.onrender.com/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar los productos');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://andromeda-api.onrender.com/api/orders');
      const data = await response.json();

      const filteredOrders = data
        .filter(order => String(order.id_usuario) === String(userId))
        .map(order => ({
          id: order.id,
          Billnumber: order.Billnumber,
          OrderDate: order.OrderDate,
          registrationDate: order.registrationDate,
          total_price: order.total_price,
          status: order.status,
          id_usuario: order.id_usuario,
          Token_Expiration: order.Token_Expiration,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          OrderDetails: order.OrderDetails.map(detail => ({
            id: detail.id,
            quantity: detail.quantity,
            unitPrice: detail.unitPrice,
            total_price: detail.total_price,
            id_producto: detail.id_producto,
            id_order: detail.id_order,
            createdAt: detail.createdAt,
            updatedAt: detail.updatedAt,
          })),
        }));

      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar los pedidos');
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
    localStorage.removeItem('userId');
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

  const getProductName = (id) => {
    const selectedProduct = products.find(product => product.id === id);
    return selectedProduct ? selectedProduct.Product_Name : `Producto ${id}`;
  };

  const handleCancelOrder = async (orderId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción cancelará el pedido y no podrá deshacerse.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, conservar',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`https://andromeda-api.onrender.com/api/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'Cancelada' }),
        });

        if (response.ok) {
          toast.success('Pedido cancelado exitosamente');
          fetchOrders();
        } else {
          throw new Error('Failed to cancel order');
        }
      } catch (error) {
        console.error('Error al cancelar el pedido:', error);
        toast.error('Error al cancelar el pedido');
      }
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
      <header className="header-index1">
        <Link to={'/'} className='d-flex align-items-center logo-index'>
          <img src={logo} alt="Logo" />
          <span className='ml-2'>Barbería Orion</span>
        </Link>
        <div className={`nav-container ${isNavOpen ? 'nav-open' : ''}`}>
          <nav className='navBar-index'>
            <Link to='/index' onClick={() => setIsNavOpen(false)}>INICIO</Link>
            {
              userRole == 3 && (<Link to='/appointmentView'>CITAS</Link>)
            }
            <Link to='/shop' onClick={() => setIsNavOpen(false)}>PRODUCTOS</Link>
          </nav>
          <div className="auth-buttons">
            {isLoggedIn && userEmail ? (
              <div className="user-menu">
                <Button
                  onClick={handleMenuClick}
                  className="userLoginn"
                  startIcon={
                    <Avatar sx={{ width: 32, height: 32, backgroundColor: '#b89b58' }}>
                      {getUserInitial()}
                    </Avatar>
                  }
                >
                  {userEmail}
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} className='menu-landingPage'>
                  {userRole == 1 || userRole == 2 ? (
                    <MenuItem onClick={handledashboard} className='menu-item-landingPage'>
                      <GrUserAdmin /> Administrar
                    </MenuItem>
                  ) : (
                    <MenuItem></MenuItem>
                  )}
                  <MenuItem component={Link} to='/profileview' onClick={() => setIsNavOpen(false)} className='menu-item-landingPage'>
                    <GrUser /> Mi perfil
                  </MenuItem>
                  <MenuItem onClick={handleLogout} className='menu-item-landingPage'>
                    <GiExitDoor /> Cerrar Sesión
                  </MenuItem>
                  {/* Usamos MenuItem para mantener el mismo estilo */}

                </Menu>
              </div>
            ) : (
              <Button variant="contained" onClick={handleLogin}>Iniciar sesión</Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mt-5 px-4 sm:px-6 lg:px-8">
        <h1 className="text-center mb-4 text-2xl sm:text-3xl font-bold" style={{ color: '#b89b58' }}>Mis Pedidos</h1>
        {isLoggedIn ? (
          <div className="overflow-x-auto">
            <TableContainer component={Paper} className="rounded-lg shadow-lg">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className="font-semibold">N° Pedido</TableCell>
                    <TableCell className="font-semibold">Fecha</TableCell>
                    <TableCell className="font-semibold">Total</TableCell>
                    <TableCell className="font-semibold">Estado</TableCell>
                    <TableCell className="font-semibold">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((order) => (
                    <React.Fragment key={order.id}>
                      <TableRow>
                        <TableCell>{order.Billnumber}</TableCell>
                        <TableCell>{formatDate(order.OrderDate)}</TableCell>
                        <TableCell>{formatCurrency(order.total_price)}</TableCell>
                        <TableCell>
                          <span style={{
                            backgroundColor: getStatusColor(order.status),
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '0.875rem'
                          }}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outlined"
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="min-w-[130px] bg-white border-2 border-[#b89b58] text-[#b89b58] hover:bg-[#b89b58] hover:text-white rounded-full py-1 px-4 font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              {expandedOrder === order.id ? (
                                <>
                                  <FaEyeSlash className="text-lg" />
                                  <span>Ocultar</span>
                                </>
                              ) : (
                                <>
                                  <FaEye className="text-lg" />
                                  <span>Ver Detalles</span>
                                </>
                              )}
                            </Button>

                            {order.status.toLowerCase() === 'pendiente' && (
                              <Button
                                variant="outlined"
                                onClick={() => handleCancelOrder(order.id)}
                                className="min-w-[130px] bg-white border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-full py-1 px-4 font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                <MdCancel className="text-lg" />
                                <span>Cancelar</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {expandedOrder === order.id && (
                        <TableRow>
                          <TableCell colSpan={5}>
                            <div className="overflow-x-auto">
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Producto</TableCell>
                                    <TableCell>Cantidad</TableCell>
                                    <TableCell>Precio Unitario</TableCell>
                                    <TableCell>Precio Total</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {order.OrderDetails.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>{getProductName(item.id_producto)}</TableCell>
                                      <TableCell>{item.quantity}</TableCell>
                                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                      <TableCell>{formatCurrency(item.total_price)}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[7, 10, 25]}
                component="div"
                count={orders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
              />
            </TableContainer>
          </div>
        ) : (
          <p className="text-center text-lg">Inicia sesión para ver tus pedidos.</p>
        )}
      </div>
    </>
  );
}


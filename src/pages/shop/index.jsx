import React, { useContext, useEffect, useState, useRef } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { MyContext } from '../../App';
import logo from '../../assets/images/logo-light.png';
import { GrUser } from 'react-icons/gr';

import {
  Button,
  TextField,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Badge,
  ListItemAvatar,
  Avatar,
  Alert,
  Snackbar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  FormControl,
  InputLabel,
  Menu,
  MenuItem,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import { ShoppingCart, Search } from '@mui/icons-material';
import LogoutIcon from '@mui/icons-material/Logout';
import ReactPaginate from 'react-paginate';
import { Scissors } from 'lucide-react';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GrUserAdmin } from "react-icons/gr";
import { GiExitDoor } from "react-icons/gi";
import axios from 'axios';
import Swal from 'sweetalert2';
import './shop.css';

export default function Component() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : {};
  });
  const [total, setTotal] = useState(0);

  const [userId, setUserId] = useState(null);
  const [orders, setOrders] = useState([]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');

  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const servicesRef = useRef(null);
  const formattedTotal = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(total);

  const [currentPage, setCurrentPage] = useState(0);
  const context = useContext(MyContext);
  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  const ITEMS_PER_PAGE = 5;

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryMenuAnchorEl, setCategoryMenuAnchorEl] = useState(null);

  useEffect(() => {
    calculateTotal();
  }, [cart, products]);

  useEffect(() => {
    context.setIsHideSidebarAndHeader(true);
    fetchProducts();
    checkLoginStatus();
    fetchCategories();
  }, [context]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    calculateTotal();
  }, [cart]);

  const checkLoginStatus = () => {
    const token = localStorage.getItem('jwtToken');
    const storedEmail = localStorage.getItem('userName');
    const idRole = localStorage.getItem('roleId');
    const userId = localStorage.getItem('userId');

    if (token && storedEmail && idRole && userId) {
      setIsLoggedIn(true);
      setUserEmail(storedEmail);
      setUserRole(idRole);
      setUserId(userId);
    } else {
      setIsLoggedIn(false);
      setUserEmail('');
      setUserRole('');
      setUserId(null);
    }
  };

  useEffect(() => {
    checkLoginStatus();

    if (isLoggedIn) {
      // Additional logic for logged-in users if needed
    } else {
      setUserRole(null);
    }
  }, [isLoggedIn]);

  const calculateTotal = () => {
    let sum = 0;
    Object.entries(cart).forEach(([productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId));
      if (product) {
        sum += product.Price * quantity;
      }
    });
    setTotal(sum);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://andromeda-api.onrender.com/api/products');
      const activeProducts = response.data.filter(product => product.status === 'A');
      console.log('Fetched products:', activeProducts);
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
    } catch (err) {
      setError('Error al cargar los productos. Por favor, intente más tarde.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://andromeda-api.onrender.com/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const addToCart = (product) => {
    if (product.Stock <= 0) {
      toast.error(`¡Producto agotado!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      });
      return;
    }
    setCart((prevCart) => {
      const currentQuantity = prevCart[product.id] || 0;

      if (currentQuantity + 1 > product.Stock) {
        toast.error(`¡Producto agotado! `, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });

        return prevCart;
      }

      const newCart = {
        ...prevCart,
        [product.id]: currentQuantity + 1
      };
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const handleShowOrders = () => {
    navigate('/ordermy');
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const increaseQuantity = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;

    setCart(prevCart => {
      const currentQuantity = prevCart[productId] || 0;
      if (currentQuantity + 1 > product.Stock) {
        toast.warning(`Producto agotado`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
        return prevCart;
      }

      const newCart = {
        ...prevCart,
        [productId]: currentQuantity + 1
      };
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const decreaseQuantity = (productId) => {
    setCart(prevCart => {
      const currentQuantity = prevCart[productId];
      if (currentQuantity <= 1) {
        const newCart = { ...prevCart };
        delete newCart[productId];
        toast.info('Producto eliminado del carrito', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined
        });
        localStorage.setItem('cart', JSON.stringify(newCart));
        return newCart;
      }

      const newCart = {
        ...prevCart,
        [productId]: currentQuantity - 1
      };
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('cart');
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      Swal.fire('Error', 'Debes iniciar sesión para realizar un pedido.', 'error');
      return;
    }

    if (Object.keys(cart).length === 0) {
      Swal.fire('Error', 'Debes seleccionar al menos un producto antes de realizar el pedido.', 'error');
      return;
    }

    const orderDetails = Object.entries(cart).map(([productId, quantity]) => ({
      quantity: quantity,
      id_producto: parseInt(productId)
    }));

    const invalidProducts = orderDetails.filter(detail => {
      const product = products.find(p => p.id === detail.id_producto);
      return !product || product.Stock < detail.quantity || detail.quantity <= 0;
    });

    if (invalidProducts.length > 0) {
      Swal.fire('Error', 'Hay productos en el carrito que no cumplen con los requisitos. Asegúrate de que la cantidad sea mayor a 0 y que haya suficiente stock.', 'error');
      return;
    }

    const total = orderDetails.reduce((acc, detail) => {
      const product = products.find(p => p.id === detail.id_producto);
      return acc + (product.Price * detail.quantity);
    }, 0);
    const formattedTotal = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(total);

    const confirmation = await Swal.fire({
      title: 'Confirmar Pedido',
      html: `
        <p>Estás a punto de realizar un pedido con un total de: <strong>${formattedTotal} COP</strong></p>
        <p>¿Deseas continuar?</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmation.isConfirmed) {
      return;
    }

    let orderCreated = false;
    let orderData;
    let expirationDateString;

    try {
      const now = new Date();
      const orderDateTime = now.toISOString().split('T');
      const orderDate = orderDateTime[0];
      const orderTime = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

      const expirationDate = new Date(now);
      expirationDate.setDate(expirationDate.getDate() + 3);
      expirationDateString = expirationDate.toLocaleDateString('es-ES');

      orderData = {
        Billnumber: `ORD${Date.now()}`,
        OrderDate: orderDate,
        OrderTime: orderTime,
        total_price: parseFloat(total.toFixed(2)),
        status: 'Pendiente',
        id_usuario: userId,
        orderDetails: orderDetails
      };

      const response = await axios.post('https://andromeda-api.onrender.com/api/orders', orderData);

      if (response.status === 201) {
        orderCreated = true;
        clearCart();
      }
    } catch (error) {
      console.error('Error creando el pedido:', error);
      if (error.response) {
        console.error('El servidor respondió con:', error.response.data);
      }
      Swal.fire('Error', 'Hubo un problema al crear el pedido. Intente de nuevo.', 'error');
    } finally {
      if (orderCreated) {
        Swal.fire({
          title: '¡Pedido creado exitosamente!',
          html: `
            <div class="order-confirmation">
              <p>Fecha de vencimiento del pedido (en caso de no ser cancelado): ${expirationDateString}</p>
              <p>Total a pagar: <strong>${formattedTotal} COP</strong></p>
            </div>
          `,
          icon: 'success'
        }).then(() => {
          refreshComponent();
        });
      }
    }
  };

  const refreshComponent = () => {
    setCart({});
    fetchProducts();
  };

  const getTotalItems = () => Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
    const filtered = products.filter(product =>
      (selectedCategory === '' || product.Category_Id === parseInt(selectedCategory)) &&
      (product.Product_Name.toLowerCase().includes(searchTerm) ||
        (product.Description && product.Description.toLowerCase().includes(searchTerm)))
    );
    setFilteredProducts(filtered);
  };

  const handleLogin = () => navigate('/login');
  const handleAdministrar = () => {
    if (isLoggedIn && (userRole === '1' || userRole === '2')) {
      context.setIsHideSidebarAndHeader(false);
      navigate('/sales');
    } else {
      Swal.fire('Error', 'No tienes permisos para acceder a la sección de administración.', 'error');
    }
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

  const getUserInitial = () => {
    return userEmail && userEmail.length >
      0 ? userEmail[0].toUpperCase() : '?';
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const scrollToServices = () => {
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (event) => {
    setCategoryMenuAnchorEl(event.currentTarget);
  };

  const handleCategoryClose = () => {
    setCategoryMenuAnchorEl(null);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    const filteredProducts = products.filter(product =>
      categoryId === '' || product.Category_Id === parseInt(categoryId)
    );
    setFilteredProducts(filteredProducts);
    handleCategoryClose();
  };

  return (
    <>
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

            <IconButton onClick={() => setDrawerOpen(true)}>
              <Badge badgeContent={getTotalItems()} color="primary">
                <AddShoppingCartIcon />
              </Badge>
            </IconButton>
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
      <main className="container mx-auto mt-8 shop-container">
        <h1 className="shop-title">NUESTROS PRODUCTOS</h1>
        <Button
            onClick={handleCategoryClick}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md shadow transition duration-200 ease-in-out transform hover:scale-105 flex items-center space-x-2"
          >
            <Scissors className="w-5 h-5 text-gray-600" />
            <span>Categorías</span>
          </Button>
        <div className="search-and-filter">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar productos"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
       


          <Menu
            anchorEl={categoryMenuAnchorEl}
            open={Boolean(categoryMenuAnchorEl)}
            onClose={handleCategoryClose}
            PaperProps={{
              style: {
                backgroundColor: '#0000',
                color: 'black',
              },
            }}
          >
            <MenuItem onClick={() => handleCategorySelect('')} className="hover:bg-amber-600">Todas las categorías</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} onClick={() => handleCategorySelect(category.id.toString())} className="hover:bg-amber-600">
                {category.name}
              </MenuItem>
            ))}
          </Menu>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            <p>{error}</p>
            <Button variant="contained" color="primary" onClick={fetchProducts} className="mt-4">
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <img
                    src={product.Image}
                    alt={product.Product_Name}
                    className="product-image"
                  />
                  <Typography variant="h5" component="h2" className="product-title">
                    {product.Product_Name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="product-description">
                    {product.Description}
                  </Typography>
                  <Typography variant="body1" className="product-price">
                    Precio: {new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0 }).format(product.Price)}
                  </Typography>

                  {userRole === '3' && (
                    <Button
                      variant="contained"
                      onClick={() => addToCart(product)}
                      className="barber-add-cart-btn"
                    >
                      <div className="button-wrapper-barber">
                        <span className="text-barber">AGREGAR</span>
                        <span className="icon-button-barber">
                          <AddShoppingCartIcon />
                        </span>
                      </div>
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <div className="no-products-container text-center py-12">
                <Typography variant="h6" gutterBottom>
                  No se encontraron productos
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedCategory
                    ? "No hay productos en esta categoría"
                    : `No hay productos que coincidan con tu búsqueda "${searchTerm}"`}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                    setFilteredProducts(products);
                  }}
                  className="mt-4"
                >
                  Mostrar todos los productos
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        variant="persistent"
        className="cart-drawer"
        ModalProps={{
          keepMounted: true,
        }}
      >
        <IconButton
          onClick={() => setDrawerOpen(false)}
          className="close-drawer-btn"
        >
          <CloseIcon />
        </IconButton>
        <div className="drawer-content">
          <div className="drawer-header">
            <Typography variant="h6">Carrito de Compras</Typography>
          </div>

          {Object.keys(cart).length === 0 ? (
            <Typography className="empty-cart-message">Tu carrito está vacío</Typography>
          ) : (
            <List>
              {Object.entries(cart).map(([productId, quantity]) => {
                const product = products.find((p) => p.id === parseInt(productId));
                if (!product) return null;

                return (
                  <ListItem key={productId} className="cart-item">
                    <ListItemAvatar>
                      <Avatar src={product.Image} alt={product.Product_Name} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={<span className="product-name">{product.Product_Name}</span>}
                      secondary={
                        <span>
                          <span className="price-text">
                            {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0
                            }).format(product.Price * quantity)}
                          </span>
                        </span>
                      }
                    />
                    <div className="quantity-controls">
                      <IconButton
                        onClick={() => decreaseQuantity(productId)}
                        className="quantity-button"
                        size="small"
                      >
                        <RemoveIcon />
                      </IconButton>
                      <span className="quantity-display">{quantity}</span>
                      <IconButton
                        onClick={() => increaseQuantity(productId)}
                        className="quantity-button"
                        size="small"
                      >
                        <AddIcon />
                      </IconButton>
                    </div>
                  </ListItem>
                );
              })}
            </List>
          )}
          <div className="drawer-footer">
            <div className="total-amount">
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">
                {formattedTotal}$
              </Typography>
            </div>
          </div>

          <Button
            variant="contained"
            onClick={handleShowOrders}
            sx={{
              backgroundColor: '#c59d5f',
              '&:hover': {
                backgroundColor: '#c59d5f',
              },
              color: '#fff'
            }}
          >
            Ver Mis Pedidos
          </Button>

          <div className="cart-buttons1">
            <Button
              variant="outlined"
              onClick={clearCart}
              className="barber-button barber-button-clear"
              startIcon={<DeleteOutlineIcon />}
            >
              Vaciar Carrito
            </Button>
            <Button
              variant="contained"
              onClick={handleCheckout}
              className="barber-button barber-button-checkout"
              startIcon={<ShoppingBagIcon />}
            >
              Realizar pedido
            </Button>
          </div>
        </div>
      </Drawer>

      <Snackbar
        open={!!alertMessage}
        autoHideDuration={3000}
        onClose={() => setAlertMessage('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setAlertMessage('')} severity={alertSeverity} sx={{ width: '100%' }}>
          {alertMessage}
        </Alert>
      </Snackbar>

      {orders.length > 0 && (
        <ReactPaginate
          previousLabel={'Anterior'}
          nextLabel={'Siguiente'}
          breakLabel={'...'}
          pageCount={Math.ceil(orders.length / ITEMS_PER_PAGE)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={5}
          onPageChange={handlePageChange}
          containerClassName={'pagination'}
          activeClassName={'active'}
        />
      )}
    </>
  );
}


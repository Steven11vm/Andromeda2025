
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { GiHairStrands } from "react-icons/gi";
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { IoTrashSharp, IoSearch, IoCart } from "react-icons/io5";
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Switch from '@mui/material/Switch';
import { Modal, Form, Col, Row } from 'react-bootstrap';
import { usePermissions } from '../../components/PermissionCheck';
import Pagination from '../../components/pagination/index';

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
  height: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightRegular,
  '&:hover, &:focus': {
    backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.06),
  },
  '&:active': {
    boxShadow: theme.shadows[1],
    backgroundColor: emphasize(theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800], 0.12),
  },
}));

const Products = () => {
  const [productData, setProductData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    Product_Name: '',
    Price: '',
    Category_Id: '',
    Image: null,
    status: 'A',
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [search, setSearch] = useState('');
  const permissions = usePermissions();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
    fetchProductData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://andromeda-api.onrender.com/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      show_alerta('Error al cargar las categorías', 'error');
    }
  };

  const fetchProductData = async () => {
    try {
      const response = await axios.get('https://andromeda-api.onrender.com/api/products');
      setProductData(response.data);
    } catch (err) {
      show_alerta('Error al cargar los productos', 'error');
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === 'Price') {
      updatedValue = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: updatedValue
    }));

    handleValidation(name, updatedValue);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        show_alerta('Tipo de archivo no permitido. Use JPEG, PNG o GIF.', 'error');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        show_alerta('El archivo es demasiado grande. Máximo 5MB permitido.', 'error');
        return;
      }

      setFormData({ ...formData, Image: file });

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Product_Name || formData.Product_Name.trim() === '') {
      newErrors.Product_Name = 'El nombre del producto es obligatorio';
    }

    if (!formData.Price || isNaN(formData.Price) || parseFloat(formData.Price) <= 0) {
      newErrors.Price = 'El precio debe ser un número mayor a cero';
    }

    if (!formData.Category_Id || isNaN(formData.Category_Id)) {
      newErrors.Category_Id = 'Debe seleccionar una categoría válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleValidation = (name, value) => {
    let error = '';
    switch (name) {
      case 'Product_Name':
        error = value.trim() === '' ? 'El nombre del producto es obligatorio' : '';
        break;
      case 'Price':
        error = !value || isNaN(value) || parseFloat(value) <= 0 ? 'El precio debe ser un número mayor a cero' : '';
        break;
      case 'Category_Id':
        error = !value || isNaN(value) ? 'Debe seleccionar una categoría válida' : '';
        break;
      default:
        break;
    }
    setErrors(prevErrors => ({ ...prevErrors, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
    handleValidation(name, formData[name]);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('Product_Name', formData.Product_Name.trim());
    formDataToSend.append('Price', formData.Price);
    formDataToSend.append('Category_Id', formData.Category_Id);
    formDataToSend.append('status', formData.status);
    formDataToSend.append('Stock', '0');
    if (formData.Image) {
      formDataToSend.append('Image', formData.Image);
    }

    try {
      const response = await axios.post('https://andromeda-api.onrender.com/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200 || response.status === 201) {
        handleClose();
        fetchProductData();
        show_alerta('Producto agregado exitosamente', 'success');
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      show_alerta('Error al agregar el producto', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('Product_Name', formData.Product_Name.trim());
    formDataToSend.append('Price', formData.Price);
    formDataToSend.append('Category_Id', formData.Category_Id);
    formDataToSend.append('status', formData.status);
    formDataToSend.append('Stock', '0');

    if (formData.Image instanceof File) {
      formDataToSend.append('Image', formData.Image);
    }

    try {
      const response = await axios.put(`https://andromeda-api.onrender.com/api/products/${formData.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.status === 200 || response.status === 204) {
        handleClose();
        await fetchProductData();
        show_alerta('Producto actualizado exitosamente', 'success');
      } else {
        throw new Error('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('Error:', error);
      show_alerta('Error al actualizar el producto', 'error');
    }
  };

  const openModal = (op, id, Product_Name, Price, Category_Id, Image, status) => {
    setOperation(op);
    setFormData({
      id,
      Product_Name: Product_Name || '',
      Price: Price || '',
      Category_Id: Category_Id || '',
      Image: null,
      status: status || 'A',
    });
    setImagePreviewUrl(Image || '');
    setErrors({});
    setTouched({});
    setTitle(op === 1 ? 'Registrar Producto' : 'Editar Producto');
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setFormData({
      id: '',
      Product_Name: '',
      Price: '',
      Category_Id: '',
      Image: null,
      Stock: '',
      status: 'A',
    });
    setErrors({});
    setTouched({});
    setImagePreviewUrl('');
  };

  const handleDelete = async (id, name) => {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: `¿Estás seguro que deseas eliminar el producto ${name}?`,
      icon: 'question',
      text: 'No se podrá dar marcha atrás',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://andromeda-api.onrender.com/api/products/${id}`);
          fetchProductData();
          show_alerta('Producto eliminado exitosamente', 'success');
        } catch (err) {
          console.error('Error deleting product:', err);
          show_alerta('Error al eliminar el producto', 'error');
        }
      } else {
        show_alerta('El producto NO fue eliminado', 'info');
      }
    });
  };

  const handleSwitchChange = async (productId, checked) => {
    const productToUpdate = productData.find(product => product.id === productId);
    const MySwal = withReactContent(Swal);

    const result = await MySwal.fire({
      title: `¿Estás seguro que deseas ${checked ? 'activar' : 'desactivar'} el producto "${productToUpdate.Product_Name}"?`,
      icon: 'question',
      text: 'Esta acción puede afectar la disponibilidad del producto.',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const newStatus = checked ? 'A' : 'I';
      try {
        MySwal.fire({
          title: 'Actualizando...',
          text: 'Por favor espere mientras se actualiza el estado del producto.',
          allowOutsideClick: false,
          showConfirmButton: false,
          willOpen: () => {
            MySwal.showLoading();
          },
        });

        const response = await axios.put(`https://andromeda-api.onrender.com/api/products/${productId}/status`, {
          status: newStatus
        });

        if (response.status === 200) {
          setProductData(prevData =>
            prevData.map(product =>
              product.id === productId ? {
                ...product,
                status: newStatus
              } : product
            )
          );
          MySwal.fire({
            title: 'Éxito',
            text: 'Estado del producto actualizado exitosamente',
            icon: 'success',
          });
        } else {
          throw new Error('Respuesta inesperada del servidor');
        }
      } catch (error) {
        console.error('Error:', error);
        MySwal.fire({
          title: 'Error',
          text: 'Error al actualizar el estado del producto',
          icon: 'error',
        });
      }
    } else {
      MySwal.fire({
        title: 'Cancelado',
        text: 'Estado del producto no cambiado',
        icon: 'info',
      });
    }
  };

  const handleSearchChange = useCallback((event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  }, []);

  const filteredItems = productData.filter((product) =>
    product.Product_Name.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleViewDetails = (product) => {
    Swal.fire({
      title: 'Detalles del Producto',
      html: `
        <div class="text-left">
          <p><strong>Nombre:</strong> ${product.Product_Name}</p>
          <p><strong>Precio:</strong> ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price)}</p>
          <p><strong>Categoría:</strong> ${categories.find(cat => cat.id === product.Category_Id)?.name || 'N/A'}</p>
          <p><strong>Stock:</strong> ${product.Stock}</p>
          <p><strong>Estado:</strong> ${product.status === 'A' ? 'Activo' : 'Inactivo'}</p>
          ${product.Image ? `<img src="${product.Image}" alt="${product.Product_Name}" style="max-width: 100%; margin-top: 10px;">` : '<p><strong>Imagen:</strong> No disponible</p>'}
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar'
    });
  };

  return (
    <div className="right-content w-100">
      <div className="row d-flex align-items-center w-100">
        <div className="spacing d-flex align-items-center">
          <div className='col-sm-5'>
            <span className='Title'>Gestión de Productos</span>
          </div>
          <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
            <div role="presentation">
              <Breadcrumbs aria-label="breadcrumb">
                <StyledBreadcrumb
                  component="a"
                  href="#"
                  label="Home"
                  icon={<HomeIcon fontSize="small" />}
                />
                <StyledBreadcrumb
                  component="a"
                  href="#"
                  label="Ingresos"
                  icon={<IoCart fontSize="small" />}
                />
                <StyledBreadcrumb
                  component="a"
                  href="#"
                  label="Productos"
                  icon={<GiHairStrands fontSize="small" />}
                />
              </Breadcrumbs>
            </div>
          </div>
        </div>
        <div className='card shadow border-0 p-3'>
          <div className='row'>
            <div className='col-sm-5 d-flex align-items-center'>
              <Button className='btn-register' onClick={() => openModal(1)} variant="contained" color="primary">
                <BsPlusSquareFill /> Registrar
              </Button>
            </div>
            <div className='col-sm-7 d-flex align-items-center justify-content-end'>
              <div className="searchBox position-relative d-flex align-items-center">
                <IoSearch className="mr-2" />
                <input
                  value={search}
                  onChange={handleSearchChange}
                  type="text"
                  placeholder='Buscar...'
                  className='form-control'
                />
              </div>
            </div>
          </div>

          <div className='table-responsive mt-3'>
            <table className='table table-bordered table-hover v-align table-striped'>
              <thead className='table-primary'>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Categoría</th>
                  <th>Stock</th>
                  <th>Imagen</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((product, i) => (
                    <tr key={product.id}>
                      <td>{(i + 1) + (currentPage - 1) * itemsPerPage}</td>
                      <td>{product.Product_Name}</td>
                      <td>{new Intl.NumberFormat('es-CO', {
                        style: 'currency', currency: 'COP'
                      }).format(product.Price)}</td>
                      <td>{categories.find(cat => cat.id === product.Category_Id)?.name || 'N/A'}</td>
                      <td>{product.Stock}</td>
                      <td className="p-2 text-center">
                        {product.Image ? (
                          <div className="inline-block">
                            <img
                              src={product.Image}
                              alt={product.Product_Name}
                              className="w-[50px] h-[50px] object-cover rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-gray-100"
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover'
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-[50px] h-[50px] inline-flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 border border-gray-100">
                            <span className="text-sm">No</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`productStatus ${product.status === 'A' ? '' : 'Inactive'}`}>
                          {product.status === 'A' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className='actions d-flex align-items-center'>
                          <Switch
                            checked={product.status === 'A'}
                            onChange={(e) => handleSwitchChange(product.id, e.target.checked)}
                          />
                          <Button
                            color='primary'
                            className='primary'
                            onClick={() => handleViewDetails(product)}
                          >
                            <FaEye />
                          </Button>
                          {product.status === 'A' && (
                            <>
                              <Button
                                color="secondary"
                                className='secondary'
                                onClick={() => openModal(2, product.id, product.Product_Name, product.Price, product.Category_Id,
                                  product.Image, product.status)}
                              >
                                <FaPencilAlt />
                              </Button>
                              <Button
                                color='error'
                                className='delete'
                                onClick={async () => {
                                  try {
                                    const response = await axios.get('https://andromeda-api.onrender.com/api/shopping');
                                    const purchases = response.data;

                                    const isAssociated = purchases.some((purchase) =>
                                      purchase.ShoppingDetails.some((detail) => detail.product_id === product.id)
                                    );

                                    if (isAssociated) {
                                      Swal.fire({
                                        title: 'No se puede eliminar',
                                        text: `El producto "${product.Product_Name}" está asociado a una compra y no puede ser eliminado.`,
                                        icon: 'warning',
                                        confirmButtonText: 'Entendido'
                                      });
                                    } else {
                                      const confirmDelete = await Swal.fire({
                                        title: '¿Estás seguro?',
                                        text: `Se eliminará el producto "${product.Product_Name}". Esta acción no se puede deshacer.`,
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonText: 'Eliminar',
                                        cancelButtonText: 'Cancelar'
                                      });

                                      if (confirmDelete.isConfirmed) {
                                        handleDelete(product.id, product.Product_Name);
                                      }
                                    }
                                  } catch (error) {
                                    console.error('Error al verificar compras:', error);
                                    Swal.fire({
                                      title: 'Error',
                                      text: 'No se pudo verificar si el producto está asociado a una compra. Inténtalo de nuevo más tarde.',
                                      icon: 'error',
                                      confirmButtonText: 'Cerrar'
                                    });
                                  }
                                }}
                              >
                                <IoTrashSharp />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">No hay productos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {currentItems.length > 0 && (
            <div className="d-flex table-footer">
              <Pagination
                setCurrentPages={setCurrentPage}
                currentPages={currentPage}
                nPages={Math.ceil(filteredItems.length / itemsPerPage)}
              />
            </div>
          )}
        </div>
      </div>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col sm="6">
                <Form.Group>
                  <Form.Label className='required'>Nombre del Producto</Form.Label>
                  <Form.Control
                    type="text"
                    name="Product_Name"
                    value={formData.Product_Name}
                    placeholder="Nombre del Producto"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.Product_Name && !!errors.Product_Name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.Product_Name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col sm="6">
                <Form.Group>
                  <Form.Label className='required'>Precio</Form.Label>
                  <Form.Control
                    type="number"
                    name="Price"
                    value={formData.Price}
                    placeholder="Precio"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.Price && !!errors.Price}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.Price}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col sm="6">
                <Form.Group>
                  <Form.Label className='required'>Categoría</Form.Label>
                  <Form.Select
                    name="Category_Id"
                    value={formData.Category_Id}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.Category_Id && !!errors.Category_Id}
                  >
                    <option value="">Seleccione una categoría</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.Category_Id}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Imagen</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
              />
              {imagePreviewUrl && (
                <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px' }} />
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} className='btn-red'>
            Cerrar
          </Button>
          <Button variant="primary" onClick={operation === 1 ? handleSubmit : handleUpdate} className='btn-sucess'>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Products;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { Breadcrumbs, Chip, Button, Switch } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { FaCartPlus, FaEye } from "react-icons/fa";
import { IoCart, IoSearch } from "react-icons/io5";
import { BsPlusSquareFill } from "react-icons/bs";
import { TbFileDownload } from "react-icons/tb";
import Modal from 'react-bootstrap/Modal';
import Pagination from '../../components/pagination/index';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DocumentPdf from './viewShopping';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { usePermissions } from '../../components/PermissionCheck';
import { Link } from 'react-router-dom';

const StyledBreadcrumb = styled(Chip)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800],
  height: theme.spacing(3),
  color: theme.palette.text.primary,
  fontWeight: theme.typography.fontWeightRegular,
  '&:hover, &:focus': {
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
  },
  '&:active': {
    boxShadow: theme.shadows[1],
    backgroundColor: theme.palette.mode === 'light' ? theme.palette.grey[300] : theme.palette.grey[600],
  },
}));

const Shopping = () => {
  const [shopping, setShopping] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [dataQt, setDataQt] = useState(5);
  const [currentPages, setCurrentPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedShopping, setSelectedShopping] = useState(null);
  const permissions = usePermissions();

  useEffect(() => {
    getShopping();
    getSuppliers();
    getProducts();
  }, []);

  const indexEnd = currentPages * dataQt;
  const indexStart = indexEnd - dataQt;

  const filteredResults = shopping.filter((dato) =>
    dato.code.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedResults = filteredResults.slice(indexStart, indexEnd);
  const nPages = Math.ceil(filteredResults.length / dataQt);

  const getShopping = async () => {
    try {
      const response = await axios.get('https://andromeda-api.onrender.com/api/shopping');
      setShopping(response.data);
    } catch (error) {
      console.error('Error fetching shopping data:', error);
      Swal.fire('Error', 'No se pudo cargar la lista de compras', 'error');
    }
  };

  const getSuppliers = async () => {
    try {
      const response = await axios.get('https://andromeda-api.onrender.com/api/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      Swal.fire('Error', 'No se pudo cargar la lista de proveedores', 'error');
    }
  };

  const getProducts = async () => {
    try {
      const response = await axios.get('https://andromeda-api.onrender.com/api/products');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      Swal.fire('Error', 'No se pudo cargar la lista de productos', 'error');
    }
  };

  const supplierName = (supplierId) => {
    const supplier = suppliers.find(supplier => supplier.id === supplierId);
    return supplier ? supplier.Supplier_Name : 'Desconocido';
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPages(1);
  };

  const handleOpenModal = (shopping) => {
    setSelectedShopping(shopping);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedShopping(null);
  };

  const handleSwitchChange = async (shoppingId, currentStatus) => {
    if (!currentStatus) {
      Swal.fire('Error', 'El estado de la compra no es válido.', 'error');
      return;
    }

    if (currentStatus === 'anulada') {
      Swal.fire('No permitido', 'No se puede cambiar el estado de una compra anulada.', 'warning');
      return;
    }

    const newStatus = currentStatus === 'completada' ? 'anulada' : 'completada';
    const MySwal = withReactContent(Swal);

    MySwal.fire({
      title: `¿Estás seguro que deseas ${newStatus === 'completada' ? 'completar' : 'anular'} la compra?`,
      icon: 'question',
      text: `Esta acción cambiará el estado de la compra a "${newStatus}".`,
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          let response;
          if (newStatus === 'anulada') {
            response = await axios.patch(`https://andromeda-api.onrender.com/api/shopping/${shoppingId}/cancel`, { status: 'anulada' });
          } else {
            response = await axios.put(`https://andromeda-api.onrender.com/api/shopping/${shoppingId}`, { status: 'completada' });
          }

          if (response.status === 200) {
            setShopping(prevShopping => prevShopping.map(item =>
              item.id === shoppingId ? { ...item, status: newStatus } : item
            ));
            Swal.fire('Estado actualizado', `El estado de la compra se ha actualizado a ${newStatus}.`, 'success');
          }
        } catch (error) {
          console.error('Error al actualizar el estado de la compra:', error);

          if (error.response && error.response.data && error.response.data.error === 'stock_negativo') {
            Swal.fire('Error', 'Hubo un problema al actualizar el estado de la compra.', 'error');
          } else {
            Swal.fire('Stock insuficiente', 'No se puede cambiar el estado porque el stock de productos quedaría en un número negativo.', 'error');
          }
        }
      }
    });
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="row d-flex align-items-center w-100">
          <div className="spacing d-flex align-items-center">
            <div className='col-sm-5'>
              <span className='Title'>Compras</span>
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
                    label="Compras"
                    icon={<FaCartPlus fontSize="small" />}
                  />
                </Breadcrumbs>
              </div>
            </div>
          </div>
          <div className='card shadow border-0 p-3'>
            <div className='row'>
              <div className='col-sm-5 d-flex align-items-center'>
                <Link className='btn-register btn btn-primary' to="/shoppingRegister">
                  <BsPlusSquareFill /> Registrar
                </Link>
              </div>
              <div className='col-sm-7 d-flex align-items-center justify-content-end'>
                <div className="searchBox position-relative d-flex align-items-center">
                  <IoSearch className="mr-2" />
                  <input
                    type="text"
                    placeholder='Buscar...'
                    className='form-control'
                    value={search}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            </div>
            <div className='table-responsive mt-3'>
              <table className='table table-bordered table-hover v-align table-striped'>
                <thead className='table-primary'>
                  <tr>
                    <th>#</th>
                    <th>Codigo</th>
                    <th>Fecha compra</th>
                    <th>Fecha registro</th>
                    <th>Monto Total</th>
                    <th>Proveedor</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.length > 0 ? (
                    paginatedResults.map((shopping, i) => (
                      <tr key={shopping.id}>
                        <td>{(indexStart + i + 1)}</td>
                        <td>{shopping.code}</td>
                        <td>{shopping.purchaseDate}</td>
                        <td>{shopping.registrationDate}</td>
                        <td>${shopping.total_price.toLocaleString()}</td>
                        <td>{supplierName(shopping.supplierId)}</td>
                        <td>{shopping.status}</td>
                        <td>
                          <div className='actions d-flex align-items-center'>
                            <Switch
                              checked={shopping.status.toLowerCase() === 'completada'}
                              onChange={() => handleSwitchChange(shopping.id, shopping.status.toLowerCase())}
                            />
                            <Button color='primary' className='primary' onClick={() => handleOpenModal(shopping)}>
                              <FaEye />
                            </Button>
                            <PDFDownloadLink document={<DocumentPdf shopping={shopping} suppliers={suppliers} products={products} />} fileName={`Detalle Compra ${shopping.code}.pdf`}>
                              <Button color='warning' className='warning'><TbFileDownload /></Button>
                            </PDFDownloadLink>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">No hay compras disponibles</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {paginatedResults.length > 0 && (
                <div className="d-flex table-footer">
                  <Pagination
                    setCurrentPages={setCurrentPages}
                    currentPages={currentPages}
                    nPages={nPages}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Modal show={showDetailModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de la compra <i className="fa fa-credit-card" aria-hidden="true"></i></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedShopping && (
            <div>
              <div className="mb-4">
                <h5 className="border-bottom pb-2">Información de la compra</h5>
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Código:</strong> {selectedShopping.code}</p>
                    <p><strong>Fecha de Compra:</strong> {selectedShopping.purchaseDate}</p>
                    <p><strong>Fecha de Registro:</strong> {selectedShopping.registrationDate}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Proveedor:</strong> {supplierName(selectedShopping.supplierId)}</p>
                    <p><strong>Total:</strong> ${selectedShopping.total_price.toLocaleString()}</p>
                    <p><strong>Estado:</strong> {selectedShopping.status}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <h5 className="border-bottom pb-2">Detalle de la compra</h5>
                {selectedShopping.ShoppingDetails && selectedShopping.ShoppingDetails.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio unitario</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedShopping.ShoppingDetails.map((detail, index) => (
                          <tr key={index}>
                            <td>{products.find(p => p.id === detail.product_id)?.Product_Name || 'Desconocido'}</td>
                            <td>{detail.quantity}</td>
                            <td>${detail.unitPrice.toLocaleString()}</td>
                            <td>${detail.total_price.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted">No se encuentran productos en esta compra.</p>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outlined" className='btn-blue' onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Shopping;

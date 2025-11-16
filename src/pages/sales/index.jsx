import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { FcSalesPerformance } from "react-icons/fc";
import { FaMoneyBillWave } from "react-icons/fa";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BsPlusSquareFill } from "react-icons/bs";
import { IoSearch } from "react-icons/io5";
import Button from '@mui/material/Button';
import { FaEye } from "react-icons/fa";
import { TbFileDownload } from "react-icons/tb";
import { Link } from 'react-router-dom';
import DocumentPdf from './DocumentoPdf';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { Modal } from 'react-bootstrap';
import Pagination from '../../components/pagination/index';
import { show_alerta } from '../../assets/functions'
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Switch from '@mui/material/Switch';
import { usePermissions } from '../../components/PermissionCheck';
import { Button as BootstrapButton } from 'react-bootstrap';
import { GrStatusInfo } from "react-icons/gr";


const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
})

const SaleDetailModal = ({ show, onHide, sale }) => {
    const urlUsers = 'https://andromeda-api.onrender.com/api/users';
    const urlServices = 'https://andromeda-api.onrender.com/api/services';
    const urlProducts = 'https://andromeda-api.onrender.com/api/products';
    const [users, setUsers] = useState([]);
    const [productos, setProducts] = useState([]);
    const [servicess, setServices] = useState([]);



    useEffect(() => {
        getServices();
        getProducts();
        getUsers();
    }, []);

    const getProducts = async () => {
        try {
            const response = await axios.get(urlProducts);
            setProducts(response.data)
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
        }
    }

    const getServices = async () => {
        try {
            const response = await axios.get(urlServices);
            setServices(response.data)
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
        }
    }

    const getUsers = async () => {
        try {
            const response = await axios.get(urlUsers);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
        }
    };

    const userName = (userId) => {
        const user = users.find(user => user.id === userId);
        return user ? user.name : 'Desconocido';
    };

    const ProductName = (productId) => {
        const product = productos.find(product => product.id === productId);
        return product ? product.Product_Name : 'Desconocido';
    };

    const ServiceName = (serviceId) => {
        const service = servicess.find(service => service.id === serviceId);
        return service ? service.name : 'Desconocido';
    };


    if (!sale) return null;

    const products = sale.SaleDetails.filter(detail => detail.id_producto !== null);
    const services = sale.SaleDetails.filter(detail => detail.serviceId !== null);

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Detalle de Venta - Factura #{sale.Billnumber}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h5 className='fw-bold border-bottom pb-2 mb-2'>Información General</h5>
                <div className="row">
                    <div className="col-sm-4 d-flex align-items-center">
                        <p className='fw-semibold pe-1'>Fecha de Venta:</p><p>{sale.SaleDate}</p>
                    </div>
                    <div className="col-sm-5 d-flex align-items-center">
                        <p className='fw-semibold pe-1'>Fecha de Registro: </p><p>{sale.registrationDate}</p>
                    </div>
                    <div className="col-sm-3 d-flex align-items-center">
                        <p className='fw-semibold pe-1'>Estado: </p><p>{sale.status}</p>
                    </div>
                </div>
                <div className="d-flex align-items-center">
                    <p className='fw-semibold pe-1'>Cliente: </p><p>{userName(sale.id_usuario)}</p>
                </div>

                {products.length > 0 && (
                    <>
                        <h5 className="mt-4">Productos</h5>
                        <table className="table table-bordered table-hover v-align table-striped">
                            <thead className='table-primary'>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unitario</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.id}>
                                        <td>{ProductName(product.id_producto)}</td>
                                        <td>{product.quantity}</td>
                                        <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.unitPrice)}</td>
                                        <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.total_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {services.length > 0 && (
                    <>
                        <h5 className="mt-4">Servicios</h5>
                        <table className="table table-bordered table-hover v-align table-striped">
                            <thead className='table-primary'>
                                <tr>
                                    <th>Servicio</th>
                                    <th>Empleado</th>
                                    <th>Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map((service) => (
                                    <tr key={service.id}>
                                        <td> {ServiceName(service.serviceId)}</td>
                                        <td> {userName(service.empleadoId)}</td>
                                        <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(service.total_price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                <p className='fw-bold border-top pt-2 mt-2'>Total: {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(sale.total_price)}</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" className='btn-blue' onClick={onHide}>
                    Cerrar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

const Sales = () => {
    const url = 'https://andromeda-api.onrender.com/api/sales';
    const urlUsers = 'https://andromeda-api.onrender.com/api/users';
    const [sales, setSales] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [dataQt, setDataQt] = useState(5);
    const [currentPages, setCurrentPages] = useState(1);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const permissions = usePermissions();
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);

    useEffect(() => {
        getSales();
        getUsers();
    }, []);

    const hasPermission = (permission) => {
        return permissions.includes(permission);
    };

    const getSales = async () => {
        try {
            const response = await axios.get(url);
            setSales(response.data);
        } catch (error) {
            console.error('Error fetching sales:', error);
            Swal.fire('Error', 'No se pudieron cargar las ventas', 'error');
        }
    };

    const getUsers = async () => {
        try {
            const response = await axios.get(urlUsers);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            Swal.fire('Error', 'No se pudieron cargar los usuarios', 'error');
        }
    };

    const userName = (userId) => {
        const user = users.find(user => user.id === userId);
        return user ? user.name : 'Desconocido';
    };

    const searcher = (e) => {
        setSearch(e.target.value);
    };

    const handleCloseDetail = () => {
        setShowDetailModal(false);
    };

    const handleViewDetails = async (saleId) => {
        try {
            const response = await axios.get(`${url}/${saleId}`);
            setDetailData(response.data);
            setShowDetailModal(true);
        } catch (error) {
            console.error('Error fetching sale details:', error);
            Swal.fire('Error', 'No se pudieron cargar los detalles de la venta', 'error');
        }
    };

    const handleShowStatusModal = (sale) => {
        setSelectedSale(sale);
        setShowStatusModal(true);
    };

    let results = !search
        ? sales
        : sales.filter((dato) => {
            const searchTerm = search.toLowerCase();
            const userNameStr = userName(dato.id_usuario).toLowerCase();
            return (
                dato.Billnumber.toLowerCase().includes(searchTerm) ||
                userNameStr.includes(searchTerm) ||
                dato.SaleDate.toLowerCase().includes(searchTerm)
            );
        });

    const indexEnd = currentPages * dataQt;
    const indexStart = indexEnd - dataQt;
    const nPages = Math.ceil(results.length / dataQt);
    results = results.slice(indexStart, indexEnd);

    const handleStatusChange = async (newStatus) => {
        if (!selectedSale) return;

        try {
            const response = await axios.put(`${url}/${selectedSale.id}/status`, {
                status: newStatus
            });

            if (response.status === 200) {
                // Update the sales list with the new status
                setSales(prevSales =>
                    prevSales.map(sale =>
                        sale.id === selectedSale.id
                            ? { ...sale, status: newStatus }
                            : sale
                    )
                );

                Swal.fire({
                    icon: 'success',
                    title: 'Estado actualizado',
                    text: `La venta ${selectedSale.Billnumber} ha sido ${newStatus}.`,
                    showConfirmButton: false,
                    timer: 1500
                });

                setShowStatusModal(false);
            }
        } catch (error) {
            console.error('Error updating sale status:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo actualizar el estado de la venta.',
            });
        }
    };

    return (
        <div className="right-content w-100">

            <div className="row d-flex align-items-center w-100">
                <div className="spacing d-flex align-items-center">
                    <div className='col-sm-5'>
                        <span className='Title'>Ventas</span>
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
                                    label="Salidas"
                                    icon={<FaMoneyBillWave fontSize="small" />}
                                />
                                <StyledBreadcrumb
                                    component="a"
                                    href="#"
                                    label="Ventas"
                                    icon={<FcSalesPerformance fontSize="small" />}
                                />
                            </Breadcrumbs>
                        </div>
                    </div>
                </div>
                <div className='card shadow border-0 p-3'>
                    <div className='row'>
                        <div className='col-sm-5 d-flex align-items-center'>
                            {
                               
                                    <Link className='btn-register btn btn-primary' to="/salesRegister">
                                        <BsPlusSquareFill />Registrar
                                    </Link>
                              
                            }
                        </div>
                        <div className='col-sm-7 d-flex align-items-center justify-content-end'>
                            <div className="searchBox position-relative d-flex align-items-center">
                                <IoSearch className="mr-2" />
                                <input
                                    value={search}
                                    onChange={searcher}
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
                                    <th>Nmro Comprobante</th>
                                    <th>Fecha venta</th>
                                    <th>Fecha registro</th>
                                    <th>MontoTotal</th>
                                    <th>Usuario</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.length > 0 ? (
                                    results.map((sale, i) => (
                                        <tr key={sale.id}>
                                            <td>{i + 1}</td>
                                            <td>{sale.Billnumber}</td>
                                            <td>{sale.SaleDate}</td>
                                            <td>{sale.registrationDate}</td>
                                            <td>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(sale.total_price)}</td>
                                            <td>{userName(sale.id_usuario)}</td>
                                            <td>{sale.status}</td>
                                            <td>
                                                <div className='actions d-flex align-items-center'>
                                                    {
                                                        sale.status == 'Pendiente' && (
                                                            <>
                                                               
                                                                    <Button
                                                                        color='warning'
                                                                        className='warning'
                                                                        onClick={() => handleShowStatusModal(sale)}
                                                                    >
                                                                        <GrStatusInfo />
                                                                    </Button>
                                                            
                                                            </>
                                                        )
                                                    }

                                                    {
                                                       
                                                            <Button color="primary" className='primary' onClick={() => handleViewDetails(sale.id)}>
                                                                <FaEye />
                                                            </Button>
                                                        
                                                    }
                                                    {
                                                        
                                                            <PDFDownloadLink document={<DocumentPdf sale={sale} />} fileName={`DetalleVenta ${sale.Billnumber}.pdf`}>
                                                                <Button color='warning' className='warning'>
                                                                    <TbFileDownload />
                                                                </Button>
                                                            </PDFDownloadLink>
                                                     
                                                    }
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className='text-center'>No hay ventas disponibles</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {results.length > 0 && (
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
            <SaleDetailModal
                show={showDetailModal}
                onHide={handleCloseDetail}
                sale={detailData}
            />
            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cambiar Estado de Venta</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Se va a modificar el estado de la venta {selectedSale?.Billnumber}. Una vez realizado este cambio, no será posible revertir la acción. Si la venta tiene una cita asociada, el estado de dicha cita también se verá afectado.</p>
                </Modal.Body>
                <Modal.Footer>
                    <BootstrapButton
                        variant="success"
                        onClick={() => handleStatusChange('Completada')}
                    >
                        Completar
                    </BootstrapButton>
                    <BootstrapButton
                        variant="danger"
                        onClick={() => handleStatusChange('Cancelada')}
                    >
                        Cancelar
                    </BootstrapButton>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Sales;
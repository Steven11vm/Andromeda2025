import { useState, useEffect } from 'react';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import axios from 'axios';
import { Link } from 'react-router-dom';



const SectionProducts = () => {
    const url = 'https://andromeda-api.onrender.com/api/products';
    const [products, setProducts] = useState([]);

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = async () => {
        try {
            const response = await axios.get(url);
            
            // Filtrar solo productos activos
            const activeProducts = response.data.filter(product => 
                product.status === 'A' || !product.status
            );
            
            // Usar Map para agrupar por ID de producto de manera más robusta
            const productsMap = new Map();
            const seenIds = new Set();
            
            activeProducts.forEach(product => {
                // Asegurar que el ID sea válido - probar diferentes formatos
                const productId = product.id || product.product_id || product.ID || product.Id;
                
                // Si no hay ID válido, usar nombre como fallback
                if (!productId) {
                    const productName = product.Product_Name || product.name || product.product_name;
                    if (!productName) return; // Saltar si tampoco tiene nombre
                }
                
                const key = productId || `name-${product.Product_Name || product.name || product.product_name}`;
                
                // Si ya vimos este ID, comparar y mantener el mejor
                if (seenIds.has(key)) {
                    const existingProduct = productsMap.get(key);
                    const existingStock = Number(existingProduct?.Stock || existingProduct?.stock || 0);
                    const newStock = Number(product.Stock || product.stock || 0);
                    
                    // Mantener el producto con mayor stock
                    if (newStock > existingStock) {
                        productsMap.set(key, product);
                    }
                } else {
                    // Primera vez que vemos este ID
                    seenIds.add(key);
                    productsMap.set(key, product);
                }
            });
            
            // Convertir el Map a array de productos únicos
            const uniqueProducts = Array.from(productsMap.values());
            
            // Filtrar cualquier duplicado adicional usando un Set con IDs
            const finalProducts = [];
            const finalSeenIds = new Set();
            
            uniqueProducts.forEach(product => {
                const productId = product.id || product.product_id || product.ID || product.Id;
                const productName = product.Product_Name || product.name || product.product_name;
                const uniqueKey = productId ? `id-${productId}` : `name-${productName}`;
                
                if (!finalSeenIds.has(uniqueKey)) {
                    finalSeenIds.add(uniqueKey);
                    finalProducts.push(product);
                }
            });
            
            // Ordenar por ID para mantener consistencia
            finalProducts.sort((a, b) => {
                const idA = a.id || a.product_id || a.ID || a.Id || 0;
                const idB = b.id || b.product_id || b.ID || b.Id || 0;
                return Number(idA) - Number(idB);
            });
            
            // Log para debugging
            console.log('Productos únicos finales:', finalProducts.length, 'de', activeProducts.length, 'productos activos');
            console.log('IDs únicos:', Array.from(finalSeenIds));
            
            setProducts(finalProducts);
        } catch (error) {
            console.error('Error al obtener productos:', error);
            setProducts([]);
        }
    };


    const responsive = {
        superLargeDesktop: {
            // the naming can be any, depends on you.
            breakpoint: { max: 4000, min: 3000 },
            items: 5
        },
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 3
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 2
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1
        }
    };


    return (
        <>
            <style>
                {`
                    /* Solo en móvil: asegurar que los controles del carrusel no se interpongan con el menú móvil */
                    @media (max-width: 768px) {
                        .react-multi-carousel-list {
                            position: relative;
                            z-index: 1 !important;
                        }
                        
                        .react-multi-carousel-dot-list {
                            z-index: 1 !important;
                        }
                        
                        .react-multi-carousel-dot button {
                            z-index: 1 !important;
                        }
                        
                        .react-multi-carousel-arrow {
                            z-index: 1 !important;
                        }
                        
                        .react-multi-carousel-arrow--left {
                            z-index: 1 !important;
                        }
                        
                        .react-multi-carousel-arrow--right {
                            z-index: 1 !important;
                        }
                    }
                `}
            </style>
            <div className='product-carousel'>
                <Carousel 
                    responsive={responsive}
                    swipeable={true}
                    draggable={true}
                    showDots={false}
                    infinite={products.length > 1}
                    autoPlay={false}
                    keyBoardControl={true}
                    customTransition="transform 300ms ease-in-out"
                    transitionDuration={300}
                    containerClass="carousel-container"
                    itemClass="carousel-item-padding-40-px"
                    removeArrowOnDeviceType={["tablet", "mobile"]}
                >
                    {products.filter((product, index, self) => {
                        // Filtro adicional para asegurar que no haya duplicados en el renderizado
                        const productId = product.id || product.product_id || product.ID || product.Id;
                        const productName = product.Product_Name || product.name || product.product_name || '';
                        const uniqueKey = productId ? `id-${productId}` : `name-${productName}`;
                        
                        // Solo mantener el primer producto con esta clave única
                        return index === self.findIndex(p => {
                            const pId = p.id || p.product_id || p.ID || p.Id;
                            const pName = p.Product_Name || p.name || p.product_name || '';
                            const pKey = pId ? `id-${pId}` : `name-${pName}`;
                            return pKey === uniqueKey;
                        });
                    }).map((product, index) => {
                        // Crear una clave única y estable para cada producto
                        const productId = product.id || product.product_id || product.ID || product.Id;
                        const productName = product.Product_Name || product.name || product.product_name || '';
                        const uniqueKey = productId ? `product-${productId}` : `product-name-${productName}-${index}`;
                        
                        return (
                        <div className='card card-product-carousel' key={uniqueKey} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%'
                        }}>
                            <div className="product-image-wrapper" style={{ 
                                width: '100%',
                                overflow: 'hidden',
                                borderRadius: '20px',
                                marginBottom: '15px',
                                position: 'relative',
                                backgroundColor: '#1a1a1a',
                                aspectRatio: '1 / 1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <img 
                                    className='product--image' 
                                    src={product.Image} 
                                    alt={product.Product_Name}
                                    loading="lazy"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'block'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.08)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                />
                            </div>
                            <h2 className='Product--name'>{product.Product_Name}</h2>
                            <p className='price-card-product'>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.Price)}</p>
                            <div className='d-flex align-items-center justify-content-center' style={{ marginTop: 'auto', paddingTop: '10px' }}>
                                <div className="cart" data-tooltip="PRICE $20">
                                    <Link to={'/shop'} style={{ textDecoration: 'none' }}>
                                        <div className="button-wrapper-cart">
                                            <div className="text-card">Ir al carrito</div>
                                            <span className="icon-button-card">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    fill="currentColor"
                                                    className="bi bi-cart2"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path
                                                        d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5zM3.14 5l1.25 5h8.22l1.25-5H3.14zM5 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0zm9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"
                                                    ></path>
                                                </svg>
                                            </span>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </Carousel>
            </div>
        </>
    );
};

export default SectionProducts;
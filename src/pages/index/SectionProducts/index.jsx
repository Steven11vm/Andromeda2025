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
        const response = await axios.get(url);
        setProducts(response.data);
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
                    infinite={true}
                    autoPlay={false}
                    keyBoardControl={true}
                    customTransition="transform 300ms ease-in-out"
                    transitionDuration={300}
                    containerClass="carousel-container"
                    itemClass="carousel-item-padding-40-px"
                >
                    {products.map((product) => (
                        <div className='card card-product-carousel' key={product.id} style={{
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
                    ))}
                </Carousel>
            </div>
        </>
    );
};

export default SectionProducts;
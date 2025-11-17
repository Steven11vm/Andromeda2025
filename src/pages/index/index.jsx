import React, { useRef, useEffect, useState } from 'react';
import Header from './Header';
import ServicesSection from './SectionServices';
import ProductSection from './SectionProducts';
import SectionFooter from './SectionFooter';
import Button from '@mui/material/Button';

const Index = () => {
    const servicesRef = useRef(null);
    const contactRef = useRef(null);
    const servicesTitleRef = useRef(null);
    const servicesDescRef = useRef(null);
    const servicesContainerRef = useRef(null);
    const productsTitleRef = useRef(null);
    const productsDescRef = useRef(null);
    const productsContainerRef = useRef(null);

    const [isVisible, setIsVisible] = useState({
        servicesTitle: false,
        servicesDesc: false,
        servicesContainer: false,
        productsTitle: false,
        productsDesc: false,
        productsContainer: false
    });

    useEffect(() => {
        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const targetId = entry.target.getAttribute('data-animate-id');
                    if (targetId) {
                        setIsVisible(prev => ({ ...prev, [targetId]: true }));
                    }
                }
            });
        }, observerOptions);

        const elementsToObserve = [
            servicesTitleRef.current,
            servicesDescRef.current,
            servicesContainerRef.current,
            productsTitleRef.current,
            productsDescRef.current,
            productsContainerRef.current
        ];

        elementsToObserve.forEach((element) => {
            if (element) observer.observe(element);
        });

        return () => {
            elementsToObserve.forEach((element) => {
                if (element) observer.unobserve(element);
            });
        };
    }, []);

    const scrollToServices = () => {
        if (servicesRef.current) {
            servicesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const scrollToContact = () => {
        if (contactRef.current) {
            contactRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                    
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes fadeInScale {
                        from {
                            opacity: 0;
                            transform: scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                    
                    .hero-content h1 {
                        animation: fadeInUp 1s ease-out 0.3s both;
                    }
                    
                    .hero-content p {
                        animation: fadeInUp 1s ease-out 0.6s both;
                    }
                    
                    .scroll-reveal-title {
                        opacity: 0;
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                    }
                    
                    .scroll-reveal-title.visible {
                        opacity: 1;
                        animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
                    }
                    
                    .scroll-reveal-desc {
                        opacity: 0;
                        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                    }
                    
                    .scroll-reveal-desc.visible {
                        opacity: 1;
                        animation: fadeInUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both;
                    }
                    
                    .scroll-reveal-container {
                        opacity: 0;
                        transition: opacity 0.8s ease-out;
                    }
                    
                    .scroll-reveal-container.visible {
                        opacity: 1;
                        animation: fadeInScale 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.3s both;
                    }
                `}
            </style>
            <Header scrollToServices={scrollToServices} scrollToContact={scrollToContact} />
            <section className="zona1">
                <div className="hero-content">
                    <h1>
                        Sólo los mejores barberos
                    </h1>
                    <p>
                        La barbería es el lugar donde puedes conseguir un corte de pelo de alta calidad de barberos certificados, que no sólo son profesionales, sino también maestros con talento.
                    </p>
                </div>
            </section>

            <section ref={servicesRef} style={{
                paddingTop: '80px',
                paddingBottom: '60px',
                backgroundColor: '#f8f9fa'
            }}>
                <div className='d-flex align-items-center justify-content-center mt-5'>
                    <h2 
                        ref={servicesTitleRef}
                        data-animate-id="servicesTitle"
                        className={`tittle-landingPage scroll-reveal-title ${isVisible.servicesTitle ? 'visible' : ''}`}
                    >
                        Nuestros servicios
                    </h2>
                </div>
                <p 
                    ref={servicesDescRef}
                    data-animate-id="servicesDesc"
                    className={`scroll-reveal-desc ${isVisible.servicesDesc ? 'visible' : ''}`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        marginTop: '20px',
                        marginBottom: '20px',
                        textAlign: 'center',
                        padding: '10px 20px',
                        color: '#333',
                        fontFamily: '"Poppins", sans-serif',
                        maxWidth: '800px',
                        margin: '20px auto',
                        lineHeight: '1.6'
                    }}
                >
                    En esta sección, encontrará una selección de algunos de nuestros servicios, aquellos que son solicitados por nuestros clientes.
                </p>
                <div 
                    ref={servicesContainerRef}
                    data-animate-id="servicesContainer"
                    className={`services-container scroll-reveal-container ${isVisible.servicesContainer ? 'visible' : ''}`}
                    style={{
                        width: '100%',
                        padding: '10px 20px',
                    }}
                >
                    <ServicesSection />
                </div>
            </section>

            <section className='section-products'>
                <div className='d-flex align-items-center justify-content-center mt-5'>
                    <h2 
                        ref={productsTitleRef}
                        data-animate-id="productsTitle"
                        className={`tittle-landingPage scroll-reveal-title ${isVisible.productsTitle ? 'visible' : ''}`}
                    >
                        Nuestros Mejores Productos
                    </h2>
                </div>
                <p 
                    ref={productsDescRef}
                    data-animate-id="productsDesc"
                    className={`scroll-reveal-desc ${isVisible.productsDesc ? 'visible' : ''}`}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        marginTop: '5px',
                        textAlign: 'center',
                        padding: '10px 20px',
                        color: '#fff',
                        fontFamily: '"Poppins", sans-serif',
                        maxWidth: '800px',
                        margin: '0 auto 20px',
                        lineHeight: '1.6'
                    }}
                >
                    En esta sección, encontrará una selección de algunos de nuestros servicios, aquellos que son solicitados por nuestros clientes.
                </p>
                <div 
                    ref={productsContainerRef}
                    data-animate-id="productsContainer"
                    className={`products-container scroll-reveal-container ${isVisible.productsContainer ? 'visible' : ''}`}
                    style={{
                        width: '100%',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        padding: '0 15px',
                    }}
                >
                    <ProductSection />
                </div>

            </section>
            <div ref={contactRef}>
                <SectionFooter />
            </div>
        </>
    );
};

export default Index;
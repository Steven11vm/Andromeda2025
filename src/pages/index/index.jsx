import React, { useRef } from 'react';
import Header from './Header';
import ServicesSection from './SectionServices';
import ProductSection from './SectionProducts';
import SectionFooter from './SectionFooter';
import Button from '@mui/material/Button';

const Index = () => {
    const servicesRef = useRef(null);
    const contactRef = useRef(null);

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

            <section ref={servicesRef}>
                <div className='d-flex align-items-center justify-content-center mt-5'>
                    <h2 className='tittle-landingPage'>Nuestros servicios</h2>
                </div>
                <p style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    marginTop: '20px',
                    marginBottom: '20px',
                    textAlign: 'center',
                    padding: '10px 20px',
                    color: '#333', // Assuming dark text on light background, adjust if needed
                    fontFamily: '"Poppins", sans-serif',
                    maxWidth: '800px',
                    margin: '20px auto',
                }}>
                    En esta sección, encontrará una selección de algunos de nuestros servicios, aquellos que son solicitados por nuestros clientes.
                </p>
                <div style={{
                    width: '100%',
                    padding: '10px 20px',
                    '@media (min-width: 768px)': {
                        padding: '10px 100px',
                    },
                    '@media (min-width: 1024px)': {
                        padding: '10px 270px',
                    },
                }}>
                    <ServicesSection />
                </div>
            </section>

            <section className='section-products'>
                <div className='d-flex align-items-center justify-content-center mt-5'>
                    <h2 className='tittle-landingPage'>Nuestros Mejores Productos</h2>
                </div>
                <p style={{
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
                }}>
                    En esta sección, encontrará una selección de algunos de nuestros servicios, aquellos que son solicitados por nuestros clientes.
                </p>
                <div style={{
                    width: '100%',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 15px',
                }}>
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
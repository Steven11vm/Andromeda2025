import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Fade from '@mui/material/Fade';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Scissors } from 'lucide-react'; 

const SectionServices = () => {
    const [expanded, setExpanded] = React.useState(null); // Inicialmente ningún acordeón está expandido
    const url = 'https://andromeda-api.onrender.com/api/services';
    const [services, setServices] = useState([]);

    useEffect(() => {
        getServices();
    }, []);

    const getServices = async () => {
        const response = await axios.get(url);
        setServices(response.data);
    };

    const handleExpansion = (id) => {
        setExpanded((prevExpanded) => (prevExpanded === id ? null : id));
    };

    return (
        <>
            <style>
                {`
                    @keyframes slideInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes scissorsCut {
                        0%, 100% {
                            transform: rotate(0deg) scale(1);
                        }
                        25% {
                            transform: rotate(-10deg) scale(1.1);
                        }
                        50% {
                            transform: rotate(0deg) scale(1);
                        }
                        75% {
                            transform: rotate(10deg) scale(1.1);
                        }
                    }
                    
                    @keyframes razorMove {
                        0%, 100% {
                            transform: translateX(0) rotate(0deg);
                        }
                        50% {
                            transform: translateX(5px) rotate(5deg);
                        }
                    }
                    
                    @keyframes pulse {
                        0%, 100% {
                            transform: scale(1);
                        }
                        50% {
                            transform: scale(1.05);
                        }
                    }
                    
                    @keyframes rotateIcon {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(180deg);
                        }
                    }
                    
                    @keyframes shimmer {
                        0% {
                            background-position: -1000px 0;
                        }
                        100% {
                            background-position: 1000px 0;
                        }
                    }
                    
                    .service-accordion {
                        animation: slideInUp 0.5s ease-out;
                        animation-fill-mode: both;
                    }
                    
                    .service-accordion:nth-child(1) { animation-delay: 0.1s; }
                    .service-accordion:nth-child(2) { animation-delay: 0.2s; }
                    .service-accordion:nth-child(3) { animation-delay: 0.3s; }
                    .service-accordion:nth-child(4) { animation-delay: 0.4s; }
                    .service-accordion:nth-child(5) { animation-delay: 0.5s; }
                    .service-accordion:nth-child(6) { animation-delay: 0.6s; }
                    .service-accordion:nth-child(7) { animation-delay: 0.7s; }
                    .service-accordion:nth-child(8) { animation-delay: 0.8s; }
                    
                    .service-icon {
                        transition: all 0.3s ease;
                    }
                    
                    .service-accordion:hover .service-icon.scissors-icon {
                        animation: scissorsCut 1.5s ease-in-out infinite;
                    }
                    
                    .service-accordion:hover .service-icon.star-icon {
                        animation: razorMove 2s ease-in-out infinite;
                    }
                    
                    .expanded-icon {
                        animation: rotateIcon 0.3s ease-out forwards;
                    }
                `}
            </style>
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                width: '100%',
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                {services.map((service, index) => (
                    <Accordion
                        className='service-accordion'
                        key={service.id}
                        expanded={expanded === service.id}
                        onChange={() => handleExpansion(service.id)}
                        slots={{ transition: Fade }}
                        slotProps={{ transition: { timeout: 400 } }}
                        sx={[
                            {
                                background: expanded === service.id 
                                    ? 'linear-gradient(135deg, rgba(197, 157, 95, 0.15) 0%, rgba(197, 157, 95, 0.08) 100%)'
                                    : 'linear-gradient(135deg, rgba(248, 249, 250, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: expanded === service.id
                                    ? '0 8px 24px rgba(197, 157, 95, 0.25), 0 0 0 1px rgba(197, 157, 95, 0.15)'
                                    : '0 2px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: expanded === service.id 
                                    ? '1px solid rgba(197, 157, 95, 0.4)'
                                    : '1px solid rgba(0, 0, 0, 0.08)',
                                '&:before': {
                                    display: 'none',
                                },
                                marginBottom: '0',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                '&:hover': {
                                    boxShadow: expanded === service.id
                                        ? '0 12px 32px rgba(197, 157, 95, 0.3), 0 0 0 1px rgba(197, 157, 95, 0.2)'
                                        : '0 6px 16px rgba(0, 0, 0, 0.15)',
                                    transform: 'translateY(-2px)',
                                    borderColor: expanded === service.id 
                                        ? 'rgba(197, 157, 95, 0.4)'
                                        : 'rgba(197, 157, 95, 0.2)',
                                },
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: expanded === service.id ? '100%' : '0%',
                                    height: '3px',
                                    background: 'linear-gradient(90deg, #c59d5f, #dfbd83, #c59d5f)',
                                    transition: 'width 0.4s ease',
                                },
                                '& .MuiAccordionDetails-root': {
                                    display: expanded === service.id ? 'block' : 'none',
                                    padding: expanded === service.id ? '20px' : '0',
                                    margin: 0,
                                },
                                '& .MuiCollapse-root': {
                                    minHeight: expanded === service.id ? 'auto' : '0 !important',
                                }
                            },
                        ]}
                    >
                        <AccordionSummary
                                expandIcon={
                                <ExpandMoreIcon 
                                    className={expanded === service.id ? 'expanded-icon' : ''}
                                    sx={{ 
                                        color: '#c59d5f',
                                        fontSize: expanded === service.id ? '28px' : '24px',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            color: '#dfbd83',
                                            transform: 'scale(1.1)'
                                        }
                                    }} 
                                />
                            }
                            aria-controls={`panel-${service.id}-content`}
                            id={`panel-${service.id}-header`}
                            sx={{
                                padding: expanded === service.id ? '16px 20px' : '12px 16px',
                                minHeight: expanded === service.id ? '64px' : '48px',
                                '&:hover': {
                                    backgroundColor: 'rgba(197, 157, 95, 0.05)',
                                },
                                '&.Mui-expanded': {
                                    minHeight: '64px',
                                    padding: '16px 20px',
                                    backgroundColor: 'rgba(197, 157, 95, 0.08)',
                                },
                                '&:not(.Mui-expanded)': {
                                    minHeight: '48px',
                                    padding: '12px 16px',
                                }
                            }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '16px',
                                width: '100%'
                            }}>
                                <div 
                                    className={`service-icon ${index % 2 === 0 ? 'scissors-icon' : 'star-icon'}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: expanded === service.id ? '40px' : '36px',
                                        height: expanded === service.id ? '40px' : '36px',
                                        borderRadius: '10px',
                                        background: expanded === service.id
                                            ? 'linear-gradient(135deg, rgba(197, 157, 95, 0.25), rgba(197, 157, 95, 0.15))'
                                            : 'linear-gradient(135deg, rgba(197, 157, 95, 0.12), rgba(197, 157, 95, 0.08))',
                                        border: expanded === service.id
                                            ? '1px solid rgba(197, 157, 95, 0.3)'
                                            : '1px solid rgba(197, 157, 95, 0.2)',
                                        transition: 'all 0.3s ease',
                                        boxShadow: expanded === service.id
                                            ? '0 4px 12px rgba(197, 157, 95, 0.2)'
                                            : '0 2px 6px rgba(197, 157, 95, 0.1)'
                                    }}
                                >
                                    {index % 2 === 0 ? (
                                        <Scissors 
                                            size={expanded === service.id ? 20 : 18} 
                                            strokeWidth={2.5}
                                            color="#c59d5f"
                                        />
                                    ) : (
                                        <StarIcon 
                                            sx={{ 
                                                color: '#c59d5f', 
                                                fontSize: expanded === service.id ? '22px' : '20px',
                                                filter: 'drop-shadow(0 2px 4px rgba(197, 157, 95, 0.4))'
                                            }} 
                                        />
                                    )}
                                </div>
                                <Typography sx={{ 
                                    fontWeight: 600,
                                    fontSize: expanded === service.id ? '18px' : '16px',
                                    color: expanded === service.id ? '#c59d5f' : '#2c3e50',
                                    letterSpacing: '0.5px',
                                    transition: 'all 0.3s ease',
                                    textShadow: expanded === service.id ? '0 2px 4px rgba(197, 157, 95, 0.2)' : 'none',
                                    '@media (max-width: 480px)': {
                                        fontSize: expanded === service.id ? '16px' : '15px'
                                    }
                                }}>
                                    {service.name}
                                </Typography>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails sx={{ 
                            padding: expanded === service.id ? '20px' : '0',
                            margin: 0,
                            display: expanded === service.id ? 'block' : 'none'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '12px',
                                paddingTop: '8px',
                                borderTop: expanded === service.id ? '1px solid rgba(197, 157, 95, 0.1)' : 'none'
                            }}>
                                <Typography sx={{
                                    color: '#34495e',
                                    lineHeight: '1.8',
                                    fontSize: '16px',
                                    fontWeight: 400,
                                    '@media (max-width: 480px)': {
                                        fontSize: '15px',
                                        lineHeight: '1.7'
                                    }
                                }}>
                                    {service.description}
                                </Typography>
                                {service.price && (
                                    <div style={{
                                        marginTop: '8px',
                                        padding: '12px 16px',
                                        background: 'linear-gradient(135deg, rgba(197, 157, 95, 0.1), rgba(197, 157, 95, 0.05))',
                                        borderRadius: '8px',
                                        border: '1px solid rgba(197, 157, 95, 0.2)'
                                    }}>
                                        <Typography sx={{
                                            color: '#c59d5f',
                                            fontSize: '18px',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <span>Precio:</span>
                                            <span>{new Intl.NumberFormat('es-CO', { 
                                                style: 'currency', 
                                                currency: 'COP',
                                                minimumFractionDigits: 0 
                                            }).format(service.price)}</span>
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </div>
        </>
    );
};

export default SectionServices;
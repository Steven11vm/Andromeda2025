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
                            transform: translateY(30px) scale(0.95);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                    
                    @keyframes bounceIn {
                        0% {
                            opacity: 0;
                            transform: scale(0.3) translateY(-50px);
                        }
                        50% {
                            opacity: 1;
                            transform: scale(1.05) translateY(0);
                        }
                        70% {
                            transform: scale(0.9);
                        }
                        100% {
                            transform: scale(1);
                        }
                    }
                    
                    @keyframes scissorsCut {
                        0%, 100% {
                            transform: rotate(0deg) scale(1);
                        }
                        25% {
                            transform: rotate(-15deg) scale(1.15);
                        }
                        50% {
                            transform: rotate(0deg) scale(1);
                        }
                        75% {
                            transform: rotate(15deg) scale(1.15);
                        }
                    }
                    
                    @keyframes razorMove {
                        0%, 100% {
                            transform: translateX(0) rotate(0deg) scale(1);
                        }
                        25% {
                            transform: translateX(8px) rotate(8deg) scale(1.1);
                        }
                        50% {
                            transform: translateX(0) rotate(0deg) scale(1);
                        }
                        75% {
                            transform: translateX(-8px) rotate(-8deg) scale(1.1);
                        }
                    }
                    
                    @keyframes pulse {
                        0%, 100% {
                            transform: scale(1);
                            opacity: 1;
                        }
                        50% {
                            transform: scale(1.1);
                            opacity: 0.9;
                        }
                    }
                    
                    @keyframes pulseGlow {
                        0%, 100% {
                            box-shadow: 0 0 5px rgba(197, 157, 95, 0.3);
                        }
                        50% {
                            box-shadow: 0 0 20px rgba(197, 157, 95, 0.6), 0 0 30px rgba(197, 157, 95, 0.4);
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
                            background-position: -200% 0;
                        }
                        100% {
                            background-position: 200% 0;
                        }
                    }
                    
                    @keyframes glow {
                        0%, 100% {
                            filter: drop-shadow(0 0 3px rgba(197, 157, 95, 0.5));
                        }
                        50% {
                            filter: drop-shadow(0 0 8px rgba(197, 157, 95, 0.8)) drop-shadow(0 0 12px rgba(197, 157, 95, 0.4));
                        }
                    }
                    
                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-5px);
                        }
                    }
                    
                    @keyframes scaleIn {
                        from {
                            opacity: 0;
                            transform: scale(0.8);
                        }
                        to {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }
                    
                    @keyframes slideInRight {
                        from {
                            opacity: 0;
                            transform: translateX(-20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                    
                    @keyframes ripple {
                        0% {
                            transform: scale(0);
                            opacity: 1;
                        }
                        100% {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }
                    
                    @keyframes textGlow {
                        0%, 100% {
                            text-shadow: 0 0 5px rgba(197, 157, 95, 0.3);
                        }
                        50% {
                            text-shadow: 0 0 15px rgba(197, 157, 95, 0.6), 0 0 25px rgba(197, 157, 95, 0.4);
                        }
                    }
                    
                    @keyframes borderGlow {
                        0%, 100% {
                            border-color: rgba(197, 157, 95, 0.3);
                            box-shadow: 0 0 5px rgba(197, 157, 95, 0.2);
                        }
                        50% {
                            border-color: rgba(197, 157, 95, 0.6);
                            box-shadow: 0 0 15px rgba(197, 157, 95, 0.4), 0 0 25px rgba(197, 157, 95, 0.2);
                        }
                    }
                    
                    .service-accordion {
                        animation: slideInUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                        position: relative;
                    }
                    
                    .service-accordion::before {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 0;
                        height: 0;
                        border-radius: 50%;
                        background: rgba(197, 157, 95, 0.1);
                        transform: translate(-50%, -50%);
                        transition: width 0.6s, height 0.6s;
                    }
                    
                    .service-accordion:active::before {
                        width: 300px;
                        height: 300px;
                    }
                    
                    .service-accordion:nth-child(1) { animation-delay: 0.1s; }
                    .service-accordion:nth-child(2) { animation-delay: 0.15s; }
                    .service-accordion:nth-child(3) { animation-delay: 0.2s; }
                    .service-accordion:nth-child(4) { animation-delay: 0.25s; }
                    .service-accordion:nth-child(5) { animation-delay: 0.3s; }
                    .service-accordion:nth-child(6) { animation-delay: 0.35s; }
                    .service-accordion:nth-child(7) { animation-delay: 0.4s; }
                    .service-accordion:nth-child(8) { animation-delay: 0.45s; }
                    
                    .service-icon {
                        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                        animation: float 3s ease-in-out infinite;
                    }
                    
                    .service-accordion:hover .service-icon.scissors-icon {
                        animation: scissorsCut 1.2s ease-in-out infinite, pulseGlow 2s ease-in-out infinite;
                    }
                    
                    .service-accordion:hover .service-icon.star-icon {
                        animation: razorMove 1.8s ease-in-out infinite, pulseGlow 2s ease-in-out infinite;
                    }
                    
                    .service-accordion:not(:hover) .service-icon {
                        animation: float 3s ease-in-out infinite;
                    }
                    
                    .expanded-icon {
                        animation: rotateIcon 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards, pulse 1s ease-in-out infinite;
                    }
                    
                    .service-name {
                        transition: all 0.3s ease;
                    }
                    
                    .service-accordion:hover .service-name {
                        animation: textGlow 2s ease-in-out infinite;
                    }
                    
                    .price-container {
                        animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
                        animation-delay: 0.2s;
                        transition: all 0.3s ease;
                    }
                    
                    .price-container:hover {
                        transform: scale(1.02);
                        box-shadow: 0 4px 12px rgba(197, 157, 95, 0.3);
                        border-color: rgba(197, 157, 95, 0.5) !important;
                    }
                    
                    .service-description {
                        animation: slideInRight 0.5s ease-out both;
                        animation-delay: 0.1s;
                    }
                    
                    .service-accordion.expanded {
                        animation: borderGlow 2s ease-in-out infinite;
                    }
                `}
            </style>
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                width: '100%',
                maxWidth: '900px',
                margin: '0 auto',
                padding: '0 10px'
            }}>
                {services.map((service, index) => (
                    <Accordion
                        className={`service-accordion ${expanded === service.id ? 'expanded' : ''}`}
                        key={service.id}
                        expanded={expanded === service.id}
                        onChange={() => handleExpansion(service.id)}
                        slots={{ transition: Fade }}
                        slotProps={{ transition: { timeout: 400 } }}
                        sx={[
                            {
                                background: expanded === service.id 
                                    ? 'linear-gradient(135deg, rgba(197, 157, 95, 0.2) 0%, rgba(197, 157, 95, 0.12) 100%)'
                                    : 'linear-gradient(135deg, rgba(235, 233, 233, 0.9) 0%, rgba(248, 249, 250, 0.85) 100%)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: expanded === service.id
                                    ? '0 8px 24px rgba(197, 157, 95, 0.25), 0 0 0 1px rgba(197, 157, 95, 0.15)'
                                    : '0 2px 12px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: expanded === service.id 
                                    ? '1px solid rgba(197, 157, 95, 0.4)'
                                    : '1px solid rgba(0, 0, 0, 0.06)',
                                '&:before': {
                                    display: 'none',
                                },
                                marginBottom: '0',
                                transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                position: 'relative',
                                '&:hover': {
                                    background: expanded === service.id 
                                        ? 'linear-gradient(135deg, rgba(197, 157, 95, 0.25) 0%, rgba(197, 157, 95, 0.15) 100%)'
                                        : 'linear-gradient(135deg, rgba(235, 233, 233, 0.95) 0%, rgba(248, 249, 250, 0.9) 100%)',
                                    boxShadow: expanded === service.id
                                        ? '0 12px 32px rgba(197, 157, 95, 0.3), 0 0 0 1px rgba(197, 157, 95, 0.2)'
                                        : '0 6px 16px rgba(0, 0, 0, 0.1)',
                                    transform: 'translateY(-4px) scale(1.01)',
                                    borderColor: expanded === service.id 
                                        ? 'rgba(197, 157, 95, 0.4)'
                                        : 'rgba(197, 157, 95, 0.25)',
                                },
                                '&:active': {
                                    transform: 'translateY(-1px) scale(0.98)',
                                },
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: expanded === service.id ? '100%' : '0%',
                                    height: '3px',
                                    background: expanded === service.id 
                                        ? 'linear-gradient(90deg, #c59d5f, #dfbd83, #f0d4a0, #dfbd83, #c59d5f)'
                                        : 'linear-gradient(90deg, #c59d5f, #dfbd83, #c59d5f)',
                                    backgroundSize: expanded === service.id ? '200% 100%' : '100% 100%',
                                    transition: 'all 0.4s ease',
                                    animation: expanded === service.id ? 'shimmer 3s linear infinite' : 'none',
                                    boxShadow: expanded === service.id ? '0 2px 8px rgba(197, 157, 95, 0.4)' : 'none',
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
                                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        filter: expanded === service.id ? 'drop-shadow(0 0 8px rgba(197, 157, 95, 0.5))' : 'none',
                                        '&:hover': {
                                            color: '#dfbd83',
                                            transform: 'scale(1.2) rotate(5deg)',
                                            filter: 'drop-shadow(0 0 12px rgba(197, 157, 95, 0.7))'
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
                                    backgroundColor: 'rgba(197, 157, 95, 0.08)',
                                },
                                '&.Mui-expanded': {
                                    minHeight: '64px',
                                    padding: '16px 20px',
                                    backgroundColor: 'rgba(197, 157, 95, 0.12)',
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
                                        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                        boxShadow: expanded === service.id
                                            ? '0 4px 12px rgba(197, 157, 95, 0.2)'
                                            : '0 2px 6px rgba(197, 157, 95, 0.1)',
                                        cursor: 'pointer',
                                        position: 'relative'
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
                                <Typography 
                                    className="service-name"
                                    sx={{ 
                                        fontWeight: 600,
                                        fontSize: expanded === service.id ? '18px' : '16px',
                                        color: expanded === service.id ? '#c59d5f' : '#2c3e50',
                                        letterSpacing: '0.5px',
                                        transition: 'all 0.3s ease',
                                        textShadow: expanded === service.id ? '0 2px 4px rgba(197, 157, 95, 0.2)' : 'none',
                                        transform: expanded === service.id ? 'scale(1.02)' : 'scale(1)',
                                        '@media (max-width: 480px)': {
                                            fontSize: expanded === service.id ? '16px' : '15px'
                                        }
                                    }}
                                >
                                    {service.name}
                                </Typography>
                            </div>
                        </AccordionSummary>
                        <AccordionDetails sx={{ 
                            padding: expanded === service.id ? '20px' : '0',
                            margin: 0,
                            display: expanded === service.id ? 'block' : 'none',
                            animation: expanded === service.id ? 'slideInRight 0.5s ease-out' : 'none'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '12px',
                                paddingTop: '8px',
                                borderTop: expanded === service.id ? '1px solid rgba(197, 157, 95, 0.1)' : 'none',
                                transition: 'all 0.3s ease'
                            }}>
                                <Typography 
                                    className="service-description"
                                    sx={{
                                        color: '#34495e',
                                        lineHeight: '1.8',
                                        fontSize: '16px',
                                        fontWeight: 400,
                                        transition: 'all 0.3s ease',
                                        '@media (max-width: 480px)': {
                                            fontSize: '15px',
                                            lineHeight: '1.7'
                                        }
                                    }}
                                >
                                    {service.description}
                                </Typography>
                                {service.price && (
                                    <div 
                                        className="price-container"
                                        style={{
                                            marginTop: '8px',
                                            padding: '12px 16px',
                                            background: 'linear-gradient(135deg, rgba(197, 157, 95, 0.15), rgba(197, 157, 95, 0.08))',
                                            borderRadius: '8px',
                                            border: '1px solid rgba(197, 157, 95, 0.3)',
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Typography sx={{
                                            color: '#c59d5f',
                                            fontSize: '18px',
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            position: 'relative',
                                            zIndex: 1,
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <span>Precio:</span>
                                            <span style={{
                                                fontWeight: 700,
                                                textShadow: '0 2px 4px rgba(197, 157, 95, 0.3)'
                                            }}>
                                                {new Intl.NumberFormat('es-CO', { 
                                                    style: 'currency', 
                                                    currency: 'COP',
                                                    minimumFractionDigits: 0 
                                                }).format(service.price)}
                                            </span>
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
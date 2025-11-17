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
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            width: '100%'
        }}>
            {services.map((service) => (
                <Accordion
                    className='accordion'
                    key={service.id}
                    expanded={expanded === service.id}
                    onChange={() => handleExpansion(service.id)}
                    slots={{ transition: Fade }}
                    slotProps={{ transition: { timeout: 400 } }}
                    sx={[
                        {
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            '&:before': {
                                display: 'none',
                            },
                            marginBottom: '12px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            }
                        },
                        expanded === service.id
                            ? {
                                '& .MuiAccordion-region': {
                                    height: 'auto',
                                },
                                '& .MuiAccordionDetails-root': {
                                    display: 'block',
                                },
                            }
                            : {
                                '& .MuiAccordion-region': {
                                    height: 0,
                                },
                                '& .MuiAccordionDetails-root': {
                                    display: 'none',
                                },
                            },
                    ]}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ color: '#b89b58' }} />}
                        aria-controls={`panel-${service.id}-content`}
                        id={`panel-${service.id}-header`}
                        sx={{
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            }
                        }}
                    >
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '12px',
                            width: '100%'
                        }}>
                            <StarIcon sx={{ color: '#b89b58', fontSize: '20px' }} />
                            <Typography sx={{ 
                                fontWeight: 500,
                                fontSize: '16px',
                                '@media (max-width: 480px)': {
                                    fontSize: '14px'
                                }
                            }}>
                                {service.name}
                            </Typography>
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            gap: '15px',
                            paddingTop: '8px'
                        }}>
                            <Typography sx={{
                                color: '#ddd',
                                lineHeight: '1.7',
                                fontSize: '15px',
                                '@media (max-width: 480px)': {
                                    fontSize: '14px',
                                    lineHeight: '1.6'
                                }
                            }}>
                                {service.description}
                            </Typography>
                        </div>
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};

export default SectionServices;
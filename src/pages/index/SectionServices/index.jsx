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
        <div>
            {services.map((service) => (
                <Accordion
                    className='accordion'
                    key={service.id}
                    expanded={expanded === service.id}
                    onChange={() => handleExpansion(service.id)}
                    slots={{ transition: Fade }}
                    slotProps={{ transition: { timeout: 400 } }}
                    sx={[
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
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={`panel-${service.id}-content`}
                        id={`panel-${service.id}-header`}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <StarIcon /> {/* O cualquier otro icono de Material-UI que prefieras */}
                            <Typography>{service.name}</Typography>
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <Typography>{service.description}</Typography>
                        </div>
                    </AccordionDetails>
                </Accordion>
            ))}
        </div>
    );
};

export default SectionServices;

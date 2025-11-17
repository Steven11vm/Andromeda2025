import React, { useState } from 'react';
import { Button, Popover, OverlayTrigger, Form } from 'react-bootstrap';

const CustomTimeSelector = ({ value, onChange, name, disabled = false, occupiedSlots = [], selectedDate = null }) => {
  const [show, setShow] = useState(false);

  const generateHourSlots = () => {
    const slots = [];
    // Solo horas completas de 7:00 AM a 10:00 PM (22:00)
    for (let hour = 7; hour <= 22; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = convertTo12HourFormat(time24);
      slots.push({ time24, time12 });
    }
    return slots;
  };

  const convertTo12HourFormat = (time24) => {
    const [hour, minute] = time24.split(':');
    let hour12 = parseInt(hour, 10) % 12;
    hour12 = hour12 === 0 ? 12 : hour12;
    const ampm = parseInt(hour, 10) >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minute} ${ampm}`;
  };

  const convertTo24HourFormat = (time12) => {
    const [time, modifier] = time12.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  };

  const isTimeSlotOccupied = (time24) => {
    if (!selectedDate || !occupiedSlots || occupiedSlots.length === 0) {
      return false;
    }
    
    return occupiedSlots.some(slot => {
      const slotStart = new Date(`${selectedDate}T${slot.startTime}`);
      const slotEnd = new Date(`${selectedDate}T${slot.endTime}`);
      const currentSlot = new Date(`${selectedDate}T${time24}`);
      return currentSlot >= slotStart && currentSlot < slotEnd;
    });
  };

  const handleTimeSelect = (time24) => {
    if (isTimeSlotOccupied(time24)) {
      // El botón ya está deshabilitado, pero esto es una medida de seguridad adicional
      return;
    }
    onChange(time24);
    setShow(false);
  };

  const hourSlots = generateHourSlots();

  const popover = (
    <Popover id="popover-basic" className="custom-time-popover" style={{ maxWidth: '300px' }}>
      <Popover.Header style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
        <strong>Selecciona una hora</strong>
      </Popover.Header>
      <Popover.Body style={{ padding: '15px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '8px',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          {hourSlots.map(({ time24, time12 }) => {
            const isOccupied = isTimeSlotOccupied(time24);
            return (
              <Button
                key={time24}
                variant={isOccupied ? "danger" : "outline-primary"}
                size="sm"
                onClick={() => handleTimeSelect(time24)}
                disabled={isOccupied}
                title={isOccupied ? 'Esta hora ya está ocupada' : `Seleccionar ${time12}`}
                style={{
                  opacity: isOccupied ? 0.5 : 1,
                  cursor: isOccupied ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  padding: '8px 12px',
                  border: isOccupied ? '1px solid #dc3545' : '1px solid #0d6efd',
                  backgroundColor: isOccupied ? '#f8d7da' : 'transparent',
                  color: isOccupied ? '#721c24' : '#0d6efd',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isOccupied) {
                    e.target.style.backgroundColor = '#0d6efd';
                    e.target.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOccupied) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#0d6efd';
                  }
                }}
              >
                {time12} {isOccupied && ' ⚠️'}
              </Button>
            );
          })}
        </div>
      </Popover.Body>
    </Popover>
  );

  const displayValue = value ? convertTo12HourFormat(value) : '';

  return (
    <div className="d-flex align-items-center gap-2">
      <Form.Control
        type="text"
        name={name}
        value={displayValue}
        onChange={(e) => {
          const time24 = convertTo24HourFormat(e.target.value);
          onChange(time24);
        }}
        className="me-2"
        disabled={disabled}
        placeholder="Selecciona una hora"
        readOnly
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? '#e9ecef' : 'white'
        }}
      />
      {!disabled && (
        <OverlayTrigger
          trigger="click"
          placement="bottom"
          show={show}
          onToggle={() => {
            setShow(!show);
          }}
          overlay={popover}
          rootClose
        >
          <Button 
            variant="outline-primary"
            style={{
              minWidth: '120px',
              fontWeight: '500'
            }}
          >
            {value ? 'Cambiar' : 'Seleccionar'}
          </Button>
        </OverlayTrigger>
      )}
    </div>
  );
};

export default CustomTimeSelector;
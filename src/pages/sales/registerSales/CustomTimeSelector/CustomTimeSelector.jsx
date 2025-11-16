import React, { useState } from 'react';
import { Button, Popover, OverlayTrigger, Form } from 'react-bootstrap';

const CustomTimeSelector = ({ value, onChange, name, disabled = false }) => {
  const [show, setShow] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);

  const generateHourSlots = () => {
    const slots = [];
    for (let hour = 7; hour < 20; hour++) {
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = convertTo12HourFormat(time24);
      slots.push({ time24, time12 });
    }
    return slots;
  };

  const generateMinuteSlots = (hour) => {
    const slots = [];
    for (let minute = 0; minute <= 30; minute += 30) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
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

  const hourSlots = generateHourSlots();

  const handleHourSelect = (hour) => {
    setSelectedHour(hour);
  };

  const handleTimeSelect = (time24) => {
    onChange(time24);
    setShow(false);
    setSelectedHour(null);
  };

  const popover = (
    <Popover id="popover-basic" className="custom-time-popover">
      <Popover.Body>
        <div className="time-grid">
          {selectedHour === null ? (
            hourSlots.map(({ time24, time12 }) => (
              <Button
                key={time24}
                variant="outline-primary"
                size="sm"
                onClick={() => handleHourSelect(time24.split(':')[0])}
                className="m-1"
              >
                {time12.split(':')[0] + ' ' + time12.split(' ')[1]}
              </Button>
            ))
          ) : (
            generateMinuteSlots(selectedHour).map(({ time24, time12 }) => (
              <Button
                key={time24}
                variant="outline-primary"
                size="sm"
                onClick={() => handleTimeSelect(time24)}
                className="m-1"
              >
                {time12}
              </Button>
            ))
          )}
        </div>
        {selectedHour !== null && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setSelectedHour(null)}
            className="mt-2"
          >
            Volver a selección de hora
          </Button>
        )}
      </Popover.Body>
    </Popover>
  );

  const displayValue = value ? convertTo12HourFormat(value) : '';

  return (
    <div className="d-flex align-items-center">
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
        placeholder="hh:mm AM/PM"
      />
      {!disabled && (
        <OverlayTrigger
          trigger="click"
          placement="bottom"
          show={show}
          onToggle={() => {
            setShow(!show);
            setSelectedHour(null);
          }}
          overlay={popover}
        >
          <Button variant="outline-secondary">
            Seleccionar
          </Button>
        </OverlayTrigger>
      )}
    </div>
  );
};

export default CustomTimeSelector;
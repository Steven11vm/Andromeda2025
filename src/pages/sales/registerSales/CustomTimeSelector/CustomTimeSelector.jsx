import React, { useState, useRef, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Clock } from 'lucide-react';

const CustomTimeSelector = ({ value, onChange, name, disabled = false, occupiedSlots = [], selectedDate = null, onEditAppointment = null }) => {
  const [show, setShow] = useState(false);
  const wrapperRef = useRef(null);
  const popoverRef = useRef(null);

  // Cerrar el selector cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target) &&
          popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevenir scroll del body cuando el popover está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [show]);

  // Calcular posición del popover cuando se abre
  useEffect(() => {
    if (show && wrapperRef.current) {
      const updatePosition = () => {
        if (popoverRef.current && wrapperRef.current) {
          const rect = wrapperRef.current.getBoundingClientRect();
          
          // Calcular posición centrada en la pantalla
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;
          const popoverHeight = Math.min(500, viewportHeight * 0.7);
          
          let top = rect.bottom + 8;
          let left = rect.left;
          
          // Si no cabe abajo, mostrarlo arriba
          if (top + popoverHeight > viewportHeight) {
            top = rect.top - popoverHeight - 8;
            // Si tampoco cabe arriba, centrarlo verticalmente
            if (top < 0) {
              top = Math.max(10, (viewportHeight - popoverHeight) / 2);
            }
          }
          
          // Ajustar horizontalmente si se sale de la pantalla
          const popoverWidth = Math.min(500, Math.max(300, rect.width));
          if (left + popoverWidth > viewportWidth) {
            left = viewportWidth - popoverWidth - 10;
          }
          if (left < 10) {
            left = 10;
          }
          
          popoverRef.current.style.top = `${top}px`;
          popoverRef.current.style.left = `${left}px`;
          popoverRef.current.style.width = `${popoverWidth}px`;
          popoverRef.current.style.transform = 'none';
        }
      };
      
      // Ejecutar inmediatamente y luego con un pequeño delay para asegurar que el DOM esté actualizado
      updatePosition();
      const timeoutId = setTimeout(updatePosition, 10);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [show]);

  const generateHourSlots = () => {
    const slots = [];
    // Solo horas completas de 7:00 AM a 10:00 PM (22:00)
    // Excluir 1:00 PM (13:00)
    for (let hour = 7; hour <= 22; hour++) {
      // Saltar hora de almuerzo 1:00 PM (13:00)
      if (hour === 13) {
        continue;
      }
      const time24 = `${hour.toString().padStart(2, '0')}:00`;
      const time12 = convertTo12HourFormat(time24);
      slots.push({ time24, time12, hour });
    }
    return slots;
  };

  const convertTo12HourFormat = (time24) => {
    if (!time24) return '';
    const [hour, minute] = time24.split(':');
    const hourNum = parseInt(hour, 10);
    let hour12 = hourNum % 12;
    hour12 = hour12 === 0 ? 12 : hour12;
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minute || '00'} ${ampm}`;
  };

  // Función para normalizar hora a formato HH:MM:SS
  const normalizeTimeForComparison = (timeString) => {
    if (!timeString) return '';
    // Si ya tiene formato HH:MM:SS, devolverlo
    if (timeString.includes(':') && timeString.split(':').length === 3) {
      return timeString;
    }
    // Si tiene formato HH:MM, agregar :00
    if (timeString.includes(':') && timeString.split(':').length === 2) {
      return timeString + ':00';
    }
    // Si solo tiene HH, agregar :00:00
    if (timeString.length === 2) {
      return timeString + ':00:00';
    }
    return timeString;
  };

  const getOccupiedSlotInfo = (time24) => {
    if (!selectedDate || !occupiedSlots || occupiedSlots.length === 0) {
      return null;
    }
    
    // Normalizar la hora actual a formato HH:MM:SS
    const normalizedCurrentTime = normalizeTimeForComparison(time24);
    
    const foundSlot = occupiedSlots.find(slot => {
      // Normalizar horas de inicio y fin del slot ocupado
      const normalizedStartTime = normalizeTimeForComparison(slot.startTime);
      const normalizedEndTime = normalizeTimeForComparison(slot.endTime);
      
      // Normalizar fecha para evitar problemas de zona horaria
      const slotDate = slot.date || selectedDate;
      const normalizedDate = slotDate.includes('T') ? slotDate.split('T')[0] : slotDate;
      
      // Crear objetos Date para comparación
      const slotStart = new Date(`${normalizedDate}T${normalizedStartTime}`);
      const slotEnd = new Date(`${normalizedDate}T${normalizedEndTime}`);
      const currentSlot = new Date(`${normalizedDate}T${normalizedCurrentTime}`);
      
      // Verificar si el slot actual está dentro del rango ocupado
      // Incluye inicio pero excluye fin (>= start && < end)
      return currentSlot >= slotStart && currentSlot < slotEnd;
    });
    
    return foundSlot || null;
  };

  const isTimeSlotOccupied = (time24) => {
    return getOccupiedSlotInfo(time24) !== null;
  };

  const isTimeSlotInPast = (time24) => {
    if (!selectedDate) return false;
    const now = new Date();
    const slotTime = new Date(`${selectedDate}T${time24}`);
    return slotTime < now;
  };

  const handleTimeSelect = (time24) => {
    // Si está ocupado y hay función de edición, permitir editar
    const occupiedSlot = getOccupiedSlotInfo(time24);
    if (occupiedSlot && onEditAppointment) {
      // Buscar la cita completa en occupiedSlots
      const appointmentInfo = occupiedSlots.find(slot => 
        slot.appointmentId === occupiedSlot.appointmentId
      );
      if (appointmentInfo) {
        onEditAppointment(appointmentInfo);
        return;
      }
    }
    
    if (isTimeSlotOccupied(time24) || isTimeSlotInPast(time24)) {
      return;
    }
    // Asegurar que siempre se devuelva en formato HH:MM (sin segundos)
    // El componente solo genera horas en punto (HH:00), así que esto es seguro
    const normalizedTime = time24.includes(':') 
      ? time24.substring(0, 5) // Asegurar formato HH:MM
      : time24 + ':00';
    onChange(normalizedTime);
    setShow(false);
  };

  const hourSlots = generateHourSlots();
  const displayValue = value ? convertTo12HourFormat(value) : 'Selecciona una hora';

  // Agrupar horas por período (AM/PM)
  const morningSlots = hourSlots.filter(slot => {
    const hour = parseInt(slot.time24.split(':')[0]);
    return hour < 12;
  });
  
  const afternoonSlots = hourSlots.filter(slot => {
    const hour = parseInt(slot.time24.split(':')[0]);
    return hour >= 12;
  });

  return (
    <div ref={wrapperRef} className="position-relative" style={{ zIndex: show ? 9999 : 'auto' }}>
      <div
        onClick={() => !disabled && setShow(!show)}
        style={{
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: '2px solid #e0e0e0',
          borderRadius: '12px',
          padding: '14px 18px',
          backgroundColor: disabled ? '#f5f5f5' : 'white',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '52px',
          boxShadow: show ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)',
          borderColor: show ? '#3498db' : (value ? '#27ae60' : '#e0e0e0')
        }}
        onMouseEnter={(e) => {
          if (!disabled && !show) {
            e.currentTarget.style.borderColor = '#3498db';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12)';
          }
        }}
        onMouseLeave={(e) => {
          if (!show) {
            e.currentTarget.style.borderColor = show ? '#3498db' : (value ? '#27ae60' : '#e0e0e0');
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = show ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.1)';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <Clock 
            size={20} 
            style={{ 
              color: value ? '#27ae60' : '#95a5a6',
              transition: 'color 0.3s ease'
            }} 
          />
          <span style={{ 
            fontSize: '16px',
            fontWeight: value ? '600' : '400',
            color: value ? '#2c3e50' : '#95a5a6',
            transition: 'all 0.3s ease'
          }}>
            {displayValue}
          </span>
        </div>
        <div style={{
          width: '8px',
          height: '8px',
          borderRight: '2px solid #95a5a6',
          borderBottom: '2px solid #95a5a6',
          transform: show ? 'rotate(225deg)' : 'rotate(45deg)',
          transition: 'transform 0.3s ease',
          marginLeft: '12px'
        }} />
      </div>

      {show && !disabled && (
        <div
          ref={popoverRef}
          style={{
            position: 'fixed',
            top: '0px',
            left: '0px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            border: '2px solid #e0e0e0',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideDown 0.3s ease',
            maxHeight: '70vh',
            overflow: 'hidden',
            minWidth: '300px',
            maxWidth: '500px'
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <style>
            {`
              @keyframes slideDown {
                from {
                  opacity: 0;
                  transform: translateY(-10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}
          </style>
          
          {/* Header - Fixed */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            flexShrink: 0
          }}>
            <Clock size={18} style={{ color: '#3498db' }} />
            <strong style={{ color: '#2c3e50', fontSize: '15px' }}>Selecciona una hora</strong>
          </div>

          {/* Contenido - Scrollable */}
          <div style={{ 
            padding: '16px',
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: 1,
            minHeight: 0
          }}>
            {/* Horas de la mañana */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#7f8c8d',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                🌅 Mañana
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px'
              }}>
                {morningSlots.map(({ time24, time12 }) => {
                  const isOccupied = isTimeSlotOccupied(time24);
                  const occupiedSlot = getOccupiedSlotInfo(time24);
                  const isPast = isTimeSlotInPast(time24);
                  const isSelected = value === time24;
                  const isDisabled = (!onEditAppointment && isOccupied) || isPast;
                  const canEdit = isOccupied && onEditAppointment;

                  return (
                    <button
                      key={time24}
                      onClick={() => handleTimeSelect(time24)}
                      disabled={isDisabled}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '10px',
                        border: `2px solid ${isSelected ? '#27ae60' : isOccupied ? '#e74c3c' : '#e0e0e0'}`,
                        backgroundColor: isSelected ? '#27ae60' : isOccupied ? '#fee' : isPast ? '#f5f5f5' : 'white',
                        color: isSelected ? 'white' : isOccupied ? '#e74c3c' : isPast ? '#95a5a6' : '#2c3e50',
                        fontSize: '14px',
                        fontWeight: isSelected ? '600' : '500',
                        cursor: canEdit ? 'pointer' : (isDisabled ? 'not-allowed' : 'pointer'),
                        transition: 'all 0.2s ease',
                        opacity: isDisabled && !canEdit ? 0.6 : 1,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (!isDisabled || canEdit) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          e.target.style.borderColor = isSelected ? '#27ae60' : (canEdit ? '#3498db' : '#3498db');
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled || canEdit) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.borderColor = isSelected ? '#27ae60' : (isOccupied ? '#e74c3c' : '#e0e0e0');
                        }
                      }}
                      title={isOccupied && occupiedSlot 
                        ? `Ocupada por: ${occupiedSlot.clientName || 'Cliente'}. Haz clic para editar.` 
                        : isOccupied 
                        ? 'Esta hora ya está ocupada' 
                        : isPast 
                        ? 'Esta hora ya pasó' 
                        : `Seleccionar ${time12}`}
                    >
                      {isSelected && (
                        <span style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          fontSize: '10px'
                        }}>✓</span>
                      )}
                      {isOccupied && (
                        <span style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          fontSize: '10px'
                        }}>⚠</span>
                      )}
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>
                        {time12.split(' ')[0]}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>
                        {time12.split(' ')[1]}
                      </div>
                      {isOccupied && occupiedSlot && (
                        <div style={{ 
                          fontSize: '9px', 
                          marginTop: '2px',
                          opacity: 0.8,
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {occupiedSlot.clientName || 'Ocupada'}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horas de la tarde/noche */}
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#7f8c8d',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                🌆 Tarde / Noche
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px'
              }}>
                {afternoonSlots.map(({ time24, time12 }) => {
                  const isOccupied = isTimeSlotOccupied(time24);
                  const occupiedSlot = getOccupiedSlotInfo(time24);
                  const isPast = isTimeSlotInPast(time24);
                  const isSelected = value === time24;
                  const isDisabled = (!onEditAppointment && isOccupied) || isPast;
                  const canEdit = isOccupied && onEditAppointment;

                  return (
                    <button
                      key={time24}
                      onClick={() => handleTimeSelect(time24)}
                      disabled={isDisabled}
                      style={{
                        padding: '12px 8px',
                        borderRadius: '10px',
                        border: `2px solid ${isSelected ? '#27ae60' : isOccupied ? '#e74c3c' : '#e0e0e0'}`,
                        backgroundColor: isSelected ? '#27ae60' : isOccupied ? '#fee' : isPast ? '#f5f5f5' : 'white',
                        color: isSelected ? 'white' : isOccupied ? '#e74c3c' : isPast ? '#95a5a6' : '#2c3e50',
                        fontSize: '14px',
                        fontWeight: isSelected ? '600' : '500',
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: isDisabled ? 0.6 : 1,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (!isDisabled || canEdit) {
                          e.target.style.transform = 'translateY(-2px)';
                          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                          e.target.style.borderColor = isSelected ? '#27ae60' : (canEdit ? '#3498db' : '#3498db');
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDisabled || canEdit) {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.borderColor = isSelected ? '#27ae60' : (isOccupied ? '#e74c3c' : '#e0e0e0');
                        }
                      }}
                      title={isOccupied && occupiedSlot 
                        ? `Ocupada por: ${occupiedSlot.clientName || 'Cliente'}. Haz clic para editar.` 
                        : isOccupied 
                        ? 'Esta hora ya está ocupada' 
                        : isPast 
                        ? 'Esta hora ya pasó' 
                        : `Seleccionar ${time12}`}
                    >
                      {isSelected && (
                        <span style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          fontSize: '10px'
                        }}>✓</span>
                      )}
                      {isOccupied && (
                        <span style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          fontSize: '10px'
                        }}>⚠</span>
                      )}
                      <div style={{ fontSize: '13px', fontWeight: '600' }}>
                        {time12.split(' ')[0]}
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>
                        {time12.split(' ')[1]}
                      </div>
                      {isOccupied && occupiedSlot && (
                        <div style={{ 
                          fontSize: '9px', 
                          marginTop: '2px',
                          opacity: 0.8,
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {occupiedSlot.clientName || 'Ocupada'}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer con información - Fixed */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #e0e0e0',
            fontSize: '12px',
            color: '#7f8c8d',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            flexShrink: 0
          }}>
            <span>✓ Disponible</span>
            <span style={{ color: '#e74c3c' }}>⚠ Ocupada</span>
            <span style={{ color: '#95a5a6' }}>⏰ Pasada</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimeSelector;

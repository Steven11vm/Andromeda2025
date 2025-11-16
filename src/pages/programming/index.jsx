
import React, { useEffect, useRef, useState } from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { FaUserCog } from "react-icons/fa";
import { RxScissors } from "react-icons/rx";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction";
import axios from 'axios';
import { Modal, Form } from 'react-bootstrap';
import Button from '@mui/material/Button';
import { FaEye } from "react-icons/fa";
import esLocale from "@fullcalendar/core/locales/es";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { usePermissions } from '../../components/PermissionCheck';

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor = theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const Programming = () => {
  const urlAppointments = 'https://andromeda-api.onrender.com/api/appointment';
  const urlUsers = 'https://andromeda-api.onrender.com/api/users';
  const urlSales = 'https://andromeda-api.onrender.com/api/sales';
  const urlAbsences = 'https://andromeda-api.onrender.com/api/absences';
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [selectedView, setSelectedView] = useState('dayGridMonth');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const permissions = usePermissions();

  useEffect(() => {
    const roleId = localStorage.getItem('roleId');
    const currentUserId = localStorage.getItem('userId');
    setUserRole(roleId);
    setUserId(currentUserId);

    fetchData(roleId, currentUserId);
  }, []);

  const fetchData = async (roleId, currentUserId) => {
    try {
      const [userResponse, appointmentResponse, salesResponse, absencesResponse] = await Promise.all([
        axios.get(urlUsers),
        axios.get(urlAppointments),
        axios.get(urlSales),
        axios.get(urlAbsences)
      ]);

      const usersData = userResponse.data;
      setUsers(usersData);

      const appointmentsData = appointmentResponse.data;
      const salesData = salesResponse.data;
      const absencesData = absencesResponse.data;

      const appointmentEmployeeMap = {};
      salesData.forEach(sale => {
        sale.SaleDetails.forEach(detail => {
          if (detail.appointmentId && detail.empleadoId) {
            appointmentEmployeeMap[detail.appointmentId] = detail.empleadoId;
          }
        });
      });

      let transformedEvents = [
        ...appointmentsData.map(appointment => ({
          id: appointment.id.toString(),
          title: getUserName(usersData, parseInt(appointment.clienteId)),
          start: `${appointment.Date.split('T')[0]}T${appointment.Init_Time}`,
          end: `${appointment.Date.split('T')[0]}T${appointment.Finish_Time}`,
          extendedProps: {
            type: 'appointment',
            status: appointment.status,
            Total: appointment.Total,
            Init_Time: appointment.Init_Time,
            Finish_Time: appointment.Finish_Time,
            Date: appointment.Date,
            time_appointment: appointment.time_appointment,
            empleadoId: appointmentEmployeeMap[appointment.id]
          }
        })),
        ...absencesData.map(absence => ({
          id: `absence-${absence.id}`,
          title: 'Ausencia',
          start: `${absence.date}T${absence.startTime}`,
          end: `${absence.date}T${absence.endTime}`,
          backgroundColor: '#ff9999',
          extendedProps: {
            type: 'absence',
            description: absence.description,
            status: absence.status,
            userId: absence.userId
          }
        }))
      ];

      if (roleId === '2') { // Rol de empleado
        transformedEvents = transformedEvents.filter(event => 
          (event.extendedProps.type === 'appointment' && event.extendedProps.empleadoId?.toString() === currentUserId) ||
          (event.extendedProps.type === 'absence' && event.extendedProps.userId?.toString() === currentUserId)
        );
      }

      setEvents(transformedEvents);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getUserName = (users, userId) => {
    const user = users.find(user => user.id === userId);
    return user ? user.name : 'Desconocido';
  };

  const handleViewChange = (newView) => {
    setSelectedView(newView);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(newView);
    }
  };

  const handleCloseDetailModal = () => setShowDetailModal(false);

  const EventComponent = ({ info }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
      setIsMenuOpen(true);
    };

    const handleClose = () => {
      setAnchorEl(null);
      setIsMenuOpen(false);
    };

    const handleViewClick = (e) => {
      e.stopPropagation();
      if (info.event.extendedProps.type === 'appointment') {
        setDetailData({
          type: 'appointment',
          title: info.event.title,
          start: info.event.start,
          end: info.event.end,
          status: info.event.extendedProps.status,
          Total: info.event.extendedProps.Total,
          Init_Time: info.event.extendedProps.Init_Time,
          Finish_Time: info.event.extendedProps.Finish_Time,
          Date: info.event.extendedProps.Date,
          time_appointment: info.event.extendedProps.time_appointment
        });
      } else {
        setDetailData({
          type: 'absence',
          title: 'Ausencia',
          start: info.event.start,
          end: info.event.end,
          description: info.event.extendedProps.description,
          status: info.event.extendedProps.status
        });
      }
      setShowDetailModal(true);
      handleClose();
    };

    return (
      <div
        className={`programming-content ${info.event.extendedProps.type}`}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          if (!isMenuOpen) {
            handleClose();
          }
        }}
        onClick={handleClick}
      >
        {!isHovered ? (
          <span className='span-programming'>{info.event.title}</span>
        ) : (
          <span className='span-programming'>
            {info.event.extendedProps.status}
            {info.event.extendedProps.type === 'appointment' && ` - ${info.event.extendedProps.Finish_Time}`}
          </span>
        )}
        <Menu
          className='Menu-programming'
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            onMouseEnter: () => setIsMenuOpen(true),
            onMouseLeave: handleClose,
            style: {
              maxHeight: 48 * 4.5,
            },
          }}
        >
          <MenuItem className='Menu-programming-item' onClick={handleViewClick}>
            <Button color='primary' className='primary'>
              <FaEye />
            </Button>
          </MenuItem>
        </Menu>
      </div>
    );
  };

  return (
    <div className="right-content w-100">
      <div className="row d-flex align-items-center w-100">
        <div className="spacing d-flex align-items-center">
          <div className='col-sm-5'>
            <span className='Title'>Citas y Ausencias</span>
          </div>
          <div className='col-sm-7 d-flex align-items-center justify-content-end pe-4'>
            <div role="presentation">
              <Breadcrumbs aria-label="breadcrumb">
                <StyledBreadcrumb
                  component="a"
                  href="#"
                  label="Home"
                  icon={<HomeIcon fontSize="small" />}
                />
                <StyledBreadcrumb
                  component="a"
                  href="#"
                  label="Servicios"
                  icon={<RxScissors fontSize="small" />}
                />
                <StyledBreadcrumb
                  label="Citas y Ausencias"
                  icon={<FaUserCog fontSize="small" />}
                />
              </Breadcrumbs>
            </div>
          </div>
        </div>
        <div className='card shadow border-0 p-3'>
          <div className='d-flex justify-content-between align-items-center mb-3'>
            <Form.Select
              value={selectedView}
              onChange={(e) => handleViewChange(e.target.value)}
              style={{ width: 'auto', display: 'inline-block', marginRight: '10px' }}
            >
              <option value="dayGridMonth">Mes</option>
              <option value="timeGridWeek">Semana</option>
              <option value="timeGridDay">Día</option>
            </Form.Select>
          </div>
          <div className='table-responsive mt-3'>
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={selectedView}
              locale="es"
              locales={[esLocale]}
              events={events}
              eventContent={(info) => <EventComponent info={info} />}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: ''
              }}
            />
          </div>
        </div>
      </div>
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {detailData.type === 'appointment' ? 'Detalle de la Cita' : 'Detalle de la Ausencia'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailData.type === 'appointment' ? (
            <div>
              <h5 className="border-bottom pb-2">Información de la cita</h5>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Cliente:</strong> {detailData.title}</p>
                  <p><strong>Fecha:</strong> {detailData.Date}</p>
                  <p><strong>Hora inicio:</strong> {detailData.Init_Time}</p>
                  <p><strong>Hora fin:</strong> {detailData.Finish_Time}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Duración de la cita:</strong> {detailData.time_appointment}<strong> Minutos</strong></p>
                  <p><strong>Total:</strong> {detailData.Total}</p>
                  <p><strong>Estado:</strong> {detailData.status}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h5 className="border-bottom pb-2">Información de la ausencia</h5>
              <p><strong>Descripción:</strong> {detailData.description}</p>
              <p><strong>Fecha de inicio:</strong> {new Date(detailData.start).toLocaleString()}</p>
              <p><strong>Fecha de fin:</strong> {new Date(detailData.end).toLocaleString()}</p>
              <p><strong>Estado:</strong>{detailData.status}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailModal} id='btnCerrar' className='btn-red'>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Programming;

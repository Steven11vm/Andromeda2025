import React, { useState, useEffect } from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import Button from '@mui/material/Button';
import { BsPlusSquareFill } from "react-icons/bs";
import { FaPencilAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { IoTrashSharp } from "react-icons/io5";
import { BsPeopleFill } from "react-icons/bs";
import { IoSearch } from "react-icons/io5";
import { Modal, Form, Col, Row } from 'react-bootstrap';
import Switch from '@mui/material/Switch';
import axios from 'axios';
import { show_alerta } from '../../assets/functions';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Pagination from '../../components/pagination/index';
import { usePermissions } from '../../components/PermissionCheck';

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === 'light'
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
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

const Users = () => {
  const url = 'https://andromeda-api.onrender.com/api/users';
  const urlRoles = 'https://andromeda-api.onrender.com/api/roles';
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('A');
  const [roleId, setRoleId] = useState('');
  const [operation, setOperation] = useState(1);
  const [title, setTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [search, setSearch] = useState('');
  const [dataQt, setDataQt] = useState(5);
  const [currentPages, setCurrentPages] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const permissions = usePermissions();

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    roleId: ''
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    phone: false,
    roleId: false
  });

  useEffect(() => {
    getUsers();
    getRoles();
  }, []);

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const getRoles = async () => {
    try {
      const response = await axios.get(urlRoles);
      setRoles(response.data);
    } catch (error) {
      show_alerta('Error al obtener los roles: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const getRolesNames = (role_Id) => {
    try {
      const role = roles.find(role => role.id === role_Id);
      return role ? role.name : 'Desconocido';
    } catch (error) {
      console.error('Error al obtener nombres de roles:', error);
      return 'Error';
    }
  };

  const getUsers = async () => {
    try {
      const response = await axios.get(url);
      setUsers(response.data);
    } catch (error) {
      show_alerta('Error al obtener los usuarios: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const searcher = (e) => {
    setSearch(e.target.value);
  };

  const validateName = (value) => {
    const regex = /^[A-Za-z\s]+$/;
    return regex.test(value) ? '' : 'El nombre solo debe contener letras';
  };

  const validateEmail = (value) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(value) ? '' : 'El correo no es válido';
  };

  const validatePassword = (value) => {
    if (operation === 2 && value === '') return '';
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(value) ? '' : 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números';
  };

  const validatePhone = (value) => {
    const regex = /^\d{10}$/;
    return regex.test(value) ? '' : 'El teléfono debe contener 10 números';
  };

  const validateRoleId = (value) => {
    return value ? '' : 'Debe seleccionar un rol';
  };

  const handleValidation = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'roleId':
        error = validateRoleId(value);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    handleValidation(name, value);

    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'roleId':
        setRoleId(value);
        break;
      default:
        break;
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    handleValidation(name, e.target.value);
  };

  const resetForm = () => {
    setId('');
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setStatus('A');
    setRoleId('');
    setErrors({
      name: '',
      email: '',
      password: '',
      phone: '',
      roleId: ''
    });
    setTouched({
      name: false,
      email: false,
      password: false,
      phone: false,
      roleId: false
    });
  };

  const openModal = (op, user = {}) => {
    setOperation(op);
    setTitle(op === 1 ? 'Registrar usuario' : 'Editar usuario');
    resetForm();

    if (op === 2) {
      setId(user.id);
      setName(user.name);
      setEmail(user.email);
      setPassword('');
      setPhone(user.phone);
      setStatus(user.status);
      setRoleId(user.roleId);
    }
    setShowModal(true);
  };

  const handleClose = () => {
    resetForm();
    setShowModal(false);
  };

  const checkExistingEmail = async (email) => {
    try {
      const response = await axios.get(`${url}/check-email/${email}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  const checkExistingPhone = async (phone) => {
    try {
      const response = await axios.get(`${url}/check-phone/${phone}`);
      return response.data.exists;
    } catch (error) {
      console.error('Error checking phone:', error);
      return false;
    }
  };

  const validar = async () => {
    if (isSubmitting) return;

    const newErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: operation === 1 ? validatePassword(password) : '',
      phone: validatePhone(phone),
      roleId: validateRoleId(roleId)
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      phone: true,
      roleId: true
    });

    if (Object.values(newErrors).some(error => error !== '')) {
      show_alerta('Por favor, corrija los errores en el formulario', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const emailExists = await checkExistingEmail(email.trim());
      const phoneExists = await checkExistingPhone(phone.trim());

      if (emailExists && (operation === 1 || (operation === 2 && email !== users.find(u => u.id === id).email))) {
        show_alerta('El correo electrónico ya está registrado', 'warning');
        setIsSubmitting(false);
        return;
      }

      if (phoneExists && (operation === 1 || (operation === 2 && phone !== users.find(u => u.id === id).phone))) {
        show_alerta('El número de teléfono ya está registrado', 'warning');
        setIsSubmitting(false);
        return;
      }

      const parametros = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        status: status,
        roleId: roleId
      };

      if (operation === 1 || (operation === 2 && password)) {
        parametros.password = password.trim();
      }

      const response = await axios({
        method: operation === 1 ? 'POST' : 'PUT',
        url: operation === 1 ? url : `${url}/${id}`,
        data: parametros
      });

      if (response.status === 200 || response.status === 201) {
        show_alerta(
          operation === 1 ? 'Usuario creado exitosamente' : 'Usuario actualizado exitosamente',
          'success'
        );
        handleClose();
        getUsers();
      }
    } catch (error) {
      show_alerta(
        operation === 1 ? 'Usuario creado exitosamente' : 'Usuario actualizado exitosamente',
        'success'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchChange = async (userId, checked) => {
    const userToUpdate = users.find(user => user.id === userId);
    const Myswal = withReactContent(Swal);
    Myswal.fire({
      title: `¿Estás seguro que deseas ${checked ? 'activar' : 'desactivar'} el Usuario "${userToUpdate.name}"?`,
      icon: 'question',
      text: 'Esta acción puede afectar la disponibilidad del usuario.',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updatedUser = {
          ...userToUpdate,
          status: checked ? 'A' : 'I'
        };
        try {
          const response = await axios.put(`${url}/${userId}`, updatedUser);
          if (response.status === 200) {
            setUsers(users.map(user =>
              user.id === userId ? { ...user, status: updatedUser.status } : user
            ));
            show_alerta('Estado del usuario actualizado exitosamente', 'success');
          }
        } catch (error) {
          if (error.response) {
            setUsers(users.map(user =>
              user.id === userId ? { ...user, status: updatedUser.status } : user
            ));
            show_alerta('Estado del usuario actualizado exitosamente', 'success');
          } else {
            show_alerta('Estado del usuario actualizado exitosamente', 'success');
          }
        }
      } else {
        setUsers(users.map(user =>
          user.id === userId ? { ...user, status: !checked ? 'A' : 'I' } : user
        ));
        show_alerta('Estado del servicio no cambiado', 'info');
      }
    });
  };

  const deleteUser = async (id, name) => {
    const Myswal = withReactContent(Swal);
    const result = await Myswal.fire({
      title: `¿Estás seguro que deseas eliminar el usuario ${name}?`,
      icon: 'question',
      text: 'No se podrá deshacer esta acción',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await axios.delete(`${url}/${id}`);
        if (response.status === 200) {
          show_alerta('Usuario eliminado exitosamente', 'success');
          getUsers();
        }
      } catch (error) {
        show_alerta(
          error.response?.data?.message ||
          'Error al eliminar el usuario. Por favor, intente nuevamente.',
          'error'
        );
      }
    }
  };

  const handleCloseDetail = () => {
    setShowModal(false);
    setShowDetailModal(false);
  };

  const handleViewDetails = (user) => {
    setDetailData(user);
    setShowDetailModal(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const indexEnd = currentPages * dataQt;
  const indexStart = indexEnd - dataQt;
  const nPages = Math.ceil(users.length / dataQt);

  let results = !search
    ? users.slice(indexStart, indexEnd)
    : users.filter((dato) => dato.name.toLowerCase().includes(search.toLocaleLowerCase()));

  return (
    <>
      <div className="right-content w-100">
        <div className="row d-flex align-items-center w-100">
          <div className="spacing d-flex align-items-center">
            <div className='col-sm-5'>
              <span className='Title'>Usuarios</span>
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
                    label="Usuarios"
                    icon={<BsPeopleFill fontSize="small" />}
                  />
                </Breadcrumbs>
              </div>
            </div>
          </div>
          <div className='card shadow border-0 p-3'>
            <div className='row'>
              <div className='col-sm-5 d-flex align-items-center'>
                <Button className='btn-register' onClick={() => openModal(1)} variant="contained" color="primary">
                  <BsPlusSquareFill /> Registrar
                </Button>
              </div>
              <div className='col-sm-7 d-flex align-items-center justify-content-end'>
                <div className="searchBox position-relative d-flex align-items-center">
                  <IoSearch className="mr-2" />
                  <input value={search} onChange={searcher} type="text" placeholder='Buscar...' className='form-control' />
                </div>
              </div>
            </div>
            <div className='table-responsive mt-3'>
              <table className='table table-bordered table-hover v-align'>
                <thead className='table-primary'>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Rol Id</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((user, i) => (
                    <tr key={user.id}>
                      <td>{i + 1}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{getRolesNames(user.roleId)}</td>
                      <td>
                        <span className={`userStatus ${user.status === 'A' ? 'active' : 'inactive'}`}>
                          {user.status === 'A' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <div className='actions d-flex align-items-center'>
                          <Switch
                            checked={user.status === 'A'}
                            onChange={(e) => handleSwitchChange(user.id, e.target.checked)}
                          />
                          <Button color="primary" className="primary" onClick={() => handleViewDetails(user)}>
                            <FaEye />
                          </Button>
                          {user.status === 'A' && (
                            <Button color="secondary" className="secondary" onClick={() => openModal(2, user)}>
                              <FaPencilAlt />
                            </Button>
                          )}
                          {user.status === 'A' && (
                            <Button color="error" className="delete" onClick={() => deleteUser(user.id, user.name)}>
                              <IoTrashSharp />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex table-footer">
              <Pagination
                setCurrentPages={setCurrentPages}
                currentPages={currentPages}
                nPages={nPages} />
            </div>
          </div>
        </div>

        <Modal show={showModal}>
          <Modal.Header>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group as={Row} className="mb-3">
                <Col sm="6">
                  <Form.Label className='required'>Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    placeholder="Nombre"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && !!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Col>
                <Col sm="6">
                  <Form.Label className='required'>Rol</Form.Label>
                  <Form.Control
                    as="select"
                    name="roleId"
                    value={roleId}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.roleId && !!errors.roleId}
                  >
                    <option value="">Seleccionar rol</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {errors.roleId}
                  </Form.Control.Feedback>
                </Col>
              </Form.Group>

              <Form.Group className='pb-3'>
                <Form.Label className='required'>Correo</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={email}
                  placeholder="Correo"
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  isInvalid={touched.email && !!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group as={Row} className='pb-3'>
                <Col sm="6">
                  <Form.Label className={operation === 1 ? 'required' : ''}>Contraseña</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={password}
                      placeholder={operation === 2 ? "Dejar en blanco para no cambiar" : "Contraseña"}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      isInvalid={touched.password && !!errors.password}
                    />
                    <Button variant="outline-secondary" onClick={togglePasswordVisibility}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Col>
                <Col sm="6">
                  <Form.Label className='required'>Teléfono</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={phone}
                    placeholder="Telefono"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    isInvalid={touched.phone && !!errors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Col>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose} id='btnCerrar' className='btn-red'>
              Cerrar
            </Button>
            <Button variant="primary" onClick={validar} className='btn-sucess'>
              Guardar
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={showDetailModal} onHide={handleCloseDetail}>
          <Modal.Header closeButton>
            <Modal.Title>Detalle usuario</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>ID:</strong> {detailData.id}</p>
            <p><strong>Nombre:</strong> {detailData.name}</p>
            <p><strong>Email:</strong> {detailData.email}</p>
            <p><strong>Teléfono:</strong> {detailData.phone}</p>
            <p><strong>Rol:</strong> {detailData.roleId === 1 ? 'Administrador' : detailData.roleId === 2 ? 'Empleado' : detailData.roleId === 3 ? 'Cliente' : 'Desconocido'}</p>
            <p><strong>Estado:</strong> {detailData.status === 'A' ? 'Activo' : 'Inactivo'}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button type='button' className='btn-blue' variant="outlined" onClick={handleCloseDetail}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default Users;
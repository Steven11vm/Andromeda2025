import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const PrivilegesModal = ({ show, handleClose, permissionId, permissionName }) => {
    const [privileges, setPrivileges] = useState([]);
    const [permissionPrivileges, setPermissionPrivileges] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (show) {
            loadPrivileges();
            loadPermissionPrivileges();
        }
    }, [show, permissionId]);

    const loadPrivileges = async () => {
        try {
            const response = await axios.get('https://andromeda-api.onrender.com/api/privileges');
            setPrivileges(response.data);
        } catch (error) {
            console.error('Error loading privileges:', error);
        }
    };

    const loadPermissionPrivileges = async () => {
        try {
            const response = await axios.get(`https://andromeda-api.onrender.com/api/permission-privileges/permission/${permissionId}`);
            setPermissionPrivileges(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error loading permission privileges:', error);
            setLoading(false);
        }
    };

    const handlePrivilegeChange = async (privilegeId, checked) => {
        try {
            if (checked) {
                await axios.post('https://andromeda-api.onrender.com/api/permission-privileges', {
                    permissionId,
                    privilegeId,
                    status: 'A'
                });
            } else {
                await axios.delete(`https://andromeda-api.onrender.com/api/permission-privileges/${permissionId}/${privilegeId}`);
            }
            await loadPermissionPrivileges();
        } catch (error) {
            console.error('Error updating privileges:', error);
        }
    };

    return (
         <>
                <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Privilegios para {permissionName}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <p>Cargando privilegios...</p>
                    ) : (
                        <Form>
                            {privileges.map(privilege => {
                                const isChecked = permissionPrivileges.some(
                                    pp => pp.privilegeId === privilege.id
                                );
                                return (
                                    <Form.Check
                                        key={privilege.id}
                                        type="checkbox"
                                        label={privilege.name}
                                        checked={isChecked}
                                        onChange={(e) => handlePrivilegeChange(privilege.id, e.target.checked)}
                                    />
                                );
                            })}
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
          
         </>
    );
}

export default PrivilegesModal;

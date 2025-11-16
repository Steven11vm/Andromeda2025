import logo from '../../assets/images/logo.png'
import React, { useContext, useEffect } from 'react';
import { MyContext } from '../../App.js';

const Error404 = () => {
    const context = useContext(MyContext);
    
    useEffect(() => {
        // Forzar el ocultamiento del sidebar y header
        context.setIsHideSidebarAndHeader(true);
        
        // Limpieza cuando el componente se desmonte
        return () => {
            // Solo restaurar si hay un token (usuario logueado)
            const token = localStorage.getItem('jwtToken');
            if (token) {
                context.setIsHideSidebarAndHeader(false);
            }
        };
    }, []); // Solo ejecutar al montar y desmontar
    
    return (
        <div className="container error-container">
            <div className="row">
                <div className="col-md-6 offset-md-3 text-center mt-5">
                    <img 
                        src={logo} 
                        alt="Error 404" 
                        className="img-fluid" 
                        width="200" 
                        height="200"
                    />
                    <h1>OOOPS!</h1>
                    <h2 className="mt-4">Error 404 - Archivo no encontrado</h2>
                    <p>Lo sentimos no se pudo encontrar la página que estás buscando</p>
                    <a href="/index" className="btn btn-primary">SALIR</a>
                </div>
            </div>
        </div>
    );
}

export default Error404;
/**
 * Punto de entrada principal de la aplicación React
 * Barbería Orion - Sistema de gestión de citas y ventas
 * 
 * @author Barbería Orion
 * @version 1.0.0
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';

// Configuración de React DevTools en desarrollo
if (process.env.NODE_ENV === 'development') {
  // Habilitar React DevTools Profiler en desarrollo
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers.forEach(renderer => {
      if (renderer.version) {
        console.log(`%c⚛️ React DevTools`, 'color: #61dafb; font-weight: bold; font-size: 14px;');
        console.log(`%cReact Version: ${renderer.version}`, 'color: #61dafb;');
      }
    });
  }
}

/**
 * Obtiene el elemento root del DOM
 * @returns {HTMLElement|null} El elemento root o null si no existe
 */
const getRootElement = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('❌ Error: No se encontró el elemento root en el DOM');
    // Crear el elemento root si no existe
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    return newRoot;
  }
  
  return rootElement;
};

/**
 * Maneja errores no capturados en la aplicación
 */
const setupErrorHandling = () => {
  // Manejo de errores globales
  window.addEventListener('error', (event) => {
    console.error('🚨 Error global capturado:', event.error);
    // Aquí podrías enviar el error a un servicio de monitoreo
    // Ejemplo: Sentry, LogRocket, etc.
  });

  // Manejo de promesas rechazadas sin catch
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Promesa rechazada sin manejar:', event.reason);
    // Prevenir que el error se muestre en la consola por defecto
    event.preventDefault();
  });
};

/**
 * Inicializa la aplicación React
 */
const initializeApp = () => {
  try {
    // Configurar manejo de errores
    setupErrorHandling();

    // Obtener el elemento root
    const rootElement = getRootElement();

    // Crear el root de React
    const root = ReactDOM.createRoot(rootElement);

    // Renderizar la aplicación
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // Log de inicialización exitosa
    if (process.env.NODE_ENV === 'development') {
      console.log('%c✅ Aplicación inicializada correctamente', 'color: #4caf50; font-weight: bold; font-size: 14px;');
      console.log(`%cModo: ${process.env.NODE_ENV}`, 'color: #666; font-size: 12px;');
    }

    // Configurar reportWebVitals para producción
    if (process.env.NODE_ENV === 'production') {
      // En producción, enviar métricas a un endpoint de analytics
      reportWebVitals((metric) => {
        // Aquí podrías enviar las métricas a Google Analytics, etc.
        // Ejemplo: gtag('event', metric.name, { value: metric.value });
        console.log('📊 Métrica de rendimiento:', metric);
      });
    } else {
      // En desarrollo, solo loggear en consola
      reportWebVitals(console.log);
    }

  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error);
    
    // Mostrar mensaje de error al usuario
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #0a0a0a;
          color: #fff;
          font-family: 'Poppins', sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <h1 style="color: #b89b58; margin-bottom: 20px;">⚠️ Error al cargar la aplicación</h1>
          <p style="color: #999; margin-bottom: 30px;">Ha ocurrido un error al inicializar la aplicación.</p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: linear-gradient(135deg, #b89b58 0%, #9a8248 100%);
              color: white;
              border: none;
              padding: 12px 28px;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.3s;
            "
            onmouseover="this.style.transform='translateY(-2px)'"
            onmouseout="this.style.transform='translateY(0)'"
          >
            Recargar página
          </button>
        </div>
      `;
    }
  }
};

// Inicializar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // El DOM ya está listo
  initializeApp();
}

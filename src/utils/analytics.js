import ReactGA from 'react-ga4';

// Inicializar Google Analytics
export const initGA = () => {
    // Reemplaza 'G-XXXXXXXXXX' con tu ID de Google Analytics
    ReactGA.initialize('G-XXXXXXXXXX');
};

// Enviar evento de página vista
export const logPageView = () => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
};

// Enviar evento personalizado
export const logEvent = (category, action, label) => {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
    });
};

// Enviar evento de excepción
export const logException = (description, fatal = false) => {
    ReactGA.exception({
        description: description,
        fatal: fatal,
    });
}; 
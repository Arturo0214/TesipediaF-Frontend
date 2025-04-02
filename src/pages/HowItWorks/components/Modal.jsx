import React from 'react';
import { Modal as BootstrapModal } from 'react-bootstrap';
import './modals.css';

const Modal = ({ show, onHide, title, children, stepColor }) => {
    return (
        <BootstrapModal
            show={show}
            onHide={onHide}
            centered
            className="custom-modal"
            backdrop="static"
            keyboard={false}
        >
            <BootstrapModal.Header
                closeButton
                className="modal-header"
                style={{ backgroundColor: stepColor }}
            >
                <BootstrapModal.Title>{title}</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body className="modal-body">
                {children}
            </BootstrapModal.Body>
        </BootstrapModal>
    );
};

export default Modal; 
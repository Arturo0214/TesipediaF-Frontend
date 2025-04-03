import React from 'react';
import Step from './Steps/Step';
import '../styles/steps.css';

const StepsList = ({ steps, activeStep, showSteps, activeModal, onShowModal, onHideModal }) => {
    return (
        <div className={`how-it-works-steps ${showSteps ? 'show' : ''}`}>
            <div className="steps-container">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        style={{ '--step-index': index }}
                        className="step-wrapper"
                    >
                        <Step
                            step={step}
                            index={index}
                            isActive={activeStep === index}
                            isModalOpen={activeModal === index}
                            onShowModal={() => onShowModal(index)}
                            onHideModal={onHideModal}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepsList;
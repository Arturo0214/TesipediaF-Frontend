import React from 'react';
import Step from './Step';
import '../styles/steps.css';

const StepsList = ({ steps, activeStep, showSteps }) => {
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
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StepsList;

// import React from "react";
// import "./StepIndicator.css";

// // indication animation for step
// const StepIndicator = ({ currentStep }) => {
//   return (
//     <div className="step-indicator">
//       <div className={`step ${currentStep === 1 ? "active" : ""}`}>Step 1: Enter IC</div>
//       <div className={`step ${currentStep === 2 ? "active" : ""}`}>Step 2: Take Photo</div>
//     </div>
//   );
// };

// export default StepIndicator;

import React from "react";
import "./StepIndicator.css";

// Step indicator component that highlights the current step
const StepIndicator = ({ currentStep }) => {
  return (
    <div className="step-indicator">
      <div className={`step step1 ${currentStep >= 1 ? "active" : ""}`}>
        <div className="step-icon">1</div>
        <p>Enter IC Number</p>
      </div>
      <div className={`indicator-line ${currentStep >= 2 ? "active" : ""}`}></div>
      <div className={`step step2 ${currentStep >= 2 ? "active" : ""}`}>
        <div className="step-icon">2</div>
        <p>Photo & Location</p>
      </div>
    </div>
  );
};

export default StepIndicator;


// export default StepIndicator;

// import React from "react";
// import "./StepIndicator.css";

// // Step indicator component that highlights the current step
// const StepIndicator = ({ currentStep }) => {
//   return (
//     <div className="container">
//       <section className="step-indicator">
//         <div className={`step step1 ${currentStep >= 1 ? "active" : ""}`}>
//           <div className="step-icon">1</div>
//           <p>Delivery</p>
//         </div>
//         <div className={`indicator-line ${currentStep >= 2 ? "active" : ""}`}></div>
//         <div className={`step step2 ${currentStep >= 2 ? "active" : ""}`}>
//           <div className="step-icon">2</div>
//           <p>Payment</p>
//         </div>
//         <div className={`indicator-line ${currentStep >= 3 ? "active" : ""}`}></div>
//         <div className={`step step3 ${currentStep >= 3 ? "active" : ""}`}>
//           <div className="step-icon">3</div>
//           <p>Confirmation</p>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default StepIndicator;

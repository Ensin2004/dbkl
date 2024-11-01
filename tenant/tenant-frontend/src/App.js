import React, { useState } from "react";
import Header from "./Header";
import DescriptionPage from "./DescriptionPage";
import ICEntryPage from "./ICEntryPage";

function App() {
  const [step, setStep] = useState(1);
  const [icNumber, setICNumber] = useState(""); // Store IC number

  // Start the process by going to IC Entry Page
  const handleGetStarted = () => setStep(2);

  // Save the IC number and move to the Camera Page (implement in next branch)
  const handleNext = (ic) => {
    setICNumber(ic); // Save the IC number
    setStep(3); // Go to camera page
  };

  return (
    <div className="App">
      <Header />

      {/* Step 1: Show Description Page */}
      {step === 1 && <DescriptionPage onGetStarted={handleGetStarted} />}

      {/* Step 2: IC Number Entry Page */}
      {step === 2 && <ICEntryPage onNext={handleNext} />}
    </div>
  );
}

export default App;

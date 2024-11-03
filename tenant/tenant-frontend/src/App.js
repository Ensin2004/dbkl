import React, { useState } from "react";
import Header from "./Header";
import DescriptionPage from "./DescriptionPage";
import ICEntryPage from "./ICEntryPage";
import CameraPage from './CameraPage';
import ResultsPage from './ResultsPage';

function App() {
  const [step, setStep] = useState(1);
  const [icNumber, setICNumber] = useState(""); // Store IC number
  const [latitude, setLatitude] = useState(null); // Store latitude
  const [longitude, setLongitude] = useState(null); // Store longitude
  const [isLocationMatch, setLocationMatch] = useState(false); // Store location match result
  const [isFaceMatch, setFaceMatch] = useState(false); // Store face match result

  // Start the process by going to IC Entry Page
  const handleGetStarted = () => setStep(2);

  // Save the IC number and move to the Camera Page
  const handleNext = (ic) => {
    setICNumber(ic); // Save the IC number
    setStep(3);      // Go to camera page
  };

  // Function to confirm and move to results page, also capturing location data
  const handleConfirm = (isLocationMatch, isFaceMatch, lat, lon) => {
    setLocationMatch(isLocationMatch); // Update location match state
    setFaceMatch(isFaceMatch); // Update face match state
    setLatitude(lat); // Save latitude
    setLongitude(lon); // Save longitude
    setStep(4); // Go to results page
  };

  return (
    <div className="App">
      <Header />

      {/* Step 1: Show Description Page */}
      {step === 1 && <DescriptionPage onGetStarted={handleGetStarted} />}

      {/* Step 2: IC Number Entry Page */}
      {step === 2 && <ICEntryPage onNext={handleNext} />}

      {/* Step 3: Camera Page, pass IC Number and handleConfirm function */}
      {step === 3 && <CameraPage icNumber={icNumber} onConfirm={handleConfirm} />} 

      {/* Step 4: Results Page, pass IC Number, Latitude, and Longitude */}
      {step === 4 && (
        <ResultsPage 
          icNumber={icNumber}
          isLocationMatch={isLocationMatch} // Pass location match result
          isFaceMatch={isFaceMatch}         // Pass face match result 
          latitude={latitude} 
          longitude={longitude} 
        />
      )}

    </div>
  );
}

export default App;

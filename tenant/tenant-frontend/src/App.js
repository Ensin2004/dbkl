import React, { useState } from 'react';
import Header from './Header';
import DescriptionPage from './DescriptionPage';

function App() {
  const [step, setStep] = useState(1);

  // Start the process by going to IC Entry Page (implement next in different branch)
  const handleGetStarted = () => setStep(2);

  return (
    <div className="App">

      <Header />

      {/* Step 1: Show Description Page */}
      {step === 1 && <DescriptionPage onGetStarted={handleGetStarted} />}
    </div>
  );
}

export default App;

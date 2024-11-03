import React,  { useEffect } from 'react';
import "./ResultsPage.css";

const ResultsPage = ({ icNumber, isLocationMatch, isFaceMatch }) => {
  // Determine if both matches are true
  const isSuccess = isLocationMatch && isFaceMatch;
  const isIncomplete = (isLocationMatch || isFaceMatch) && !isSuccess;
  const isFailed = !isLocationMatch && !isFaceMatch;

  // Log values of isLocationMatch and isFaceMatch
  useEffect(() => {
    console.log("Location Result:", isLocationMatch);
    console.log("Face Result:", isFaceMatch);
  }, [isLocationMatch, isFaceMatch]);

  return (
    <div className='full-screen'>
      <div className='results-container'>
        {/* Conditional Icon Rendering */}
        <div className='status-icon'>
        {isSuccess ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="green"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-check-circle animated-icon"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          ) : isIncomplete ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="orange"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-x-circle animated-icon"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6m0-6l6 6" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="red"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-x-circle animated-icon"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M15 9l-6 6m0-6l6 6" />
            </svg>
          )}
        </div>

        {/* Conditional Text Rendering */}
        <h2 style={{ color: isSuccess ? '#525252' : isIncomplete ? 'orange' : 'red' }}>
          {isSuccess
              ? "Thank you for your submission!"
              : isIncomplete
              ? "Incomplete Submission"
              : "Error!"}
        </h2>
        
        <p className='message-text'>
          {isSuccess
              ? "Your location and identity have been successfully verified."
              : isIncomplete
              ? "One of the verification checks failed. Please review and try again."
              : "Registration cannot be completed. Please try again."}
        </p>
        
        <p className='result-text' style={{ color: '#525252', fontWeight: 'bold' }}>IC Number: {icNumber}</p>

        <p className='result-text' style={{ color: '#525252', fontWeight: 'bold' }}>Location:
          <span style={{ color: isLocationMatch ? 'green' : 'red', fontWeight: 'bold' }}>
            {isLocationMatch ? " Match" : " No Match"}
          </span>
        </p>

        <p className='result-text' style={{ color: '#525252', fontWeight: 'bold' }}>Image: 
          <span style={{ color: isFaceMatch ? 'green' : 'red', fontWeight: 'bold' }}>
            {isFaceMatch ? " Match" : " No Match"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ResultsPage;

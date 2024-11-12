import React, { useState } from "react";
import axios from "axios";
import StepIndicator from "./StepIndicator";
import { FaCheckCircle} from "react-icons/fa";
import "./ICEntryPage.css";

/**
 * ICEntryPage Component
 * This component is used for entering an IC number to check its existence.
 * If the IC exists, the user is allowed to proceed to the next step.
 *
 * onNext - Function to handle the next step after IC validation.
 */
const ICEntryPage = ({ onNext }) => {
  const [icNumber, setICNumber] = useState("");
  const [showSuccessBox, setShowSuccessBox] = useState(false); // New state for success box

  // Regular expression for IC format 
  function isNumeric(str) {
    return /^\d{12}$/.test(str);
  } 

  /**
   * handleNext - Handles the 'Next' button click event
   * Checks if the IC number is valid and exists in the database.
   */
  const handleNext = async () => {

    const trimmedICNumber = icNumber.trim();

    // if tenant didnt type anything
    if (trimmedICNumber === "") {
      alert("Please do not leave blank. Enter your IC.");
      return;
    }

    // if format not 12 digit number
    if (!isNumeric(trimmedICNumber)){
      alert("Invalid format. Please enter a valid 12-digit IC number without dashes.");
      return;
    }

    try {

      // Make a GET request to check if the IC number exists in the database
      const response = await axios.get(
        `http://localhost:5000/tenant/IC/${trimmedICNumber}`,
        {
          withCredentials: true,
        }
      );

      console.log("Response:", response.data);
      
      // Check if status is "completed"
      if (response.data.status === "success") {
        setShowSuccessBox(true); // Show success box
      }
      else {
        // If status is not "success," proceed to the next step
        onNext(trimmedICNumber);
      }

    } catch (error) {

      // Handle server error response
      if (error.response) {
        if (error.response.status === 404) {
          alert("IC number does not exist. Please check and try again.");
        } else if (error.response.data && error.response.data.error) {
          alert(error.response.data.error); // Show server error message
        } else {
          alert("An unexpected error occurred. Please try again later.");
        }
      } else {
        console.error("Error checking IC:", error);
        alert("Network error. Please check your connection and try again.");
      }
    }
  };

  // Function to close the success box
  const closeSuccessBox = () => {
    setShowSuccessBox(false);
  };

  return (
    <div className="full-screen">
      <div className="container">
        <StepIndicator currentStep={1} />
        <input
          type="text"
          placeholder="Enter your IC number"
          value={icNumber}
          onChange={(e) => setICNumber(e.target.value.trim())} // Trim whitespace here
          style={{ padding: "10px", fontSize: "16px", width: "80%" }}
        />
        <br />
        <button onClick={handleNext}>Next</button>

        {/* Success message div box */}
        {showSuccessBox && (
          <div className="success-modal">
            <div className="success-content">
              <FaCheckCircle className="success-icon" />
              <h3>Already Verified!</h3>
              <p>You have already completed the verification process. Do not need to verify again.</p>
              <button className="close-btn-success" onClick={closeSuccessBox}>OK</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ICEntryPage;

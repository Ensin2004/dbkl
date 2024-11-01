import React, { useState } from "react";
import axios from "axios";
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

  /**
   * handleNext - Handles the 'Next' button click event
   * Checks if the IC number is valid and exists in the database.
   */
  const handleNext = async () => {
    if (icNumber.trim()) { // Ensure IC number is not empty or whitespace
      try {

        // Make a GET request to check if the IC number exists in the database
        const response = await axios.get(
          `http://localhost:5000/tenant/IC/${icNumber}`,
          {
            withCredentials: true,
          }
        );

        console.log("Response:", response.data);
        
        if (response.data.exists) {
          onNext(icNumber); // pass IC to next page
        } else {
          alert("IC number does not exist. Please check and try again.");
        }

      } catch (error) {

        // Handle different types of errors and provide feedback
        console.error("Error checking IC:", error);

        if (error.response) {
          console.error("Response data:", error.response.data);
          console.error("Response status:", error.response.status);
          console.error("Response headers:", error.response.headers);

        } else if (error.request) {
          console.error("Request data:", error.request);

        } else {
          console.error("Error message:", error.message);

        }
        alert("Error checking IC number. Please try again later.");
      }
      
    } else {
      // Alert if input is empty
      alert("Please enter a valid IC number");
    }
  };

  return (
    <div className="full-screen">
      <div className="container">
        <h2>Step 1: Enter IC Number</h2>
        <input
          type="text"
          placeholder="Enter your IC number"
          value={icNumber}
          onChange={(e) => setICNumber(e.target.value)}
          style={{ padding: "10px", fontSize: "16px", width: "80%" }}
        />
        <br />
        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
};

export default ICEntryPage;

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import * as faceapi from "./face-api.min";
import StepIndicator from "./StepIndicator";
import { FaExclamationCircle } from "react-icons/fa";
import "./CameraPage.css";

// CameraPage component that handles photo capture and location verification
const CameraPage = ({ onConfirm, icNumber }) => {
  const [photoTaken, setPhotoTaken] = useState(false); // Track if a photo has been taken
  const [locationMatch, setLocationMatch] = useState(null); // Track location matching status
  const [currentLocation, setCurrentLocation] = useState({latitude: null, longitude: null}); // Store current location
  const [capturedPhoto, setCapturedPhoto] = useState(null); // Store the captured photo
  const [faceDetected, setFaceDetected] = useState(true); // Track if a face is detected
  const webcamRef = useRef(null); // Reference to the Webcam component
  const canvasRef = useRef(null); // Reference to the canvas for drawing
  const [tenantImage, setTenantImage] = useState(null); // Store tenant image fetched from backend
  const [loading, setLoading] = useState(false); // Loading state
  const [showError, setShowError] = useState(false);  // Error pop-out state

  // load face recognition models on component mount
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
      fetchTenantImage(); // Fetch the tenant image after models load
    };
  
    loadModels();
  }, []); // Empty dependency array means this runs once on mount

  // Function to fetch the tenant's image using IC number
  const fetchTenantImage = async () => {
    try {

      // Send a GET request to fetch the tenant image
      const response = await axios.get(`http://localhost:5000/tenant/fetch-image/${icNumber}`);

      // Check if the response contains an image
      if (response.data.image) {
        const base64Image = response.data.image; // Extract base64 image from response
        const imageUrl = `data:image/jpeg;base64,${base64Image}`; // Create image URL
        setTenantImage(imageUrl); // Set the tenant image in state
      }
    } catch (error) {
      console.error("Error fetching tenant image:", error);
    }
  };

  // Function to handle confirmation of photo and location
  const handleConfirm = async () => {

    setLoading(true); // Start loading

    if (!icNumber) {
      alert("IC number is missing.");
      setLoading(false); // Stop loading if IC number is missing
      return;
    }

    try {
      // Log the IC Number to verify its value
      console.log("IC Number:", icNumber);

      // Get current location using geolocation API
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          let { latitude, longitude } = position.coords;

          // Round off latitude and longitude to 4 decimal places
          latitude = parseFloat(latitude.toFixed(4));
          longitude = parseFloat(longitude.toFixed(4));

          console.log("Current Location:", latitude, longitude);

          // Set current location in state to display in the UI
          setCurrentLocation({ latitude, longitude });

          // Fetch IC's stored location data from the backend
          const response = await axios.get(`http://localhost:5000/tenant/location/${icNumber}`);
          let { storedLatitude, storedLongitude } = response.data;

          // Round off stored latitude and longitude to 4 decimal places
          storedLatitude = parseFloat(storedLatitude.toFixed(4));
          storedLongitude = parseFloat(storedLongitude.toFixed(4));

          console.log("Stored Location:", storedLatitude, storedLongitude);

          // Calculate the differences
          const latDiff = Math.abs(latitude - storedLatitude);
          const longDiff = Math.abs(longitude - storedLongitude);
          console.log("Latitude Difference:", latDiff);
          console.log("Longitude Difference:", longDiff);

          // Compare coordinates
          const isLocationMatch = latDiff < 0.001 && longDiff < 0.001;
          setLocationMatch(isLocationMatch ? "Match" : "No Match");
          console.log("Location Match:", isLocationMatch ? "Match" : "No Match");

          // Capture photo
          const imageSrc = webcamRef.current.getScreenshot();
          setCapturedPhoto(imageSrc);
          setPhotoTaken(true);

          // Perform face recognition comparison
          const capturedImg = await faceapi.fetchImage(imageSrc); // Using captured photo
          const tenantImg = await faceapi.fetchImage(tenantImage); // Using tenant's image from DB

          const capturedDescriptor = await faceapi.detectSingleFace(capturedImg).withFaceLandmarks().withFaceDescriptor();
          const tenantDescriptor = await faceapi.detectSingleFace(tenantImg).withFaceLandmarks().withFaceDescriptor();

          let isFaceMatch = false;
          if (capturedDescriptor && tenantDescriptor) {
            // Calculate the match percentage between the two faces
            const matchDifference = faceapi.euclideanDistance(capturedDescriptor.descriptor, tenantDescriptor.descriptor);
            isFaceMatch = matchDifference < 0.5; // Set threshold for face match, the lower the better, means both face difference very small
            console.log("Match Difference:", matchDifference);
          }
          else{
            console.log("No face detected for either the captured photo or tenant image.");
            setFaceDetected(false);
            setShowError(true); // Show error box if no face is detected

          }
          console.log("Face Match:", isFaceMatch ? "Match" : "No Match");
            
          // Update status based on location and face recognition result
          const status = isLocationMatch && isFaceMatch 
          ? "success" 
          : isLocationMatch || isFaceMatch 
          ? "incomplete" 
          : "failed";

          console.log("Final Location Match:", isLocationMatch); // Log location match
          console.log("Final Face Match:", isFaceMatch); // Log face match
          console.log("Final Status:", status); // Log the final status

          // Navigate to the results page if a face is detected, regardless of match status
          if (capturedDescriptor) {
            await axios.put(`http://localhost:5000/tenant/update-status/${icNumber}`, { status });
            onConfirm(isLocationMatch, isFaceMatch, latitude, longitude); 
            console.log("Request Body:", { status });
          }

          setLoading(false); // Stop loading after processing is complete

        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Failed to get your location. Please enable location access.");
          setLoading(false); // Stop loading if location fetch fails
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Geolocation options
      );
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
      setLoading(false); // Stop loading if location fetch fails
    }
  };

  // Handle showing error message pop-out box
  const showErrorBox = () => {
    setShowError(true);
  };

  // Close error message box
  const closeErrorBox = () => {
    setShowError(false);
  };

  return (
    <div className="full-screen">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Loading, please wait...</p>
        </div>
      )}
      <div className="camera-container">
        <StepIndicator currentStep={2} />
        <p className="message-text">
          Please stay in the shop and take a clear photo of your face.
        </p>
        <div className="webcam-container">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={1}  // Increase quality (1 is the highest)
          />
          <canvas
            className="canvas-container"
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 3,
              opacity: 1,
            }}
          />
        </div>
        <button onClick={handleConfirm}>
          Take Photo & Check Location
        </button>

        {/* Conditionally render message if no face is detected */}
        {!faceDetected && showError && (
        <div className="error-modal">
          <div className="error-content">
            <FaExclamationCircle className="error-icon" />
            <h3>No face detected!</h3>
            <p className="error-message">Make sure your face is clearly visible. Please click the button again to retry.</p>
            <button className="close-btn" onClick={closeErrorBox}>OK</button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default CameraPage;
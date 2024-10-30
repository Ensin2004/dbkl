import React from 'react';
import './DescriptionPage.css';
import { IoIosWarning } from "react-icons/io";

const DescriptionPage = ({ onGetStarted }) => {
  return (
    <div className='full-screen'>
      <div className='container'>
        <p className='welcome-text'>Welcome to Store Rental Recognition System</p>
        <p className='desc-text'>Register your store now by typing IC and scan your face.</p>
        <div className='warning-container'>
          <IoIosWarning className='warning-icon' />
          <span className='warning-text'>Please ensure you are at your store when scanning</span>
          <IoIosWarning className='warning-icon' />
        </div>
        <button onClick={onGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default DescriptionPage;
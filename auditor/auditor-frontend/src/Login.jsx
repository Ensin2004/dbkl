import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaUser, FaLock } from "react-icons/fa"; // Import icons
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });
      if (response.status === 200) {
        //alert("Login successful");
        navigate("/map");
      }
    } catch (error) {
      // Check if there's a response from the server
      if (error.response) {
        // Display the specific error message from the server
        alert(error.response.data.message);
      } else {
        alert("An error occurred during login");
      }
    }
  };

  return (
    <div className="login__wrapper">
      <form onSubmit={handleLogin}>
        <h1>Login</h1>
        <div className="login__input-box">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <FaUser className="icon" />
        </div>
        <div className="login__input-box">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <FaLock className="icon" />
        </div>
        <button type="submit" className="login__button">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;

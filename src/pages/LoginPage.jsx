import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoEye, GoEyeClosed } from "react-icons/go"; // Import visibility icons
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useAuth } from "../context/AuthContext"; // Import the useAuth hook
import styles from "../styles/pages-style/LoginPage.module.css"; // Import the CSS Module

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const navigate = useNavigate(); // Initialize navigate hook
  const { login } = useAuth(); // Get login function from context
  const handleLogin = async (values) => {
    try {
      // Send login request to backend
      const response = await axios.post("http://localhost:5002/api/Auth/login", {
        email: values.email,
        password: values.password,
      });
  
      // Print the response in the console
      console.log("Login response:", response);
  
      // Handle successful login response
      if (response.status === 200) {
        toast.success("Login successful!");
        console.log("Login successful:", response.data); // This will print the user data
  
        // Store user info and token in the Auth context and localStorage
        login(response.data); // Store the user in the context
  
        // Save the token to localStorage
        localStorage.setItem("userToken", response.data.token); // Assuming the token is in response.data.token
  
        // Redirect to the dashboard page after successful login
        navigate("/dashboard"); // Redirect to the dashboard
      } else {
        toast.error("Invalid email or password.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };
  
  

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: handleLogin,
  });

  return (
    <div className={styles.loginPage}>
      <ToastContainer />
      <div className={styles.loginFormContainer}>
        <h1>Login</h1>
        <form onSubmit={formik.handleSubmit}>
          <div className={styles.formGroup}>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.email && formik.errors.email ? styles.error : ""}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type={passwordVisible ? "text" : "password"} // Toggle password visibility
              id="password"
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.password && formik.errors.password ? styles.error : ""}
              required
            />
            <span
              onClick={() => setPasswordVisible(!passwordVisible)} // Toggle password visibility state
              className={styles.passwordToggleIcon}
            >
              {passwordVisible ? <GoEyeClosed /> : <GoEye />} {/* Show icon based on state */}
            </span>
          </div>
          <button type="submit" className={styles.loginBtn}>
            Login
          </button>
        </form>
        <p className={styles.registerLink}>
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoEye, GoEyeClosed } from "react-icons/go"; // Import visibility icons
import { useNavigate } from "react-router-dom"; // Import useNavigate
import styles from "../styles/pages-style/LoginPage.module.css"; // Import the CSS Module

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false); // State for password visibility
  const navigate = useNavigate(); // Initialize navigate hook

  const handleLogin = async (values) => {
    try {
      // Fetch users from the endpoint
      const response = await axios.get("http://localhost:3000/users?email=" + values.email);

      // Check if user exists
      const user = response.data[0]; // Assuming email is unique and only one user is returned
      if (user && user.password === values.password) {
        toast.success("Login successful!");
        console.log("Login successful:", user);
        
        // Store user info if needed (you can set it in a global context or local storage)
        localStorage.setItem('user', JSON.stringify(user)); // Example of storing user info
        
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

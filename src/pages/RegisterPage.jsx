import React, { useState } from "react";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { GoEye, GoEyeClosed } from "react-icons/go";
import styles from "../styles/pages-style/LoginPage.module.css"; // Import the CSS module

const RegisterPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isServerAvailable, setIsServerAvailable] = useState(true);

  const navigate = useNavigate();

  const checkServerAvailability = async () => {
    try {
      await axios.get("http://localhost:3000/users");
      return true;
    } catch (error) {
      console.error("Error checking server availability:", error.message);
      setIsServerAvailable(false);
      return false;
    }
  };
  const checkAvailability = async (field, value) => {
    try {
      const response = await axios.get(`http://localhost:3000/users?${field}=${value}`);
      console.log(`Response for ${field} query:`, response.data); // Debugging line to check response data
      return response.data.length > 0; // This will return true if a user with that field exists
    } catch (error) {
      console.error(`Error checking ${field} availability:`, error.message);
      toast.error("Error validating user data. Please try again.");
      return false;
    }
  };
  

  const handleRegister = async (values) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    // Check if the server is available
    const serverAvailable = await checkServerAvailability();
    if (!serverAvailable) {
      toast.error("Server is unavailable. Please try again later.");
      setIsSubmitting(false);
      return;
    }
  
    // Check if the username is already taken
    const isUsernameTaken = await checkAvailability("username", values.username);
    if (isUsernameTaken) {
      toast.error("Username is already taken.");
      setIsSubmitting(false);
      return;
    }
  
    // Check if the email is already registered
    const isEmailTaken = await checkAvailability("email", values.email);
    if (isEmailTaken) {
      toast.error("Email is already registered.");
      setIsSubmitting(false);
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:3000/users/", values);
      if (response.status === 200 || response.status === 201) {
        toast.success("Registration successful!");
        navigate("/dashboard");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const formik = useFormik({
    initialValues: {
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .min(3, "Username must be at least 3 characters")
        .required("Username is required"),
      firstName: Yup.string()
        .min(2, "First name must be at least 2 characters")
        .required("First name is required"),
      lastName: Yup.string()
        .min(2, "Last name must be at least 2 characters")
        .required("Last name is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
        .matches(/[0-9]/, "Password must contain at least one number")
        .matches(/[!@#$%^&*]/, "Password must contain at least one special character")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
    }),
    onSubmit: handleRegister,
  });

  return (
    <div className={styles.loginPage}>
      <ToastContainer />
      <div className={styles.loginFormContainer}>
        <h1>Register</h1>
        <form onSubmit={formik.handleSubmit}>
          <div className={styles.formGroup}>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.username && formik.errors.username ? styles.error : ""}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.firstName && formik.errors.firstName ? styles.error : ""}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.lastName && formik.errors.lastName ? styles.error : ""}
              required
            />
          </div>
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
              type={passwordVisible ? "text" : "password"}
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
              onClick={() => setPasswordVisible(!passwordVisible)}
              className={styles.passwordToggleIcon}
            >
              {passwordVisible ? <GoEyeClosed /> : <GoEye />}
            </span>
          </div>
          <div className={styles.formGroup}>
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={formik.touched.confirmPassword && formik.errors.confirmPassword ? styles.error : ""}
              required
            />
            <span
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              className={styles.passwordToggleIcon}
            >
              {confirmPasswordVisible ? <GoEyeClosed /> : <GoEye />}
            </span>
          </div>
          <button type="submit" className={styles.loginBtn} disabled={isSubmitting}>
            Register
          </button>
        </form>
        <p className={styles.registerLink}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;

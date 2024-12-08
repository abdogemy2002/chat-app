import React, { useState } from "react";
import axios from "axios";  // Import Axios for making API requests
import { toast } from "react-toastify";  // Import Toastify
import "react-toastify/dist/ReactToastify.css";  // Import the Toastify CSS
import styles from "../styles/components-style/NewConvo.module.css"; // Import the CSS Module

const NewConvo = ({ togglePopup }) => {
  const [username, setUsername] = useState(""); // State for username input
  const [loading, setLoading] = useState(false); // State for loading state

  // Handle username input change
  const handleInputChange = (e) => {
    setUsername(e.target.value);
  };

  // Function to check if the input is an email
  const isEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
  };

  // Handle form submission
  const handleStartConversation = async () => {
    if (!username) {
      // Show error toast
      toast.error("Please enter a username or email.");
      return;
    }

    setLoading(true);

    const isEmailInput = isEmail(username); // Check if input is email

    try {
      const response = await axios.post(
        "http://localhost:3000/users",
        { username },
        {
          headers: {
            "Content-Type": "application/json",
            "X-Input-Type": isEmailInput ? "email" : "username", // Send the type as header
          },
        }
      );

      // Handle the response from the backend
      if (response.data.success) {
        toast.success("Conversation started successfully!");
        togglePopup(); // Close the popup after success
      } else {
        toast.error("Failed to start conversation. Please try again.");
      }
      
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Error:", error);
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  return (
    <div className={styles.newConvo}>
      <div className={styles.newConvoContent}>
        <div className={styles.newConvoHeader}>
          <h3 className={styles.headerTitle}>New Conversation</h3>
          {/* Close button to hide the popup */}
          <button className={styles.closeBtn} onClick={togglePopup}>
            ×
          </button>
        </div>

        <label htmlFor="username" className={styles.newConvoLabel}>
          Username or Email
        </label>
        <input
          type="text"
          id="username"
          className={styles.newConvoInput}
          placeholder="Enter username or email"
          value={username}
          onChange={handleInputChange}
        />

        <button
          className={styles.startConvoBtn}
          onClick={handleStartConversation}
          disabled={loading} // Disable button while loading
        >
          {loading ? "Starting..." : "Start Conversation"}
        </button>
      </div>
    </div>
  );
};

export default NewConvo;

import React, { useState, useEffect } from "react";
import axios from "axios";  // Import Axios for making API requests
import { toast, ToastContainer } from "react-toastify";  // Import Toastify
import "react-toastify/dist/ReactToastify.css";  // Import the Toastify CSS
import "../styles/pages-style/DashboardPage.css";  // Import the custom styles for DashboardPage

const DashboardPage = () => {
  const [conversations, setConversations] = useState([]); // Ensure conversations is always an array

  // Function to fetch the user's conversations
  const getConversationsMy = async () => {
    try {
      const response = await axios.get("http://localhost:5173/api/Conversations/my");
      // Ensure the response is an array
      if (Array.isArray(response.data)) {
        setConversations(response.data); // Set conversations
      } else {
        setConversations([]); // If the data is not an array, set conversations as empty array
      }
    } catch (error) {
      toast.error("Failed to load conversations.");
      setConversations([]); // In case of an error, reset to empty array
    }
  };

  // Fetch conversations on component mount
  useEffect(() => {
    getConversationsMy();
  }, []);

  return (
    <>
      <section className="chatHome">
        <div className="container">
          <div className="chatContent">
            <p>Select a conversation or start a new one</p>
          </div>
          <div className="conversations">
            <button type="button" className="NewConversation">
              <div>
                <div className="icon-conversations">
                  <i className="fa-solid fa-plus"></i>
                </div>
                <p>New Conversation</p>
              </div>
            </button>

            {Array.isArray(conversations) && conversations.length > 0 ? (
              conversations.map((conversation, index) => (
                <div key={index} className="conversationItem">
                  <i className="fa-regular fa-message"></i>
                  <p>{conversation.name}</p>
                </div>
              ))
            ) : (
              <p>No conversations found.</p>
            )}
          </div>

          <div className="auxiliaryTools">
            <div className="Profile">
              <i className="fa-regular fa-user"></i>
              <p>Profile</p>
            </div>
            <div className="Logout">
              <i className="fa-solid fa-right-from-bracket"></i>
              <p>Logout</p>
            </div>
          </div>
        </div>
      </section>

      <ToastContainer /> {/* Toast Container to display toasts */}
    </>
  );
};

export default DashboardPage;

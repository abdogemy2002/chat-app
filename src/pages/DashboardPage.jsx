import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CiCirclePlus } from "react-icons/ci"; // Import the CiCirclePlus icon
import "../styles/pages-style/DashboardPage.css";
import NewConvo from "../components/NewConvo"; // Import the NewConvo component
import { HubConnectionBuilder } from "@microsoft/signalr"; // Import SignalR
import { BsSend } from "react-icons/bs"; // Import the BsSend icon

const DashboardPage = () => {
  const [conversations, setConversations] = useState([]); // State for storing conversations
  const [showNewConvo, setShowNewConvo] = useState(false); // State for toggling new conversation popup
  const [message, setMessage] = useState(""); // State for message input
  const [messagesList, setMessagesList] = useState([]); // State for storing messages
  const [isConnected, setIsConnected] = useState(false); // State for tracking connection status
  const [selectedConversation, setSelectedConversation] = useState(null); // State for storing the selected conversation
  const messageInputRef = useRef(null); // Reference to the message input field
  const sendButtonRef = useRef(null); // Reference to the send button

  // Initialize the SignalR connection
  const connection = useRef(
    new HubConnectionBuilder().withUrl("http://localhost:3000/chatHub").build() // Adjust the SignalR URL here
  ).current;

  // Function to fetch the user's conversations
  const getConversationsMy = async () => {
    try {
      const response = await axios.get("http://localhost:3000/conversations"); // Fetch conversations from JSON Server
      if (Array.isArray(response.data)) {
        setConversations(response.data); // Update state with fetched conversations
      } else {
        setConversations([]); // Set to empty array if no conversations
      }
    } catch (error) {
      toast.error("Failed to load conversations.");
      setConversations([]); // Handle error
    }
  };

  // Function to fetch messages for a specific conversation
  const getMessagesForConversation = async (conversation) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/messages?conversationId=${conversation.id}`
      );
      setMessagesList(response.data); // Update messages list with fetched messages
      setSelectedConversation(conversation); // Set the selected conversation
    } catch (error) {
      toast.error("Failed to load messages.");
      setMessagesList([]); // Handle errorش
    }
  };

  // Set up the SignalR connection and message listener
  useEffect(() => {
    // Disable the send button initially until the connection is established
    sendButtonRef.current.disabled = true;

    connection.on("ReceiveMessage", (user, message) => {
      setMessagesList((prevMessages) => [...prevMessages, { user, message }]);
    });

    connection
      .start()
      .then(() => {
        setIsConnected(true); // Set connection status to true
        sendButtonRef.current.disabled = false; // Enable send button
      })
      .catch((err) =>
        console.error("SignalR connection error: ", err.toString())
      );

    getConversationsMy(); // Fetch conversations on mount

    return () => {
      connection.stop();
    };
  }, []); // Empty dependency array to run only once when the component mounts

  // Function to handle sending messages
  const sendMessage = (event) => {
    event.preventDefault();

    if (message.trim() && isConnected) {
      const user = "User"; // Replace with actual username if needed
      connection
        .invoke("SendMessage", user, message)
        .then(() => {
          console.log("Message sent successfully");
          setMessage(""); // Clear the input field
        })
        .catch((err) => {
          console.error("Error sending message: ", err.toString());
          toast.error("Failed to send message.");
        });
    } else {
      toast.error("You are not connected to the chat.");
    }
  };

  // Toggle the New Conversation popup
  const togglePopup = () => {
    setShowNewConvo((prevState) => !prevState);
  };

  return (
    <>
      <section className="chatHome">
        <div className="container">
          {/* Sidebar */}
          <div className="conversations">
            <button
              type="button"
              className="NewConversation"
              onClick={togglePopup}
            >
              <div>
                <div className="icon-conversations">
                  <CiCirclePlus size={24} />
                </div>
                New Conversation
              </div>
            </button>

            {Array.isArray(conversations) && conversations.length > 0 ? (
              conversations.map((conversation, index) => (
                <div
                  key={index}
                  className="conversationItem"
                  onClick={() => getMessagesForConversation(conversation)} // Fetch messages for the selected conversation
                >
                  <i className="fa-regular fa-message"></i>
                  <p>{conversation.name}</p>
                </div>
              ))
            ) : (
              <p>No conversations found.</p>
            )}

            {/* Profile and Logout buttons */}
            <div className="userActions">
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

          {/* Main content */}
          <div className="chatContent">
            {/* Display the conversation name at the top */}
            <div className="chatHeader">
              <h2>
                {selectedConversation
                  ? selectedConversation.name
                  : "Select a conversation or start a new one"}
              </h2>
            </div>
            {/* Display messages */}
            <ul id="messagesList">
              {messagesList.map((msg, index) => (
                <li
                  key={index}
                  className={`message ${
                    msg.user === "User" ? "userMessage" : "senderMessage"
                  }`}
                >
                  <strong>{msg.user}:</strong> {msg.message}
                </li>
              ))}
            </ul>

            {/* Message input and Send button */}
            <div className="messageInput">
              <input
                type="text"
                id="messageInput"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                ref={messageInputRef}
              />
              <button
                id="sendButton"
                ref={sendButtonRef}
                onClick={sendMessage}
                aria-label="Send Message" // Add an aria-label for accessibility
              >
                <BsSend size={18} />{" "}
                {/* Use the BsSend icon as the button content */}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* New Conversation Popup */}
      {showNewConvo && <NewConvo togglePopup={togglePopup} />}

      <ToastContainer />
    </>
  );
};

export default DashboardPage;

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CiCirclePlus } from "react-icons/ci"; // Import the CiCirclePlus icon
import "../styles/pages-style/DashboardPage.css";
import NewConvo from "../components/NewConvo"; // Import the NewConvo component
import { HubConnectionBuilder } from "@microsoft/signalr"; // Import SignalR
import { BsSend } from "react-icons/bs"; // Import the BsSend icon
import { useAuth } from "../context/AuthContext"; // Import AuthContext

const DashboardPage = () => {
  const { user } = useAuth(); // Access the user from AuthContext
  const [conversations, setConversations] = useState([]); // State for storing conversations
  const [showNewConvo, setShowNewConvo] = useState(false); // State for toggling new conversation popup
  const [message, setMessage] = useState(""); // State for message input
  const [messagesList, setMessagesList] = useState([]); // State for storing messages
  const [isConnected, setIsConnected] = useState(false); // State for tracking connection status
  const [selectedConversation, setSelectedConversation] = useState(null); // State for storing the selected conversation
  const messageInputRef = useRef(null); // Reference to the message input field
  const sendButtonRef = useRef(null); // Reference to the send button

  // Get userId from AuthContext
  const userId = user ? user.id : null;

  // Initialize the SignalR connection
  const connection = useRef(
    new HubConnectionBuilder()
      .withUrl("http://localhost:5002/chathub", {
        accessTokenFactory: () => localStorage.getItem("userToken"), // Pass token for SignalR
      })
      .withAutomaticReconnect()
      .build()
  ).current;

  // Function to fetch the user's conversations
  const getConversationsMy = async () => {
    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        toast.error("You are not logged in.");
        return;
      }

      const response = await axios.get(
        "http://localhost:5002/api/Conversations/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setConversations(response.data); // Update state with fetched conversations
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations.");
      setConversations([]);
    }
  };

  // Set up the SignalR connection and message listener
  useEffect(() => {
    sendButtonRef.current.disabled = true; // Disable send button initially

    connection.on("ReceiveMessage", (user, message) => {
      setMessagesList((prevMessages) => [...prevMessages, { ...message }]);
    });

    connection.on("ReceiveNewConversation", (conversation) => {
      setConversations((prevConversations) => [
        conversation,
        ...prevConversations,
      ]);
      toast.info(
        `New conversation started with ${conversation.receiverUsername}`
      );
    });

    connection
      .start()
      .then(() => {
        setIsConnected(true);
        sendButtonRef.current.disabled = false; // Enable send button
      })
      .catch((err) =>
        console.error("SignalR connection error: ", err.toString())
      );

    getConversationsMy(); // Fetch conversations on mount

    return () => {
      connection.stop();
    };
  }, []); // Run only once when the component mounts

  // Handle conversation selection and fetch messages for the selected conversation
  const selectConversation = async (conversation) => {
    try {
      setSelectedConversation(conversation); // Set the selected conversation
      setMessagesList([]); // Clear previous messages for a clean state

      const token = localStorage.getItem("userToken");

      if (!token) {
        toast.error("You are not logged in.");
        return;
      }

      const response = await axios.get(
        `http://localhost:5002/api/Messages/${conversation.conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data)) {
        setMessagesList(response.data); // Update messages list with fetched data
      } else {
        toast.warning("No messages found for this conversation.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages for the selected conversation.");
    }
  };

  // Function to handle sending messages
  const sendMessage = (event) => {
    event.preventDefault();

    if (message.trim() && isConnected && selectedConversation) {
      connection
        .invoke("SendMessage", selectedConversation?.conversationId, message)
        .then(() => {
          console.log("Message sent successfully");
          setMessage(""); // Clear the input field
        })
        .catch((err) => {
          console.error("Error sending message: ", err.toString());
          toast.error("Failed to send message.");
        });
    } else {
      toast.error(
        "You are not connected to the chat or no conversation selected."
      );
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

            {conversations.length > 0 ? (
              conversations.map((conversation, index) => (
                <div
                  key={index}
                  className={`conversationItem ${
                    selectedConversation?.conversationId ===
                    conversation.conversationId
                      ? "activeConversation"
                      : ""
                  }`}
                  onClick={() => selectConversation(conversation)}
                >
                  <i className="fa-regular fa-message"></i>
                  <p>{conversation.receiverUsername}</p>
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
            <div className="chatHeader">
              <h2>
                {selectedConversation
                  ? selectedConversation.receiverUsername
                  : "Select a conversation or start a new one"}
              </h2>
            </div>
            <ul id="messagesList" className="messagesList">
              {messagesList
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                .map((msg, index) => (
                  <li
                    key={index}
                    className={`message ${
                      msg.senderId === userId ? "userMessage" : "senderMessage"
                    }`}
                  >
                    <span className="messageSender">
                      {msg.senderId === userId ? "You" : msg.senderUsername}
                    </span>
                    <span className="messageContent">{msg.content || "No content"}</span>
                  </li>
                ))}
            </ul>
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
                aria-label="Send Message"
              >
                <BsSend size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {showNewConvo && (
        <NewConvo
          togglePopup={togglePopup}
          updateConversations={setConversations}
          conversations={conversations}
        />
      )}

      <ToastContainer />
    </>
  );
};

export default DashboardPage;
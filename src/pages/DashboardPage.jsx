import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CiCirclePlus } from "react-icons/ci";
import "../styles/pages-style/DashboardPage.css";
import NewConvo from "../components/NewConvo";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { BsSend } from "react-icons/bs";

const DashboardPage = () => {
  const [conversations, setConversations] = useState([]);
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [message, setMessage] = useState("");
  const [messagesList, setMessagesList] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const messageInputRef = useRef(null);
  const sendButtonRef = useRef(null);

  // Decode token to get userId
  const token = localStorage.getItem("userToken");
  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub || payload.nameid || payload.userId || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      toast.error("Failed to decode user ID from token.");
    }
  }

  const connection = useRef(
    new HubConnectionBuilder()
      .withUrl("http://localhost:5002/chathub", {
        accessTokenFactory: () => localStorage.getItem("userToken"),
      })
      .withAutomaticReconnect()
      .build()
  ).current;

  const getConversationsMy = async () => {
    try {
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
        setConversations(response.data);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations.");
      setConversations([]);
    }
  };

  useEffect(() => {
    sendButtonRef.current.disabled = true;

    connection.on("ReceiveMessage", (message) => {
      setMessagesList((prevMessages) => [...prevMessages, message]);
    },[message]);

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
        sendButtonRef.current.disabled = false;
      })
      .catch((err) =>
        console.error("SignalR connection error: ", err.toString())
      );

    getConversationsMy();

    return () => {
      connection.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectConversation = async (conversation) => {
    try {
      setSelectedConversation(conversation);
      setMessagesList([]);

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
        setMessagesList(response.data);
      } else {
        toast.warning("No messages found for this conversation.");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages for the selected conversation.");
    }
  };

  const sendMessage = async (event) => {
  event.preventDefault();

  if (message.trim() && selectedConversation) {
    const newMessage = {
      senderId: userId,
      content: message,
      timestamp: new Date().toISOString(),
      pending: true,
    };

    setMessagesList((prevMessages) => [...prevMessages, newMessage]);
    setMessage(""); // Clear input field

    try {
      // Send the message to the server
      await axios.post(
        "http://localhost:5002/api/messages/send",
        {
          conversationId: selectedConversation.conversationId,
          content: message,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("Failed to send message. Please try again.");
    }
  } else {
    toast.error("Please select a conversation or type a message.");
  }
};

  
  const togglePopup = () => {
    setShowNewConvo((prevState) => !prevState);
  };

  return (
    <>
      <section className="chatHome">
        <div className="container">
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

          <div className="chatContent">
            <div className="chatHeader">
              <h2>
                {selectedConversation
                  ? selectedConversation.receiverUsername
                  : "Select a conversation or start a new one"}
              </h2>
            </div>
            <ul id="messagesList" className="messagesList">
              {messagesList.map((msg, index) => {
                const isUserMessage = String(msg.senderId) === String(userId);
                return (
                  <li
                    key={index}
                    className={`message ${
                      isUserMessage ? "userMessage" : "senderMessage"
                    } fade-in`}
                  >
                    <span className="messageSender">
                      {isUserMessage ? "You" : msg.senderUsername}
                    </span>
                    <span className="messageContent">
                      {msg.content || "No content"}
                    </span>
                  </li>
                );
              })}
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
                onClick={(e) => {
                  console.log("Send button clicked");
                  sendMessage(e);
                }}
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

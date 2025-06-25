import React, { useState } from 'react';
import './ChatBot.css';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: 'Hi there! How can I help you?', sender: 'bot' }
    ]);
    const [input, setInput] = useState('');

    const toggleChat = () => setIsOpen(!isOpen);

    const handleInputChange = (e) => setInput(e.target.value);

    const handleSendMessage = () => {
        if (input.trim() !== '') {
            const newMessages = [...messages, { text: input, sender: 'user' }];
            setMessages(newMessages);
            setInput('');

            // Simulate bot response
            setTimeout(() => {
                setMessages(prevMessages => [
                    ...prevMessages,
                    { text: 'This is a sample response.', sender: 'bot' }
                ]);
            }, 1000);
        }
    };

    return (
        <div className="chatbot-wrapper">
            <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
                <div className="chatbot-header">
                    <span>Chatbot</span>
                    <button className="close-btn" onClick={toggleChat}>×</button>
                </div>
                <div className="chatbot-messages">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`chatbot-message ${msg.sender}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>
                <div className="chatbot-input">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Type your message..."
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            </div>
            <button className="chatbot-toggle" onClick={toggleChat}>
                💬
            </button>
        </div>
    );
};

export default ChatBot;

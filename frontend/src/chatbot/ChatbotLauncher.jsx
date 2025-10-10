// src/chatbot/ChatbotLauncher.jsx

import React, { useState, useEffect } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import config from './config';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';
import './Chatbot.css';

const ChatbotLauncher = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { transcript, listening, resetTranscript } = useSpeechRecognition();
    
    // This check is the most important part of the security fix.
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (!listening && transcript) {
            const input = document.querySelector('.react-chatbot-kit-chat-input');
            if (input) input.value = transcript;
        }
    }, [listening, transcript]);

    const toggleChatbot = () => {
        setIsOpen((prev) => !prev);
        if (!isOpen) resetTranscript();
    };

    const handleVoiceListening = () => {
        if (listening) {
            SpeechRecognition.stopListening();
        } else {
            resetTranscript();
            SpeechRecognition.startListening();
        }
    };

    // --- CRITICAL SECURITY FIX ---
    // If the user is not logged in (no role found), this component renders nothing.
    // The chatbot button will not exist on the page.
    if (!role || role === 'guest') {
        return null;
    }

    // This part of the component will only be rendered if a user is logged in.
    return (
        <div>
            {isOpen && (
                <div className="chatbot-container">
                    <Chatbot
                        config={config}
                        messageParser={MessageParser}
                        actionProvider={ActionProvider}
                    />
                    <button onClick={handleVoiceListening} className={`voice-button ${listening ? 'listening' : ''}`} title="Voice Input">🎤</button>
                </div>
            )}
            <button className="chatbot-launcher-button" onClick={toggleChatbot} title="Chatbot">
                {isOpen ? '✕' : '💬'}
            </button>
        </div>
    );
};

export default ChatbotLauncher;
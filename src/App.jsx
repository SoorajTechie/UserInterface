import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Upload, Menu, X, User, LogOut, ChevronDown, MessageSquare, FileText } from 'lucide-react';
import './App.css';

// Moved static data outside the component for better performance.
const conversations = [
  { id: 1, title: 'Property Dispute Query', date: '2 hours ago', agent: 'civil' },
  { id: 2, title: 'Theft Case Information', date: 'Yesterday', agent: 'criminal' },
  { id: 3, title: 'Contract Law Question', date: '2 days ago', agent: 'civil' },
  { id: 4, title: 'Assault Case Guidance', date: '3 days ago', agent: 'criminal' }
];

const languageOptions = {
  english: { flag: '🇬🇧', name: 'English', code: 'en-US' },
  malayalam: { flag: '🇮🇳', name: 'Malayalam', code: 'ml-IN' },
  hindi: { flag: '🇮🇳', name: 'Hindi', code: 'hi-IN' }
};

export default function ChatbotUI() {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState('civil');
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const chatAreaRef = useRef(null);

  // Effect for auto-scrolling
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  // Effect for simulating a bot response
  useEffect(() => {
    if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].type === 'user') {
      const userMessage = chatHistory[chatHistory.length - 1].text.toLowerCase();
      let botResponse = '';

      if (userMessage.includes('contract')) {
        botResponse = 'Certainly. For contract law, please specify if you are asking about formation, breach, or remedies.';
      } else if (userMessage.includes('theft')) {
        botResponse = 'Regarding theft, could you provide more details about the jurisdiction and the value of the item(s)?';
      } else {
        botResponse = `Thank you for your query about ${selectedAgent} law. I am analyzing your request and will provide a detailed response shortly.`;
      }

      setTimeout(() => {
        setChatHistory(prev => [...prev, { type: 'bot', text: botResponse, timestamp: new Date() }]);
      }, 1000); // Simulate network delay
    }
  }, [chatHistory, selectedAgent]);


  const handleSend = () => {
    if (message.trim()) {
      setChatHistory([...chatHistory, { type: 'user', text: message, timestamp: new Date() }]);
      setMessage('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File uploaded:', file.name);
      setChatHistory(prev => [...prev, {type: 'user', text: `Uploaded file: ${file.name}`, timestamp: new Date()}]);
    }
  };

  const toggleRecording = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support Speech Recognition.");
      return;
    }

    if (!recognitionRef.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      // =========================================================
      // == THE FIX: Rebuild transcript from scratch on every event ==
      // =========================================================
      recognition.onresult = (event) => {
        let final_transcript = '';
        let interim_transcript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final_transcript += transcript;
          } else {
            interim_transcript += transcript;
          }
        }
        
        setMessage(final_transcript + interim_transcript);
      };

      recognition.onerror = (event) => console.error('Speech recognition error:', event.error);
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    }

    const recognition = recognitionRef.current;
    recognition.lang = languageOptions[selectedLanguage].code;

    if (isRecording) {
      recognition.stop();
    } else {
      setMessage(''); 
      recognition.start();
      setIsRecording(true);
    }
  };


  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="user-profile">
            <div className="avatar"><User size={20} /></div>
            <div className="user-info">
              <div className="user-name">John Doe</div>
              <div className="user-email">john@example.com</div>
            </div>
            <button className="logout-btn"><LogOut size={18} /></button>
          </div>

          <div className="agent-section">
            <label className="section-label">Select Agent</label>
            <div className="agent-buttons">
              <button onClick={() => setSelectedAgent('civil')} className={`agent-btn ${selectedAgent === 'civil' ? 'active-civil' : ''}`}>
                <FileText size={20} /><div className="agent-label">Civil Law</div>
              </button>
              <button onClick={() => setSelectedAgent('criminal')} className={`agent-btn ${selectedAgent === 'criminal' ? 'active-criminal' : ''}`}>
                <MessageSquare size={20} /><div className="agent-label">Criminal Law</div>
              </button>
            </div>
          </div>
        </div>

        <div className="conversation-history">
          <div className="section-label">Recent Conversations</div>
          <div className="conversation-list">
            {conversations.map((conv) => (
              <button key={conv.id} className="conversation-item">
                <div className="conversation-content">
                  <div className={`conv-indicator ${conv.agent}`} />
                  <div className="conv-details">
                    <div className="conv-title">{conv.title}</div>
                    <div className="conv-date">{conv.date}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="main-content">
        <div className="header">
          <div className="header-left">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="menu-btn">{isSidebarOpen ? <X size={20} /> : <Menu size={20} />}</button>
            <div className="header-title">
              <h1>Legal Assistant AI</h1>
              <p className="header-subtitle">{selectedAgent === 'civil' ? 'Civil Law Expert' : 'Criminal Law Expert'}</p>
            </div>
          </div>

          <div className="language-selector">
            <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="language-btn">
              <span>{languageOptions[selectedLanguage].flag} {languageOptions[selectedLanguage].name}</span>
              <ChevronDown size={16} />
            </button>
            {showLanguageMenu && (
              <div className="language-menu">
                {Object.entries(languageOptions).map(([key, value]) => (
                  <button key={key} onClick={() => { setSelectedLanguage(key); setShowLanguageMenu(false); }} className="language-option">
                    <span>{value.flag}</span> {value.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="chat-area" ref={chatAreaRef}>
          {chatHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon"><MessageSquare size={40} /></div>
              <h2>Welcome to Legal Assistant AI</h2>
              <p>Ask me anything about {selectedAgent === 'civil' ? 'civil law, property disputes, contracts' : 'criminal law, cases, procedures'} and more.</p>
            </div>
          ) : (
            <div className="messages">
              {chatHistory.map((chat, idx) => (
                <div key={idx} className={`message ${chat.type}`}>
                  <div className="message-bubble">{chat.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="input-area">
          <div className="file-upload-section">
            <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="file-input-hidden" accept=".pdf,.doc,.docx,.txt" />
            <button onClick={() => fileInputRef.current?.click()} className="upload-btn">
              <Upload size={16} /> Upload Document
            </button>
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder="Type your message or use the mic..."
                rows="1"
                className="message-input"
              />
            </div>
            <button onClick={toggleRecording} className={`voice-btn ${isRecording ? 'recording' : ''}`}>
              <Mic size={24} />
            </button>
            <button onClick={handleSend} disabled={!message.trim()} className="send-btn">
              <Send size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

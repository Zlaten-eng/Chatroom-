import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // change to your backend URL on deploy

function App() {
  const [username, setUsername] = useState('');
  const [enteredName, setEnteredName] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('init', (msgs) => setMessages(msgs));
    socket.on('message', (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off('init');
      socket.off('message');
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!message.trim()) return;

    socket.emit('message', {
      user: username,
      text: message,
      replyTo: replyTo?.id || null,
    });

    setMessage('');
    setReplyTo(null);
  }

  if (!enteredName) {
    return (
      <div style={styles.centered}>
        <h2>Enter your username</h2>
        <input
          style={styles.input}
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Your name"
        />
        <button
          style={styles.button}
          onClick={() => username.trim() && setEnteredName(true)}
        >
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>WhatsApp Group Chat</h2>
        <small>Logged in as <b>{username}</b></small>
      </header>

      <div style={styles.messages}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              ...styles.message,
              alignSelf: msg.user === username ? 'flex-end' : 'flex-start',
              backgroundColor: msg.user === username ? '#DCF8C6' : 'white'
            }}
            onClick={() => setReplyTo(msg)}
          >
            <div style={styles.userName}>{msg.user}</div>
            {msg.replyTo && (
              <div style={styles.replyPreview}>
                Reply to: {messages.find(m => m.id === msg.replyTo)?.text || '...'}
              </div>
            )}
            <div>{msg.text}</div>
            <div style={styles.timestamp}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {replyTo && (
        <div style={styles.replyBox}>
          Replying to: <b>{replyTo.text}</b>
          <button onClick={() => setReplyTo(null)} style={styles.cancelReplyBtn}>Cancel</button>
        </div>
      )}

      <div style={styles.inputArea}>
        <input
          style={styles.inputMessage}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <button style={styles.sendBtn} onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 600,
    margin: 'auto',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  header: {
    padding: 20,
    backgroundColor: '#075E54',
    color: 'white',
  },
  messages: {
    flexGrow: 1,
    padding: 20,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    backgroundColor: '#ECE5DD',
  },
  message: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 8,
    boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
    cursor: 'pointer',
    userSelect: 'none',
  },
  userName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#075E54',
  },
  replyPreview: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 5,
    paddingLeft: 8,
    borderLeft: '2px solid #075E54',
    color: '#555',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    textAlign: 'right',
    color: '#999',
  },
  inputArea: {
    display: 'flex',
    padding: 10,
    backgroundColor: 'white',
  },
  inputMessage: {
    flexGrow: 1,
    padding: 10,
    fontSize: 16,
    borderRadius: 20,
    border: '1px solid #ccc',
    outline: 'none',
  },
  sendBtn: {
    marginLeft: 10,
    backgroundColor: '#075E54',
    color: 'white',
    border: 'none',
    borderRadius: 20,
    padding: '0 20px',
    cursor: 'pointer',
  },
  centered: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECE5DD',
  },
  input: {
    padding: 10,
    fontSize: 18,
    borderRadius: 10,
    border: '1px solid #ccc',
    marginBottom: 10,
    width: 200,
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#075E54',
    color: 'white',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
  },
  replyBox: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  cancelReplyBtn: {
    background: 'none',
    border: 'none',
    color: '#075E54',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};

export default App

import React, { useState, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const handleCapture = async () => {
    const constraints = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const videoTracks = stream.getVideoTracks();
    videoRef.current.srcObject = stream;
    videoRef.current.play();

    // Capture the image after a delay to allow the video stream to load
    setTimeout(() => {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = videoRef.current.videoWidth/2.5;
      canvas.height = videoRef.current.videoHeight/2.5;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/png');
      videoTracks[0].stop();

      console.log(imageData);
      setImageSrc(imageData); // Set the image data
      addImageMessage(imageData); // Add the image message
    }, 2000);
  };


  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [imageSrc, setImageSrc] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { text: input, user: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const aiMessage = { text: 'Generating mapp View visualization, it can take a moment...', user: false };
    setMessages((prevMessages) => [...prevMessages, aiMessage]);
    // Send the image data to the backend
    fetch('http://localhost:3001/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageSrc, text: input }),
    });
    setImageSrc("");
    //const response = await chatWithGPT3(input);
    //const newAiMessage = { text: "", user: false };
    //setMessages((prevMessages) => [...prevMessages.slice(0, -1), newAiMessage]);
    setInput('');
  };

  const addImageMessage = (imageSrc) => {
    const imageMessage = { text: '', image: imageSrc, user: true };
    setMessages((prevMessages) => [...prevMessages, imageMessage]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.user ? 'user-message' : 'ai-message'}`}
          >
            {message.text}
            {message.image && <img src={message.image} alt="Captured" />}
          </div>
        ))}
      </div>
      <form className="chatbot-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />

        <div className="chatbot-container">
          <video ref={videoRef} style={{ display: 'none' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button type="submit" onClick={handleSubmit}>Send</button>
          <button type="button" onClick={handleCapture}>Capture</button>
        </div>
      </form>
    </div>

  );
};
export default Chatbot;
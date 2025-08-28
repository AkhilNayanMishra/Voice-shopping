import { useState, useRef, useEffect } from 'react';

export const useVoiceRecognition = ({ onTranscript, language }) => {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.onresult = (event) => onTranscript(event.results[0][0].transcript);
    recognition.onerror = (event) => console.error("Speech error:", event.error);
    recognition.onend = () => setListening(false);
    
    recognitionRef.current = recognition;
  }, [onTranscript]);

  useEffect(() => {
      if(recognitionRef.current){
          recognitionRef.current.lang = language;
      }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition not supported in this browser.");
        return;
    }
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return { listening, toggleListening };
};
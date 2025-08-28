import React from 'react';

const Controls = ({ input, setInput, handleManualAdd, listening, toggleListening, language, setLanguage }) => {
  return (
    <>
      <div className="flex gap-2 mb-6">
        <input 
          className="flex-1 p-3 border rounded-lg" 
          placeholder="Type or speak a command" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && handleManualAdd()} 
        />
        <button 
          className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700" 
          onClick={handleManualAdd}
        >
          Add
        </button>
        <button 
          className={`px-5 py-2 rounded-lg font-semibold text-white shadow-md ${listening ? "bg-red-600 animate-pulse" : "bg-green-600 hover:bg-green-700"}`} 
          onClick={toggleListening}
        >
          {listening ? "Listening..." : "Speak"}
        </button>
      </div>
      <div className="text-right text-xs mb-6">
        <label htmlFor="lang-select" className="text-gray-500 mr-2">Language:</label>
        <select 
          id="lang-select" 
          value={language} 
          onChange={e => setLanguage(e.target.value)} 
          className="border rounded p-1"
        >
          <option value="en-US">English (US)</option>
          <option value="en-GB">English (UK)</option>
          <option value="hi-IN">हिन्दी</option>
        </select>
      </div>
    </>
  );
};

export default Controls;
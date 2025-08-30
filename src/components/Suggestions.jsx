import React from 'react';

const Suggestions = ({ suggestions, addItem, dismissSuggestion }) => {
  if (suggestions.length === 0) {
    return <div className="text-gray-500 text-sm">Suggestions will appear here.</div>;
  }

  const renderSuggestionText = (s) => {
    switch (s.type) {
      case 'history': return <span> Running low on <b className="font-semibold text-gray-800">{s.item}</b>?</span>;
      case 'substitute': return <span>For <b className="font-semibold text-gray-800">{s.for}</b>, you could also try: {s.options.join(', ')}.</span>;
      case 'seasonal': return <span> <b className="font-semibold text-gray-800">{s.item.charAt(0).toUpperCase() + s.item.slice(1)}</b> is in season!</span>;
      case 'paired': return <span> Goes well with {s.with}: <b className="font-semibold text-gray-800">{s.item}</b></span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-3">
      {suggestions.map((s) => (
        <div key={s.key} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ease-in-out group">
          <span className="text-gray-600 text-sm">{renderSuggestionText(s)}</span>
          <div className="flex items-center space-x-2">
            {s.item && (
              <button onClick={() => addItem(s.item, 1)} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600">
                Add
              </button>
            )}
            <button onClick={() => dismissSuggestion(s.key)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              [x]
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Suggestions;
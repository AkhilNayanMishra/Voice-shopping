
import React from 'react';

const SearchResults = ({ searchResults, setIsSearching, addItem }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-700">Search Results</h2>
        <button onClick={() => setIsSearching(false)} className="text-sm text-blue-600 hover:underline">
          Back to List
        </button>
      </div>
      {searchResults.length === 0 ? (
        <div className="text-gray-500 p-4 border-2 border-dashed rounded-lg text-center">
          No products found.
        </div>
      ) : (
        <ul className="space-y-2">
          {searchResults.map((it, i) => (
            <li key={i} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
              <div>
                <span className="font-medium text-gray-800">{it.name}</span>
                <span className="text-sm text-gray-500 ml-2">${it.price.toFixed(2)}</span>
                <div className="text-xs text-gray-500">{it.brand}</div>
              </div>
              <button 
                className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600" 
                onClick={() => addItem(it.name, 1)}
              >
                Add to List
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
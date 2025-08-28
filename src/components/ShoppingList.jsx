import React from 'react';
import Suggestions from './Suggestions';

const ShoppingList = ({ items, loading, processRemoveIntent, suggestions, addItem, dismissSuggestion }) => {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Smart Suggestions</h2>
        <Suggestions suggestions={suggestions} addItem={addItem} dismissSuggestion={dismissSuggestion} />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Shopping List</h2>
        {loading ? (
          <div>Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500 p-4 border-2 border-dashed rounded-lg text-center">
            Your list is empty.
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li key={it.id} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm">
                <div>
                  <span className="font-medium text-gray-800">{it.name}</span>
                  <span className="text-sm text-gray-500 ml-2">(x{it.qty})</span>
                  <div className="text-xs text-blue-500 bg-blue-100 inline-block px-2 py-0.5 rounded-full ml-2">
                    {it.category}
                  </div>
                </div>
                <button 
                  className="text-sm text-red-500 hover:text-red-700 font-medium" 
                  onClick={() => processRemoveIntent(it, 1)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default ShoppingList;
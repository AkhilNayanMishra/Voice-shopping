import React, { useEffect, useState, useCallback } from 'react';
import { db, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, updateDoc } from './services/firebase';
import { processNLP, normalize, categorizeItem, getHistory, addToHistory, parseManualInput } from './services/nlp';
import { PRODUCT_DATABASE, SUBSTITUTES, PAIRED_ITEMS, SEASONAL } from './data/database';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import './index.css'; 
import Header from './components/Header';
import Controls from './components/Controls';
import ShoppingList from './components/ShoppingList';
import SearchResults from './components/SearchResults';

import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState([]);
  const [language, setLanguage] = useState("en-US");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (!db) {
      const localItems = JSON.parse(localStorage.getItem("shoppingList") || "[]");
      setItems(localItems);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "shoppingList"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setItems(arr);
      setLoading(false);
    }, (err) => { console.error("Firestore error:", err); setLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!db) {
      localStorage.setItem("shoppingList", JSON.stringify(items));
    }
    computeSuggestions(items);
  }, [items, dismissedSuggestions]);

  const computeSuggestions = (currentItems) => {
    let potentialSuggestions = [];
    const itemNames = currentItems.map(i => normalize(i.name));
    const history = getHistory();
    const frequentItems = Object.entries(history).sort((a, b) => b[1] - a[1]).slice(0, 5);
    
    frequentItems.forEach(([name, count]) => {
      if (count > 2 && !itemNames.includes(name)) {
        potentialSuggestions.push({ key: name, type: 'history', item: name });
      }
    });

    currentItems.forEach((it) => {
      const k = normalize(it.name);
      if (SUBSTITUTES[k]) {
        potentialSuggestions.push({ key: `sub_${k}`, type: 'substitute', for: it.name, options: SUBSTITUTES[k] });
      }
      if (PAIRED_ITEMS[k] && !itemNames.includes(PAIRED_ITEMS[k])) {
        potentialSuggestions.push({ key: PAIRED_ITEMS[k], type: 'paired', item: PAIRED_ITEMS[k], with: k });
      }
    });

    const month = new Date().getMonth();
    (SEASONAL[month] || []).forEach(seasonalItem => {
        if (!itemNames.includes(seasonalItem)) {
            potentialSuggestions.push({ key: seasonalItem, type: 'seasonal', item: seasonalItem });
        }
    });

    const finalSuggestions = potentialSuggestions
      .filter(s => !dismissedSuggestions.includes(s.key))
      .slice(0, 3);
    setSuggestions(finalSuggestions);
  };

  const addItem = async (name, qty = 1) => {
    if (!name || name.trim() === "") return;
    const normalizedName = normalize(name);
    if (!normalizedName) return;
    
    const existingItem = items.find(item => normalize(item.name) === normalizedName);
    if (existingItem) {
      const newQty = existingItem.qty + qty;
      if (!db) {
        setItems(items.map(item => item.id === existingItem.id ? { ...item, qty: newQty } : item));
      } else {
        await updateDoc(doc(db, "shoppingList", existingItem.id), { qty: newQty }).catch(console.error);
      }
    } else {
      const newItem = { name: normalizedName, qty, category: categorizeItem(normalizedName), createdAt: Date.now() };
      if (!db) {
        setItems(prev => [{ ...newItem, id: Date.now().toString() }, ...prev]);
      } else {
        await addDoc(collection(db, "shoppingList"), newItem).catch(console.error);
      }
    }
    setInput("");
  };

  const processRemoveIntent = async (item, quantityToRemove) => {
    const newQty = item.qty - quantityToRemove;
    addToHistory(item);
    if (newQty > 0) {
      if (!db) {
        setItems(items.map(i => i.id === item.id ? { ...i, qty: newQty } : i));
      } else {
        await updateDoc(doc(db, "shoppingList", item.id), { qty: newQty });
      }
    } else {
      if (!db) {
        setItems(items.filter((i) => i.id !== item.id));
      } else {
        await deleteDoc(doc(db, "shoppingList", item.id));
      }
    }
  };

  const executeSearch = (query) => {
    let searchQuery = query.toLowerCase();
    let results = [...PRODUCT_DATABASE];
    
    const priceMatch = searchQuery.match(/(?:under|less than) \$?(\d+(\.\d+)?)/);
    if (priceMatch) {
      const maxPrice = parseFloat(priceMatch[1]);
      results = results.filter(item => item.price < maxPrice);
      searchQuery = searchQuery.replace(priceMatch[0], "").trim();
    }

    const keywords = searchQuery.replace(/^(find|search for|look for)\s+/, "").split(' ').filter(Boolean);
    keywords.forEach(keyword => {
      results = results.filter(item => item.name.toLowerCase().includes(keyword) || item.brand.toLowerCase().includes(keyword));
    });

    setSearchResults(results);
    setIsSearching(true);
  };

  const handleTranscript = useCallback((transcript) => {
    const result = processNLP(transcript);
    switch (result.intent) {
      case 'ADD':
        addItem(result.entities.name, result.entities.qty);
        break;
      case 'REMOVE':
        const match = items.find(it => normalize(it.name) === normalize(result.entities.name));
        if (match) {
          processRemoveIntent(match, result.entities.qty);
        } else {
          alert(`Could not find "${result.entities.name}" in your list.`);
        }
        break;
      case 'SEARCH':
        executeSearch(result.entities.query || transcript);
        break;
      case 'NAVIGATE_LIST':
        setIsSearching(false);
        break;
      default:
        if (window.confirm(`Heard: "${transcript}". Add this to your list?`)) {
          addItem(transcript, 1);
        }
    }
  }, [items]);

  const { listening, toggleListening } = useVoiceRecognition({ onTranscript: handleTranscript, language });

  const handleManualAdd = () => {
    const entities = parseManualInput(input, language);
    addItem(entities.name, entities.qty);
  };

  const dismissSuggestion = (key) => {
    setDismissedSuggestions(prev => [...prev, key]);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-pink-50 to-purple-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full bg-white/80 rounded-3xl shadow-2xl border-2 border-indigo-100 overflow-hidden"
      >
        {/* App Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-pink-500 p-8 text-center relative">
          <Header />
          <p className="text-white/80 mt-2 text-sm tracking-wide">
            Use commands like "Add apples", "Remove milk", or "Find toothpaste".
          </p>
        </div>
        {/* Main Content */}
        <div className="p-8 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white/80 p-6 rounded-2xl shadow-md border border-indigo-100 hover:shadow-lg transition"
          >
            <Controls
              input={input}
              setInput={setInput}
              handleManualAdd={handleManualAdd}
              listening={listening}
              toggleListening={toggleListening}
              language={language}
              setLanguage={setLanguage}
            />
          </motion.div>
          <AnimatePresence mode="wait">
            {isSearching ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white/90 p-6 rounded-2xl shadow-lg border border-pink-100"
              >
                <SearchResults searchResults={searchResults} setIsSearching={setIsSearching} addItem={addItem} />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white/90 p-6 rounded-2xl shadow-lg border border-indigo-100"
              >
                <ShoppingList
                  items={items}
                  loading={loading}
                  processRemoveIntent={processRemoveIntent}
                  suggestions={suggestions}
                  addItem={addItem}
                  dismissSuggestion={dismissSuggestion}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
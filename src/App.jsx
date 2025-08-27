import React, { useEffect, useState, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, query, orderBy, updateDoc } from "firebase/firestore";

const firebaseConfig = { apiKey: "REPLACE_ME", authDomain: "REPLACE_ME", projectId: "REPLACE_ME", storageBucket: "REPLACE_ME", messagingSenderId: "REPLACE_ME", appId: "REPLACE_ME" };

let db = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) { console.warn("Firebase not initialized."); }

const CATEGORY_MAP = { milk: "Dairy", cheese: "Dairy", bread: "Bakery", butter: "Dairy", apple: "Produce", banana: "Produce", orange: "Produce", mango: "Produce", strawberry: "Produce", water: "Beverages", toothpaste: "Personal Care", cereal: "Pantry", leche: "Dairy", pan: "Bakery", manzana: "Produce", सेब: "Produce", दूध: "Dairy", सब: "Produce" };
const SUBSTITUTES = { milk: ["almond milk", "soy milk", "oat milk"], sugar: ["honey", "stevia"] };
const SEASONAL = { [new Date().getMonth()]: "peaches" };
const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, ten: 10, uno: 1, dos: 2, tres: 3, एक: 1, दो: 2, तीन: 3 };
const PAIRED_ITEMS = { "bread": "butter", "cereal": "milk" };

const KEYWORDS = {
  'en': {
    ADD: ['add', 'buy', 'get', 'need', 'want'],
    REMOVE: ['remove', 'delete', 'get rid of'],
    SEARCH: ['find', 'search for', 'look for'],
    NAVIGATE_LIST: ['show my list', 'go back', 'back to list'],
  },
  'hi': {
    ADD: ['चाहिए', 'जोड़ें', 'खरीदना', 'लेना'],
    REMOVE: ['हटाएं', 'निकालें', 'हटा दो', 'हटाओ'],
    SEARCH: ['खोजें', 'ढूंढो'],
    NAVIGATE_LIST: ['मेरी सूची दिखाओ', 'वापस'],
  }
};

const PRODUCT_DATABASE = [
  { name: 'organic apples', brand: 'FarmFresh', price: 4.99, category: 'Produce' }, { name: 'apples', brand: 'Happy Orchard', price: 2.99, category: 'Produce' }, { name: 'whole milk', brand: 'DairyLand', price: 3.50, category: 'Dairy' }, { name: 'almond milk', brand: 'NuttyLife', price: 4.25, category: 'Dairy' }, { name: 'toothpaste', brand: 'BrightSmile', price: 2.99, category: 'Personal Care' }, { name: 'sensitive toothpaste', brand: 'BrightSmile', price: 4.50, category: 'Personal Care' },
];

function normalize(str) {
  let s = str.toLowerCase().trim();
  if (s === 'सब') { s = 'सेब'; }
  if (s.endsWith('es')) { return s.slice(0, -2); }
  if (s.endsWith('s')) { return s.slice(0, -1); }
  return s;
}

function categorizeItem(name) {
  const key = normalize(name);
  for (const k of Object.keys(CATEGORY_MAP)) { if (key.includes(k)) return CATEGORY_MAP[k]; }
  return "Miscellaneous";
}

const getHistory = () => JSON.parse(localStorage.getItem("shoppingHistory") || "{}");
const addToHistory = (item) => {
  const history = getHistory();
  history[item.name] = (history[item.name] || 0) + 1;
  localStorage.setItem("shoppingHistory", JSON.stringify(history));
};

export default function App() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [listening, setListening] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [language, setLanguage] = useState("en-US");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!db) { setItems([]); setLoading(false); return; }
    const q = query(collection(db, "shoppingList"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
        const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setItems(arr);
        computeSuggestions(arr);
        setLoading(false);
      }, (err) => { console.error("Firestore error:", err); setLoading(false); });
    return () => unsub();
  }, [items]);

  function computeSuggestions(currentItems) {
    const newSuggestions = [];
    const itemNames = currentItems.map(i => normalize(i.name));
    const history = getHistory();
    const frequentItems = Object.entries(history).sort((a, b) => b[1] - a[1]).slice(0, 3);
    frequentItems.forEach(([name, count]) => {
      if (count > 2 && !itemNames.includes(name)) { newSuggestions.push({ type: 'history', item: name }); }
    });
    currentItems.forEach((it) => {
      const k = normalize(it.name);
      if (SUBSTITUTES[k]) { newSuggestions.push({ type: 'substitute', for: it.name, options: SUBSTITUTES[k] }); }
      if (PAIRED_ITEMS[k] && !itemNames.includes(PAIRED_ITEMS[k])) { newSuggestions.push({ type: 'paired', item: PAIRED_ITEMS[k], with: k }); }
    });
    const month = new Date().getMonth();
    const seasonalItem = SEASONAL[month];
    if (seasonalItem && !itemNames.includes(seasonalItem)) { newSuggestions.push({ type: 'seasonal', item: seasonalItem }); }
    setSuggestions(newSuggestions);
  }

  async function addItem(name, qty = 1) {
    if (!name || name.trim() === "") return;
    const normalizedName = normalize(name);
    if (!normalizedName) return;
    const existingItem = items.find(item => normalize(item.name) === normalizedName);
    if (existingItem) {
      const newQty = existingItem.qty + qty;
      if (!db) { setItems(items.map(item => item.id === existingItem.id ? { ...item, qty: newQty } : item)); }
      else { await updateDoc(doc(db, "shoppingList", existingItem.id), { qty: newQty }).catch(e => console.error(e)); }
    } else {
      const newItem = { name: normalizedName, qty, category: categorizeItem(normalizedName), createdAt: Date.now() };
      if (!db) {
        const updatedItems = [{ id: Date.now().toString(), ...newItem }, ...items];
        setItems(updatedItems);
      } else { await addDoc(collection(db, "shoppingList"), newItem).catch(e => console.error(e)); }
    }
    setInput("");
  }

  async function processRemoveIntent(item, quantityToRemove) {
    const newQty = item.qty - quantityToRemove;
    addToHistory(item);
    if (newQty > 0) {
      if (!db) { setItems(items.map(i => i.id === item.id ? { ...i, qty: newQty } : i)); }
      else { await updateDoc(doc(db, "shoppingList", item.id), { qty: newQty }); }
    } else {
      if (!db) {
        const updatedItems = items.filter((i) => i.id !== item.id);
        setItems(updatedItems);
      } else { await deleteDoc(doc(db, "shoppingList", item.id)); }
    }
  }

  function initSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const r = new SpeechRecognition();
    r.lang = language;
    r.interimResults = false;
    r.onresult = (ev) => handleTranscript(ev.results[0][0].transcript);
    r.onerror = (e) => console.error("Speech error:", e);
    r.onend = () => setListening(false);
    return r;
  }

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      const recognition = initSpeech();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
      } else { alert("Speech recognition not supported in this browser."); }
    }
  }

  function parseEntities(textFragment, langCode) {
    let name = textFragment.trim();
    let qty = 1;

    const stopWords = {
      'en': ['i', 'a', 'an', 'the', 'some', 'to', 'my', 'list', 'please', ...KEYWORDS.en.ADD, ...KEYWORDS.en.REMOVE],
      'hi': ['मुझे', 'कृपया', ...KEYWORDS.hi.ADD, ...KEYWORDS.hi.REMOVE]
    };

    if (stopWords[langCode]) {
      stopWords[langCode].forEach(word => {
        name = name.replace(new RegExp(`\\b${word}\\b`, 'g'), '').trim();
      });
    }

    const numRegex = new RegExp(`(\\d+|${Object.keys(NUMBER_WORDS).join('|')})`);
    const match = name.match(numRegex);
    
    if (match) {
      const numWord = match[0];
      qty = NUMBER_WORDS[numWord] || parseInt(numWord, 10) || 1;
      name = name.replace(numRegex, '').trim();
    }
    
    return { qty, name: name.replace(/\s\s+/g, ' ').trim() };
  }

  function processNLP(transcript) {
    const txt = transcript.toLowerCase().trim();
    const langCode = language.split('-')[0];
    const langKeywords = KEYWORDS[langCode] || KEYWORDS['en'];
    const intents = [
      { intent: 'NAVIGATE_LIST', keywords: langKeywords.NAVIGATE_LIST }, { intent: 'REMOVE', keywords: langKeywords.REMOVE }, { intent: 'SEARCH', keywords: langKeywords.SEARCH }, { intent: 'ADD', keywords: langKeywords.ADD }
    ];
    for (const intent of intents) {
      for (const keyword of intent.keywords) {
        if (txt.includes(keyword)) {
          const remainder = txt;
          let entities = parseEntities(remainder, langCode);
          if (intent.intent === 'SEARCH') {
            entities.query = remainder.replace(new RegExp(keyword, 'g'), "").trim();
          }
          return { intent: intent.intent, entities };
        }
      }
    }
    return { intent: 'UNKNOWN', entities: { query: transcript } };
  }
  
  function handleTranscript(transcript) {
    const result = processNLP(transcript);
    switch (result.intent) {
      case 'ADD':
        addItem(result.entities.name, result.entities.qty);
        break;
      case 'REMOVE':
        const match = items.find(it => normalize(it.name) === normalize(result.entities.name));
        if (match) {
        } else {
          alert(`Could not find "${result.entities.name}" in your list.`);
        }
        break;
      case 'SEARCH':
        executeSearch(result.entities.query);
        break;
      case 'NAVIGATE_LIST':
        setIsSearching(false);
        break;
      default:
        if (window.confirm(`Heard: "${transcript}". Add this to your list?`)) {
          addItem(transcript, 1);
        }
    }
  }

  function executeSearch(query) {
    let results = [...PRODUCT_DATABASE];
    const priceMatch = query.match(/under \$?(\d+)/);
    if (priceMatch) {
      const maxPrice = parseFloat(priceMatch[1]);
      results = results.filter(item => item.price < maxPrice);
      query = query.replace(/under \$?(\d+)/, "").trim();
    }
    const keywords = query.split(' ').filter(Boolean);
    keywords.forEach(keyword => {
      results = results.filter(item => item.name.toLowerCase().includes(keyword) || item.brand.toLowerCase().includes(keyword));
    });
    setSearchResults(results);
    setIsSearching(true);
  }

  function handleManualAdd() {
    const {qty, name} = parseEntities(input, language.split('-')[0]);
    addItem(name, qty);
  }
  
  const renderSuggestions = () => { return suggestions.length === 0 ? <div className="text-gray-500 text-sm">Suggestions will appear here.</div> : suggestions.map((s, i) => (<div key={i} className="flex justify-between items-center p-2 border bg-gray-50 rounded mb-2 text-sm"><span>{s.type === 'history' && <span>🤔 Running low on <b>{s.item}</b>?</span>}{s.type === 'substitute' && <span>🥛 For <b>{s.for}</b>, you could also try: {s.options.join(', ')}.</span>}{s.type === 'seasonal' && <span>☀️ <b>{s.item.charAt(0).toUpperCase() + s.item.slice(1)}</b> is in season!</span>}{s.type === 'paired' && <span>🤝 Goes well with {s.with}: <b>{s.item}</b></span>}</span>{s.item && <button onClick={() => addItem(s.item, 1)} className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600">Add</button>}</div>));}
  const renderShoppingList = () => ( <> <div className="mb-6"><h2 className="text-xl font-semibold text-gray-700 mb-2">Smart Suggestions</h2>{renderSuggestions()}</div> <div><h2 className="text-xl font-semibold text-gray-700 mb-2">Shopping List</h2>{loading ? ( <div>Loading...</div> ) : items.length === 0 ? ( <div className="text-gray-500 p-4 border-2 border-dashed rounded-lg text-center">Your list is empty.</div> ) : ( <ul className="space-y-2">{items.map((it) => (<li key={it.id} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm"><div><span className="font-medium text-gray-800">{it.name}</span><span className="text-sm text-gray-500 ml-2">(x{it.qty})</span><div className="text-xs text-blue-500 bg-blue-100 inline-block px-2 py-0-5 rounded-full ml-2">{it.category}</div></div><button className="text-sm text-red-500 hover:text-red-700 font-medium" onClick={() => processRemoveIntent(it, 1)}>Remove</button></li>))}</ul>)}</div></>);
  const renderSearchResults = () => ( <div> <div className="flex justify-between items-center mb-2"><h2 className="text-xl font-semibold text-gray-700">Search Results</h2><button onClick={() => setIsSearching(false)} className="text-sm text-blue-600 hover:underline">Back to List</button></div> {searchResults.length === 0 ? ( <div className="text-gray-500 p-4 border-2 border-dashed rounded-lg text-center">No products found.</div> ) : ( <ul className="space-y-2">{searchResults.map((it, i) => (<li key={i} className="flex justify-between items-center p-3 bg-white border rounded-lg shadow-sm"><div><span className="font-medium text-gray-800">{it.name}</span><span className="text-sm text-gray-500 ml-2">${it.price.toFixed(2)}</span><div className="text-xs text-gray-500">{it.brand}</div></div><button className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded hover:bg-green-600" onClick={() => addItem(it.name, 1)}>Add to List</button></li>))}</ul>)}</div>);

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Voice Shopping Assistant</h1>
        <p className="text-gray-500 mb-6">Use commands like "Add apples", "Remove milk", or "Find toothpaste".</p>
        <div className="flex gap-2 mb-6">
          <input className="flex-1 p-3 border rounded-lg" placeholder="Type or speak a command" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleManualAdd()} />
          <button className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md" onClick={handleManualAdd}>Add</button>
          <button className={`px-5 py-2 rounded-lg font-semibold text-white shadow-md ${listening ? "bg-red-600 animate-pulse" : "bg-green-600"}`} onClick={toggleListening}>{listening ? "Listening..." : "Speak"}</button>
        </div>
        <div className="text-right text-xs mb-6">
          <label htmlFor="lang-select" className="text-gray-500 mr-2">Language:</label>
          <select id="lang-select" value={language} onChange={e => setLanguage(e.target.value)} className="border rounded p-1">
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="hi-IN">हिन्दी</option>
          </select>
        </div>
        {isSearching ? renderSearchResults() : renderShoppingList()}
      </div>
    </div>
  );
}
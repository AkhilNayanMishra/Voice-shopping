import { CATEGORY_MAP, NUMBER_WORDS, KEYWORDS } from '../data/database.js';

export function normalize(str) {
  if (!str) return '';
  let s = str.toLowerCase().trim();
  if (s.endsWith('es')) { return s.slice(0, -2); }
  if (s.endsWith('s')) { return s.slice(0, -1); }
  return s;
}

export function categorizeItem(name) {
  const key = normalize(name);
  for (const k of Object.keys(CATEGORY_MAP)) {
    if (key.includes(k)) return CATEGORY_MAP[k];
  }
  return "Miscellaneous";
}

export const getHistory = () => JSON.parse(localStorage.getItem("shoppingHistory") || "{}");

export const addToHistory = (item) => {
  const history = getHistory();
  history[item.name] = (history[item.name] || 0) + 1;
  localStorage.setItem("shoppingHistory", JSON.stringify(history));
};

function parseEnglishEntities(textFragment) {
  let name = textFragment.trim();
  let qty = 1;
  const stopWords = ['i', 'a', 'an', 'the', 'some', 'to', 'my', 'list', 'please', ...KEYWORDS.en.ADD, ...KEYWORDS.en.REMOVE, ...KEYWORDS.en.SEARCH, ...KEYWORDS.en.NAVIGATE_LIST];
  stopWords.forEach(word => {
    name = name.replace(new RegExp(`\\b${word}\\b`, 'g'), '').trim();
  });
  const numRegex = new RegExp(`(\\d+|${Object.keys(NUMBER_WORDS).join('|')})`);
  const match = name.match(numRegex);
  if (match) {
    const numWord = match[0];
    qty = NUMBER_WORDS[numWord] || parseInt(numWord, 10) || 1;
    name = name.replace(numRegex, '').trim();
  }
  return { qty, name: name.replace(/\s\s+/g, ' ').trim() };
}

function parseHindiEntities(textFragment) {
  let name = textFragment.trim();
  let qty = 1;
  const stopWords = ['मुझे', 'कृपया', ...KEYWORDS.hi.ADD, ...KEYWORDS.hi.REMOVE, ...KEYWORDS.hi.SEARCH, ...KEYWORDS.hi.NAVIGATE_LIST];
  stopWords.forEach(word => {
    name = name.replace(new RegExp(word, 'g'), '').trim();
  });
  const numRegex = new RegExp(`(\\d+|${Object.keys(NUMBER_WORDS).join('|')})`);
  const match = name.match(numRegex);
  if (match) {
    const numWord = match[0];
    qty = NUMBER_WORDS[numWord] || parseInt(numWord, 10) || 1;
    name = name.replace(numRegex, '').trim();
  }
  return { qty, name: name.replace(/\s\s+/g, ' ').trim() };
}

export function processNLP(transcript) {
    // FIXED: Normalize the transcript to a standard Unicode form.
    const txt = transcript.normalize('NFC').toLowerCase().trim();

    const intentPriority = ['NAVIGATE_LIST', 'REMOVE', 'SEARCH', 'ADD'];

    for (const intentName of intentPriority) {
        for (const langCode in KEYWORDS) {
            const keywords = KEYWORDS[langCode][intentName] || [];
            
            for (const keyword of keywords) {
                // FIXED: Also normalize the keyword to ensure a match.
                if (txt.includes(keyword.normalize('NFC'))) {
                    const detectedLang = langCode;
                    const remainder = txt;

                    let entities = detectedLang === 'hi'
                        ? parseHindiEntities(remainder)
                        : parseEnglishEntities(remainder);

                    if (intentName === 'SEARCH') {
                        entities.query = remainder.replace(new RegExp(keyword, 'g'), "").trim();
                    }

                    return { intent: intentName, entities };
                }
            }
        }
    }

    return { intent: 'UNKNOWN', entities: { query: transcript } };
}

export function parseManualInput(input, language) {
  const langCode = language.split('-')[0];
  return langCode === 'hi' ? parseHindiEntities(input) : parseEnglishEntities(input);
}
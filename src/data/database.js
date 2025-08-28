export const CATEGORY_MAP = { milk: "Dairy", cheese: "Dairy", bread: "Bakery", butter: "Dairy", apple: "Produce", banana: "Produce", orange: "Produce", mango: "Produce", strawberry: "Produce", water: "Beverages", toothpaste: "Personal Care", cereal: "Pantry", onion: "Produce", tomato: "Produce", potato: "Produce", yogurt: "Dairy", eggs: "Dairy", chicken: "Meat", rice: "Pantry", pasta: "Pantry", coffee: "Beverages", tea: "Beverages", leche: "Dairy", pan: "Bakery", manzana: "Produce", सेब: "Produce", दूध: "Dairy", सब: "Produce", pal: "Produce" };

export const SUBSTITUTES = { milk: ["almond milk", "oat milk", "soy milk"], butter: ["margarine", "olive oil"], sugar: ["honey", "stevia"] };

export const SEASONAL = { 
  0: ["orange", "grapefruit"], 1: ["cabbage", "broccoli"], 2: ["spinach", "peas"], 3: ["strawberry", "asparagus"], 4: ["mango", "cherry", "zucchini"], 5: ["watermelon", "blueberry", "peach"], 6: ["corn", "tomato", "cucumber"], 7: ["peach", "bell pepper"], 8: ["apple", "grape", "pumpkin"], 9: ["sweet potato", "squash"], 10: ["cranberry", "brussels sprout"], 11: ["pomegranate", "kale"]
};

export const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, ten: 10, uno: 1, dos: 2, tres: 3, एक: 1, दो: 2, तीन: 3 };

export const PAIRED_ITEMS = { "bread": "butter", "cereal": "milk", "eggs": "bread", "pasta": "cheese", "chips": "salsa", "coffee": "milk" };

export const KEYWORDS = {
  'en': {
    ADD: ['add', 'buy', 'get', 'need', 'want'],
    REMOVE: ['remove', 'delete', 'get rid of'],
    SEARCH: ['find', 'search for', 'look for'],
    NAVIGATE_LIST: ['show my list', 'go back', 'back to list'],
  },
  'hi': {
    ADD: ['चाहिए', 'जोड़ें', 'जोड़ो', 'खरीदना', 'लेना'],
    REMOVE: ['हटाएं', 'निकालें', 'हटा दो', 'हटाओ'],
    SEARCH: ['खोजें', 'ढूंढो'],
    NAVIGATE_LIST: ['मेरी सूची दिखाओ', 'वापस'],
  }
};

export const PRODUCT_DATABASE = [
  { name: 'organic apples', brand: 'FarmFresh', price: 4.99, category: 'Produce' }, { name: 'apples', brand: 'Happy Orchard', price: 2.99, category: 'Produce' }, { name: 'whole milk', brand: 'DairyLand', price: 3.50, category: 'Dairy' }, { name: 'almond milk', brand: 'NuttyLife', price: 4.25, category: 'Dairy' }, { name: 'toothpaste', brand: 'BrightSmile', price: 2.99, category: 'Personal Care' }, { name: 'sensitive toothpaste', brand: 'BrightSmile', price: 4.50, category: 'Personal Care' },
];
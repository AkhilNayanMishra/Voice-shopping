#  Voice Command Shopping Assistant

A **voice-based shopping list manager** that lets users add, remove, and search products using natural voice commands.  
It also provides **smart suggestions**, **multilingual support**, and a **minimalist UI** optimized for mobile and voice-only use.

**Live Demo:** [voice-shopping.vercel.app](https://voice-shopping.vercel.app)

---

##  Features

**Voice Input with NLP** 
  - Add items using flexible commands like  
  - “Add 2 bottles of water”  
  - “I need apples”  
  - “Remove milk from my list”  

**Multilingual Support** 
  - Commands in multiple languages.  

**Smart Suggestions**  
  - Product recommendations based on history  
  - Seasonal recommendations  
  - Alternatives (e.g., almond milk instead of regular milk)  

**Shopping List Management** 
  - Add / Remove / Modify items  
  - Automatic categorization (dairy, produce, snacks)  
  - Quantity management  

**Voice-Activated Search** 
  - Find items by name, brand, or category  
  - Apply price filters (e.g., “Find toothpaste under $5”)  

**UI/UX** 
  - Minimalist design  
  - Real-time visual feedback for commands  
  - Mobile-first & responsive  

---

##  Tech Stack

- **Frontend:** React + Vite + TailwindCSS  
- **Voice Recognition:** Web Speech API (or compatible library)  
- **Database/Storage:** Firebase Firestore  
- **Hosting:** Vercel  

---

##  Getting Started

Follow these steps to run the project locally:

# 1. Clone the repo
```
git clone https://github.com/<your-username>/voice-shopping.git
```
# 2. Navigate to the project folder
```
cd voice-shopping
```
# 3. Install dependencies
```
npm install
```

# 4. Start the development server
```
npm run dev
```



## Appraoch 
The Voice Command Shopping Assistant was designed to simplify shopping list management through natural voice interactions. I chose React with Vite for a lightweight, modular, and fast development environment, and TailwindCSS for a clean, responsive UI. For storage and synchronization, I integrated Firebase Firestore, which provides real-time updates and scalability.

Voice input is powered by the Web Speech API, allowing users to issue flexible commands such as “Add 2 bottles of water” or “Remove milk from my list.” To handle varied phrasing, I implemented simple NLP parsing that interprets quantities, item names, and actions. The app also supports multilingual input, making it more inclusive.

For smart suggestions, I built a recommendation layer that uses stored history and simulated seasonal data to suggest relevant items or substitutes. Items are automatically categorized (e.g., dairy, produce, snacks), making the shopping list more organized.

The UI/UX emphasizes minimalism and accessibility, with real-time feedback to confirm user actions. Finally, the app was deployed on Vercel for ease of hosting and reliability.

Overall, my approach focused on delivering a production-quality prototype within 8 hours, balancing voice recognition, smart features, and usability.

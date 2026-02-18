// app.js
import { ChatModule } from 'https://cdn.jsdelivr.net/npm/webllm@0.2.45/dist/webllm.es.min.js';

let chat;
let messages = [];

// DOM Elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const statusEl = document.getElementById('status');

// Initialize the model
async function initModel() {
  statusEl.textContent = "Initializing Phi-3-mini... (first load may take 1-5 min)";
  
  try {
    chat = new ChatModule();
    
    // Optional: Add progress callback
    chat.setInitProgressCallback((progress) => {
      statusEl.textContent = `Loading model: ${(progress.progress * 100).toFixed(1)}%`;
    });

    await chat.reload("Phi-3-mini-4k-instruct-q4f16_1");
    statusEl.textContent = "✅ Ready! Ask anything (works offline now).";
    
    // Enable input
    userInput.disabled = false;
    sendBtn.disabled = false;
    
    // Add welcome message
    addMessage("Hello! I'm VoltaOI — your offline AI assistant. How can I help?", "bot");
    
  } catch (error) {
    console.error("Failed to load model:", error);
    statusEl.textContent = "❌ Error loading model. Check console.";
  }
}

// Add message to chat UI
function addMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  // Save to memory (optional: later save to IndexedDB)
  messages.push({ role: sender === 'user' ? 'user' : 'assistant', content: text });
}

// Send user message
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text || !chat) return;

  // Clear input
  userInput.value = '';
  
  // Show user message
  addMessage(text, 'user');

  // Disable input during generation
  userInput.disabled = true;
  sendBtn.disabled = true;
  statusEl.textContent = "Thinking...";

  try {
    const response = await chat.generate(text);
    addMessage(response, 'bot');
  } catch (error) {
    console.error("Generation error:", error);
    addMessage("Sorry, I ran into an issue. Try again.", "bot");
  } finally {
    userInput.disabled = false;
    sendBtn.disabled = false;
    statusEl.textContent = "✅ Ready!";
    userInput.focus();
  }
}

// Clear chat
function clearChat() {
  chatBox.innerHTML = '';
  messages = [];
  addMessage("Chat cleared. How can I help?", "bot");
}

// Handle Enter key (but allow Shift+Enter for new line)
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Start!
userInput.disabled = true;
sendBtn.disabled = true;
initModel();

const API_KEY = 'AIzaSyBnkRUxWKNSzk9fxwVxfo8DadsSydB92VU'; // Simulated .env usage
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');


function addMessage(content, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    const avatarSrc = isUser ? 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg' : 'https://cdn-icons-png.freepik.com/256/12167/12167613.png';
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const messageText = content || 'No response available';
    messageDiv.innerHTML = `
        <img src="${avatarSrc}" alt="${isUser ? 'User' : 'Bot'} Avatar" class="avatar">
        <div class="message-content">
            <p>${messageText}</p>
            <span class="timestamp">${timestamp}</span>
        </div>
    `;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function callGeminiAPI(prompt) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;
    const payload = {
        contents: [{
            parts: [{
                text: `You are a home cleaning scheduler chatbot. Help the user with cleaning task inquiries or scheduling based on their input. If they mention a task (e.g., deep cleaning, mopping, washroom, bathroom) and a time/day (e.g., tomorrow, 10:00 AM), confirm the task with date/time. Provide pricing details when relevant or asked. Pricing: Basic Cleaning ($50, 1-2 hours), Deep Cleaning ($100, 3-4 hours), Move-In/Move-Out Cleaning ($150), Window Cleaning ($10 per window), Carpet Cleaning ($30 per room). For non-cleaning queries, politely redirect to cleaning tasks. Avoid asking for clarification repeatedly; confirm the task with complete details if possible. Ensure responses are never undefined; provide defaults if needed. Respond concisely and professionally. Input: ${prompt}`
            }]
        }]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            return `Failed to send message: ${errorData.error?.message || 'Unknown API error'}`;
        }
        const data = await response.json();
        return data.candidates[0].content.parts[0].text || 'No response available';
    } catch (error) {
        console.error('Network or CORS Error:', error);
        return `Failed to send message: ${error.message || 'Network or CORS issue. Please check your connection.'}`;
    }
}


async function handleSend() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, true);
    userInput.value = '';
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';

    try {
        const response = await callGeminiAPI(message);
        addMessage(response, false);
    } catch (error) {
        addMessage('Error: Unable to send message. Please try again.', false);
    } finally {
        setTimeout(() => {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send';
        }, 500); 
    }
}

sendBtn.addEventListener('click', handleSend);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !sendBtn.disabled) handleSend();
});
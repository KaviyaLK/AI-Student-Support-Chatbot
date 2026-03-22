// USERNAME (Dynamic)

let username = localStorage.getItem("username");

if (!username) {
    username = prompt("Enter your name:");
    if (!username) username = "Student";
    localStorage.setItem("username", username);
}


// SEND MESSAGE

async function sendMessage() {

    const input = document.getElementById("userInput");
    const message = input.value.trim();

    if (!message) return;

    const chatbox = document.getElementById("chatbox");

    // Show user message
    chatbox.innerHTML += `<div class="message user">${message}</div>`;

    // Show typing...
    const typingId = Date.now();
    chatbox.innerHTML += `<div class="message bot" id="${typingId}">Typing...</div>`;

    chatbox.scrollTop = chatbox.scrollHeight;

    input.value = "";

    try {
        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        setTimeout(() => {
            const typingMsg = document.getElementById(typingId);
            if (typingMsg) typingMsg.innerText = data.reply;

            chatbox.scrollTop = chatbox.scrollHeight;
        }, 800);

    } catch (err) {
        document.getElementById(typingId).innerText = "Error connecting to server.";
    }
}


// WELCOME MESSAGE

window.onload = function () {

    const chatbox = document.getElementById("chatbox");

    const welcomeMessage = `Hello, ${username} 👋<br>How can I help you today?`;

    chatbox.innerHTML += `<div class="message bot">${welcomeMessage}</div>`;
};


// ENTER KEY SUPPORT

document.getElementById("userInput")
.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
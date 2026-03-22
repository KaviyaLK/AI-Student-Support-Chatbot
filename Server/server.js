const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// ================================
// FAQ ROUTES (REQUIRED FOR ADMIN)
// ================================

// GET FAQs
app.get("/faqs", (req, res) => {
  const data = JSON.parse(fs.readFileSync(faqPath));
  res.json(data);
});

// ADD FAQ
app.post("/faqs", (req, res) => {
  const { keywords, answer } = req.body;

  let data = JSON.parse(fs.readFileSync(faqPath));
  data.push({ keywords, answer });

  fs.writeFileSync(faqPath, JSON.stringify(data, null, 2));

  res.json({ message: "FAQ added successfully" });
});

// DELETE FAQ
app.delete("/faqs/:index", (req, res) => {
  let data = JSON.parse(fs.readFileSync(faqPath));

  data.splice(req.params.index, 1);

  fs.writeFileSync(faqPath, JSON.stringify(data, null, 2));

  res.json({ message: "FAQ deleted successfully" });
});

// UPDATE FAQ
app.put("/faqs/:index", (req, res) => {
  let data = JSON.parse(fs.readFileSync(faqPath));

  const { keywords, answer } = req.body;

  data[req.params.index] = { keywords, answer };

  fs.writeFileSync(faqPath, JSON.stringify(data, null, 2));

  res.json({ message: "FAQ updated successfully" });
});

// FILE SYSTEM SETUP
const fs = require("fs");
const path = require("path");

const faqPath = path.join(__dirname, "../database/faq.json");
const logPath = path.join(__dirname, "../database/logs.json");
const motivationPath = path.join(__dirname, "../database/motivations.json");

// CHATBOT
app.post("/chat", (req, res) => {
  const rawMessage = req.body.message;
  const message = rawMessage.toLowerCase().replace(/[^\w\s]/g, "");

  // Load data
  let faqs = JSON.parse(fs.readFileSync(faqPath));

  let motivations = [];
  try {
    motivations = JSON.parse(fs.readFileSync(motivationPath));
  } catch {
    motivations = [];
  }

  // 1. GREETING
  if (message.includes("hi") || message.includes("hello")) {
    return res.json({ reply: "Hello! How can I assist you today?" });
  }

  // 2. EMOTION DETECTION (BEST VERSION)
  const stressWords = ["stress", "stressed", "pressure", "tired", "sad"];

  const stopWords = ["i", "im", "me", "my", "is", "the", "a", "am"];
  const words = message.split(" ").filter(word => !stopWords.includes(word));

  if (words.some(word => stressWords.includes(word))) {
    if (motivations.length > 0) {
      const random = Math.floor(Math.random() * motivations.length);
      return res.json({ reply: motivations[random].text });
    } else {
      return res.json({ reply: "Stay strong! You can do this 💪" });
    }
  }

  // 3. FAQ MATCHING (CLEAN + SAFE)
  let bestMatch = null;
  let highestScore = 0;

  for (let faq of faqs) {
    let score = 0;

    for (let keyword of faq.keywords) {
      const cleanKeyword = keyword.toLowerCase().trim();

      if (words.includes(cleanKeyword)) {
        score++;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  let reply =
    "I'm not sure about that. Try asking about exams, timetable, or assignments.";

  if (bestMatch && highestScore >= 1) {
    reply = bestMatch.answer;
  }

  // LOGGING
  let logs = [];

  try {
    logs = JSON.parse(fs.readFileSync(logPath));
  } catch {
    logs = [];
  }

  logs.push({
    userMessage: rawMessage,
    botReply: reply,
    time: new Date().toLocaleString(),
  });

  fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

  console.log("User:", rawMessage);
  console.log("Bot:", reply);

  res.json({ reply });
});
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch'); // use node-fetch or your preferred fetch lib

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Serve static files for assets like CSS/JS
app.use(express.static(__dirname));

// Serve demo.html at root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo.html'));
});

// Chat API endpoint
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  let reply = "";

  try {
    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Basic keyword responses
    if (userMessage.toLowerCase().includes("admission")) {
      reply = "Admissions at VIET are through AP EAMCET/ECET. Visit viet.ac.in for details.";
    } else if (userMessage.toLowerCase().includes("placements")) {
      reply = "Our Placement Cell works with companies like TCS, Infosys, Wipro.";
    } else {
      // Example of external API call with SerpAPI - replace your API key below
      const SERPAPIKEY = "your_serp_api_key_here"; 
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(userMessage)}&apikey=${SERPAPIKEY}`;
      const response = await fetch(url);
      const data = await response.json();

      // Simple parsing to reply with answer box or snippet
      if (data.answer_box && data.answer_box.answer) {
        reply = data.answer_box.answer;
      } else if (data.organic_results && data.organic_results.length > 0) {
        reply = data.organic_results[0].snippet;
      } else {
        reply = "I couldn't find an answer for that.";
      }
    }

    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Backend error" });
  }
});

// Start server on port 5000
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});

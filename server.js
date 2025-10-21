const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname)); // Serves static files

const SERPAPI_KEY = "f94cf102ec702243fdecd43858183b0f0626f71cc19ed22915223a40d617ec1d";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "demo.html"));
});

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;
  let reply = "";

  try {
    // Static responses FIRST, outside of any fetch logic
    if (userMessage && userMessage.toLowerCase().includes("admission")) {
      reply = "Admissions at VIET are through AP EAMCET/ECET. Visit viet.ac.in for details.";
      return res.json({ reply }); // Respond and exit
    }
    if (userMessage && userMessage.toLowerCase().includes("placements")) {
      reply = "Our Placement Cell works with companies like TCS, Infosys, Wipro.";
      return res.json({ reply }); // Respond and exit
    }

    // If not a static known query, go to SerpAPI
    const url = `https://serpapi.com/search.json?q=${encodeURIComponent(userMessage)}&api_key=${SERPAPI_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.answer_box && data.answer_box.answer) {
      reply = data.answer_box.answer;
    } else if (data.organic_results && data.organic_results.length > 0) {
      reply = data.organic_results[0].snippet;
    } else if (data.error) {
      reply = "⚠️ SerpAPI Error: " + data.error;
    } else {
      // Fallback to Wikipedia summary if nothing found
      const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(userMessage)}`;
      const wikiRes = await fetch(wikiUrl);
      const wikiData = await wikiRes.json();
      reply = wikiData.extract || "I couldn't find an answer. Please try again!";
    }

    res.json({ reply });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ reply: "⚠️ Server error. Please check backend." });
  }
});

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));

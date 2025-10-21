const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname));

const SERPAPI_KEY = "f94cf102ec702243fdecd43858183b0f0626f71cc19ed22915223a40d617ec1d";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "demo.html"));
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ reply: "⚠️ Please enter a message." });
    }

    // Static responses first
    if (userMessage.toLowerCase().includes("admission")) {
      return res.json({ reply: "Admissions at VIET are through AP EAMCET/ECET. Visit viet.ac.in for details." });
    }
    if (userMessage.toLowerCase().includes("placements")) {
      return res.json({ reply: "Our Placement Cell works with companies like TCS, Infosys, Wipro." });
    }

    // External fetch logic
    try {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(userMessage)}&api_key=${SERPAPI_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.answer_box && data.answer_box.answer) {
        return res.json({ reply: data.answer_box.answer });
      } else if (data.organic_results && data.organic_results.length > 0) {
        return res.json({ reply: data.organic_results[0].snippet });
      } else if (data.error) {
        return res.json({ reply: "⚠️ SerpAPI Error: " + data.error });
      } else {
        const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(userMessage)}`;
        const wikiRes = await fetch(wikiUrl);
        const wikiData = await wikiRes.json();
        if (wikiData.extract) {
          return res.json({ reply: wikiData.extract });
        } else {
          return res.json({ reply: "I couldn't find an answer. Please try again!" });
        }
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      return res.json({ reply: "⚠️ External search error." });
    }
  } catch (err) {
    console.error("❌ Chat error:", err);
    return res.status(500).json({ reply: "⚠️ Server error. Please check backend." });
  }
});

app.listen(5000, () => console.log("✅ Backend running on http://localhost:5000"));

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Serve static files for CSS, JS etc.
app.use(express.static(__dirname));

// Serve demo.html as root page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo.html'));
});

// Your existing /chat API route here
app.post('/chat', async (req, res) => {
  // existing chat code...
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));

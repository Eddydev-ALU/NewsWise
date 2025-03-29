require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 4000;

//CORS configuration
app.use(cors({
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], 
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Key validation
const API_KEY = process.env.RAPIDAPI_KEY;
if (!API_KEY) {
  console.error('ERROR: Missing RAPIDAPI_KEY in .env file');
  process.exit(1);
}

// API Endpoints
app.get('/api/search', async (req, res) => {
  try {
    const { q, country = 'us', language = 'en' } = req.query;
    
    if (!q) return res.status(400).json({ error: 'Search query required' });

    const response = await axios.get('https://google-news22.p.rapidapi.com/v1/search', {
      params: { q, country, language },
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'google-news22.p.rapidapi.com'
      },
      timeout: 15000
    });

    res.json({ 
      success: true,
      articles: response.data?.data || [] 
    });

  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: 'Failed to fetch search results' });
  }
});

app.get('/api/top-headlines', async (req, res) => {
  try {
    const { country = 'us', language = 'en' } = req.query;
    
    const response = await axios.get('https://google-news22.p.rapidapi.com/v1/top-headlines', {
      params: { country, language },
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'google-news22.p.rapidapi.com'
      },
      timeout: 10000
    });

    res.json({ 
      success: true,
      articles: response.data?.data || []
    });

  } catch (error) {
    console.error('Headlines error:', error.message);
    res.status(500).json({ error: 'Failed to fetch headlines' });
  }
});

app.get('/api/topic-headlines', async (req, res) => {
  try {
    const { topic, country = 'us', language = 'en' } = req.query;
    if (!topic) return res.status(400).json({ error: 'Topic required' });

    const response = await axios.get('https://google-news22.p.rapidapi.com/v1/topic-headlines', {
      params: { topic, country, language },
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'google-news22.p.rapidapi.com'
      },
      timeout: 10000
    });

    res.json({ 
      success: true,
      articles: response.data?.data || []
    });

  } catch (error) {
    console.error('Topic error:', error.message);
    res.status(500).json({ error: 'Failed to fetch topic news' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
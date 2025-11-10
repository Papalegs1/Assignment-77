// controllers/jokebookController.js
const {
    getAllCategories,
    getJokesByCategory,
    addJoke,
    getRandomJoke
  } = require('../models/jokebookModel');
  
  // if you still want extra credit external fetch:
  const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
  
  async function getCategories(req, res) {
    try {
      const categories = await getAllCategories();
      res.json({ categories });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  }
  
  async function getJokesInCategory(req, res) {
    const category = req.params.category;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    try {
      const jokes = await getJokesByCategory(category);
      if (!jokes) {
        return res.status(404).json({ error: `Category '${category}' not found.` });
      }
      if (limit && !isNaN(limit)) {
        return res.json({ category, jokes: jokes.slice(0, limit) });
      }
      res.json({ category, jokes });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch jokes' });
    }
  }
  
  async function getRandomJokeHandler(req, res) {
    try {
      const joke = await getRandomJoke();
      if (!joke) {
        return res.status(404).json({ error: 'No jokes in database.' });
      }
      res.json({
        category: joke.category,
        joke: {
          setup: joke.setup,
          delivery: joke.delivery
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch random joke' });
    }
  }
  
  async function addNewJoke(req, res) {
    const { category, setup, delivery } = req.body;
    if (!category || !setup || !delivery) {
      return res.status(400).json({ error: 'category, setup, and delivery are required.' });
    }
  
    try {
      const updatedJokes = await addJoke(category, setup, delivery);
      res.status(201).json({
        message: 'Joke added successfully.',
        category,
        jokes: updatedJokes
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to add joke' });
    }
  }
  
  /**
   * Extra credit: if category not found in DB, try external
   */
  async function searchExternalCategory(req, res) {
    const category = req.params.category;
  
    // first, try DB
    const jokes = await getJokesByCategory(category);
    if (jokes) {
      return res.json({ category, jokes });
    }
  
    try {
      const url = `https://v2.jokeapi.dev/joke/${encodeURIComponent(category)}?type=twopart&amount=3&safe-mode`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(404).json({ error: `No jokes found in external API for ${category}` });
      }
      const data = await response.json();
  
      let externalJokes = [];
      if (data.jokes && Array.isArray(data.jokes)) {
        externalJokes = data.jokes.map(j => ({
          setup: j.setup,
          delivery: j.delivery
        }));
      } else if (data.type === 'twopart') {
        externalJokes.push({
          setup: data.setup,
          delivery: data.delivery
        });
      }
  
      if (externalJokes.length === 0) {
        return res.status(404).json({ error: `No jokes found in external API for ${category}` });
      }
  
      // store them in DB now
      for (const j of externalJokes) {
        await addJoke(category, j.setup, j.delivery);
      }
  
      const finalJokes = await getJokesByCategory(category);
      return res.json({ category, jokes: finalJokes, source: 'external' });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch from external API.' });
    }
  }
  
  module.exports = {
    getCategories,
    getJokesInCategory,
    getRandomJoke: getRandomJokeHandler,
    addNewJoke,
    searchExternalCategory
  };
  
// routes/jokebookRoutes.js
const express = require('express');
const router = express.Router();
const {
  getCategories,
  getJokesInCategory,
  getRandomJoke,
  addNewJoke,
  searchExternalCategory
} = require('../controllers/jokebookController');

// i. Jokebook Categories
router.get('/categories', getCategories);

// ii. Jokes in a category
router.get('/category/:category', getJokesInCategory);

// extra credit endpoint (separate, so you don’t break the main one)
router.get('/category/:category/search-external', searchExternalCategory);

// iii. Random Joke
router.get('/random', getRandomJoke);

// iv. Add a new joke
router.post('/joke/add', addNewJoke);

module.exports = router;

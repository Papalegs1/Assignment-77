// models/jokebookModel.js
const db = require('../db');

// get all categories
async function getAllCategories() {
  const result = await db.query('SELECT name FROM categories ORDER BY name');
  return result.rows.map(r => r.name);
}

// get jokes for a category
async function getJokesByCategory(category) {
  const catRes = await db.query('SELECT id FROM categories WHERE name = $1', [category]);
  if (catRes.rowCount === 0) {
    return null; // controller will handle 404
  }
  const categoryId = catRes.rows[0].id;
  const jokesRes = await db.query(
    'SELECT setup, delivery FROM jokes WHERE category_id = $1 ORDER BY id',
    [categoryId]
  );
  return jokesRes.rows;
}

// add a joke to a category (create category if missing)
async function addJoke(category, setup, delivery) {
  // ensure category
  let catRes = await db.query('SELECT id FROM categories WHERE name = $1', [category]);
  let categoryId;
  if (catRes.rowCount === 0) {
    const insertCat = await db.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING id',
      [category]
    );
    categoryId = insertCat.rows[0].id;
  } else {
    categoryId = catRes.rows[0].id;
  }

  await db.query(
    'INSERT INTO jokes (category_id, setup, delivery) VALUES ($1, $2, $3)',
    [categoryId, setup, delivery]
  );

  const jokesRes = await db.query(
    'SELECT setup, delivery FROM jokes WHERE category_id = $1 ORDER BY id',
    [categoryId]
  );
  return jokesRes.rows;
}

// get a random joke across all categories
async function getRandomJoke() {
  const result = await db.query(
    'SELECT c.name AS category, j.setup, j.delivery FROM jokes j JOIN categories c ON j.category_id = c.id ORDER BY RANDOM() LIMIT 1'
  );
  if (result.rowCount === 0) {
    return null;
  }
  return result.rows[0];
}

module.exports = {
  getAllCategories,
  getJokesByCategory,
  addJoke,
  getRandomJoke
};

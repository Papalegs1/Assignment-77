const BASE_URL = '/jokebook';

document.addEventListener('DOMContentLoaded', () => {
  loadRandomJoke();

  document.getElementById('reload-random').addEventListener('click', loadRandomJoke);
  document.getElementById('load-categories').addEventListener('click', loadCategories);
  document.getElementById('search-category-btn').addEventListener('click', () => {
    const cat = document.getElementById('category-search').value.trim();
    if (cat) {
      loadJokesForCategory(cat, true);
    }
  });

  document.getElementById('add-joke-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const category = document.getElementById('new-category').value.trim();
    const setup = document.getElementById('new-setup').value.trim();
    const delivery = document.getElementById('new-delivery').value.trim();
    const status = document.getElementById('add-status');

    try {
      const res = await fetch(`${BASE_URL}/joke/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ category, setup, delivery })
      });

      const data = await res.json();
      if (!res.ok) {
        status.textContent = data.error || 'Error adding joke';
        status.style.color = 'tomato';
        return;
      }

      status.textContent = 'Joke added and category updated!';
      status.style.color = 'lightgreen';

      // show the updated jokes
      renderJokes(category, data.jokes);
    } catch (err) {
      console.error(err);
      status.textContent = 'Network error';
      status.style.color = 'tomato';
    }
  });
});

async function loadRandomJoke() {
  const p = document.getElementById('random-joke');
  p.textContent = 'Loading...';
  try {
    const res = await fetch(`${BASE_URL}/random`);
    const data = await res.json();
    p.textContent = `${data.joke.setup} — ${data.joke.delivery} (${data.category})`;
  } catch (err) {
    p.textContent = 'Failed to load random joke.';
  }
}

async function loadCategories() {
  const list = document.getElementById('category-list');
  list.innerHTML = 'Loading...';
  try {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    list.innerHTML = '';
    data.categories.forEach(cat => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = cat;
      btn.addEventListener('click', () => loadJokesForCategory(cat, false));
      li.appendChild(btn);
      list.appendChild(li);
    });
  } catch (err) {
    list.innerHTML = 'Failed to load categories.';
  }
}

async function loadJokesForCategory(category, allowExternal = false) {
  const container = document.getElementById('jokes-container');
  container.textContent = 'Loading...';

  try {
    const res = await fetch(`${BASE_URL}/category/${encodeURIComponent(category)}`);
    if (!res.ok) {
      // if category not found and extra credit allowed
      if (allowExternal) {
        const externalRes = await fetch(`${BASE_URL}/category/${encodeURIComponent(category)}/search-external`);
        const externalData = await externalRes.json();
        if (!externalRes.ok) {
          container.textContent = externalData.error || 'Category not found.';
          return;
        }
        renderJokes(category, externalData.jokes);
        return;
      }
      const data = await res.json();
      container.textContent = data.error || 'Category not found.';
      return;
    }
    const data = await res.json();
    renderJokes(data.category, data.jokes);
  } catch (err) {
    container.textContent = 'Failed to load jokes.';
  }
}

function renderJokes(category, jokes) {
  const container = document.getElementById('jokes-container');
  const heading = document.createElement('h3');
  heading.textContent = `Category: ${category}`;
  container.innerHTML = '';
  container.appendChild(heading);

  if (!jokes || jokes.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No jokes in this category.';
    container.appendChild(p);
    return;
  }

  jokes.forEach(j => {
    const div = document.createElement('div');
    div.className = 'joke';
    div.innerHTML = `<strong>${j.setup}</strong><br>${j.delivery}`;
    container.appendChild(div);
  });
}

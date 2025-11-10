// server.js
const express = require('express');
const path = require('path');
const app = express();
const jokebookRouter = require('./routes/jokebookRoutes');

const PORT = process.env.PORT || 8080;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// mount jokebook routes
app.use('/jokebook', jokebookRouter);

// default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

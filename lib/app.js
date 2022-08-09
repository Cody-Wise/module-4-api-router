const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const authenticate = require('./middleware/authenticate');
const auth = require('./routes/auth');
const items = require('./routes/items');
const notFound = require('./middleware/not-found');
const error = require('./middleware/error');

const app = express();

// Built in middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}
app.use(express.json());
app.use(cookieParser());

// App routes
app.use('/api/v1/auth', auth);
app.use('/api/v1/items', authenticate, items);

// Error handling & 404 middleware for when
// a request doesn't match any app routes
app.use(notFound);
app.use(error);

module.exports = app;

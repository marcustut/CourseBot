if (process.env.NODE_ENV !== 'production') require('dotenv').config();

module.exports = {
  prefix: '!',
  token: process.env.TOKEN
};
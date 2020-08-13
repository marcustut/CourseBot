const app = require('express')();

app.get('/', (req, res) => res.send('Server is up.'));

module.exports = () => {
  app.listen(process.env.PORT || 3000);
}
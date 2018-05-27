const http = require('http'),
  api = require('./config/app'),
  server = http.Server(api),
  PORT = process.env.PORT || 3001,
  LOCAL = '0.0.0.0';

server.listen(PORT, LOCAL, () => console.log(`Fin Health API running on ${PORT}`));

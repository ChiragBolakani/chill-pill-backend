const http = require('http')
const app = require('./app');

const port = process.env.PORT

var server = http.createServer(app).listen(port);

server.on('listening', () => {
    console.log('Server listening on', port);
});

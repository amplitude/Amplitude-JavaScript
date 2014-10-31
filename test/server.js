var express = require('express');
var server = express();

server.use('/src', express.static(__dirname + '/..'));
server.use(express.static(__dirname));
var port = 9000;
server.listen(port);
console.log('Listening on port ' + port + '...');

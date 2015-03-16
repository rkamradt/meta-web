var express = require('express');
var http = require('http');
var fs = require('fs');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var metaAppFactory = require('meta-app');
var storeFactory = require('meta-app-mongo');
var restFactory = require('meta-app-rest');
var morgan = require('morgan');

var json = JSON.parse(fs.readFileSync('meta-data.json'));
var metaApp = metaAppFactory(json);
var mongoURL = 'mongodb://localhost:27017/myproject';

app.use(bodyParser.urlencoded({extended: true}));

app.use('/', express.static(path.join(__dirname, 'public')));
 // parse application/json
app.use(bodyParser.json());
app.use(methodOverride());
app.use(morgan('dev', { format: 'dev', immediate: true }));
restFactory(app, metaApp, storeFactory(metaApp.getModel('comments'), mongoURL, 'comments'));

http.createServer(app).listen(9999, function() {
 console.log('Server up: http://localhost:' + 9999);
});

var express = require('express');
var ejs = require('ejs');
var fs = require('fs');
var app = express();

var templateString = null;
var count = 0;

fs.readFile('template.ejs', function(err, data) {
    if(!err) {
        templateString = data;
    }
});

// configure Express
app.configure(function() {
  app.use(app.router);
  app.use(express.static(__dirname + '/'));
});

// app.get('/', function(req, res){
// 	res.redirect('/app/index.html')
// })

app.get('/template', function(req, res){
	res.end("This data has been returned from the server.  This proves that AJAX is working.")
})

app.get('/count', function(req, res){
	count ++;
	res.send("This has been seen " + count + " times.  AJAX lazy loading is working.");
})

app.use(function(req, res, next){
  console.log('%s %s', req.method, req.url);
  next();
});

console.log("listening on port 3000")
app.listen(3000);
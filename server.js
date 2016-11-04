var express = require("express");
var app = express();

app.use(express.static(__dirname + '/View'));

app.use(express.static(__dirname + '/Script'));

app.use(express.static(__dirname + '/Data'));

app.use(express.static(__dirname + '/Media'))


app.get('/', function(req, res)
  {
    res.sendFile("index.html");
  })

app.listen(8000, function ()
  {
    console.log('Server running on port 8000!')
  })

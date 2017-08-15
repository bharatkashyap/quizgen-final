require("rootpath")();

var express = require("express"),
    path = require('path'),
    bodyParser = require("body-parser");

var app = express();

app.use(express.static(path.join(__dirname , "/Views")));
app.use(express.static(path.join(__dirname , "/Script")));
app.use(express.static(path.join(__dirname , "/Data")));
app.use(express.static(path.join(__dirname , "/Media")));



app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());

app.listen(8000, function ()
  {
    console.log("Server running on port 8000!")
  })

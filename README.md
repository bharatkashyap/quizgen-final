Quizgen - Final
======

Creating a standard, grid-like format for final rounds of quizzes instead of having to make bulky, irritating powerpoint presentations.

Fetches data from a Google Spreadsheet (like [so](https://docs.google.com/spreadsheets/d/1oI83izpSqQIJP8_A65smGIuSr1AT66v8F-vFkvR5O2k/edit#gid=0)) and creates a simple, minimalistic yet immersive final round experience - built using pure Javascript; packaged as a Node + Express application for distributability.

A list of dependencies of this project can be seen through *package.json*

***
### Setting up

* If you do not have Node.js installed, install it from [here](https://www.nodejs.org)

* Download this repository using either

````
git clone https://github.com/bharatkashyap/quizgen-final.git
````

* Or **Clone or download** -> **Download ZIP** option on the top right

* Extract to *quizgen-final-master*; open up the terminal and navigate to it

````
cd Desktop/quizgen-final-master/final
````

* Install all dependencies using :

```
npm install
```

* Then, run the application using :

```
node server.js
```

* Finally, open up your browser to :

```
localhost:8000
```

* Create your own sheet like the one I've linked to up top

* Publish your sheet to the web and get your key, like so :
```
https://docs.google.com/spreadsheets/d/1oI83izpSqQIJP8_A65smGIuSr1AT66v8F-vFkvR5O2k/pubhtml?gd=0&single=true
```
thus, in this case, KEY = 1oI83izpSqQIJP8_A65smGIuSr1AT66v8F-vFkvR5O2k

* Replace this line in the Main script file :
```javascript
xhr.open("GET", "https://spreadsheets.google.com/feeds/list/YOUR-KEY-HERE/od6/public/values?alt=json", true);
```

* Build quizzes like [these](https://bharatkashyap.github.io/quizzes/17nov16/View)

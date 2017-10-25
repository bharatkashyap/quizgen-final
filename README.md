Quizgen - Final
======

Creating a standard, grid-like format for final rounds of quizzes instead of having to make bulky, irritating powerpoint presentations.

Fetches data from a Google Spreadsheet (like [so](https://docs.google.com/spreadsheets/d/1oI83izpSqQIJP8_A65smGIuSr1AT66v8F-vFkvR5O2k/edit#gid=0)) and creates a simple, minimalistic yet immersive final round experience - built using pure Javascript. Packaged as Node/Express to be able to run locally.

***
## Update
Live [here](https://quizgen-final.firebaseapp.com/). Instructions for local run follow.

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

* Create your own sheet like the one I've linked to up [top](https://docs.google.com/spreadsheets/d/1oI83izpSqQIJP8_A65smGIuSr1AT66v8F-vFkvR5O2k/edit#gid=0)

* Publish your sheet to the web and enter that URL into the text field, and we should be up!

* Build quizzes like [this one](https://bharatkashyap.github.io/quizzes/17nov16/View) and also [this one](https://quizgen-final.firebaseapp.com/?sheet=https://docs.google.com/spreadsheets/d/1W4A4rrA812qtynqrU3Y4iYQrFrizoAe8WezAw0wviEg/edit#gid=0)

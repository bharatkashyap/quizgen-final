import { formatRelativeTime, debounce } from "./utils.js";
import {
  db,
  setDoc,
  getDoc,
  getDocs,
  doc,
  auth,
  query,
  where,
  collection,
  signIn,
  serverTimestamp,
  googleAuthProvider,
  GoogleProvider,
} from "./firebase.js";

let viewedQues = sessionStorage.getItem("viewedQues")
  ? JSON.parse(sessionStorage.getItem("viewedQues"))
  : []; // Session letiable for viewed questions

function parseSpreadsheetData(response) {
  const [keys, ...data] = response;

  return data.map((row) =>
    Object.fromEntries(keys.map((key, index) => [key, row[index]]))
  );
}

function parseStoredData(data) {
  delete data.author_uid;
  delete data.last_published_at;
  return Object.values(data);
}

function createQuiz(rows) {
  let title = rows[0]["Title"];
  let day = rows[0]["Date"];

  let rules = [];
  let questions = [];
  let questions_media = [];
  let answers = [];
  let answers_media = [];
  let answers_descr = [];
  rows.forEach((row) => {
    if (row["Rules"]) {
      rules.push(row["Rules"]);
    }
    if (row["Questions"]) {
      questions.push(row["Questions"]);
    }
    if (row["Questions Media"]) {
      questions_media.push(row["Questions Media"]);
    }
    if (row["Answers"]) {
      answers.push(row["Answers"]);
    }
    if (row["Answers Media"]) {
      answers_media.push(row["Answers Media"]);
    }
    if (row["Answers Description"]) {
      answers_descr.push(row["Answers Description"]);
    }
  });
  showMeta(title, day, rules);
  populateTable(
    questions,
    questions_media,
    answers,
    answers_media,
    answers_descr
  );

  /* Make things visible/accessible on quizload */

  let init = document.getElementsByClassName("init")[0];
  init.classList.add("success-hide");

  let tutorial = document.getElementsByClassName("tutorial")[0];
  tutorial.style.display = "none";

  let containerMiddle = document.getElementsByClassName("container-x")[0];
  containerMiddle.classList.add("success-show");

  let containerBottom = document.getElementsByClassName("container-x")[1];
  containerBottom.classList.add("success-show");

  let start = document.getElementById("start");
  start.disabled = false;

  let access = document.getElementById("access");
  access.disabled = false;
}

//Write rules from data into HTML
function showMeta(title, day, rules) {
  document.getElementById("title").innerHTML = title;
  document.getElementById("day").innerHTML = day;

  let rulesList = document.getElementById("rules");
  rulesList.innerHTML = "";

  for (let i = 0, len = rules.length; i < len; i++) {
    let li = document.createElement("LI");

    li.innerHTML = rules[i];

    rulesList.appendChild(li);
  }
}

//Create grid of questions
function populateTable(
  questions,
  questions_media,
  answers,
  answers_media,
  answers_descr
) {
  let grid = document.getElementById("grid");
  grid.innerHTML = "";

  let cols = 4; //Number of columns in the grid

  for (let i = 0, len = questions.length; i < len; i++) {
    if (i % cols == 0) {
      //Insert new row after every fourth cell
      let row = document.createElement("TR");
      grid.appendChild(row);
    }
    let index = Math.floor(i / cols); //Get current row index

    let curr_row = grid.childNodes[index]; //Get current row element

    let cell = curr_row.insertCell(-1); //Insert new cell at the end of current row

    cell.innerHTML = i + 1;

    if (viewedQues.length > 0) {
      if (viewedQues.indexOf(cell.innerHTML.toString()) > -1)
        //Marking viewed questions
        cell.style.opacity = 0.3;
    }

    cell.onclick = function (event) {
      let q = event.target.innerHTML - 1;
      let question_object = {
        question: questions[q],
        questionMedia: questions_media[q],
        answer: answers[q],
        answerMedia: answers_media[q],
        answerDescr: answers_descr[q],
      };

      loadQuestion(event, question_object);
    };
  }
}

//Scroll to grid on start button-click
export function scrollToGrid() {
  let height = document.getElementsByClassName("container-x")[0].clientHeight;

  window.scrollBy(0, 1.1 * (window.scrollY / 5 + 1)); //Totally random forumla for Ease-in that looked good

  if (window.scrollY < height - 1)
    //Safeguard for mobile devices where the scrollY property always was finally set to 1px less than the container height
    requestAnimationFrame(scrollToGrid);
}

function loadQuestion(event, object) {
  let grid = document.getElementById("gridfield");
  grid.style.display = "none"; //Hide question grid

  let cell = event.target; //Get cell containing question number

  let container = document.createElement("DIV");
  container.id = "questionfield";

  let act_container = document.getElementsByClassName("container-x")[1];
  act_container.appendChild(container); //Append questionfield to container

  let quesNum = document.createElement("DIV");
  quesNum.innerHTML = event.target.innerHTML;
  quesNum.id = "quesNum"; //Div for question number

  let question = document.createElement("DIV");
  question.innerHTML = object.question;
  question.id = "question"; //Div for question content
  let questionMedia;
  if (object.questionMedia) {
    let type = object.questionMedia.substr(-3);

    switch (type) {
      case "png":
      case "jpg":
      case "gif":
      case "peg":
        questionMedia = document.createElement("IMG");
        break;
      case "mp3":
        questionMedia = document.createElement("AUDIO");
        questionMedia.controls = true;
        break;
      case "mp4":
      case "flv":
        questionMedia = document.createElement("VIDEO");
        questionMedia.controls = true;
        break;
      default:
        questionMedia = document.createElement("IMG");
    }
    questionMedia.id = "questionMedia";
    questionMedia.src = object.questionMedia;
  }

  let controls = document.createElement("DIV");
  controls.id = "controls"; //Div for buttons to handle further options

  let returnGrid = document.createElement("BUTTON"); //Button to return to grid
  returnGrid.id = "returnGrid";
  returnGrid.innerHTML = "Return to grid";

  returnGrid.onclick = function () {
    grid.style.display = "block"; //Show question grid
    act_container.removeChild(container); //Remove questionfield from container
  };

  let viewAns = document.createElement("BUTTON"); //Button to view answer
  viewAns.id = "viewAns";
  viewAns.innerHTML = "View answer";

  viewAns.onclick = function () {
    let answer = document.createElement("DIV");
    answer.id = "answer";
    answer.innerHTML = object.answer; //Div for answer content
    let answerDescr;
    if (object.answerDescr) {
      answerDescr = document.createElement("DIV");
      answerDescr.id = "answerDescr";
      answerDescr.innerHTML = object.answerDescr; //Div for answer description
    }

    cell.style.opacity = 0.3; //Semi-hide question to show it has been used
    let answerMedia;
    if (object.answerMedia) {
      let type = object.answerMedia.substr(-3);

      switch (type) {
        case "png":
        case "jpg":
        case "gif":
        case "peg":
          answerMedia = document.createElement("IMG");
          break;
        case "mp3":
          answerMedia = document.createElement("AUDIO");
          answerMedia.controls = true;
          break;
        case "mp4":
        case "flv":
          answerMedia = document.createElement("VIDEO");
          answerMedia.controls = true;
          break;
        default:
          answerMedia = document.createElement("IMG");
      }

      answerMedia.id = "answerMedia";
      answerMedia.src = object.answerMedia; //Div for answer resource image
    }

    container.removeChild(question); //Remove question from questionfield
    if (questionMedia) container.removeChild(questionMedia); //Remove question resource from questionfield
    controls.removeChild(viewAns); //Remove view answer button from controls div but keep return to grid button

    container.appendChild(answer);
    if (answerDescr) container.appendChild(answerDescr);
    if (answerMedia) container.appendChild(answerMedia);
    container.appendChild(controls); ///Append answerimage, answer and control buttons divisions to questionfield

    questionViewed(cell.innerHTML);
  };

  controls.appendChild(viewAns);
  controls.appendChild(returnGrid); //Append control buttons to controls division

  container.appendChild(quesNum);
  container.appendChild(question);
  if (questionMedia) container.appendChild(questionMedia);
  container.appendChild(controls); //Append question number, question content and control buttons to questionfield
}

function questionViewed(q) {
  // Storing viewed questions into sessionStorage
  viewedQues.push(q.toString());
  sessionStorage.setItem("viewedQues", JSON.stringify(viewedQues));
}

//Get sheet key
function getKey(string) {
  let key = new RegExp("/spreadsheets/d/([a-zA-Z0-9-_]+)");
  return key.exec(string)[1];
}

//Get JSON output link
function createSpreadsheetLink(docsLink) {
  let spreadsheetKey = getKey(docsLink);
  let spreadsheetLink =
    "https://spreadsheets.google.com/feeds/list/" +
    spreadsheetKey +
    "/od6/public/values?alt=json";
  return spreadsheetLink;
}

//Colour-scheme
export function invert() {
  document.getElementsByClassName("container-x")[0].classList.toggle("invert");
  document.getElementsByClassName("container-x")[1].classList.toggle("invert");
}

function makeXHR(callback) {
  let docsLink = document.getElementById("spreadsheet").value;
  let xhr;
  xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == 200) {
      callback(xhr.responseText);
    }
  };

  let spreadsheetLink = createSpreadsheetLink(docsLink);
  xhr.open("GET", spreadsheetLink, true);
  xhr.send();
}

let intervalFunc,
  index = 0;

function shuffleImages() {
  intervalFunc = setInterval(nextImage, 2000);

  let images = document.getElementsByClassName("slide");

  function nextImage() {
    let modIndex = index % images.length;
    if (images[modIndex].classList.contains("img-active")) {
      images[modIndex].classList.remove("img-active");
      let nextIndex = (index + 1) % images.length;
      images[nextIndex].classList.add("img-active");
    }
    index++;
  }
}

function setSlideshowHeight() {
  let slideshow = document.getElementById("slideshow");
  let image = document.getElementsByTagName("img")[0];
  let imgstyle = getComputedStyle(image, null);
  let slideshowHeight =
    parseFloat(imgstyle.marginTop) + parseFloat(imgstyle.height);
  slideshow.style.height = slideshowHeight + "px";
  loadTutorial();
}

function loadTutorial() {
  let tutorial = document.getElementsByClassName("tutorial")[0];
  tutorial.classList.add("visible");
  window.sr = ScrollReveal();
  sr.reveal(".tut-1", { duration: 2000 });
  sr.reveal(".tut-2", { duration: 2000 });
  sr.reveal(".tut-3", { duration: 2000 });
  sr.reveal(".tut-4", { duration: 2000 });
  sr.reveal(".tut-5", { duration: 2000 });
}

async function detectUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        reject("No user is signed in");
      }
    });
  });
}

async function init() {
  let user;
  try {
    user = await detectUser();
    window.user = user;
  } catch (e) {
    console.log(e);
  }
  const params = new URLSearchParams(document.location.search);

  const id = params.get("id");
  window.sheetId = id;
  const edit = params.get("mode") === "edit";

  if (!id && !user) return;
  else if (!id && user) {
    fetchQuizzes();
  } else if (id) {
    fetchStoredQuiz(params.get("id"));

    if (edit && user) {
      console.log("edit mode", user);
      displayRefreshQuiz();
    }
  }
}

async function fetchStoredQuiz(id) {
  const docRef = doc(db, "quizzes", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const parsedStoredData = parseStoredData(data);
    window.quizgenData = parsedStoredData;
    createQuiz(parsedStoredData);
  } else {
    // docSnap.data() will be undefined in this case
    displayError("No quiz found.");
  }
}

// Function to fetch data for a particular spreadsheet
function fetchDataForSpreadsheet(spreadsheetId) {
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: spreadsheetId,
      range: "A1:Z100",
      majorDimension: "ROWS",
      valueRenderOption: "UNFORMATTED_VALUE",
      dateTimeRenderOption: "FORMATTED_STRING",
    })
    .then(function (response) {
      let spreadsheetData = response.result;
      let containerMiddle = document.getElementsByClassName("container-x")[0];
      containerMiddle.classList.add("success-show");
      // Handle the fetched data as needed
      const parsedSpreadsheetData = parseSpreadsheetData(
        spreadsheetData.values
      );
      createQuiz(parsedSpreadsheetData);
      window.quizgenData = parsedSpreadsheetData;
    })
    .catch(function (error) {
      console.error("Error fetching data for the spreadsheet:", error);
    });
}

function searchSheets(event) {
  if (event.target && !event.target.value) {
    if (window.originalFiles) {
      displaySheetCards(window.originalFiles);
    }
    return;
  }
  let query = event.target.value.toLowerCase().trim();
  gapi.client.drive.files
    .list({
      q: `mimeType='application/vnd.google-apps.spreadsheet' and name contains '${query}'`,
      orderBy: "modifiedTime desc",
      fields: "files(id, name, modifiedTime)",
      pageSize: 9,
    })
    .then((response) => {
      const searchResults = response.result.files;

      displaySheetCards(searchResults);
    })
    .catch((err) => console.log(err));
}

export const debouncedSearch = debounce(searchSheets, 300);

function displaySheetsSearch() {
  const searchInput = document.getElementById("sheetsSearch");
  searchInput.classList.remove("invisible");
  searchInput.classList.add("visible");
  searchInput.classList.add("mb-2");
}

function toggleSheetsShimmer() {
  const shimmerContainer = document.getElementById("shimmer-container");
  shimmerContainer.classList.toggle("invisible");
  shimmerContainer.classList.toggle("hide-init");
  shimmerContainer.classList.toggle("min-height-shimmer");
}

function displaySheetCards(sheets) {
  let sheetsHeading = document.getElementById("sheetsHeading");
  sheetsHeading.classList.remove("invisible");
  sheetsHeading.classList.add("mt-4");
  let sheetsContainer = document.getElementById("sheets-cards");
  sheetsContainer.innerHTML = "";
  let row;
  if (!sheets.length) {
    let noResults = document.createElement("div");
    noResults.className = "col-md-12 my-4";
    noResults.innerHTML = "No results found - try another search term.";
    sheetsContainer.appendChild(noResults);
    return;
  }
  sheets.forEach(function (sheet, index) {
    if (index % 3 == 0) {
      row = document.createElement("div");
      row.className = "row justify-content-center";
      sheetsContainer.appendChild(row);
    }

    let sheetCard = document.createElement("div");
    sheetCard.role = "button";
    sheetCard.className = "col-md-3 card sheet-card";

    let sheetCardBody = document.createElement("div");
    sheetCardBody.className = "card-body";

    let sheetTitle = document.createElement("h5");
    sheetTitle.className = "card-title";
    sheetTitle.textContent = sheet.name;

    let sheetDescription = document.createElement("p");
    sheetDescription.className = "card-text";

    if (sheet.modifiedTime) {
      sheetDescription.innerHTML =
        "Modified <strong>" +
        formatRelativeTime(new Date(sheet.modifiedTime)) +
        "</strong>";
    }

    sheetCardBody.appendChild(sheetTitle);
    sheetCardBody.appendChild(sheetDescription);

    sheetCard.appendChild(sheetCardBody);

    // Add click event listener to each card
    sheetCard.addEventListener("click", function () {
      // On card click, fetch data for the particular spreadsheet
      fetchDataForSpreadsheet(sheet.id);
      window.sheetId = sheet.id;
    });

    row.appendChild(sheetCard);
  });
}

function displayQuizCards(quizzes) {
  let quizzesHeading = document.getElementById("quizzesHeading");
  quizzesHeading.innerHTML = "Your quizzes";
  quizzesHeading.classList.remove("invisible");
  let quizzesRoot = document.getElementById("quizzes");
  quizzesRoot.classList.add("opacity-1");
  quizzesRoot.classList.remove("opacity-0");
  let quizzesContainer = document.getElementById("quiz-cards");

  quizzesContainer.innerHTML = "";
  let row;
  if (!quizzes.length) {
    return;
  }
  quizzes.forEach(function (doc, index) {
    let [id, data] = doc;
    let last_published_at = data.last_published_at;
    let quiz = parseStoredData(data);
    if (index % 3 == 0) {
      row = document.createElement("div");
      row.className = "row justify-content-center";
      quizzesContainer.appendChild(row);
    }

    let quizCard = document.createElement("div");
    quizCard.role = "button";
    quizCard.className = "col-md-3 card quiz-card";

    let quizCardBody = document.createElement("div");
    quizCardBody.className = "card-body";

    let quizTitle = document.createElement("h5");
    quizTitle.className = "card-title";
    quizTitle.textContent = quiz[0]["Title"];

    let quizDescription = document.createElement("p");
    quizDescription.className = "card-text";

    last_published_at
      ? (quizDescription.innerHTML =
          "Published <strong>" +
          formatRelativeTime(new Date(last_published_at)) +
          "</strong>")
      : (quizDescription.innerHTML = "<strong>Draft</strong>");

    quizCardBody.appendChild(quizTitle);
    quizCardBody.appendChild(quizDescription);

    quizCard.appendChild(quizCardBody);

    // Add click event listener to each card
    quizCard.addEventListener("click", function () {
      // On card click, fetch data for the particular spreadsheet
      window.open(`http://localhost:5500/final/public/?id=${id}&mode=edit`);
    });

    row.appendChild(quizCard);
  });
  hideSubheading();
  hideSlideshow();
}

let gapiInited = false;
let gDriveInited = false;
let gSheetsInited = false;

function initClient() {
  gapi.client.init({}).then(function () {
    gapi.client
      .load("https://www.googleapis.com/discovery/v1/apis/drive/v3/rest")
      .then(function () {
        gDriveInited = true;
        checkBeforeStart();
      });
    gapi.client
      .load("https://sheets.googleapis.com/$discovery/rest?version=v4")
      .then(function () {
        gSheetsInited = true;
        checkBeforeStart();
      });

    gapiInited = true;
    checkBeforeStart();
  });
}

// Load the Google Sheets API
export function gapiLoad() {
  gapi.load("client", initClient);
}

function checkBeforeStart() {
  if (gapiInited && gDriveInited && gSheetsInited) {
    // Start only when  gapi is initialized.
    document.getElementById("fetchSheets").classList.remove("disabled");
    if (window.user) {
      // fetchSheets();
    }
  }
}

function hideSignIn() {
  let signIn = document.getElementById("sign-in-container");
  signIn.classList.add("invisible");
}

function hideSubheading() {
  let subheadingMajor = document.getElementById("subheading-maj");
  subheadingMajor.classList.add("opacity-0");
  let subheadingMinor = document.getElementById("subheading-min");
  subheadingMinor.classList.add("opacity-0");
}

function hideSlideshow() {
  let slideshow = document.getElementById("slideshow");
  slideshow.classList.add("opacity-0");
}

function hideTutorial() {
  let tutorial = document.getElementsByClassName("tutorial")[0];
  tutorial.classList.add("opacity-0");
}

function displaySaveQuiz() {
  let saveQuiz = document.getElementById("saveQuiz");
  saveQuiz.classList.remove("opacity-0");
  saveQuiz.classList.add("opacity-1");
}

function displayRefreshQuiz() {
  let refreshQuiz = document.getElementById("refreshQuiz");
  refreshQuiz.classList.remove("opacity-0");
  refreshQuiz.classList.add("opacity-1");
}

function hideSaveQuiz() {
  let saveQuiz = document.getElementById("saveQuiz");
  saveQuiz.classList.remove("opacity-1");
  saveQuiz.classList.add("opacity-0");
}

function displayPublishedLink() {
  let publishedLink = document.getElementById("publishedLink");
  publishedLink.classList.remove("d-none");
  let publishedLinkURL = document.getElementById("publishedLinkURL");
  publishedLinkURL.href = `http://localhost:5500/final/public/?id=${window.sheetId}`;
  publishedLinkURL.innerText = `http://localhost:5500/final/public/?id=${window.sheetId}`;
  publishedLink.classList.remove("opacity-0");
  publishedLink.classList.add("opacity-1");
}

function displayError(err) {
  let error = document.getElementById("error");
  error.classList.remove("opacity-0");
  error.classList.add("opacity-1");
  error.classList.add("mt-4");
  let errorMessage = document.getElementById("errorMessage");
  errorMessage.innerHTML = err;
}

export function fetchSheets() {
  // gapiClient.callback = (resp) => {
  //   if (resp.error !== undefined) {
  //     throw resp;
  //   }

  // Show shimmer while loading sheets.
  toggleSheetsShimmer();

  // GIS has automatically updated gapi.client with the newly issued access token.
  window.gapiAccessToken = gapi.client.getToken()?.access_token;

  gapi.client.drive.files
    .list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      orderBy: "modifiedTime desc",
      fields: "files(id, name, modifiedTime)",
      pageSize: 9,
    })
    .then((response) => {
      const files = response.result.files;
      window.originalFiles = files;
      // Hide shimmer when sheets are fetched
      toggleSheetsShimmer();
      // Display search bar and search results
      displaySheetsSearch();
      displaySheetCards(files);
    })
    .catch((err) => console.log(err));

  // document.getElementById("search-button-label").innerText = "Refresh Sheets";
  document.getElementById("fetchSheets").classList.add("d-none");
}

function setAccessToken(token) {
  gapi.client.setToken({ access_token: token });
  window.gapiAccessToken = token;
}
function getAccessToken(response) {
  window.idToken = response.credential;
  const credential = GoogleProvider.credentialFromResult(response);
  const token = credential.accessToken;
  setAccessToken(token);
}

export function fetchUserData() {
  fetchQuizzes();
  fetchSheets();
}

async function fetchQuizzes() {
  const docRef = collection(db, "quizzes");
  const q = query(docRef, where("author_uid", "==", auth.currentUser.uid));
  const snapshot = await getDocs(q);
  let quizzes = [];
  snapshot.forEach((doc) => {
    quizzes.push([doc.id, doc.data()]);
  });

  displayQuizCards(quizzes);
}

export async function saveQuiz() {
  const quizgenData = window.quizgenData;
  const spreadsheetId = window.sheetId;

  try {
    await setDoc(doc(db, "quizzes", spreadsheetId), {
      ...quizgenData,
      author_uid: auth.currentUser.uid,
      last_published_at: serverTimestamp(),
    });
    hideSaveQuiz();
    displayPublishedLink();
  } catch (e) {
    console.log(e);
    displayError(e);
  }
}

export async function refreshQuiz() {
  if (gapi.client.getToken() == null || !gapi.client.sheets.spreadsheets) {
    signInWithGoogle(fetchDataForSpreadsheet.bind(null, [window.sheetId]));
  } else {
    fetchDataForSpreadsheet(window.sheetId);
  }
  let refreshQuiz = document.getElementById("refreshQuiz");
  refreshQuiz.classList.remove("opacity-1");
  refreshQuiz.classList.add("opacity-0");
  displaySaveQuiz();
}

export function signInWithGoogle(callback) {
  signIn(auth, googleAuthProvider)
    .then((result) => {
      getAccessToken(result);
      if (callback) callback();
    })
    .catch((error) => {
      console.log(error);
    });
}

export function onStart() {
  gapiLoad();
  // gisInit();
  init();
  shuffleImages();
  setSlideshowHeight();
}

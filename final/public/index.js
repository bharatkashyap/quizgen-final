import {
  fetchSheets,
  debouncedSearch,
  onStart,
  fetchUserData,
  scrollToGrid,
  refreshQuiz,
  invert,
  signInWithGoogle,
  saveQuiz,
} from "./main.js";

window.signInWithGoogle = signInWithGoogle;
window.fetchSheets = fetchSheets;
window.fetchUserData = fetchUserData;
window.searchSheets = debouncedSearch;
window.scrollToGrid = scrollToGrid;
window.invert = invert;
window.refreshQuiz = refreshQuiz;
window.saveQuiz = saveQuiz;

window.onload = onStart;

'use strict';

// Events on multiple elements
const addEventOnElements = function (elements, eventType, callback) {
  for (const elem of elements) elem.addEventListener(eventType, callback);
};

// Toggle search box in mobile device || small screen
const searchBox = document.querySelector('[search-box]');
const searchTogglers = document.querySelectorAll('[search-toggler]');

addEventOnElements(searchTogglers, 'click', function () {
  searchBox.classList.toggle('active');
});

// store movieId in localStorage when you click any movie card

const getMovieDetail = function (movieId) {
  window.localStorage.setItem('movieId', String(movieId));
};

const getMovieList = function (urlParam, genreName) {
  window.localStorage.setItem('urlParam', urlParam);
  window.localStorage.setItem('genreName', genreName);
};

const getMovieKeyword = function (keyword) {
  window.localStorage.setItem('Keyword', keyword);
};

const getActorDetail = function (actorId) {
  window.localStorage.setItem('actorId', actorId);
};

const getSavedMovies = function (element, movieID) {
  const savedMovies = JSON.parse(window.localStorage.getItem('SavedMovies')) || [];

  const movieIndex = savedMovies.indexOf(movieID);

  if (movieIndex === -1) {
    savedMovies.push(movieID);
    window.localStorage.setItem('SavedMovies', JSON.stringify(savedMovies));
    element.classList.toggle('saved');
    element.classList.toggle('removed');
  } else {
    savedMovies.splice(movieIndex, 1);
    window.localStorage.setItem('SavedMovies', JSON.stringify(savedMovies));
    element.classList.toggle('saved');
    element.classList.toggle('removed');
  }
  if (location.hash.startsWith('#favorites')) {
    location.reload();
  }
};

const reloadPageWithFavorites = function () {
  window.location.hash = '#favorites';
  location.reload();
};

'use strict';

// import all components and functions
import { sidebar } from './sidebar.js';
import { API_KEY, imageBaseURL, fetchDataFromServer } from './api.js';
import { createPostBox, createMovieCard } from './movie-card.js';
import { Search } from './search.js';

const pageContent = document.querySelector('[page-content]');
const savedMovies = JSON.parse(window.localStorage.getItem('SavedMovies')) || [];

sidebar();

// Home page sections (Top rated, Upcoming, Trending movies)
const homePageSections = [
  {
    title: 'Upcoming Movies',
    path: '/movie/upcoming',
  },
  {
    title: "This Week's Trending Movies",
    path: '/trending/movie/week',
  },
  {
    title: 'Top Rated Movies',
    path: '/movie/top_rated',
  },
  {
    title: 'Now Playing Movies',
    path: '/movie/now_playing',
  },
];

// fetch all genres eg: [ { 'id': '123', 'name': 'Action' } ]
// then change genre format eg: { 123: 'Action' }
const genreList = {
  // create genre string from genre_id eg: [ 23, 43 ] -> 'Action, Romance'.
  asString(genreIdList) {
    let newGenreList = [];
    for (const genreId of genreIdList) {
      this[genreId] && newGenreList.push(this[genreId]); // this == genreList;
    }
    return newGenreList.join(', ');
  },
};

fetchDataFromServer(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`, function ({ genres }) {
  for (const { id, name } of genres) {
    genreList[id] = name;
  }
  fetchDataFromServer(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=1`, heroBanner);
});

const heroBanner = function ({ results: movieList }) {
  const container = document.querySelector('.container');
  const banner = document.createElement('section');
  banner.classList.add('banner');
  banner.ariaLabel = 'Popular Movies';

  banner.innerHTML = `
        <div class="banner-slider"></div>
        <div class="slider-control">
            <div class="control-inner"></div>
        </div>
    `;

  let controlItemIndex = 0;

  for (const [index, movie] of movieList.entries()) {
    const { backdrop_path, title, release_date, genre_ids, overview, poster_path, vote_average, id } = movie;

    const movieId = id.toString();
    const isSaved = savedMovies.includes(movieId);

    const sliderItem = document.createElement('div');
    sliderItem.classList.add('slider-item');
    sliderItem.setAttribute('slider-item', '');

    sliderItem.innerHTML = `
            <img src="${imageBaseURL}${backdrop_path}" alt="Poster of ${title}" class="img-cover" loading=${
      index === 0 ? 'eager' : 'lazy'
    }>
            <div class="banner-content">
                <h2 class="heading">${title}</h2>
                <div class="meta-list">
                    <div class="meta-item">${release_date.split('-')[0]}</div>
                    <div class="meta-item card-badge">${vote_average.toFixed(1)}</div>
                </div>
                <p class="genre">${genreList.asString(genre_ids)}</p>
                <p class="banner-text">${overview}</p>
                <div class="meta-list saved-m">
                    <a href="./detail.html" class="btn" onclick="getMovieDetail(${id})">
                        <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
                        <span class="span">More Info</span>
                    </a>
                    <button class="btn-saved btn-secondary has-state ${
                      isSaved ? 'saved' : 'removed'
                    }" aria-label="Add to saved movies" onclick="getSavedMovies(this, '${movieId}')">
                        <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                        <i class="fa-solid fa-bookmark bookmark" aria-hidden="true"></i>
                        <span class="save-text">Save</span>
                        <span class="unsaved-text">Unsave</span>
                    </button>
                </div>
            </div>
        `;

    banner.querySelector('.banner-slider').appendChild(sliderItem);

    const controlItem = document.createElement('button');
    controlItem.classList.add('poster-box', 'slider-item');
    controlItem.setAttribute('slider-control', `${controlItemIndex}`);

    controlItemIndex++;

    controlItem.innerHTML = `
            <img src="${imageBaseURL}${poster_path}" alt="Slide to ${title}" loading="lazy" draggable="false" class="img-cover">
        `;
    banner.querySelector('.control-inner').appendChild(controlItem);
  }

  pageContent.insertBefore(banner, container.firstChild);

  addHeroSlide();

  // fetch data for home page sections (top rated, upcoming, trending)
  for (const { title, path } of homePageSections) {
    fetchDataFromServer(`https://api.themoviedb.org/3${path}?api_key=${API_KEY}&page=1`, createMovieList, title);
  }
};

// Hero Slider functionality
const addHeroSlide = function () {
  const sliderItems = document.querySelectorAll('[slider-item]');
  const sliderControls = document.querySelectorAll('[slider-control]');

  let lastSliderItem = sliderItems[0];
  let lastSliderControl = sliderControls[0];

  lastSliderItem.classList.add('active');
  lastSliderControl.classList.add('active');

  const sliderStart = function () {
    lastSliderItem.classList.remove('active');
    lastSliderControl.classList.remove('active');

    // 'this' == slider-control
    sliderItems[Number(this.getAttribute('slider-control'))].classList.add('active');
    this.classList.add('active');

    lastSliderItem = sliderItems[Number(this.getAttribute('slider-control'))];
    lastSliderControl = this;
  };

  addEventOnElements(sliderControls, 'click', sliderStart);
};

const createMovieList = function ({ results: movieList }, title) {
  const movieListElem = document.createElement('section');
  movieListElem.classList.add('movie-list');
  movieListElem.ariaLabel = `${title}`;

  movieListElem.innerHTML = `
        <div class="title-wrapper">
            <h3 class="title-large">${title}</h3>
        </div>
        <div class="slider-list">
            <div class="slider-inner"></div>
        </div>
    `;

  for (const movie of movieList) {
    const card = createMovieCard(movie); // called from movie_card.js
    movieListElem.querySelector('.slider-inner').appendChild(card);
  }

  pageContent.appendChild(movieListElem);
};

Search();

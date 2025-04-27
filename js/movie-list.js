'use strict';

import { API_KEY, fetchDataFromServer } from './api.js';
import { sidebar } from './sidebar.js';
import { createMovieCard } from './movie-card.js';
import { Search } from './search.js';

// collect genre name & url parameter from local storage
const genreName = window.localStorage.getItem('genreName');
const urlParam = window.localStorage.getItem('urlParam');
const keyword = window.localStorage.getItem('Keyword');
const savedMovies = JSON.parse(window.localStorage.getItem('SavedMovies')) || [];
const pageContent = document.querySelector('[page-content]');

sidebar();

let currentPage = 1;
let totalPages = 0;

if (location.hash.startsWith('#keyword')) {
  fetchDataFromServer(
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
      keyword
    )}&page=${currentPage}`,
    function ({ results: movieList, total_pages, total_results }) {
      totalPages = total_pages;
      if (total_results === 0) {
        document.title = `${keyword} Movies | MovieVerse`;

        const movieListElem = document.createElement('section');
        movieListElem.classList.add('movie-list', 'genre-list');
        movieListElem.ariaLabel = `${keyword} Movies`;

        movieListElem.innerHTML = `
                <div class="title-wrapper">
                    <h3 class="heading">No Movies Found For ${keyword}</h3>
                </div>
            `;

        pageContent.appendChild(movieListElem);
      } else if (totalPages === 1) {
        document.title = `${keyword} Movies | MovieVerse`;

        const movieListElem = document.createElement('section');
        movieListElem.classList.add('movie-list', 'genre-list');
        movieListElem.ariaLabel = `${keyword} Movies`;

        movieListElem.innerHTML = `
                <div class="title-wrapper">
                    <h3 class="heading">All ${keyword} Movies</h3>
                </div>
                <div class="grid-list"></div>
            `;

        // add movie card based on fetched item
        for (const movie of movieList) {
          const movieCard = createMovieCard(movie);

          movieListElem.querySelector('.grid-list').appendChild(movieCard);
        }

        pageContent.appendChild(movieListElem);
      } else {
        document.title = `${keyword} Movies | MovieVerse`;

        const movieListElem = document.createElement('section');
        movieListElem.classList.add('movie-list', 'genre-list');
        movieListElem.ariaLabel = `${keyword} Movies`;

        movieListElem.innerHTML = `
                <div class="title-wrapper">
                    <h3 class="heading">All ${keyword} Movies</h3>
                </div>
                <div class="grid-list"></div>
                <button class="btn load-more" load-more>Load More</button>
            `;

        // add movie card based on fetched item
        for (const movie of movieList) {
          const movieCard = createMovieCard(movie);

          movieListElem.querySelector('.grid-list').appendChild(movieCard);
        }

        pageContent.appendChild(movieListElem);

        // load more button funcionality
        document.querySelector('[load-more]').addEventListener('click', function () {
          if (currentPage >= totalPages) {
            this.style.display = 'none'; // this == loading-btn
            return;
          }
          currentPage++, this.classList.add('loading'); // this == loading-btn
          fetchDataFromServer(
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
              keyword
            )}&page=${currentPage}`,
            ({ results: movieList }) => {
              this.classList.remove('loading'); // this == loading-btn
              for (const movie of movieList) {
                const movieCard = createMovieCard(movie);
                movieListElem.querySelector('.grid-list').appendChild(movieCard);
              }
            }
          );
        });
      }
    }
  );
} else if (location.hash.startsWith('#favorites')) {
  document.title = `Saved Movies | MovieVerse`;

  const mobileNavLink = document.querySelectorAll('.mobile-nav .nav-list .nav-item .nav-link');
  mobileNavLink[1].setAttribute('aria-current', 'true');

  const movieListElem = document.createElement('section');
  movieListElem.classList.add('movie-list', 'genre-list');
  movieListElem.ariaLabel = `Favorites Movies`;

  if (savedMovies.length === 0) {
    movieListElem.innerHTML = `
            <div class="title-wrapper">
                <h3 class="heading">You still haven't add any movie</h3>
            </div>
        `;
  } else {
    movieListElem.innerHTML = `
            <div class="title-wrapper">
                <h3 class="heading">All Your Favorite Movies</h3>
            </div>
            <div class="grid-list"></div>
            <button class="btn load-more-sec" load-more></button>
        `;

    for (const movieId of savedMovies) {
      fetchDataFromServer(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`, function (movie) {
        const movieCard = createMovieCard(movie);
        movieListElem.querySelector('.grid-list').appendChild(movieCard);
      });
    }
  }

  pageContent.appendChild(movieListElem);
} else {
  fetchDataFromServer(
    `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&include_adult=false&page=${currentPage}&${urlParam}`,
    function ({ results: movieList, total_pages }) {
      totalPages = total_pages;
      document.title = `${genreName} Movies | CineVerse`;

      const movieListElem = document.createElement('section');
      movieListElem.classList.add('movie-list', 'genre-list');
      movieListElem.ariaLabel = `${genreName} Movies`;

      movieListElem.innerHTML = `
            <div class="title-wrapper">
                <h3 class="heading">All ${genreName} Movies</h3>
            </div>
            <div class="grid-list"></div>
            <button class="btn load-more" load-more>Load More</button>
        `;

      // add movie card based on fetched item
      for (const movie of movieList) {
        const movieCard = createMovieCard(movie);

        movieListElem.querySelector('.grid-list').appendChild(movieCard);
      }

      pageContent.appendChild(movieListElem);

      // load more button funcionality
      document.querySelector('[load-more]').addEventListener('click', function () {
        if (currentPage >= totalPages) {
          this.style.display = 'none'; // this == loading-btn
          return;
        }
        currentPage++, this.classList.add('loading'); // this == loading-btn
        fetchDataFromServer(
          `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&include_adult=false&page=${currentPage}&${urlParam}`,
          ({ results: movieList }) => {
            this.classList.remove('loading'); // this == loading-btn
            for (const movie of movieList) {
              const movieCard = createMovieCard(movie);
              movieListElem.querySelector('.grid-list').appendChild(movieCard);
            }
          }
        );
      });
    }
  );
}

Search();

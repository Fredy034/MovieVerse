'use strict';

import { imageBaseURL, fetchDataFromServer, API_KEY } from './api.js';

const savedMovies = JSON.parse(window.localStorage.getItem('SavedMovies')) || [];

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
});

// POST-BOX
{
  /* <div class="post-box">
    <div class="post-overlay">
        <button class="bookmark">
            <i class="fa-regular fa-bookmark"></i>
        </button>
        <button class="rating">
            <i class="fa-regular fa-star"></i>
            <span>8.3</span>
        </button>
        <a href="./detail.html" class="more-info" title="Indiana Jones: The Dial of Destiny">
            <i class="fa-solid fa-circle-info"></i>
        </a>
    </div>
    <figure class="post-img">
        <img src="https://artofthemovies.co.uk/cdn/shop/products/venom_hardy_style_teaser_EB05938_B-893199.jpg?v=1611688561" alt="" class="img-cover">
    </figure>
    <div class="movie-text">
        <div class="meta-list">
            <div class="movie-year">2022</div>
            <div class="movie-name">Indiana Jones: The Dial of Destiny</div>
        </div>
        <p class="genre">Animation, Action, Adventure</p>
    </div>
</div> */
}

// MOVIE CARD
{
  /* <div class="movie-card">
    <figure class="poster-box card-banner">
        <img src="./assets/images/slider-control.jpg" alt="Puss in Boots: The Last Wish" class="img-cover">
    </figure>
    <h4 class="title">Puss in Boots: The Last Wish</h4>
    <div class="meta-list">
        <div class="meta-item">
            <img src="./assets/images/star.png" width="20" height="20" loading="lazy" alt="rating">
            <span class="span">8.4</span>
        </div>
        <div class="card-badge">2022</div>
        <a href="./detail.html" class="card-btn" title="Puss in Boots: The Last Wish"></a>
    </div>
</div> */
}

// post-box
export function createPostBox(movie) {
  const { poster_path, title, vote_average, release_date, genre_ids, id } = movie;

  const post = document.createElement('div');
  post.classList.add('post-box');

  post.innerHTML = `
        <div class="post-overlay">
            <button class="bookmark">
                <i class="fa-regular fa-bookmark"></i>
            </button>
            <button class="rating">
                <i class="fa-regular fa-star"></i>
                <span>${vote_average.toFixed(1)}</span>
            </button>
            <a href="./detail.html" class="more-info" title="${title}" onclick="getMovieDetail(${id})">
                <i class="fa-solid fa-circle-info"></i>
            </a>
        </div>
        <figure class="post-img">
            <img src="${imageBaseURL}${poster_path}" alt="${title}" class="img-cover">
        </figure>
        <div class="movie-text">
            <div class="meta-list">
                <div class="movie-year">${release_date.split('-')[0]}</div>
                <div class="movie-name">${title}</div>
            </div>
            <p class="genre">${genreList.asString(genre_ids)}</p>
        </div>
    `;

  return post;
}

// movie-card
export function createMovieCard(movie) {
  const { poster_path, title, vote_average, release_date, id } = movie;

  const movieId = id.toString();
  const isSaved = savedMovies.includes(movieId);

  const card = document.createElement('div');
  card.classList.add('movie-card');

  card.innerHTML = `
        <figure class="poster-box card-banner">
            <img src="${imageBaseURL}${poster_path}" alt="${title}" class="img-cover">
        </figure>
        <h4 class="title">${title}</h4>
        <div class="meta-list">
            <div class="meta-wrapper">
                <div class="meta-item">
                    <i class="fa-regular fa-star"></i>
                    <span class="span">${vote_average.toFixed(1)}</span>
                </div>
                <div class="card-badge">${release_date.split('-')[0]}</div>
            </div>  
            <button class="icon-btn btn-bg has-state ${
              isSaved ? 'saved' : 'removed'
            }" aria-label="Add to saved movies" onclick="getSavedMovies(this, '${id}')">
                <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                <i class="fa-solid fa-bookmark bookmark" aria-hidden="true"></i>
            </button>
            <a href="./detail.html" class="card-btn" title="${title}" onclick="getMovieDetail(${id})"></a>
        </div>
    `;

  return card;
}

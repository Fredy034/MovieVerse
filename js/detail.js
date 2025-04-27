'use strict';

import { API_KEY, imageBaseURL, fetchDataFromServer } from './api.js';
import { sidebar } from './sidebar.js';
import { createMovieCard, createPostBox } from './movie-card.js';
import { Search } from './search.js';

const movieId = window.localStorage.getItem('movieId');
const savedMovies = JSON.parse(window.localStorage.getItem('SavedMovies')) || [];
const pageContent = document.querySelector('[page-content]');

sidebar();

const getDuration = function (runtime) {
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  return `${hours}h ${minutes}min`;
};

const getGenres = function (genreList) {
  const newGenreList = [];
  for (const { name } of genreList) newGenreList.push(name);
  return newGenreList.join(', ');
};

const getCasts = function (castList) {
  const newCastList = [];
  for (let i = 0, len = castList.length; i < len && i < 10; i++) {
    const { name, character, id } = castList[i];
    const actorLink = `<a href="./actor-detail.html" onclick='getActorDetail("${id}")'>${name} (${character}),</a>`;
    newCastList.push(actorLink);
  }
  return newCastList.join(' ');
};

const getDirectors = function (crewList) {
  const directors = crewList.filter(({ job }) => job === 'Director');
  const directorList = [];
  for (const { name } of directors) directorList.push(name);
  return directorList.join(', ');
};

const getLanguage = function (langCode) {
  const languages = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ru: 'Russian',
  };
  return languages[langCode] || 'Unknown';
};

const getKeywordsList = function (keywords) {
  if (Array.isArray(keywords) && keywords.length > 0) {
    const keywordListItems = keywords.map((keyword) => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `
                <a href="./movie-list.html#keyword" onclick='getMovieKeyword("${keyword.name}")'>${keyword.name}</a>
            `;
      return listItem.outerHTML;
    });
    return keywordListItems.join('');
  } else {
    return [];
  }
};

const formatReleaseDate = function (dateString) {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const formatCurrency = function (amount) {
  if (amount === 0) {
    return 'undisclosed';
  } else {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
};

const createSocialLink = function (href, iconClass, title) {
  const link = document.createElement('a');
  link.target = '_blank';
  link.href = href;
  link.className = 'social';
  link.title = title;

  const icon = document.createElement('i');
  icon.className = iconClass;

  link.appendChild(icon);
  return link;
};

const filterVideos = function (videoList) {
  return videoList.filter(({ type, site }) => (type === 'Trailer' || type === 'Teaser') && site === 'YouTube');
};

fetchDataFromServer(
  `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=casts,videos,images,releases,external_ids,keywords`,
  function (movie) {
    try {
      const {
        backdrop_path,
        poster_path,
        title,
        release_date,
        runtime,
        vote_average,
        original_language,
        releases: {
          countries: [{ certification }],
        },
        genres,
        overview,
        tagline,
        status,
        budget,
        revenue,
        casts: { cast, crew },
        videos: { results: videos },
        homepage,
        external_ids: { facebook_id, instagram_id, twitter_id, imdb_id },
        keywords: { keywords },
      } = movie;

      document.title = `${title} | MovieVerse`;

      const isSaved = savedMovies.includes(movieId);

      const movieDetail = document.createElement('section');
      movieDetail.classList.add('movie-detail');

      movieDetail.innerHTML = `
            <div class="backdrop-image" style="background-image: url('${imageBaseURL}${
        backdrop_path || poster_path
      }');"></div>
            <figure class="poster-box movie-poster">
                <img src="${imageBaseURL}${poster_path}" alt="${title} poster" class="img-cover">
            </figure>
            <div class="detail-box">
                <div class="detail-content">
                    <div class="meta-list saved-m">
                        <h1 class="heading">${title}</h1>
                        <button class="btn-saved btn-secondary has-state ${
                          isSaved ? 'saved' : 'removed'
                        }" aria-label="Add to saved movies" onclick="getSavedMovies(this, '${movieId}')">
                            <span class="material-symbols-outlined bookmark-add" aria-hidden="true">bookmark_add</span>
                            <i class="fa-solid fa-bookmark bookmark" aria-hidden="true"></i>

                            <span class="save-text">Save</span>
                            <span class="unsaved-text">Unsave</span>
                        </button>
                    </div>
                    <div class="meta-list">
                        <div class="meta-item">
                            <i class="fa-regular fa-star"></i>
                            <span class="span">${vote_average.toFixed(1)}</span>
                        </div>
                        <div class="separator"></div>
                        <div class="meta-item">${getDuration(runtime)}</div>
                        <div class="separator"></div>
                        <div class="meta-item">${formatReleaseDate(release_date)}</div>
                        <div class="separator"></div>
                        <div class="meta-item card-badge">${certification}</div>
                    </div>
                    <p class="genre">${getGenres(genres)}</p>
                    <p class="tagline">${tagline}</p>
                    <p class="overview"><strong>Overview</strong><br>${overview}</p>
                    <ul class="detail-list">
                        <div class="list-item">
                            <p class="list-name">Social</p>
                            <div class="social-links"></div>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Starring</p>
                            <div class="list-actor">${getCasts(cast)}.</div>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Directed By</p>
                            <p>${getDirectors(crew)}</p>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Status</p>
                            <p>${status}</p>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Language</p>
                            <p>${getLanguage(original_language)}</p>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Budget</p>
                            <p>${formatCurrency(budget)}</p>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Revenue</p>
                            <p>${formatCurrency(revenue)}</p>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Keywords</p>
                            <ul class="keywords">
                                ${getKeywordsList(keywords)}
                            </ul>
                        </div>
                    </ul>
                </div>
                <div class="title-wrapper">
                    <h3 class="title-large">Trailers and Clips</h3>
                </div>
                <div class="slider-list">
                    <div class="slider-inner"></div>
                </div>
            </div>
        `;

      const socialLinksContainer = movieDetail.querySelector('.social-links');

      if (facebook_id) {
        const facebookLink = createSocialLink(
          `https://www.facebook.com/${facebook_id}`,
          'fa-brands fa-facebook',
          'Visit Facebook'
        );
        socialLinksContainer.appendChild(facebookLink);
      }
      if (twitter_id) {
        const twitterLink = createSocialLink(
          `https://twitter.com/${twitter_id}`,
          'fa-brands fa-twitter',
          'Visit Twitter'
        );
        socialLinksContainer.appendChild(twitterLink);
      }
      if (instagram_id) {
        const instagramLink = createSocialLink(
          `https://instagram.com/${instagram_id}`,
          'fa-brands fa-instagram',
          'Visit Instagram'
        );
        socialLinksContainer.appendChild(instagramLink);
      }
      if (homepage) {
        const homepageLink = createSocialLink(homepage, 'fa-solid fa-link', 'Visit Homepage');
        const homepageContainer = document.createElement('div');
        homepageContainer.className = 'social-container';
        homepageContainer.appendChild(homepageLink);
        socialLinksContainer.appendChild(homepageContainer);
      }
      if (imdb_id) {
        const imdbLink = createSocialLink(`https://www.imdb.com/title/${imdb_id}`, 'fa-brands fa-imdb', 'Visit IMDb');
        const imdbContainer = document.createElement('div');
        imdbContainer.className = 'social-container';
        imdbContainer.appendChild(imdbLink);
        socialLinksContainer.appendChild(imdbContainer);
      }

      for (const { key, name } of filterVideos(videos)) {
        const videoCard = document.createElement('div');
        videoCard.classList.add('video-card');

        videoCard.innerHTML = `
                <iframe width="500" height="294" src="https://www.youtube.com/embed/${key}?theme=dark&color=white&rel=0?enablejsapi=1" frameborder="0"  allowfullscreen="1" title="${name}" class="img-cover" loading="lazy"></iframe>
            `;

        movieDetail.querySelector('.slider-inner').appendChild(videoCard);
      }

      pageContent.appendChild(movieDetail);

      // recommendations
      fetchDataFromServer(
        `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}&page=1`,
        addSuggestedMovies
      );
    } catch (error) {
      console.error('Error al obtener los detalles de la película de la API de TMDb:', error);
    }
  }
);

const addSuggestedMovies = function ({ results: movieList }, title) {
  const movieListElem = document.createElement('section');
  movieListElem.classList.add('movie-list');
  movieListElem.ariaLabel = 'You May Also Like';

  movieListElem.innerHTML = `
        <div class="title-wrapper">
            <h3 class="title-large">You May Also Like</h3>
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

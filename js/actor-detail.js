'use strict';

import { API_KEY, imageBaseURL, fetchDataFromServer } from './api.js';
import { sidebar } from './sidebar.js';
import { createMovieCard, createPostBox } from './movie-card.js';
import { Search } from './search.js';

const actorId = window.localStorage.getItem('actorId');
const pageContent = document.querySelector('[page-content]');

sidebar();

const getCurrentAge = function (birthday) {
  const birthDate = new Date(birthday);
  const currentDate = new Date();

  const age = currentDate.getFullYear() - birthDate.getFullYear();

  return `${birthday} (${age} years old)`;
};

const getBiography = function (biography) {
  const biographyParagraphs = biography.split('\n');

  const biographyContainer = document.createElement('div');
  biographyContainer.classList.add('biography');

  biographyContainer.innerHTML = `
        <strong>Biography</strong>
    `;

  biographyParagraphs.forEach((paragraph) => {
    const pElement = document.createElement('p');
    pElement.textContent = paragraph;
    biographyContainer.appendChild(pElement);
  });

  return biographyContainer;
};

const getGender = function (gender) {
  if (gender === 1) {
    return 'Female';
  } else if (gender === 2) {
    return 'Male';
  } else {
    return 'Unknown';
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

fetchDataFromServer(
  `https://api.themoviedb.org/3/person/${actorId}?api_key=${API_KEY}&append_to_response=external_ids,movie_credits`,
  function (actor) {
    try {
      const {
        also_known_as,
        biography,
        birthday,
        gender,
        homepage,
        known_for_department,
        name,
        place_of_birth,
        popularity,
        profile_path,
        external_ids: { facebook_id, instagram_id, twitter_id },
        movie_credits: { cast, crew },
      } = actor;

      document.title = `${name} | MovieVerse`;

      const actorDetail = document.createElement('section');
      actorDetail.classList.add('actor-detail');

      actorDetail.innerHTML = `
            <figure class="actor-box">
                <img src="${imageBaseURL}${profile_path}" alt="${name}" class="img-cover">
            </figure>
            <div class="detail-box">
                <div class="detail-content">
                    <div class="actor-title">
                        <h1 class="heading">${name}</h1>
                        <div class="meta-list">
                            <div class="meta-item">
                                <i class="fa-regular fa-star"></i>
                                <span class="span">${popularity.toFixed(1)}</span>
                            </div>
                            <div class="separator"></div>
                            <div class="social-links"></div>
                        </div>
                    </div>
                    <ul class="detail-list">
                        <div class="list-item">
                            <p class="list-name">Known For</p>
                            <p>${known_for_department}</p>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Gender</p>
                            <p>${getGender(gender)}</p>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Birthday</p>
                            <p>${getCurrentAge(birthday)}</p>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Place of Birth</p>
                            <p>${place_of_birth}</p>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Known Credits</p>
                            <p>${cast.length}</p>
                        </div>
                        <div class="list-item">
                            <p class="list-name">Also Known As</p>
                            <div class="list-known">
                                <p>${also_known_as.join(', ')}</p>
                            </div>
                        </div>
                    </ul>
                    <div class="biography">
                        ${getBiography(biography).innerHTML}
                    </div>
                    <div class="credits-list">
                        <div class="title-wrapper">
                            <h3 class="title-large">Acting</h3>
                        </div>
                        <table class="credits">
                            <tbody>
                                
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

      const socialLinksContainer = actorDetail.querySelector('.social-links');

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
        const homepageLink = createSocialLink(`${homepage}`, 'fa-solid fa-link', 'Visit Homepage');
        socialLinksContainer.appendChild(homepageLink);
      }

      const createCreditsTable = function (cast) {
        const table = actorDetail.querySelector('.credits tbody');

        const creditGroups = {};

        cast.forEach((credit) => {
          const year = new Date(credit.release_date).getFullYear();
          if (!creditGroups[year]) {
            creditGroups[year] = [];
          }
          creditGroups[year].push(credit);
        });

        const sortedYears = Object.keys(creditGroups).sort((a, b) => {
          if (isNaN(a) && !isNaN(b)) {
            return -1;
          } else if (!isNaN(a) && isNaN(b)) {
            return 1;
          } else {
            return b - a;
          }
        });

        for (const year in sortedYears) {
          if (creditGroups.hasOwnProperty(sortedYears[year])) {
            const group = creditGroups[sortedYears[year]];

            const yearRow = document.createElement('tr');
            table.appendChild(yearRow);

            const roleTd = document.createElement('td');
            yearRow.appendChild(roleTd);

            const yearTable = document.createElement('table');
            yearTable.classList.add('credit-group');
            roleTd.appendChild(yearTable);

            const yearTbody = document.createElement('tbody');
            yearTable.appendChild(yearTbody);

            group.forEach((credit) => {
              const creditRow = document.createElement('tr');
              yearTbody.appendChild(creditRow);

              const creditTdYear = document.createElement('td');
              creditTdYear.classList.add('year');
              if (isNaN(sortedYears[year])) {
                creditTdYear.textContent = 'Soon';
              } else {
                creditTdYear.textContent = sortedYears[year];
              }
              creditRow.appendChild(creditTdYear);

              const creditTdRole = document.createElement('td');
              creditTdRole.classList.add('role');
              creditRow.appendChild(creditTdRole);

              const movieTitleLink = document.createElement('a');
              movieTitleLink.classList.add('movie-title');
              movieTitleLink.textContent = credit.title;

              const characterSpan = document.createElement('span');
              characterSpan.classList.add('character');

              if (!isNaN(sortedYears[year])) {
                movieTitleLink.href = `./detail.html`;
                movieTitleLink.onclick = function () {
                  getMovieDetail(credit.id);
                };

                characterSpan.textContent = 'as ';

                const characterName = document.createElement('span');
                characterName.classList.add('characters');
                characterName.textContent = `${credit.character}`;

                characterSpan.appendChild(characterName);
              }

              creditTdRole.appendChild(movieTitleLink);
              creditTdRole.appendChild(characterSpan);
            });
          }
        }
        return table;
      };

      createCreditsTable(cast);

      pageContent.appendChild(actorDetail);

      cast.sort((a, b) => b.popularity - a.popularity);
      const top10Movies = cast.slice(0, 10);

      addKnownMovies(top10Movies);
    } catch (error) {
      console.error('Error al obtener los detalles de la película de la API de TMDb:', error);
    }
  }
);

const addKnownMovies = function (movieList) {
  const movieListElem = document.createElement('section');
  movieListElem.classList.add('movie-list');
  movieListElem.ariaLabel = 'Known For';

  movieListElem.innerHTML = `
        <div class="title-wrapper">
            <h3 class="title-large">Known For</h3>
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

'use strict';

import { API_KEY, fetchDataFromServer } from './api.js';

export function sidebar() {
  // fetch all genres eg: [ { 'id': '123', 'name': 'Action' } ]
  // then change genre format eg: { 123: 'Action' }
  const genreList = {};

  fetchDataFromServer(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`, function ({ genres }) {
    for (const { id, name } of genres) {
      genreList[id] = name;
    }
    genreLink();
  });

  const sidebarInner = document.createElement('div');
  sidebarInner.classList.add('sidebar-inner');

  sidebarInner.innerHTML = `
        <div class="sidebar-list">
            <p class="title">Genre</p>
        </div>
        <div class="sidebar-list">
            <p class="title">Language</p>
            <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=en", "English")'>English</a>
            <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=es", "Spanish")'>Spanish</a>
            <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=fr", "French")'>French</a>

            <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=de", "German")'>German</a>
            <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=it", "Italian")'>Italian</a>
            <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=pt", "Portuguese")'>Portuguese</a>
            <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=ja", "Japanese")'>Japanese</a>
            <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=zh", "Chinese")'>Chinese</a>
            <a href="./movie-list.html" menu-close class="sidebar-link" onclick='getMovieList("with_original_language=ru", "Russian")'>Russian</a>
        </div>
        <div class="sidebar-footer">
            <p class="copyright">Copyright 2023 | <a target="_blank" href="../index.html">Fredy Quintero</a></p>
            <p class="copyright">This product uses the TMDb API but is not endorsed or certified by TMDB.</p>
            <div class="references-container">
                <a target="_blank" href="https://www.themoviedb.org/?language=en"><img src="./assets/tmdb-logo.svg" alt="The Movie DataBase Logo"></a>
                <a target="_blank" href="https://fontawesome.com/"><img src="./assets/fontawesome-logo.png" alt="Font-Awesome Logo"></a>
            </div>
        </div>
    `;

  const genreLink = function () {
    for (const [genreId, genreName] of Object.entries(genreList)) {
      const link = document.createElement('a');
      link.classList.add('sidebar-link');
      link.setAttribute('href', './movie-list.html');
      link.setAttribute('onclick', `getMovieList("with_genres=${genreId}", "${genreName}")`);
      link.textContent = genreName;
      sidebarInner.querySelectorAll('.sidebar-list')[0].appendChild(link);
    }
    const sidebar = document.querySelector('[sidebar]');
    sidebar.appendChild(sidebarInner);
    toggleSidebar(sidebar);
  };

  const toggleSidebar = function (sidebar) {
    // Toggle sidebar in mobile screen
    const sidebarBtn = document.querySelector('[menu-btn]');
    const sidebarTogglers = document.querySelectorAll('[menu-toggler]');
    const sidebarClose = document.querySelectorAll('[menu-close]');
    const overlay = document.querySelector('[overlay]');

    addEventOnElements(sidebarTogglers, 'click', function () {
      sidebar.classList.toggle('active');
      sidebarBtn.classList.toggle('active');
      overlay.classList.toggle('active');
    });

    addEventOnElements(sidebarClose, 'click', function () {
      sidebar.classList.remove('active');
      sidebarBtn.classList.remove('active');
      overlay.classList.remove('active');
    });
  };
}

'use strict';
console.log('Loading API...');
import { API_KEY_SECRET } from '../secret.js'; // Import the API key from a separate file

const API_KEY = API_KEY_SECRET;
const imageBaseURL = 'https://image.tmdb.org/t/p/original';

/**
 * Fetch data from a server using the 'url' and passes the result in JSON data to a 'callback'
 * function, along with an optional parameter if has 'optionalParam'.
 */

const fetchDataFromServer = function (url, callback, optionalParam) {
  try {
    fetch(url)
      .then((response) => response.json())
      .then((data) => callback(data, optionalParam));
  } catch (error) {
    console.error('Error al obtener datos de la API de TMDb para el PostContainer:', error);
  }
};

export { imageBaseURL, API_KEY, fetchDataFromServer };

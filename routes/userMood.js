// userMood.js
const express = require('express');
const router = express.Router();
const { spotifyApi } = require('./spotifyAuthRoutes');
require('dotenv').config();

// Middleware to check and refresh token
const ensureAuthenticated = async (req, res, next) => {
  try {
    if (!spotifyApi.getAccessToken()) {
      return res.status(401).json({ error: 'Access token is missing' });
    }

    // Refresh token if it's about to expire
    const tokenData = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(tokenData.body['access_token']);
    next();
  } catch (err) {
    console.error('Error refreshing access token:', err);
    res.status(500).json({ error: 'Failed to refresh access token' });
  }
};

// Route to handle mood-based music recommendations
router.post('/music', ensureAuthenticated, async (req, res) => {
  const { mood } = req.body;

  // Validate mood input
  if (!['happy', 'sad', 'dance'].includes(mood)) {
    return res.status(400).json({ error: 'Invalid mood provided' });
  }

  try {
    let query = '';

    // Determine the search query based on mood
    switch (mood) {
      case 'happy':
        query = 'happy music';
        break;
      case 'sad':
        query = 'sad music';
        break;
      case 'dance':
        query = 'dance music';
        break;
      default:
        query = 'music';
    }

    // Search for albums related to the mood
    const data = await spotifyApi.searchAlbums(query, { limit: 5 });
    const albums = data.body.albums.items;

    if (albums.length > 0) {
      res.json({ mood: mood, albums: albums });
    } else {
      res.json({ mood: mood, message: 'No albums found for this mood.' });
    }
  } catch (err) {
    console.error('Error fetching albums:', err);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

// Route to get albums by artist ID
router.get('/albums/:artistId', ensureAuthenticated, async (req, res) => {
  const artistId = req.params.artistId;

  try {
    const data = await spotifyApi.getArtistAlbums(artistId, { limit: 5 });
    const albums = data.body.items;

    if (albums.length > 0) {
      res.json({ artistId: artistId, albums: albums });
    } else {
      res.json({ artistId: artistId, message: 'No albums found for this artist.' });
    }
  } catch (err) {
    console.error('Error fetching artist albums:', err);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

module.exports = router;

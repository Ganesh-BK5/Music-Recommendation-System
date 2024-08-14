const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config();

// Load environment variables
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = process.env;

// Initialize the Spotify API object
const spotifyApi = new SpotifyWebApi({
  clientId: SPOTIFY_CLIENT_ID,
  clientSecret: SPOTIFY_CLIENT_SECRET,
  redirectUri: SPOTIFY_REDIRECT_URI
});

// Route to initiate Spotify authentication
// Route to initiate Spotify authentication
router.get('/login', (req, res) => {
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state'
  ];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  console.log(authorizeURL); // For debugging

  res.redirect(authorizeURL);
});

// Route to handle the callback from Spotify
router.get('/callback', async (req, res) => {
  const error=req.query.error;
  const code = req.query.code || null;
  const state=req.query.state;
  if(error){
    console.error(`Error:${error}`);
    return;
  }
  spotifyApi.authorizationCodeGrant(code).then(data=>{
    const accessToken=data.body['access_token'];
    const refreshToken=data.body['refresh_token'];
    const expiresIn=data.body['expires_in'];

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    console.log(accessToken,refreshToken);
    res.send('success!!');


    setInterval(async()=>{
      const data=await spotifyApi.refreshAccessToken();
      const accessTokenRefreshed=data.body['access_token'];
      spotifyApi.setAccessToken(accessTokenRefreshed);
    },expiresIn/2*1000);
  }).catch(error=>{
    console.error('Error',error);
    res.send('error getting token')
  })


  // if (code) {
  //   try {
  //     const data = await spotifyApi.authorizationCodeGrant(code);
  //     const { access_token, refresh_token } = data.body;

  //     // Store tokens
  //     spotifyApi.setAccessToken(access_token);
  //     spotifyApi.setRefreshToken(refresh_token);

  //     res.send('Authentication successful! You can close this window.');
  //   } catch (error) {
  //     console.error('Error during callback:', error);
  //     res.status(500).send('Authentication failed');
  //   }
  // } else {
  //   res.status(400).send('No authorization code provided');
  // }
});

// Route to refresh the access token
router.get('/refresh-token', async (req, res) => {
  try {
    const { refresh_token } = spotifyApi.getRefreshToken();

    if (!refresh_token) {
      return res.status(400).json({ error: 'No refresh token available' });
    }

    const data = await spotifyApi.refreshAccessToken();
    const { access_token } = data.body;

    // Set the new access token
    spotifyApi.setAccessToken(access_token);

    res.json({ access_token });
  } catch (error) {
    console.error('Error refreshing access token:', error);
    res.status(500).json({ error: 'Failed to refresh access token' });
  }
});






// router.get('/search',(req,res)=>{
//   const{q}=req.query;
//   spotifyApi.searchTracks(q).then(searchData=>{
//     const trackUri=searchData.body.tracks.items[0].uri;
//     res.send({uri:trackUri});
//   }).catch(err=>{
//     res.send(`Error searching:${err}`);
//   })

// })

router.get('/search', (req, res) => {
  const { q } = req.query;

  if (!spotifyApi.getAccessToken()) {
    return res.status(401).json({ error: 'No access token. Please authenticate first.' });
  }

  spotifyApi.searchTracks(q)
    .then(searchData => {
      const trackUri = searchData.body.tracks.items[0].uri;
      res.send({ uri: trackUri });
    })
    .catch(err => {
      console.error(`Error searching: ${err}`);
      res.status(500).send(`Error searching: ${err}`);
    });
});



router.get('/play',(req,res)=>{
  const uri=req.query;
  spotifyApi.play({uris:[uri]}).then(()=>{
    res.send('playback started');
  }).catch(err=>{
    res.send(`Error playing:${err}`);
  })
})

module.exports = {
  router,
  spotifyApi
};



// spotifyAuthRoutes.js
// const express = require('express');
// const router = express.Router();
// const SpotifyWebApi = require('spotify-web-api-node');
// require('dotenv').config();

// const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REDIRECT_URI } = process.env;

// const spotifyApi = new SpotifyWebApi({
//   clientId: SPOTIFY_CLIENT_ID,
//   clientSecret: SPOTIFY_CLIENT_SECRET,
//   redirectUri: SPOTIFY_REDIRECT_URI
// });

// // Route to initiate Spotify authentication
// router.get('/login', (req, res) => {
//   const scopes = [
//     'user-read-private',
//     'user-read-email',
//     'user-read-playback-state',
//     'user-modify-playback-state'
//   ];
//   const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
//   res.redirect(authorizeURL);
// });

// // Route to handle the callback from Spotify
// router.get('/callback', async (req, res) => {
//   const code = req.query.code || null;
//   const error = req.query.error;

//   if (error) {
//     console.error(`Error: ${error}`);
//     return res.status(400).send('Error during authentication');
//   }

//   try {
//     const data = await spotifyApi.authorizationCodeGrant(code);
//     const accessToken = data.body['access_token'];
//     const refreshToken = data.body['refresh_token'];
//     const expiresIn = data.body['expires_in'];

//     spotifyApi.setAccessToken(accessToken);
//     spotifyApi.setRefreshToken(refreshToken);

//     console.log('Access Token:', accessToken);
//     console.log('Refresh Token:', refreshToken);

//     res.send('Authentication successful! You can close this window.');

//     // Refresh the access token periodically
//     setInterval(async () => {
//       const data = await spotifyApi.refreshAccessToken();
//       const refreshedToken = data.body['access_token'];
//       spotifyApi.setAccessToken(refreshedToken);
//       console.log('Access token refreshed:', refreshedToken);
//     }, (expiresIn / 2) * 1000);
//   } catch (err) {
//     console.error('Error during callback:', err);
//     res.status(500).send('Authentication failed');
//   }
// });

// // Export the spotifyApi instance for use in other files
// module.exports = {
//   router,
//   spotifyApi,
// };

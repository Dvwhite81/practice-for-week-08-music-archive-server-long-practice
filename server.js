const http = require('http');
const fs = require('fs');

/* ============================ SERVER DATA ============================ */
let artists = JSON.parse(fs.readFileSync('./seeds/artists.json'));
let albums = JSON.parse(fs.readFileSync('./seeds/albums.json'));
let songs = JSON.parse(fs.readFileSync('./seeds/songs.json'));

let nextArtistId = 2;
let nextAlbumId = 2;
let nextSongId = 2;

// returns an artistId for a new artist
function getNewArtistId() {
  const newArtistId = nextArtistId;
  nextArtistId++;
  return newArtistId;
}

// returns an albumId for a new album
function getNewAlbumId() {
  const newAlbumId = nextAlbumId;
  nextAlbumId++;
  return newAlbumId;
}

// returns an songId for a new song
function getNewSongId() {
  const newSongId = nextSongId;
  nextSongId++;
  return newSongId;
}

/* ======================= PROCESS SERVER REQUESTS ======================= */
const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // assemble the request body
  let reqBody = "";
  req.on("data", (data) => {
    reqBody += data;
  });

  req.on("end", () => { // finished assembling the entire request body
    // Parsing the body of the request depending on the "Content-Type" header
    if (reqBody) {
      switch (req.headers['content-type']) {
        case "application/json":
          req.body = JSON.parse(reqBody);
          break;
        case "application/x-www-form-urlencoded":
          req.body = reqBody
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
              acc[key] = value;
              return acc;
            }, {});
          break;
        default:
          break;
      }
      console.log(req.body);
    }

    /* ========================== ROUTE HANDLERS ========================== */

    // Your code here

    // Get all the artists
    if (req.method === "GET" && req.url === "/artists") {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.body = JSON.stringify(artists);
      return res.end(res.body);
    }

    // Get a specific artist's details based on artistId
    if (req.method === "GET" && req.url.startsWith("/artists/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 3) {
        const artistId = urlParts[2];
        const artist = artists[artistId];

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(artist);
        return res.end(res.body)
      }
    }

    // Add an artist
    if (req.method === "POST" && req.url === "/artists") {
      const artistId = getNewArtistId();
      artists[artistId] = {
        artistId: artistId,
        name: req.body.name
      };

      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.body = JSON.stringify(artists[artistId]);
      return res.end(res.body);
    }

    // Edit a specified artist by artistId
    if ((req.method === "PATCH"  || req.method === "PUT") && req.url.startsWith("/artists/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 3) {
        const artistId = urlParts[2];
        const artist = artists[artistId];
        artist.name = req.body.name;
        artist.updatedAt = new Date();

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(artist)
      }
    }

    // Delete a specified artist by artistId
    if (req.method === "DELETE" && req.url.startsWith("/artists/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 3) {
        const artistId = urlParts[2];
        const artist = artists[artistId];
        delete artist;

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify({"message": "Successfully deleted"});
        return res.end(res.body);
      }
    }

    // Get all albums of a specific artist based on artistId
    if (req.method === "GET" && req.url.startsWith("/artists/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 4 && urlParts[3] === "albums") {
        const artistId = urlParts[2];
        let artistAlbums = [];

        for (let album in albums) {
          if (albums[album].artistId === artistId) {
            artistAlbums.push(albums[album]);
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(artistAlbums);
        return res.end(res.body);
      }
    }

    // Get a specific album's details based on albumId
    if (req.method === "GET" && req.url.startsWith("/albums/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 3) {
        const albumId = urlParts[2];

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(albums[albumId]);
        return res.end(res.body);
      }
    }

    // Add an album to a specific artist based on artistId
    if (req.method === "POST" && req.url.startsWith("/artists/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 4) {
        const artistId = urlParts[2];
        const albumId = getNewAlbumId();

        albums[albumId] = {
          albumId: albumId,
          name: req.body.name,
          artistId: artistId
        };

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(albums[albumId]);
        return res.end(res.body);
      }
    }

    // Edit a specified album by albumId
    if ((req.method === "PATCH" || req.method === "PUT") && req.url.startsWith("/albums/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 3) {
        const albumId = urlParts[2];
        const album = albums[albumId];
        const artistId = album.artistId;
        album = {
          name: req.body.name,
          albumId: albumId,
          artistId: artistId,
          updatedAt: new Date()
        };

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(album);
        return res.end(res.body);
      }
    }

    // Delete a specified album by albumId
    if (req.method === "DELETE" && req.url.startsWith("/albums/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 3) {
        const albumId = urlParts[2];
        delete albums[albumId];

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify({"message": "Successfully deleted"});
        return res.end(res.body);
      }
    }

    // Get all songs of a specific artist based on artistId
    if (req.method === "GET" && req.url.startsWith("/artists/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 4) {
        const artistId = urlParts[2];
        let artistSongs = [];

        for (let song in songs) {
          if (songs[song].artistId === artistId) {
            artistSongs.push(songs[song]);
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(artistSongs);
        return res.end(res.body);
      }
    }

    // Get all songs of a specific album based on albumId
    if (req.method === "GET" && req.url.startsWith("/albums/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 4) {
        const albumId = urlParts[2];
        let albumSongs = [];

        for (let song in songs) {
          if (songs[song].albumId === albumId) {
            albumSongs.push(songs[song]);
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(albumSongs);
        return res.end(res.body);
      }
    }

    // Get all songs of a specified trackNumber
    if (req.method === "GET" && req.url.startsWith("/trackNumbers/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 4) {
        const trackNumber = urlParts[2];
        const songsTrackNumber = [];

        for (let song in songs) {
          if (songs[song].trackNumber === trackNumber) {
            songsTrackNumber.push(songs[song]);
          }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(songsTrackNumber);
        return res.end(res.body);
      }
    }

    // Get a specific song's details based on songId
    if (req.method === "GET" && req.url.startsWith("/songs/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 4) {
        const songId = urlParts[2];

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(songs[songId]);
        return res.end(res.body);
      }
    }

    // Add a song to a specific album based on albumId
    if (req.method === "POST" && req.url.startsWith("/albums/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 4) {
        const albumId = urlParts[2];
        const songId = getNewSongId();
        songs[songId] = {
          name: req.body.name,
          lyrics: req.body.lyrics,
          trackNumber: req.body.trackNumber,
          songId: songId,
          albumId: albumId
        };

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(songs[songId]);
        return res.end(res.body);
      }
    }

    // Edit a specified song by songId
    if ((req.method === "PATCH" || req.method === "PUT") && req.url.startsWith("/songs/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 3) {
        const songId = urlParts[2];
        songs[songId] = {
          name: req.body.name,
          lyrics: req.body.lyrics,
          trackNumber: req.body.trackNumber,
          updatedAt: new Date()
        };

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify(songs[songId]);
        return res.end(res.body);
      }
    }

    // Delete a specified song by songId
    if (req.method === "DELETE" && req.url.startsWith("/songs/")) {
      const urlParts = req.url.split("/");

      if (urlParts.length === 3) {
        const songId = urlParts[2];
        delete songs[songId];

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.body = JSON.stringify({"message": "Successfully deleted"});
        return res.end(res.body);
      }
    }

    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.write("Endpoint not found");
    return res.end();
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => console.log('Server is listening on port', port));

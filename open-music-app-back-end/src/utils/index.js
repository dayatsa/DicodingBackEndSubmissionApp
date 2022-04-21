/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint linebreak-style: ["error", "windows"] */

const mapAlbumToModel = ({
  id,
  name,
  year,
  created_at,
  updated_at,
  cover_url,
}) => ({
  id,
  name,
  year,
  createdAt: created_at,
  updatedAt: updated_at,
  coverUrl: cover_url,
});

const mapSongToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  albumId: album_id,
  createdAt: created_at,
  updatedAt: updated_at,
});

const mapAllSongToModel = ({
  id,
  title,
  year,
  genre,
  performer,
  duration,
  album_id,
  created_at,
  updated_at,
}) => ({
  id,
  title,
  performer,
});

const mapPlaylistToModel = ({
  id,
  name,
  owner,
  username,
}) => ({
  id,
  name,
  username,
});

module.exports = {
  mapAlbumToModel, mapSongToModel, mapAllSongToModel, mapPlaylistToModel,
};

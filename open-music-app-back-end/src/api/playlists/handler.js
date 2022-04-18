/* eslint-disable no-underscore-dangle */
/* eslint linebreak-style: ["error", "windows"] */

const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
  constructor(songService, playlistService, activitiesService, validator) {
    this._songService = songService;
    this._playlistService = playlistService;
    this._activitiesService = activitiesService;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.addSongToPlaylistHandler = this.addSongToPlaylistHandler.bind(this);
    this.getSongPlaylistHandler = this.getSongPlaylistHandler.bind(this);
    this.deleteSongInPlaylistByIdHandler = this.deleteSongInPlaylistByIdHandler.bind(this);
    this.getPlaylistActivitiesHandler = this.getPlaylistActivitiesHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name = 'untitled' } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._playlistService.addPlaylist({
        name, owner: credentialId,
      });

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan ada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._playlistService.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistOwner(id, credentialId);
      await this._playlistService.deletePlaylistById(id);
      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan ada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async addSongToPlaylistHandler(request, h) {
    try {
      this._validator.validateSongPlaylistPayload(request.payload);
      const { songId } = request.payload;

      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._songService.getSongById(songId);
      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
      await this._playlistService.addSongToPlaylist(playlistId, songId);

      await this._activitiesService.addPlaylistActivities({
        playlistId, songId, userId: credentialId, action: 'add',
      });

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke Playlist',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan ada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async getSongPlaylistHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
      const playlist = await this._playlistService.getPlaylistById(playlistId);
      const songs = await this._playlistService.getSongPlaylists(playlistId);

      playlist.songs = songs;

      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan ada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async deleteSongInPlaylistByIdHandler(request, h) {
    try {
      this._validator.validateSongPlaylistPayload(request.payload);
      const { songId } = request.payload;
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._songService.getSongById(songId);
      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
      await this._playlistService.deleteSongInPlaylistById(songId);

      await this._activitiesService.addPlaylistActivities({
        playlistId, songId, userId: credentialId, action: 'delete',
      });
      return {
        status: 'success',
        message: 'Lagu dalam Playlist berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan ada server kami.',
      });
      response.code(500);
      return response;
    }
  }

  async getPlaylistActivitiesHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
      const activities = await this._activitiesService.getPlaylistsActivities(playlistId);

      return {
        status: 'success',
        data: {
          playlistId,
          activities,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan ada server kami.',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = PlaylistsHandler;

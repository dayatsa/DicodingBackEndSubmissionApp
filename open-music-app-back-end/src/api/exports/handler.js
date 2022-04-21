/* eslint-disable no-underscore-dangle */
/* eslint linebreak-style: ["error", "windows"] */

const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(exportService, playlistsService, validator) {
    this._exportService = exportService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postExportPlaylistByIdHandler = this.postExportPlaylistByIdHandler.bind(this);
  }

  async postExportPlaylistByIdHandler(request, h) {
    try {
      this._validator.validateExportPlaylistsPayload(request.payload);

      const message = {
        userId: request.auth.credentials.id,
        playlistId: request.params.playlistId,
        targetEmail: request.payload.targetEmail,
      };

      await this._playlistsService.verifyPlaylistAccess(message.playlistId, message.userId);
      await this._exportService.sendMessage('export:playlists', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda dalam antrean',
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
      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = ExportsHandler;

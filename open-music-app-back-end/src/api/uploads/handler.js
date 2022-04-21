/* eslint-disable no-underscore-dangle */
/* eslint linebreak-style: ["error", "windows"] */

const ClientError = require('../../exceptions/ClientError');

class UploadsHandler {
  constructor(uploadsService, albumsService, validator) {
    this._uploadsService = uploadsService;
    this._albumsService = albumsService;
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    try {
      const { cover } = request.payload;
      const albumId = request.params.id;

      this._validator.validateImageHeaders(cover.hapi.headers);

      const filename = await this._uploadsService.writeFile(cover, cover.hapi);
      const location = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

      await this._albumsService.editCoverUrlById(albumId, location);

      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
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

module.exports = UploadsHandler;

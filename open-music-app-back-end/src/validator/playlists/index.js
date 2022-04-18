/* eslint linebreak-style: ["error", "windows"] */

const InvariantError = require('../../exceptions/InvariantError');
const { PlaylistPayloadSchema, SongPlaylistPayloadSchema } = require('./schema');

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validateResult = PlaylistPayloadSchema.validate(payload);

    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
  validateSongPlaylistPayload: (payload) => {
    const validateResult = SongPlaylistPayloadSchema.validate(payload);

    if (validateResult.error) {
      throw new InvariantError(validateResult.error.message);
    }
  },
};

module.exports = PlaylistsValidator;

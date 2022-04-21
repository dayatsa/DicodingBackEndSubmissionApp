/* eslint linebreak-style: ["error", "windows"] */

const Joi = require('joi');

const ExportPlaylistsPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

module.exports = ExportPlaylistsPayloadSchema;

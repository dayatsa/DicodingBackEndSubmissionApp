/* eslint-disable function-paren-newline */
/* eslint linebreak-style: ["error", "windows"] */

const PlaylistsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    songService, playlistService, activitiesService, validator,
  }) => {
    const playlistsHandler = new PlaylistsHandler(
      songService, playlistService, activitiesService, validator,
    );
    server.route(routes(playlistsHandler));
  },
};

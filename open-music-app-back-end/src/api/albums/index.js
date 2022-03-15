/* eslint linebreak-style: ["error", "windows"] */

const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'openMusic',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const albumsHandler = new AlbumsHandler(service, validator);
    server.route(routes(albumsHandler));
  },
};
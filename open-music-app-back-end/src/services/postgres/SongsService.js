/* eslint-disable no-underscore-dangle */
/* eslint linebreak-style: ["error", "windows"] */

const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongToModel, mapAllSongToModel } = require('../../utils');

class SongsService {
  constructor() {
    this.__pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
    };

    const result = await this.__pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(request) {
    const params = request.query;
    let result;
    if (params.title && params.performer === undefined) {
      const query = {
        text: 'SELECT * FROM songs WHERE lower(title) LIKE $1',
        values: [`%${params.title}%`],
      };
      result = await this.__pool.query(query);
    } else if (params.performer && params.title === undefined) {
      const query = {
        text: 'SELECT * FROM songs WHERE lower(performer) LIKE $1',
        values: [`%${params.performer}%`],
      };
      result = await this.__pool.query(query);
    // eslint-disable-next-line no-dupe-else-if
    } else if (params.title && params.performer) {
      const query = {
        text: 'SELECT * FROM songs WHERE lower(title) LIKE $1 AND lower(performer) LIKE $2',
        values: [`%${params.title}%`, `%${params.performer}%`],
      };
      result = await this.__pool.query(query);
    } else {
      result = await this.__pool.query('SELECT * FROM songs');
    }
    return result.rows.map(mapAllSongToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this.__pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows.map(mapSongToModel)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6, updated_at = $7 WHERE id = $8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    };

    const result = await this.__pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.__pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = SongsService;

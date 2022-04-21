/* eslint-disable no-underscore-dangle */
/* eslint linebreak-style: ["error", "windows"] */

const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapAlbumToModel, mapAllSongToModel } = require('../../utils');

class AlbumsService {
  constructor(cacheService) {
    this.__pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this.__pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const query = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };

    const querySong = {
      text: 'SELECT * FROM songs WHERE album_id = $1',
      values: [id],
    };

    const result = await this.__pool.query(query);
    const resultSong = await this.__pool.query(querySong);

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    if (resultSong.rows.length) {
      const res = resultSong.rows.map(mapAllSongToModel);
      const resFinal = result.rows.map(mapAlbumToModel)[0];
      resFinal.songs = res;
      return resFinal;
    }

    return result.rows.map(mapAlbumToModel)[0];
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2, updated_at = $3 WHERE id = $4 RETURNING id',
      values: [name, year, updatedAt, id],
    };

    const result = await this.__pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }
  }

  async editCoverUrlById(id, coverUrl) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE albums SET cover_url = $1, updated_at = $2 WHERE id = $3 RETURNING id',
      values: [coverUrl, updatedAt, id],
    };

    const result = await this.__pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menambahkan coverUrl pada album. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.__pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async checkAlbumLikes({ userId, albumId }) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE id = $1',
      values: [`like-${userId}-${albumId}`],
    };
    const result = await this.__pool.query(query);

    if (!result.rows.length) {
      return true;
    }
    return false;
  }

  async addAlbumLikes({ userId, albumId }) {
    const id = `like-${userId}-${albumId}`;

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this.__pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal disukai');
    }

    await this._cacheService.delete(`cache:${albumId}`);
    return result.rows[0].id;
  }

  async deleteAlbumLikes({ userId, albumId }) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE id = $1 RETURNING id',
      values: [`like-${userId}-${albumId}`],
    };

    const result = await this.__pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal di unlike. Id tidak ditemukan');
    }
    await this._cacheService.delete(`cache:${albumId}`);
  }

  async getAlbumLikeById(albumId) {
    try {
      // mendapatkan catatan dari cache
      const result = await this._cacheService.get(`cache:${albumId}`);
      return [true, JSON.parse(result)];
    } catch (error) {
      const query = {
        text: 'SELECT id FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };
      const result = await this.__pool.query(query);

      const mappedResult = result.rows.length;

      await this._cacheService.set(`cache:${albumId}`, JSON.stringify(mappedResult));

      return [false, mappedResult];
    }
  }
}

module.exports = AlbumsService;

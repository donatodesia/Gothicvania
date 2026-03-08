/**
 * TerrainMap — bounds-safe wrapper around the per-column surface-row array.
 *
 * Centralises all reads and writes so out-of-bounds accesses never silently
 * return undefined, and the "only update if higher" invariant (setMin) lives
 * in one place instead of being repeated in every generator.
 */
import { GROUND_ROW } from '../constants.js';

export default class TerrainMap {
  /**
   * @param {number} cols       Total map width in tile columns.
   * @param {number} defaultRow Row returned for out-of-bounds reads (base ground).
   */
  constructor(cols, defaultRow = GROUND_ROW) {
    this._cols    = cols;
    this._default = defaultRow;
    this._data    = new Array(cols).fill(defaultRow);
  }

  /**
   * Return the surface row for a column.
   * Returns defaultRow when col is out of bounds instead of crashing.
   * @param {number} col
   * @returns {number}
   */
  get(col) {
    if (col < 0 || col >= this._cols) return this._default;
    return this._data[col];
  }

  /**
   * Write the surface row for a column. Out-of-bounds writes are silently ignored.
   * @param {number} col
   * @param {number} row
   */
  set(col, row) {
    if (col < 0 || col >= this._cols) return;
    this._data[col] = row;
  }

  /**
   * Write the surface row only if the new row is higher (smaller index) than
   * the current value. Used by generators to track the highest placed tile.
   * @param {number} col
   * @param {number} row
   */
  setMin(col, row) {
    if (col < 0 || col >= this._cols) return;
    if (row < this._data[col]) this._data[col] = row;
  }
}

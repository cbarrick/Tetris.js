//     Tetris.js - A Tetris clone for HTML5
//     Copyright (C) 2014  Chris Barrick <cbarrick1@gmail.com>
//     
//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
//     
//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
//     
//     You should have received a copy of the GNU General Public License
//     along with this program.  If not, see <http://www.gnu.org/licenses/>.


define(function (require, exports, module) {
	'use strict';

	var Model = require('model');


	// A class for managing the score. Extends `Model`.
	//
	// Note that you should set the `game` attribute on construction and that
	// `dryspell` alternates between -1 and 0 during a combo.
	//
	// Attributes
	// ----------
	// - `combo` (Number): The number of plays in a row that have cleared.
	// - `dryspell` (Number): The complement of `combo`.
	// - `game` (Tetris): The game being scored.
	// - `score` (Number): Duh.
	//
	// Events
	// ------
	// - `score` (current score, combo): Triggers when a score is calculated.

	var ScoreKeeper = module.exports = Model.extend({

		attributes: {
			combo: 0,
			dryspell: 0,
			game: null,
			score: 0
		},


		initialize: function () {
			var game = this.get('game');

			game.on('clear', this.score.bind(this));
			game.on('lock', function () {
				var dryspell = this.get('dryspell');
				this.set({ 'dryspell': dryspell + 1 });
			}.bind(this))
		},


		// sk.score(rows)
		// --------------
		// Adds to the score based on the number of rows cleared.
		//
		// This method is registered as a handler for the `clear` event of the
		// game, which is called when the player clears one or more rows in a
		// turn.
		//
		// ### Params
		// - `rows` (Array of Integers): The indicies of the rows cleared.

		score: function (rows) {
			var dryspell = this.get('dryspell');
			var score = this.get('score');
			var combo = this.get('combo');
			var bonus = 0;
			var points = 0;

			// -1 because the upcoming `lock` event will bump it to 0
			if (rows.length > 0) dryspell = -1;

			if (dryspell > 0) combo = 0;
			else combo += 1;

			// No breaks, intentional fall through
			switch (rows.length) {
				case 4: bonus += 1;
				case 3: bonus += 1;
				case 2: bonus += 1;
			}

			points = (rows.length + bonus) * combo;
			score += points;
			if (points > 0) console.log(score);

			this.set({
				'dryspell': dryspell,
				'score': score,
				'combo': combo
			})

			this.trigger('score', score, combo);
		}

	})
})
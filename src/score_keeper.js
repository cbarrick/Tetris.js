define(function (require, exports, module) {
	'use strict';

	var Model = require('model');


	var ScoreKeeper = module.exports = Model.extend({

		attributes: {
			combo: 0,
			dryspell: 0,
			game: null,
			score: 0
		},


		/**
		 * var sk = new ScoreKeeper(attributes)
		 * --------------------------------------
		 * You should set the `game` attribute on construction
		 */

		initialize: function () {
			var game = this.get('game');

			game.on('clear', this.score.bind(this));
			game.on('lock', function () {
				var dryspell = this.get('dryspell');
				this.set({ 'dryspell': dryspell + 1 });
			}.bind(this))
		},


		/**
		 * ScoreKeeper.prorotype.score(rows)
		 * ---------------------------------
		 * Adds to the score based on the number of elements in the array
		 * argument, `rows`.
		 *
		 * This method is registered as a handler for the `clear` event of the
		 * game, which is called after every lock, and gets passed an array of
		 * the rows cleared.
		 */

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
		}

	})
})
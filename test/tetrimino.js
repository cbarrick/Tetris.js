define(function (require) {
	'use strict';

	var expect = require('chai').expect;

	var Tetrimino = require('tetrimino');


	describe('Tetrimino', function () {

		it('can be created as any type', function () {
			var T = "[Tetrimino: T (3,0) 0]\n"
			      + "+---+\n"
			      + "| X |\n"
			      + "|XXX|\n"
			      + "|   |\n"
			      + "+---+";
			var L = "[Tetrimino: L (3,0) 0]\n"
			      + "+---+\n"
			      + "|  X|\n"
			      + "|XXX|\n"
			      + "|   |\n"
			      + "+---+";
			var J = "[Tetrimino: J (3,0) 0]";
			var S = "[Tetrimino: S (3,0) 0]";
			var Z = "[Tetrimino: Z (3,0) 0]";
			var O = "[Tetrimino: O (3,0) 0]";
			var I = "[Tetrimino: I (2,0) 0]";

			// The default type is T
			var t = new Tetrimino();
			var l = new Tetrimino({type: 'L'});
			var j = new Tetrimino({type: 'J'});
			var s = new Tetrimino({type: 'S'});
			var z = new Tetrimino({type: 'Z'});
			var o = new Tetrimino({type: 'O'});
			var i = new Tetrimino({type: 'I'});

			// Passing `true` to `toString` causes the box to be rendered
			expect(t.toString(true)).to.equal(T);
			expect(l.toString(true)).to.equal(L);
			expect(j.toString()).to.equal(J);
			expect(s.toString()).to.equal(S);
			expect(z.toString()).to.equal(Z);
			expect(o.toString()).to.equal(O);
			expect(i.toString()).to.equal(I);
		})


		it('can move', function () {
			var t = new Tetrimino();
			var x = t.get('x');
			var y = t.get('y');
			t.move(3,5);
			expect(t.get('x')).to.equal(x+3);
			expect(t.get('y')).to.equal(y+5);
			t.move(-3,-5);
			expect(t.get('x')).to.equal(x);
			expect(t.get('y')).to.equal(y);
		})


		it('can rotate', function () {
			var T0 = "[Tetrimino: T (3,0) 0]\n"
			       + "+---+\n"
			       + "| X |\n"
			       + "|XXX|\n"
			       + "|   |\n"
			       + "+---+";
			var T1 = "[Tetrimino: T (3,0) 1]\n"
			       + "+---+\n"
			       + "| X |\n"
			       + "| XX|\n"
			       + "| X |\n"
			       + "+---+";
			var T2 = "[Tetrimino: T (3,0) 2]\n"
			       + "+---+\n"
			       + "|   |\n"
			       + "|XXX|\n"
			       + "| X |\n"
			       + "+---+";
			var T3 = "[Tetrimino: T (3,0) 3]\n"
			       + "+---+\n"
			       + "| X |\n"
			       + "|XX |\n"
			       + "| X |\n"
			       + "+---+";
			var t = new Tetrimino();
			expect(t.toString(true)).to.equal(T0);
			t.rotate();
			expect(t.toString(true)).to.equal(T1);
			t.rotate();
			expect(t.toString(true)).to.equal(T2);
			t.rotate();
			expect(t.toString(true)).to.equal(T3);
		})


		it('can work with boundaries (including wall kicks)', function () {
			// A bounding function that simulates a wall at column 5
			var bounds = function (coords) {
				expect(coords.length).to.equal(4);
				var inBounds = coords.filter(function (coord) {
					expect(coord.length).to.equal(2);
					if (coord[0] > 5) {
						return false;
					}
					return true;
				})
				return (inBounds.length == 4);
			}

			var t = new Tetrimino({bounds: bounds});

			// Rotate to state 3, move right. `t` will be against the wall.
			// Rotating should cause a wall-kick
			t.rotate();
			t.rotate();
			t.rotate();
			expect(t.get('x')).to.equal(3);
			t.move(1,0);
			expect(t.get('x')).to.equal(4);
			t.rotate();
			expect(t.get('x')).to.equal(3);
		})

	})

})
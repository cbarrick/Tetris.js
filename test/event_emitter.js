define(function (require) {
	'use strict';

	var expect = require('chai').expect;

	var EventEmitter = require('event_emitter');


	describe('EventEmitter', function () {

		it('shrould allow registering and triggering event handlers', function (done) {
			var e = new EventEmitter();
			var eventArg = {};
			e.on('foo', function (arg) {
				expect(arg).to.equal(eventArg);
				done();
			})
			e.trigger('foo', eventArg);
		})


		it('should allow removing event handlers', function () {
			var e = new EventEmitter();
			var count = 0;
			var bad = function () {
				expect(count).to.equal(0);
				count += 1;
			}
			var good = function () {
				count += 1;
			}
			e.on('test', bad);
			e.on('test', good);

			// We expect `bad` to be called, which increments count,
			// then for `good` to be called, which also increments count.
			e.trigger('test');
			expect(count).to.equal(2);

			// Then we remove `bad` as a handler
			e.off('test', bad);

			// Now we expect `bad` to not get called
			// and for `good` to get called and end the test
			e.trigger('test');
			expect(count).to.equal(3);
		})


		it('should allow one-time events', function () {
			var e = new EventEmitter();
			var count = 0;
			var a = function () {
				expect(count).to.equal(0);
				count += 1;
			}
			e.once('test', a);
			e.trigger('test');
			e.trigger('test');
			expect(count).to.equal(1);
		})


		it('should be extendable', function (done) {
			var SubClass = EventEmitter.extend({
				foo: function () {
					this.trigger('foo');
				}
			})
			var e = new SubClass();
			e.on('foo', function () {
				done();
			})
			e.foo();
		})

	})

})

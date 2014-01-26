define(function (require) {
	'use strict';

	var expect = require('chai').expect;

	var Model = require('model');


	describe('Model', function () {

		describe('class', function () {
			
			describe('#.extend', function () {

				it('should extend the parent prototype')

				it('should extend (rather than override) the `attributes` property')

			})
		})

		describe('instance', function () {

			it("should have it's own `attributes` as a clone of the prototype's `attributes`", function () {
				var Class = Model.extend({
					attributes: {
						test: 'test'
					}
				})
				var instance = new Class();
				expect(Class.prototype).to.have.ownProperty('attributes');
				expect(instance).to.have.ownProperty('attributes');
				expect(instance.attributes).to.deep.equal(Class.prototype.attributes);
				expect(instance.attributes).to.not.equal(Class.prototype.attributes);
			})

			it('should not interfere with other instances', function () {
				var Class = Model.extend({
					attributes: {
						test: 'test'
					}
				})
				var a = new Class();
				var b = new Class();
				a.set({'test': 'A'});
				b.set({'test': 'B'});
				expect(a.get('test')).to.equal('A');
				expect(b.get('test')).to.equal('B');
				expect(Class.prototype.attributes['test']).to.equal('test');
			})

			it('should extend `attributes` on construction', function () {
				var Class = Model.extend({
					attributes: {
						a: 'A',
						b: 'B'
					}
				})
				var instance = new Class({
					b: 'BB',
					c: 'CC'
				})
				expect(instance.get('a')).to.equal('A');
				expect(instance.get('b')).to.equal('BB');
				expect(instance.get('c')).to.equal('CC');
				expect(Class.prototype.attributes['a']).to.equal('A');
				expect(Class.prototype.attributes['b']).to.equal('B');
			})

			describe('#.set and #.get', function () {
				it('should support both simple and complex `set` syntax', function () {
					var Class = Model.extend({
						attributes: {
							a: 'A',
							b: 'B'
						}
					})
					var instance = new Class();
					instance.set('b', 'BB');
					instance.set({c:'CC', d:'DD'});
					expect(instance.get('a')).to.equal('A');
					expect(instance.get('b')).to.equal('BB');
					expect(instance.get('c')).to.equal('CC');
					expect(instance.get('d')).to.equal('DD');
					expect(Class.prototype.attributes['a']).to.equal('A');
					expect(Class.prototype.attributes['b']).to.equal('B');
				})
			})

			describe('#.toJson', function () {
				it('should return a clone of the attributes', function () {
					var Class = Model.extend({
						attributes: {
							a: 'A'
						}
					})
					var instance = new Class();
					expect(instance.toJson()).to.deep.equal(instance.attributes);
					expect(instance.toJson()).to.not.equal(instance.attributes);
				})
			})

		})

	})

})
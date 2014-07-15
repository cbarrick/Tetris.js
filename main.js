'use strict';


require.config({
	baseUrl: 'src'
});


require(['tetris'], function (Tetris) {
	var root = document.getElementById('body');
	window.t = new Tetris({root:root});
});

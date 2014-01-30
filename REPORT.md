Tetris.js
=========
A Tetris clone for HTML5. Right now this only works in Safari and Chrome, but it will be simple to update to work in Firefox and IE 10.

I had to write this report very quickly. I apologize for the terseness, but I believe you will be very pleased with the game.

The game is Tetris. The goal is to stack blocks. When you fill a row completely with blocks, it disapears, and all rows above it fall. When the stack of blocks reaches the top of the screen, the game is over. Scoring is calculated in terms of how many lines you clear and if you clear lines multiple turns in succession. The goal is to score the most points :)

The main graphical objects are "blocks". The player controls 4 blocks at once called a "Tetrimino". All of the drawing logic is in `src/tetris_view.js`. Particularly the `drawBlock` and `clearArea` methods. The drawing is very simple. I just draw a path then fill it and stroke it to draw each block. Scoring is pretty cool. The state of the game is handled by the `Tetris` class in `src/tetris.js`. The class emits an events when an area of the board is updated. The `TetrisView` listens to this event and redraws the area that has updated.

The logic for calculating the score is somewhat complex, but basically the more lines you clear at once, the more points you get. And the more turns in a row that you score, the more points you get. Checkout `src/score_keeper.js` for scoring details.

The user documentation is in-game :) Instructions are given when you start it up.

For the gallery, checkout http://cbarrick.github.io/Tetris.js/gallery/

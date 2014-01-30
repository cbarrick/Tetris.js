Tetris.js
=========
A Tetris clone for HTML5

The game is hosted at http://cbarrick.github.io/Tetris.js/
Annotated source code documentation is [here][documentation].

This game was created as a project for *CSCI 4070 - Game Programming* at the University of Georgia. The required report has been rendered to HTML as the index page of the [documentation]. To run the code from the repository, open `index.xhtml` in a browser. To run the unit tests, open `test/index.xhtml`.

[documentation]: http://cbarrick.github.io/Tetris.js/docs/


Source layout
-------------
The source has a very standard layout. Part of the requirement was that we use no 3rd party libraries. However, I used [Require.js] for the ability to modularize my code into separate files and [Mocha] and [Chai] for unit testing. None of these effected the source logic itself.

├── LICENSE
├── README.md
├── index.xhtml
├── main.js
├── assets
│   └── { Assets needed by the XHTML page }
├── docs
│   └── { Generated documentation }
├── lib
│   └── { Dev tools needed at runtime and/or compile time }
├── src
│   └── { The source logic for the game }
└── test
    ├── lib
    │   └── { Dev tools needed at testtime }
    ├── index.xhtml
    └── { The unit tests for the lower level classes }


Credits
-------
- Lead developer: [Chris Barrick](https://github.com/cbarrick)
- Inventor of Tetris: [Alexey Pajitnov](http://en.wikipedia.org/wiki/Alexey_Pajitnov)
- Music: [Tetris Korobeiniki Remix by Cornholio1975](http://www.newgrounds.com/audio/listen/45668)
- Background: [Escheresque Dark by Ste Patten](http://subtlepatterns.com/escheresque-dark/)
- Font: [Quicksand by Andrew Paglinawan](http://www.google.com/fonts/specimen/Quicksand)


Development tools
-----------------
- [Docco]: Docco is a quick-and-dirty, hundred-line-long, literate-programming-style documentation generator.
- [Require.js]: A file and module loader for JavaScript.
- [Mocha]: A simple, flexible, fun javascript test framework for node.js & the browser.
- [Chai]: A BDD / TDD assertion framework for node.js and the browser that can be paired with any testing framework.

[Docco]: https://github.com/jashkenas/docco
[Require.js]: https://github.com/jrburke/requirejs
[Mocha]: https://github.com/visionmedia/mocha
[Chai]: https://github.com/chaijs/chai


License
-------
Copyright (C) 2014  Chris Barrick (cbarrick1@gmail.com)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

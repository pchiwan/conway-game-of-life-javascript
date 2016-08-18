Conway's Game of Life
=====================

The Game of Life, also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970.

The "game" is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves.


## Rules

The universe of the Game of Life is an infinite two-dimensional orthogonal grid of square cells, each of which is in one of two possible states, alive or dead. Every cell interacts with its eight neighbours, which are the cells that are horizontally, vertically, or diagonally adjacent. At each step in time, the following transitions occur:

1) Any live cell with fewer than two live neighbours dies, as if caused by under-population.

2) Any live cell with two or three live neighbours lives on to the next generation.

3) Any live cell with more than three live neighbours dies, as if by overcrowding.

4) Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.

The initial pattern constitutes the seed of the system. The first generation is created by applying the above rules simultaneously to every cell in the seed—births and deaths occur simultaneously, and the discrete moment at which this happens is sometimes called a tick (in other words, each generation is a pure function of the preceding one). The rules continue to be applied repeatedly to create further generations.

See [Wikipedia](http://en.wikipedia.org/wiki/Conway's_Game_of_Life)

## Setup

You'll need to have Browserify and Watchify installed globally in your machine:
```
npm install browserify watchify -g
```

And then install local dependencies with:
```
npm install
```

To generate the application's bundle file simply run:
```
npm run build
```

This will keep Browserify running and watching for changes in the source files.

## The code

This is a Javascript implementation of Conway's Game of Life.

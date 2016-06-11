(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
/**
 * The cell class
 */
function Cell(initialStatus) {
	var _this = this;

	var status = initialStatus !== undefined ? initialStatus : false;

	Object.defineProperty(this, 'live', {
		get: function get() {
			return !!status;
		}
	});

	Object.defineProperty(this, 'dead', {
		get: function get() {
			return !status;
		}
	});

	this.die = function () {
		status = false;
		return _this;
	};

	this.rise = function () {
		status = true;
		return _this;
	};
}

exports.default = Cell;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _grid = require('./grid.js');

var _grid2 = _interopRequireDefault(_grid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The jQuery Game of life class
 */
function GameOfLife($grid, $score, $message) {
    var _this = this;

    var intervalTime = 1000;
    var g = new _grid2.default(10);
    var interval = null;
    var generations = 0;
    var prevGrid = '';

    //------------------------------- PUBLIC METHODS

    this.start = function () {
        init();
        interval = setInterval(function () {
            var result = g.tick();
            generations++;
            _this.drawGrid();
            if (!result.liveCells) {
                // our population has died, the game of life is over
                $message.text('The population has died');
                _this.stop();
                return;
            }
            if (result.currentGrid === prevGrid) {
                // our population has stagnated, the game of life is over
                $message.text('The population has stagnated');
                _this.stop();
                return;
            }
            $message.text('Live cells: ' + result.liveCells);
            prevGrid = result.currentGrid;
        }, intervalTime);
    };

    this.stop = function () {
        if (interval) {
            clearInterval(interval);
        }
    };

    this.loadGrid = function (table) {
        g.loadGrid(table);
    };

    this.drawGrid = function () {
        $grid.empty();
        g.grid.forEach(function (row) {
            var $row = $('<tr></tr>');
            row.forEach(function (cell) {
                var $cell = $('<td></td>');
                if (cell.live) $cell.addClass('live');
                $row.append($cell);
            });
            $grid.append($row);
        });
        $score.text(generations);
    };

    //------------------------------- PRIVATE METHODS

    var init = function init() {
        generations = 0;
        $score.text('0');
        $message.text('');
        _this.stop();
        _this.drawGrid();
    };

    init();
}

exports.default = GameOfLife;

},{"./grid.js":4}],3:[function(require,module,exports){
'use strict';

var _gameOfLife = require('./game-of-life.js');

var _gameOfLife2 = _interopRequireDefault(_gameOfLife);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(function () {
	var game = new _gameOfLife2.default($('#grid'), $('#generations'), $('#message'));

	$('#startGame').on('click', function () {
		var table = [];
		$('#grid tr').each(function () {
			var tr = [];
			$(this).find('td').each(function () {
				tr.push($(this).hasClass('live') ? true : false);
			});
			table.push(tr);
		});
		game.loadGrid(table);
		game.start();
	});

	$('#stopGame').on('click', function () {
		game.stop();
	});

	$('#grid td').on('click', function () {
		$(this).toggleClass('live');
	});
})();

},{"./game-of-life.js":2}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _cell = require('./cell.js');

var _cell2 = _interopRequireDefault(_cell);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The grid class
 */
function Grid(size) {
	var _this = this;

	var gridSize = size;
	this.grid = [];

	//------------------------------- PUBLIC METHODS

	this.createGrid = function () {
		_this.grid = [];
		for (var i = 0, l1 = gridSize; i < l1; i++) {
			var row = [];
			for (var j = 0, l2 = gridSize; j < l2; j++) {
				row.push(new _cell2.default());
			}
			_this.grid.push(row);
		}
	};

	this.loadGrid = function (table) {
		if (table.length != _this.grid.length) return;

		table.forEach(function (tr, x) {
			tr.forEach(function (td, y) {
				if (td) {
					_this.grid[x][y].rise();
				} else {
					_this.grid[x][y].die();
				}
			});
		});
	};

	this.tick = function () {
		_this.grid = newGeneration();
		return {
			currentGrid: encode(),
			liveCells: findLiveCells()
		};
	};

	//------------------------------- PRIVATE METHODS

	var cloneGrid = function cloneGrid() {
		var newGrid = [];
		_this.grid.forEach(function (row) {
			var newRow = [];
			row.forEach(function (cell) {
				newRow.push(new _cell2.default(cell.live));
			});
			newGrid.push(newRow);
		});
		return newGrid;
	};

	var newGeneration = function newGeneration() {
		var newGrid = cloneGrid();
		_this.grid.forEach(function (row, x) {
			row.forEach(function (cell, y) {
				var liveNeighbours = checkNeighbours(x, y);
				newGrid[x][y] = getNewCell(cell, liveNeighbours);
			});
		});
		return newGrid;
	};

	var findLiveCells = function findLiveCells() {
		return _this.grid.reduce(function (liveCellsInRow, row) {
			return liveCellsInRow + row.reduce(function (liveCells, cell) {
				return liveCells + (cell.live ? 1 : 0);
			}, 0);
		}, 0);
	};

	var checkNeighbours = function checkNeighbours(x, y) {
		var liveNeighbours = 0;
		// check 8 neighbours clockwise
		liveNeighbours += checkNeighbour(getPrevIndex(x), getPrevIndex(y)); // top left cell
		liveNeighbours += checkNeighbour(x, getPrevIndex(y)); // top cell
		liveNeighbours += checkNeighbour(getNextIndex(x), getPrevIndex(y)); // top right cell
		liveNeighbours += checkNeighbour(getNextIndex(x), y); // right cell
		liveNeighbours += checkNeighbour(getNextIndex(x), getNextIndex(y)); // bottom right cell
		liveNeighbours += checkNeighbour(x, getNextIndex(y)); // bottom cell
		liveNeighbours += checkNeighbour(getPrevIndex(x), getNextIndex(y)); // bottom left cell
		liveNeighbours += checkNeighbour(getPrevIndex(x), y); // left cell
		return liveNeighbours;
	};

	var checkNeighbour = function checkNeighbour(x, y) {
		return _this.grid[x][y].live ? 1 : 0;
	};

	var getPrevIndex = function getPrevIndex(x) {
		return x - 1 < 0 ? gridSize - 1 : x - 1;
	};

	var getNextIndex = function getNextIndex(x) {
		return x + 1 === gridSize ? 0 : x + 1;
	};

	var getNewCell = function getNewCell(cell, liveNeighbours) {
		if (liveNeighbours < 2 && cell.live) {
			// cell dies, as if caused by under-population
			return cell.die();
		} else if (liveNeighbours > 3 && cell.live) {
			// cell dies, as if caused by overcrowding
			return cell.die();
		} else if (liveNeighbours === 3 && cell.dead) {
			// cell becomes live, as if by reproduction
			return cell.rise();
		}
		return cell; // cell lives on to the next generation
	};

	var encode = function encode() {
		return _this.grid.map(function (row) {
			return row.map(function (cell) {
				return cell.live ? 1 : 0;
			}).join('');
		}).join('');
	};

	var init = function init() {
		_this.createGrid();
	};

	init();
}

exports.default = Grid;

},{"./cell.js":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY2VsbC5qcyIsInNyYy9nYW1lLW9mLWxpZmUuanMiLCJzcmMvZ2FtZS5qcyIsInNyYy9ncmlkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7QUNHQSxTQUFTLElBQVQsQ0FBYyxhQUFkLEVBQTZCO0FBQUE7O0FBRTVCLEtBQUksU0FBUyxrQkFBa0IsU0FBbEIsR0FBOEIsYUFBOUIsR0FBOEMsS0FBM0Q7O0FBRUEsUUFBTyxjQUFQLENBQXNCLElBQXRCLEVBQTRCLE1BQTVCLEVBQW9DO0FBQ25DLE9BQUssZUFBTTtBQUNWLFVBQU8sQ0FBQyxDQUFDLE1BQVQ7QUFDQTtBQUhrQyxFQUFwQzs7QUFNQSxRQUFPLGNBQVAsQ0FBc0IsSUFBdEIsRUFBNEIsTUFBNUIsRUFBb0M7QUFDbkMsT0FBSyxlQUFNO0FBQ1YsVUFBTyxDQUFDLE1BQVI7QUFDQTtBQUhrQyxFQUFwQzs7QUFNQSxNQUFLLEdBQUwsR0FBVyxZQUFNO0FBQ2hCLFdBQVMsS0FBVDtBQUNBO0FBQ0EsRUFIRDs7QUFLQSxNQUFLLElBQUwsR0FBWSxZQUFNO0FBQ2pCLFdBQVMsSUFBVDtBQUNBO0FBQ0EsRUFIRDtBQUlBOztrQkFFYyxJOzs7Ozs7Ozs7QUM5QmY7Ozs7Ozs7OztBQUtBLFNBQVMsVUFBVCxDQUFxQixLQUFyQixFQUE0QixNQUE1QixFQUFvQyxRQUFwQyxFQUE4QztBQUFBOztBQUUxQyxRQUFNLGVBQWUsSUFBckI7QUFDQSxRQUFJLElBQUksbUJBQVMsRUFBVCxDQUFSO0FBQ0EsUUFBSSxXQUFXLElBQWY7QUFDQSxRQUFJLGNBQWMsQ0FBbEI7QUFDQSxRQUFJLFdBQVcsRUFBZjs7OztBQUlBLFNBQUssS0FBTCxHQUFhLFlBQU07QUFDZjtBQUNBLG1CQUFXLFlBQVksWUFBTTtBQUN6QixnQkFBSSxT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QyxFQUF1Qzs7QUFFN0MsVUFBTyxLQUFLLElBQUwsRUFBUDtBQUNBO0FBQ0QsU0FBTyxJQUFQLEM7QUFDQSxFQVpEOztBQWNBLEtBQU0sU0FBUyxTQUFULE1BQVMsR0FBTTtBQUNwQixTQUFPLE1BQUssSUFBTCxDQUFVLEdBQVYsQ0FBYyxlQUFPO0FBQzNCLFVBQU8sSUFBSSxHQUFKLENBQVEsZ0JBQVE7QUFDdEIsV0FBTyxLQUFLLElBQUwsR0FBWSxDQUFaLEdBQWdCLENBQXZCO0FBQ0EsSUFGTSxFQUVKLElBRkksQ0FFQyxFQUZELENBQVA7QUFHQSxHQUpNLEVBSUosSUFKSSxDQUlDLEVBSkQsQ0FBUDtBQUtBLEVBTkQ7O0FBUUEsS0FBTSxPQUFPLFNBQVAsSUFBTyxHQUFNO0FBQ2xCLFFBQUssVUFBTDtBQUNBLEVBRkQ7O0FBSUE7QUFDQTs7a0JBRWMsSSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIFRoZSBjZWxsIGNsYXNzXG4gKi9cbmZ1bmN0aW9uIENlbGwoaW5pdGlhbFN0YXR1cykge1xuXHRcblx0bGV0IHN0YXR1cyA9IGluaXRpYWxTdGF0dXMgIT09IHVuZGVmaW5lZCA/IGluaXRpYWxTdGF0dXMgOiBmYWxzZTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2xpdmUnLCB7XG5cdFx0Z2V0OiAoKSA9PiB7XG5cdFx0XHRyZXR1cm4gISFzdGF0dXM7XG5cdFx0fVxuXHR9KTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2RlYWQnLCB7XG5cdFx0Z2V0OiAoKSA9PiB7XG5cdFx0XHRyZXR1cm4gIXN0YXR1cztcblx0XHR9XG5cdH0pO1xuXG5cdHRoaXMuZGllID0gKCkgPT4ge1xuXHRcdHN0YXR1cyA9IGZhbHNlIDtcblx0XHRyZXR1cm4gdGhpcztcblx0fTtcblxuXHR0aGlzLnJpc2UgPSAoKSA9PiB7XG5cdFx0c3RhdHVzID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ2VsbDsiLCJpbXBvcnQgR3JpZCBmcm9tICcuL2dyaWQuanMnO1xuXG4vKipcbiAqIFRoZSBqUXVlcnkgR2FtZSBvZiBsaWZlIGNsYXNzXG4gKi9cbmZ1bmN0aW9uIEdhbWVPZkxpZmUgKCRncmlkLCAkc2NvcmUsICRtZXNzYWdlKSB7XG5cbiAgICBjb25zdCBpbnRlcnZhbFRpbWUgPSAxMDAwO1xuICAgIGxldCBnID0gbmV3IEdyaWQoMTApO1xuICAgIGxldCBpbnRlcnZhbCA9IG51bGw7XG4gICAgbGV0IGdlbmVyYXRpb25zID0gMDtcbiAgICBsZXQgcHJldkdyaWQgPSAnJztcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQVUJMSUMgTUVUSE9EU1xuXG4gICAgdGhpcy5zdGFydCA9ICgpID0+IHtcbiAgICAgICAgaW5pdCgpO1xuICAgICAgICBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIGxldCByZXN1bHQgPSBnLnRpY2soKTtcbiAgICAgICAgICAgIGdlbmVyYXRpb25zKys7XG4gICAgICAgICAgICB0aGlzLmRyYXdHcmlkKCk7XG4gICAgICAgICAgICBpZiAoIXJlc3VsdC5saXZlQ2VsbHMpIHtcbiAgICAgICAgICAgICAgICAvLyBvdXIgcG9wdWxhdGlvbiBoYXMgZGllZCwgdGhlIGdhbWUgb2YgbGlmZSBpcyBvdmVyXG4gICAgICAgICAgICAgICAgJG1lc3NhZ2UudGV4dCgnVGhlIHBvcHVsYXRpb24gaGFzIGRpZWQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVzdWx0LmN1cnJlbnRHcmlkID09PSBwcmV2R3JpZCkge1xuICAgICAgICAgICAgICAgIC8vIG91ciBwb3B1bGF0aW9uIGhhcyBzdGFnbmF0ZWQsIHRoZSBnYW1lIG9mIGxpZmUgaXMgb3ZlciBcbiAgICAgICAgICAgICAgICAkbWVzc2FnZS50ZXh0KCdUaGUgcG9wdWxhdGlvbiBoYXMgc3RhZ25hdGVkJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJG1lc3NhZ2UudGV4dCgnTGl2ZSBjZWxsczogJyArIHJlc3VsdC5saXZlQ2VsbHMpO1xuICAgICAgICAgICAgcHJldkdyaWQgPSByZXN1bHQuY3VycmVudEdyaWQ7XG4gICAgICAgIH0sIGludGVydmFsVGltZSk7XG4gICAgfTtcblxuICAgIHRoaXMuc3RvcCA9ICgpID0+IHtcbiAgICAgICAgaWYgKGludGVydmFsKSB7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmxvYWRHcmlkID0gKHRhYmxlKSA9PiB7XG4gICAgICAgIGcubG9hZEdyaWQodGFibGUpO1xuICAgIH07XG5cbiAgICB0aGlzLmRyYXdHcmlkID0gKCkgPT4ge1xuICAgICAgICAkZ3JpZC5lbXB0eSgpO1xuICAgICAgICBnLmdyaWQuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICAgICAgbGV0ICRyb3cgPSAkKCc8dHI+PC90cj4nKTtcbiAgICAgICAgICAgIHJvdy5mb3JFYWNoKGNlbGwgPT4ge1xuICAgICAgICAgICAgICAgIGxldCAkY2VsbCA9ICQoJzx0ZD48L3RkPicpO1xuICAgICAgICAgICAgICAgIGlmIChjZWxsLmxpdmUpICRjZWxsLmFkZENsYXNzKCdsaXZlJyk7XG4gICAgICAgICAgICAgICAgJHJvdy5hcHBlbmQoJGNlbGwpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkZ3JpZC5hcHBlbmQoJHJvdyk7XG4gICAgICAgIH0pO1xuICAgICAgICAkc2NvcmUudGV4dChnZW5lcmF0aW9ucyk7XG4gICAgfTtcblxuICAgIC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQUklWQVRFIE1FVEhPRFNcbiAgICBcbiAgICBjb25zdCBpbml0ID0gKCkgPT4ge1xuICAgICAgICBnZW5lcmF0aW9ucyA9IDA7XG4gICAgICAgICRzY29yZS50ZXh0KCcwJyk7XG4gICAgICAgICRtZXNzYWdlLnRleHQoJycpO1xuICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgdGhpcy5kcmF3R3JpZCgpO1xuICAgIH07XG5cbiAgICBpbml0KCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVPZkxpZmU7XG4iLCJpbXBvcnQgR2FtZU9mTGlmZSBmcm9tICcuL2dhbWUtb2YtbGlmZS5qcyc7XG5cbihmdW5jdGlvbiAoKSB7XG5cdGxldCBnYW1lID0gbmV3IEdhbWVPZkxpZmUoXG5cdFx0JCgnI2dyaWQnKSwgXG5cdFx0JCgnI2dlbmVyYXRpb25zJyksXG5cdFx0JCgnI21lc3NhZ2UnKSk7XG5cblx0JCgnI3N0YXJ0R2FtZScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuXHRcdGxldCB0YWJsZSA9IFtdO1xuXHRcdCQoJyNncmlkIHRyJykuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdGxldCB0ciA9IFtdO1xuXHRcdFx0JCh0aGlzKS5maW5kKCd0ZCcpLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRyLnB1c2goJCh0aGlzKS5oYXNDbGFzcygnbGl2ZScpID8gdHJ1ZSA6IGZhbHNlKTtcblx0XHRcdH0pO1xuXHRcdFx0dGFibGUucHVzaCh0cik7XG5cdFx0fSk7XG5cdFx0Z2FtZS5sb2FkR3JpZCh0YWJsZSk7XG5cdFx0Z2FtZS5zdGFydCgpO1xuXHR9KTtcblxuXHQkKCcjc3RvcEdhbWUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHRnYW1lLnN0b3AoKTtcblx0fSk7XG5cblx0JCgnI2dyaWQgdGQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHQkKHRoaXMpLnRvZ2dsZUNsYXNzKCdsaXZlJyk7XG5cdH0pO1xuXG59KCkpO1xuIiwiaW1wb3J0IENlbGwgZnJvbSAnLi9jZWxsLmpzJztcblxuLyoqXG4gKiBUaGUgZ3JpZCBjbGFzc1xuICovXG5mdW5jdGlvbiBHcmlkKHNpemUpIHtcblxuXHRsZXQgZ3JpZFNpemUgPSBzaXplO1x0XG5cdHRoaXMuZ3JpZCA9IFtdO1x0XG5cblx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFBVQkxJQyBNRVRIT0RTXG5cblx0dGhpcy5jcmVhdGVHcmlkID0gKCkgPT4ge1xuXHRcdHRoaXMuZ3JpZCA9IFtdO1xuXHRcdGZvciAobGV0IGkgPSAwLCBsMSA9IGdyaWRTaXplOyBpIDwgbDE7IGkrKykge1xuXHRcdFx0bGV0IHJvdyA9IFtdO1xuXHRcdFx0Zm9yIChsZXQgaiA9IDAsIGwyID0gZ3JpZFNpemU7IGogPCBsMjsgaisrKSB7XG5cdFx0XHRcdHJvdy5wdXNoKG5ldyBDZWxsKCkpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5ncmlkLnB1c2gocm93KTtcblx0XHR9XG5cdH07XHRcblxuXHR0aGlzLmxvYWRHcmlkID0gKHRhYmxlKSA9PiB7XG5cdFx0aWYgKHRhYmxlLmxlbmd0aCAhPSB0aGlzLmdyaWQubGVuZ3RoKSBcblx0XHRcdHJldHVybjtcblxuXHRcdHRhYmxlLmZvckVhY2goKHRyLCB4KSA9PiB7XG5cdFx0XHR0ci5mb3JFYWNoKCh0ZCwgeSkgPT4ge1xuXHRcdFx0XHRpZiAodGQpIHtcblx0XHRcdFx0XHR0aGlzLmdyaWRbeF1beV0ucmlzZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuZ3JpZFt4XVt5XS5kaWUoKTtcblx0XHRcdFx0fVx0XHRcdFx0XG5cdFx0XHR9KTtcblx0XHR9KVxuXHR9O1xuXG5cdHRoaXMudGljayA9ICgpID0+IHtcblx0XHR0aGlzLmdyaWQgPSBuZXdHZW5lcmF0aW9uKCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGN1cnJlbnRHcmlkOiBlbmNvZGUoKSxcblx0XHRcdGxpdmVDZWxsczogZmluZExpdmVDZWxscygpXG5cdFx0fTtcblx0fTtcblxuXHQvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUFJJVkFURSBNRVRIT0RTXG5cblx0Y29uc3QgY2xvbmVHcmlkID0gKCkgPT4ge1xuXHRcdGxldCBuZXdHcmlkID0gW107XG5cdFx0dGhpcy5ncmlkLmZvckVhY2gocm93ID0+IHtcblx0XHRcdGxldCBuZXdSb3cgPSBbXTtcblx0XHRcdHJvdy5mb3JFYWNoKGNlbGwgPT4ge1xuXHRcdFx0XHRuZXdSb3cucHVzaChuZXcgQ2VsbChjZWxsLmxpdmUpKTtcblx0XHRcdH0pO1xuXHRcdFx0bmV3R3JpZC5wdXNoKG5ld1Jvdyk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG5ld0dyaWQ7XG5cdH07XG5cblx0Y29uc3QgbmV3R2VuZXJhdGlvbiA9ICgpID0+IHtcblx0XHRsZXQgbmV3R3JpZCA9IGNsb25lR3JpZCgpO1xuXHRcdHRoaXMuZ3JpZC5mb3JFYWNoKChyb3csIHgpID0+IHtcblx0XHRcdHJvdy5mb3JFYWNoKChjZWxsLCB5KSA9PiB7XG5cdFx0XHRcdGxldCBsaXZlTmVpZ2hib3VycyA9IGNoZWNrTmVpZ2hib3Vycyh4LCB5KTtcblx0XHRcdFx0bmV3R3JpZFt4XVt5XSA9IGdldE5ld0NlbGwoY2VsbCwgbGl2ZU5laWdoYm91cnMpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIG5ld0dyaWQ7XG5cdH07XG5cblx0Y29uc3QgZmluZExpdmVDZWxscyA9ICgpID0+IHtcblx0XHRyZXR1cm4gdGhpcy5ncmlkLnJlZHVjZSgobGl2ZUNlbGxzSW5Sb3csIHJvdykgPT4ge1xuXHRcdFx0cmV0dXJuIGxpdmVDZWxsc0luUm93ICsgcm93LnJlZHVjZSgobGl2ZUNlbGxzLCBjZWxsKSA9PiB7XG5cdFx0XHRcdHJldHVybiBsaXZlQ2VsbHMgKyAoY2VsbC5saXZlID8gMSA6IDApO1xuXHRcdFx0fSwgMCk7XG5cdFx0fSwgMCk7XG5cdH07XG5cblx0Y29uc3QgY2hlY2tOZWlnaGJvdXJzID0gKHgsIHkpID0+IHtcblx0XHRsZXQgbGl2ZU5laWdoYm91cnMgPSAwO1xuXHRcdC8vIGNoZWNrIDggbmVpZ2hib3VycyBjbG9ja3dpc2Vcblx0XHRsaXZlTmVpZ2hib3VycyArPSBjaGVja05laWdoYm91cihnZXRQcmV2SW5kZXgoeCksIGdldFByZXZJbmRleCh5KSk7IC8vIHRvcCBsZWZ0IGNlbGxcblx0XHRsaXZlTmVpZ2hib3VycyArPSBjaGVja05laWdoYm91cih4LCBnZXRQcmV2SW5kZXgoeSkpOyAvLyB0b3AgY2VsbFxuXHRcdGxpdmVOZWlnaGJvdXJzICs9IGNoZWNrTmVpZ2hib3VyKGdldE5leHRJbmRleCh4KSwgZ2V0UHJldkluZGV4KHkpKTsgLy8gdG9wIHJpZ2h0IGNlbGxcblx0XHRsaXZlTmVpZ2hib3VycyArPSBjaGVja05laWdoYm91cihnZXROZXh0SW5kZXgoeCksIHkpOyAvLyByaWdodCBjZWxsXG5cdFx0bGl2ZU5laWdoYm91cnMgKz0gY2hlY2tOZWlnaGJvdXIoZ2V0TmV4dEluZGV4KHgpLCBnZXROZXh0SW5kZXgoeSkpOyAvLyBib3R0b20gcmlnaHQgY2VsbFxuXHRcdGxpdmVOZWlnaGJvdXJzICs9IGNoZWNrTmVpZ2hib3VyKHgsIGdldE5leHRJbmRleCh5KSk7IC8vIGJvdHRvbSBjZWxsXG5cdFx0bGl2ZU5laWdoYm91cnMgKz0gY2hlY2tOZWlnaGJvdXIoZ2V0UHJldkluZGV4KHgpLCBnZXROZXh0SW5kZXgoeSkpOyAvLyBib3R0b20gbGVmdCBjZWxsXG5cdFx0bGl2ZU5laWdoYm91cnMgKz0gY2hlY2tOZWlnaGJvdXIoZ2V0UHJldkluZGV4KHgpLCB5KTsgLy8gbGVmdCBjZWxsXG5cdFx0cmV0dXJuIGxpdmVOZWlnaGJvdXJzO1xuXHR9O1xuXG5cdGNvbnN0IGNoZWNrTmVpZ2hib3VyID0gKHgsIHkpID0+IHtcblx0XHRyZXR1cm4gdGhpcy5ncmlkW3hdW3ldLmxpdmUgPyAxIDogMDtcblx0fTtcblxuXHRjb25zdCBnZXRQcmV2SW5kZXggPSAoeCkgPT4ge1xuXHRcdHJldHVybiB4IC0gMSA8IDAgPyBncmlkU2l6ZSAtIDEgOiB4IC0gMTtcblx0fTtcblxuXHRjb25zdCBnZXROZXh0SW5kZXggPSAoeCkgPT4ge1xuXHRcdHJldHVybiB4ICsgMSA9PT0gZ3JpZFNpemUgPyAwIDogeCArIDE7XG5cdH07XG5cblx0Y29uc3QgZ2V0TmV3Q2VsbCA9IChjZWxsLCBsaXZlTmVpZ2hib3VycykgPT4ge1xuXHRcdGlmIChsaXZlTmVpZ2hib3VycyA8IDIgJiYgY2VsbC5saXZlKSB7XG5cdFx0XHQvLyBjZWxsIGRpZXMsIGFzIGlmIGNhdXNlZCBieSB1bmRlci1wb3B1bGF0aW9uXG5cdFx0XHRyZXR1cm4gY2VsbC5kaWUoKTtcblx0XHR9IGVsc2UgaWYgKGxpdmVOZWlnaGJvdXJzID4gMyAmJiBjZWxsLmxpdmUpIHtcblx0XHRcdC8vIGNlbGwgZGllcywgYXMgaWYgY2F1c2VkIGJ5IG92ZXJjcm93ZGluZ1xuXHRcdFx0cmV0dXJuIGNlbGwuZGllKCk7XG5cdFx0fSBlbHNlIGlmIChsaXZlTmVpZ2hib3VycyA9PT0gMyAmJiBjZWxsLmRlYWQpIHtcblx0XHRcdC8vIGNlbGwgYmVjb21lcyBsaXZlLCBhcyBpZiBieSByZXByb2R1Y3Rpb25cblx0XHRcdHJldHVybiBjZWxsLnJpc2UoKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNlbGw7IC8vIGNlbGwgbGl2ZXMgb24gdG8gdGhlIG5leHQgZ2VuZXJhdGlvblxuXHR9O1xuXG5cdGNvbnN0IGVuY29kZSA9ICgpID0+IHtcblx0XHRyZXR1cm4gdGhpcy5ncmlkLm1hcChyb3cgPT4ge1xuXHRcdFx0cmV0dXJuIHJvdy5tYXAoY2VsbCA9PiB7XG5cdFx0XHRcdHJldHVybiBjZWxsLmxpdmUgPyAxIDogMDtcblx0XHRcdH0pLmpvaW4oJycpO1xuXHRcdH0pLmpvaW4oJycpO1xuXHR9O1xuXG5cdGNvbnN0IGluaXQgPSAoKSA9PiB7XG5cdFx0dGhpcy5jcmVhdGVHcmlkKCk7XG5cdH07XG5cblx0aW5pdCgpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBHcmlkO1xuIl19

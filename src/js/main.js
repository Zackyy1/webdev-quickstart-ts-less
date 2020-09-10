//@ts-ignore
var Labyrinth;
(function (Labyrinth) {
    var MAZE_CONTAINER = '[data-js-maze-container]';
    var MAZE_CELL = '[data-js-maze-cell]';
    var CLASS_CURRENT = 'current';
    var CLASS_WALL = 'wall';
    var START_BUTTON = '[data-js-start]';
    var STEP_BUTTON = '[data-js-step]';
    var TEST = true;
    var correctPath = [];
    Labyrinth.Init = function () {
        console.log('Init Labyrinth v2');
        var params = {
            startCoordinates: { x: 2, y: 2 }
        };
        var Maze = buildMazeData(12, 17, params);
        buildMazeIntoHtml(Maze);
        initButtonListeners(Maze);
    };
    var buildMazeData = function (x, y, params) {
        var maze = [];
        for (var i = 0; i < y; i++) {
            maze[i] = [];
            for (var o = 0; o < x; o++) {
                maze[i][o] = {
                    x: o,
                    y: i,
                    data: {
                        visited: false,
                        current: false,
                        wall: false,
                        isGoal: false
                    }
                };
            }
        }
        console.log('Created maze:', maze, 'with endind point being the last cell');
        maze[maze.length - 1][maze[0].length - 1].data.isGoal = true;
        if (params) {
            if (params.startCoordinates) {
                maze[params.startCoordinates.y][params.startCoordinates.x].data.current = true;
            }
        }
        return maze;
    };
    var initButtonListeners = function (maze) {
        $(START_BUTTON).on('click', function (e) {
            tryPathfind(maze);
        });
        $(MAZE_CONTAINER).find(MAZE_CELL).on('click', function (e) {
            $(e.target).toggleClass(CLASS_WALL);
            console.log('Updating cell to be a wall');
            toggleWall($(e.target), maze);
        });
        $(STEP_BUTTON).on('click', function (e) {
            var currentX = $(MAZE_CONTAINER).find(MAZE_CELL + '.current').data('x');
            var currentY = $(MAZE_CONTAINER).find(MAZE_CELL + '.current').data('y');
            tryPathfind(maze, currentX, currentY);
        });
    };
    var toggleWall = function (el, maze) {
        console.log('recieved', el.data('cell-coordinates'));
        var coords = el.data('cell-coordinates');
        var x = coords.substring(0, coords.indexOf(','));
        var y = coords.substring(coords.indexOf(',') + 1);
        maze[y][x].data.wall = maze[y][x].data.wall === true ? false : true;
        console.log('Updated', maze[y][x]);
    };
    var buildMazeIntoHtml = function (maze) {
        var ROWS = maze.length;
        var COLUMNS = maze[0].length;
        var MAZE = $(MAZE_CONTAINER);
        for (var i = 0; i < ROWS; i++) {
            var rowHtml = $("<ul data-js-maze-row> </ul>");
            MAZE.append(rowHtml);
            for (var o = 0; o < COLUMNS; o++) {
                var mazeCell = "<li data-js-maze-cell data-cell-coordinates=\"" + maze[i][o].x + "," + maze[i][o].y + "\" data-x=\"" + maze[i][o].x + "\" data-y=\"" + maze[i][o].y + "\"\n                class=\"" + (maze[i][o].data.isGoal ? 'goal' : '') + " " + (maze[i][o].data.current ? 'current' : '') + "\"\n                \n               \n                > " + maze[i][o].x + "," + maze[i][o].y + "</li>";
                rowHtml.append(mazeCell);
            }
        }
    };
    var checkDirection = function (direction, maze, cell) {
        var nextCell;
        switch (direction) {
            case 'right':
                if (maze[cell.y][cell.x + 1]) {
                    nextCell = maze[cell.y][cell.x + 1];
                    if (cell.x < maze[0].length - 1 && nextCell.data.visited == false && nextCell.data.wall == false) {
                        console.log('can go right');
                        return true;
                    }
                }
                break;
            case 'down':
                if (maze[cell.y + 1]) {
                    nextCell = maze[cell.y + 1][cell.x];
                    if (cell.y < maze.length - 1 && nextCell.data.visited == false && nextCell.data.wall == false) {
                        console.log('can go down');
                        return true;
                    }
                }
                break;
            case 'left':
                if (maze[cell.y][cell.x - 1]) {
                    nextCell = maze[cell.y][cell.x - 1];
                    if (cell.x > 0 && nextCell.data.visited == false && nextCell.data.wall == false) {
                        console.log('can go left');
                        return true;
                    }
                }
                break;
            case 'up':
                if (maze[cell.y - 1]) {
                    nextCell = maze[cell.y - 1][cell.x];
                    if (cell.y > 0 && nextCell.data.visited == false && nextCell.data.wall == false) {
                        console.log('can go up');
                        return true;
                    }
                }
                else {
                    console.log('CANT GO UP');
                }
                break;
            default:
                break;
        }
        return false;
    };
    var go = function (direction, cell) {
        var initX = cell.x;
        var initY = cell.y;
        var newPosition = (cell);
        switch (direction) {
            case 'right':
                newPosition.x = cell.x + 1;
                break;
            case 'down':
                newPosition.y = cell.y + 1;
                break;
            case 'left':
                newPosition.x = cell.x - 1;
                break;
            case 'up':
                newPosition.y = cell.y - 1;
                break;
            default:
                break;
        }
        console.log('Moved from', initX, initY, 'to', newPosition.x, newPosition.y);
        return newPosition;
    };
    var tryPathfind = function (maze, x, y) {
        /**
         * 1) Assign a starting point (x, y)
         * 2) Try moving right or down or left or up
         * 3) if can move or next cell is not visited yet, save current position as visited, move there,
         * 4) if can't move any further or all positions are visited, come back to last visited position with available moving space
         * 5) if reached the end, you won :)
         */
        console.log('------ new iteration -------\n');
        if (!x && !y) {
            console.log('Standing on 0, 0');
            x = 0;
            y = 0;
            maze[y][x].data.visited = true;
            correctPath = [];
            correctPath.push(maze[y][x]);
        }
        var cell = maze[y][x];
        console.log('Can go everywhere?', checkDirection('right', maze, cell), checkDirection('down', maze, cell), checkDirection('left', maze, cell), checkDirection('up', maze, cell));
        if (cell.data.isGoal == true) {
            console.log('Reached the end :)');
        }
        else {
            // 2.1) Try moving right
            if (checkDirection('right', maze, cell)) {
                cell = go('right', cell);
                correctPath.push(cell);
            }
            else if (checkDirection('down', maze, cell)) {
                cell = go('down', cell);
                correctPath.push(cell);
            }
            else if (checkDirection('left', maze, cell)) {
                cell = go('left', cell);
                correctPath.push(cell);
            }
            else if (checkDirection('up', maze, cell)) {
                cell = go('up', cell);
                correctPath.push(cell);
            }
            else {
                correctPath.pop();
                cell = maze[correctPath[correctPath.length - 1].y][correctPath[correctPath.length - 1].x];
                cell.data.current = true;
                y = cell.y;
                x = cell.x;
                console.log('Cant move anywhere else :(, going to', correctPath[correctPath.length - 1].x, correctPath[correctPath.length - 1].y);
            }
            cell.data.visited = true;
            console.log('correct path:', correctPath);
            // Mark our current location in HTML
            // Remove current class from ALL list items
            $(MAZE_CONTAINER).find(MAZE_CELL).removeClass(CLASS_CURRENT);
            var CURRENT_CELL_ELEMENT = $(MAZE_CONTAINER).find(MAZE_CELL + "[data-cell-coordinates=\"" + cell.x + "," + cell.y + "\"]");
            CURRENT_CELL_ELEMENT.addClass(CLASS_CURRENT);
            if (!TEST) {
                setTimeout(function () { return tryPathfind(maze, cell.x, cell.y); }, 100);
            }
        }
    };
})(Labyrinth || (Labyrinth = {}));
$(document).ready(function () {
    Labyrinth.Init();
});

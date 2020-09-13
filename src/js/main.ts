
//@ts-ignore
module Labyrinth {

    const MAZE_CONTAINER: string = '[data-js-maze-container]';
    const MAZE_CELL: string = '[data-js-maze-cell]';
    const CLASS_CURRENT: string = 'current';
    const CLASS_WALL: string = 'wall';
    const START_BUTTON: string = '[data-js-start]';
    const STEP_BUTTON: string = '[data-js-step]';

    const MAZE_WIDTH: number = 7;
    const MAZE_HEIGHT: number = 7;

    let correctPath = [];
    let paths = [];


    export const Init = (): void => {
        console.log('Init Labyrinth v2')
        let params = {
            startCoordinates: {x: 2, y: 2}
        }
        let Maze = buildMazeData(MAZE_WIDTH, MAZE_HEIGHT, params);
        buildMazeIntoHtml(Maze);
        initButtonListeners(Maze);
    }


    const buildMazeData = (x: number, y: number, params?) => {

        let maze: any = [];

        for (let i = 0; i < y; i++) {
            maze[i] = [];
            for (let o = 0; o < x; o++) {
                maze[i][o] = { 
                    x: o, 
                    y: i, 
                    data: {
                            visited: false, 
                            current: false,
                            wall: false,
                            isGoal: false}};
            }
        }
        
        console.log('Created maze:', maze, 'with endind point being the last cell')
        maze[maze.length-1][maze[0].length-1].data.isGoal = true;
        if (params) {
            if (params.startCoordinates) {
                maze[params.startCoordinates.y][params.startCoordinates.x].data.current = true
            }
        }

        correctPath.push(maze[params.startCoordinates.y][params.startCoordinates.x]);
        paths.push(maze[params.startCoordinates.y][params.startCoordinates.x]);
        return maze;

    }

    const getCurrentCell = (maze) => {
        let currentX = $(MAZE_CONTAINER).find(MAZE_CELL+'.current').data('x');
        let currentY = $(MAZE_CONTAINER).find(MAZE_CELL+'.current').data('y');
        return maze[currentY][currentX]
    }

    const initButtonListeners = (maze) => {
        const CURRENT_CELL = getCurrentCell(maze);

        $(START_BUTTON).on('click', e => {
            tryPathfind(maze, CURRENT_CELL.x, CURRENT_CELL.y);
        });

        $(MAZE_CONTAINER).find(MAZE_CELL).on('click', e => {
            $(e.target).toggleClass(CLASS_WALL);
            console.log('Updating cell to be a wall')
            toggleWall($(e.target), maze);
        })

        $(STEP_BUTTON).on('click', e => {
            tryPathfind(maze, CURRENT_CELL.x, CURRENT_CELL.y, {step: true});
        })
    }

    const toggleWall = (el, maze) => {
        console.log('recieved', el.data('cell-coordinates'));
        let coords = el.data('cell-coordinates');
        let x = coords.substring(0, coords.indexOf(','));
        let y = coords.substring(coords.indexOf(',') + 1)
        maze[y][x].data.wall = maze[y][x].data.wall === true ?  false : true;
        console.log('Updated', maze[y][x])
    }

    const buildMazeIntoHtml = (maze) => {

        const ROWS: number = maze.length;
        const COLUMNS: number = maze[0].length;

        const MAZE: JQuery<HTMLElement> = $(MAZE_CONTAINER);
        for (let i = 0; i < ROWS; i++) {
            let rowHtml = $(`<ul data-js-maze-row> </ul>`);
            MAZE.append(rowHtml);
            for (let o = 0; o < COLUMNS; o++) {
                
                let mazeCell = `<li data-js-maze-cell data-cell-coordinates="${maze[i][o].x},${maze[i][o].y}" data-x="${maze[i][o].x}" data-y="${maze[i][o].y}"
                class="${maze[i][o].data.isGoal ? 'goal' : ''} ${maze[i][o].data.current ? 'current' : ''}"
                
               
                > ${maze[i][o].x},${maze[i][o].y}</li>`
                
                ;
                rowHtml.append(mazeCell);
            } 
        }
    }

    const checkDirection = (direction, maze, cell) => {
        let nextCell;
        let toReturn = false;
        switch (direction) {
            case 'right':
                if (maze[cell.y][cell.x+1]) {
                    nextCell = maze[cell.y][cell.x+1];
                    if (cell.x < maze[0].length-1 && nextCell.data.visited == false && nextCell.data.wall == false) {
                        console.log('can go right')
                        toReturn = true
                    }
                }
                
                break;
            case 'down':
                if (maze[cell.y+1]) {
                    nextCell = maze[cell.y+1][cell.x];
                    if (cell.y < maze.length-1 && nextCell.data.visited == false && nextCell.data.wall == false) {
                        console.log('can go down')
                        toReturn = true
                    }
                }
                break;

            case 'left':
                if (maze[cell.y][cell.x-1]) {
                    nextCell = maze[cell.y][cell.x-1];
                    if (cell.x > 0 && nextCell.data.visited == false && nextCell.data.wall == false) {
                        console.log('can go left')
                        toReturn = true
    
                    } 
                }
                
            break;
            case 'up':
                if (maze[cell.y-1]) {
                    nextCell = maze[cell.y-1][cell.x];
                    if (cell.y > 0 && nextCell.data.visited == false && nextCell.data.wall == false) {
                        console.log('can go up')
                        toReturn = true
    
                    }
                }
            break;
        
            default:
                break;
        }

        if (toReturn === true) {
            paths.push(cell.x, cell.y);
        }
        return toReturn
    }


    const go = (direction, cell) => {
        let initX = cell.x;
        let initY = cell.y
        let newPosition = (cell);
        newPosition.data.visited = true;


        switch (direction) {
            case 'right':
                newPosition.x = cell.x + 1
                break;
            case 'down':
                newPosition.y = cell.y + 1
                break;
            case 'left':
                newPosition.x = cell.x - 1
            break;
            case 'up':
                newPosition.y = cell.y - 1
            break;

            default:
                break;
        }
        console.log('Moved from', initX, initY, 'to', newPosition.x, newPosition.y)
        return newPosition
    }

    const updateCurrentCell = (cell) => {
        $(MAZE_CONTAINER).find(MAZE_CELL).removeClass(CLASS_CURRENT);
         const CURRENT_CELL_ELEMENT: JQuery<HTMLElement> = $(MAZE_CONTAINER).find(`${MAZE_CELL}[data-cell-coordinates="${cell.x},${cell.y}"]`);
         CURRENT_CELL_ELEMENT.addClass(CLASS_CURRENT);
    };
  
    const tryPathfind = (maze, x?, y?, params?) => {
        /**
         * 1) Assign a starting point (x, y)
         * 2) Try moving right or down or left or up
         * 3) if can move or next cell is not visited yet, save current position as visited, move there, 
         * 4) if can't move any further or all positions are visited, come back to last visited position with available moving space
         * 5) if reached the end, you won :)
         */

        //  debugger

        console.log('------ new iteration -------\n')
       

         if (!x && !y) {
            console.log('Standing on 0, 0')
            x = 0;
            y = 0;
            maze[y][x].data.visited = true;
            correctPath = [];
         }

         let cell = maze[y][x];
         console.log('Current cell:', cell);

         
         if (cell.data.isGoal == true) {
            console.log('Reached the end :)');
           
        } else {

        correctPath.push(cell);
        console.log(correctPath);

        cell.data.current = false;

        // console.log('Can go everywhere?', 
        //  'right', checkDirection('right', maze, cell),
        //  'down', checkDirection('down', maze, cell),
        //  'left', checkDirection('left', maze, cell),
        //  'up', checkDirection('up', maze, cell)
        //  )

         // 2.1) Try moving right
         if (checkDirection('right', maze, cell)) {
            cell = go('right', cell)

        } else if (checkDirection('down', maze, cell)) {
            cell = go('down', cell)

        } else if (checkDirection('left', maze, cell)) {
            cell = go('left', cell)

        } else if (checkDirection('up', maze, cell)) {
            cell = go('up', cell)

        } else {
            // correctPath.pop();
            cell.data.visited = true;
            cell.data.current = false;

            // cell = maze[correctPath[correctPath.length-1].y][correctPath[correctPath.length-1].x];
            correctPath.pop();
            cell = correctPath.pop();

            console.log('Now we\'re gonna switch to', maze[correctPath[correctPath.length-1].y][correctPath[correctPath.length-1].x], correctPath[correctPath.length-1].x, correctPath[correctPath.length-1].y)

            cell.data.current = true;
            y = cell.y;
            x = cell.x;
            console.log('Cant move anywhere else :(, going to', x, y); 
         
        }

        let r = '';
        correctPath.map(e => {
            r+=e;
        })
        $('[data-js-info]').text(r);

        console.log('paths:', paths)
        
        

        updateCurrentCell(cell);

        // Repeat
         if ( ( params && params.step === false ) || !params) {
            // console.log('step', params, params.step)
            setTimeout( () => tryPathfind(maze, cell.x, cell.y, params), 100);
         }
        }

    };




}

$(document).ready( () => {
    Labyrinth.Init();

})

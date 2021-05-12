import _ from "lodash";
const canvas = document.getElementById("gol-canvas") as HTMLCanvasElement;

const _drawingContext = canvas.getContext("2d");

const squareSize = 10;
const boardWidth = canvas.width / squareSize;
const boardHeight = canvas.height / squareSize;

console.log(`${boardHeight}x${boardWidth}`);

const squareOnColor = "#fff90d";
const squareOffColor = "#fff90d44";

class Square {
  static draw(context: CanvasRenderingContext2D, [x, y]: [number, number], color: string, size: number) {
    context.fillStyle = color;
    context.clearRect(x, y, size, size);
    context.fillRect(x, y, size, size);
  }
}

class Board {
  private data: Array<Array<boolean>>;

  constructor(public width: number, public height: number) {
    this.data = this.createBoard();
  }

  createBoard() {
    return _.times(this.height, () => _.times(this.width, () => false));
  }

  randomize() {
    this.transformCells(() => Math.random() < 0.2);
  }

  boardCoordinates(cellSize: number, [x, y]: [number, number]): [number, number] {
    return [x * cellSize, y * cellSize];
  }

  getLocation(x: number, y: number): boolean {
    return this.data[(y + this.height) % this.height][(x + this.width) % this.width];
  }

  getNeighbors(x: number, y: number): Array<boolean> {
    return [
      this.getLocation(x - 1, y),
      this.getLocation(x + 1, y),
      this.getLocation(x, y + 1),
      this.getLocation(x, y - 1),
      this.getLocation(x + 1, y + 1),
      this.getLocation(x + 1, y - 1),
      this.getLocation(x - 1, y + 1),
      this.getLocation(x - 1, y - 1),
    ];
  }

  transformCells(map: (value: boolean, x: number, y: number) => boolean) {
    const newData = this.createBoard();
    this.data.forEach((row, y) => {
      row.forEach((col, x) => {
        newData[y][x] = map(col, x, y);
      });
    });
    this.data = newData;
  }

  /*
    1. Any live cell with two or three live neighbours survives.
    2. Any dead cell with three live neighbours becomes a live cell.
    3. All other live cells die in the next generation. Similarly, all other dead cells stay dead.
  */
  updateCells() {
    this.transformCells((value, x, y) => {
      const livingNeighbors = this.getNeighbors(x, y).filter((v) => v).length;
      if (value && (livingNeighbors === 2 || livingNeighbors === 3)) {
        return true;
      } else if (!value && livingNeighbors === 3) {
        return true;
      } else {
        return false;
      }
    });
  }

  draw(cellSize: number, context: CanvasRenderingContext2D) {
    this.data.forEach((row, y) => {
      row.forEach((col, x) => {
        Square.draw(context, this.boardCoordinates(cellSize, [x, y]), col ? squareOnColor : squareOffColor, squareSize);
      });
    });
  }
}

const board = new Board(boardWidth, boardHeight);
board.randomize();

board.draw(squareSize, _drawingContext);

setInterval(() => {
  board.updateCells();
  board.draw(squareSize, _drawingContext);
}, 100);

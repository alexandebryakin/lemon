import { EDirection, ICell, ICoordinates, IField, IModifier } from '../../types';
// import CellContentMover from '../field-manipulators/CellContentMover';

// class GravityModifier implements IModifier {
//   canModify(field: IField): boolean {
//     return !!field.cells.flat().find(this.findEmptyCellToMove);
//   }

//   modify(field: IField) {
//     const cell = field.cells.flat().find(this.findEmptyCellToMove);
//     if (!cell) return;

//     const newCoordinates = this.findEmptyCellToMove(cell);

//     if (newCoordinates) CellContentMover.with(field).moveFrom(cell.coordinates).to(newCoordinates);

//     return field;
//   }
//   findEmptyCellToMove(cell: ICell): ICoordinates | undefined {
//     const nextCoordinates = this.defineNextCoordinatesFor(cell);
//     return nextCoordinates.find((c) => cell.canMoveTo(c));
//   }

//   defineNextCoordinatesFor(cell: ICell): ICoordinates[] {
//     const direction = cell.gravity.direction;

//     const gravityMap = {
//       [EDirection.None]: cell.coordinates,

//       [EDirection.Bottom]: { x: cell.coordinates.x, y: cell.coordinates.y + 1 },
//       [EDirection.Top]: { x: cell.coordinates.x, y: cell.coordinates.y - 1 },
//       [EDirection.Left]: { x: cell.coordinates.x - 1, y: cell.coordinates.y },
//       [EDirection.Right]: { x: cell.coordinates.x - 1, y: cell.coordinates.y },

//       [EDirection.TopRight]: { x: cell.coordinates.x + 1, y: cell.coordinates.y - 1 },
//       [EDirection.TopLeft]: { x: cell.coordinates.x - 1, y: cell.coordinates.y - 1 },
//       [EDirection.BottomRight]: { x: cell.coordinates.x + 1, y: cell.coordinates.y + 1 },
//       [EDirection.BottomLeft]: { x: cell.coordinates.x - 1, y: cell.coordinates.y + 1 },
//     };

//     return [direction].flat().map((d) => gravityMap[d]);
//   }
// }

// // function buildPath(field: IField) {
// //   // there are 2 ways to build this:
// //   //   - via PUSH
// //   //   - via PULL
// //   // how to build ot via PULL??
// //   field.cells.filter((cell: ICell) => cell.isBlank());
// // }

// export default GravityModifier;

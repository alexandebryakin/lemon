import { EDirection, ICell, ICoordinates, IField, IModifier } from '../../types';
import EventObserver, { EVENTS } from '../EventObserver';

class FieldCellMover {
  field: IField;
  pickedCoordinates: ICoordinates = { x: 0, y: 0 };

  constructor(field: IField) {
    this.field = field;
  }

  static with(field: IField) {
    return new FieldCellMover(field);
  }

  takeFrom(coordinates: ICoordinates) {
    this.pickedCoordinates = coordinates;
    EventObserver.fire(EVENTS.ENTITY_PICKED, coordinates);
    return this;
  }

  moveTo(coordinates: ICoordinates) {
    const entity = this.field.cellAt(this.pickedCoordinates).pick();
    this.field.cellAt(coordinates).put(entity);
    EventObserver.fire(EVENTS.ENTITY_PLACED, coordinates);
  }
}

class GravityModifier implements IModifier {
  canModify(field: IField): boolean {
    return !!field.cells.flat().find(this.findEmptyCellToMove);
  }

  modify(field: IField) {
    const cell = field.cells.flat().find(this.findEmptyCellToMove);
    if (!cell) return;

    const newCoordinates = this.findEmptyCellToMove(cell);

    // field.takeFrom(cell.coordinates).moveTo(newCoordinates)
    FieldCellMover.with(field).takeFrom(cell.coordinates).moveTo(newCoordinates);

    // field.pick(cell.coordinates).moveTo(newCoordinates)

    return field;
  }
  findEmptyCellToMove(cell: ICell): ICoordinates | undefined {
    const nextCoordinates = this.defineNextCoordinatesFor(cell);
    return nextCoordinates.find((c) => cell.canMoveTo(c));
  }

  defineNextCoordinatesFor(cell: ICell): ICoordinates[] {
    const direction = cell.gravity.direction;

    const gravityMap = {
      [EDirection.None]: cell.coordinates,

      [EDirection.Bottom]: { x: cell.coordinates.x, y: cell.coordinates.y + 1 },
      [EDirection.Top]: { x: cell.coordinates.x, y: cell.coordinates.y - 1 },
      [EDirection.Left]: { x: cell.coordinates.x - 1, y: cell.coordinates.y },
      [EDirection.Right]: { x: cell.coordinates.x - 1, y: cell.coordinates.y },

      [EDirection.TopRight]: { x: cell.coordinates.x + 1, y: cell.coordinates.y - 1 },
      [EDirection.TopLeft]: { x: cell.coordinates.x - 1, y: cell.coordinates.y - 1 },
      [EDirection.BottomRight]: { x: cell.coordinates.x + 1, y: cell.coordinates.y + 1 },
      [EDirection.BottomLeft]: { x: cell.coordinates.x - 1, y: cell.coordinates.y + 1 },
    };

    return [direction].flat().map((d) => gravityMap[d]);
  }
}

export default GravityModifier;

import { EAction, EEntityTypeNeutral, ICell, ICoordinates, IDimensions, IField, IUserMove } from '../../types';
import { Coordinates } from '../Coordinates';
import CellContentMover from '../field-manipulators/CellContentMover';
import Shape from '../Shape';
import EntityDestroyer, { CellContentInvoker } from './CellContentInvoker';

class ShapeLocator {
  static gatherCoordinates(field: IField, shape: Shape): ICoordinates[] {
    const fieldMatrix = new Matrix(field.dimensions);
    const shapeMatrix = new Matrix(shape.dimensions);
    const shapeCoordinates = shapeMatrix.filter(shape.activeAt);

    const shapeCoordinatesInField = (point: ICoordinates) => shapeCoordinates.map((c) => Coordinates.sum(point, c));

    const point = fieldMatrix.consider(shape.dimensions).find((fieldCoordinate: ICoordinates) => {
      const cells = field.cellsAt(shapeCoordinatesInField(fieldCoordinate));
      const compatible = (cell: ICell, index: number, cells: ICell[]) => cells[index].equalTo(cell);
      return cells.every(compatible);
    });

    if (!point) return [];

    return shapeCoordinatesInField(point);
  }
}

class Matrix {
  dimensions: IDimensions;

  constructor(dimensions: IDimensions) {
    this.dimensions = dimensions;
  }

  consider(dimensions: IDimensions) {
    const redefinedDimensions = {
      width: dimensions.width + 1,
      height: dimensions.height + 1,
    };
    return new Matrix(redefinedDimensions);
  }

  find(callback: (coordinates: ICoordinates) => boolean): ICoordinates | undefined {
    for (let x = 0; x < this.dimensions.height; x++) {
      for (let y = 0; y < this.dimensions.width; y++) {
        const coordinates = { x, y };
        if (callback(coordinates) === true) return coordinates;
      }
    }

    return undefined;
  }

  filter(callback: (coordinate: ICoordinates) => boolean): ICoordinates[] {
    const coordinates: ICoordinates[] = [];
    for (let x = 0; x < this.dimensions.height; x++) {
      for (let y = 0; y < this.dimensions.width; y++) {
        const coordinate = { x, y };
        if (callback(coordinate) === true) coordinates.push(coordinate);
      }
    }
    return coordinates;
  }
}

class MutationModifier {
  shapes: Shape[] = [];
  // move: IUserMove;

  constructor(shapes: Shape[], move?: IUserMove) {
    this.shapes = shapes;
    // this.move = move;
  }

  modify(field: IField, putMutatedTo?: ICoordinates) {
    const shape = this.locateShape(field, this.shapes);

    if (!shape) return;

    const area = ShapeLocator.gatherCoordinates(field, shape);

    CellContentInvoker.upon(field).at(area).perform(EAction.DESTROY);

    if (shape.type == EEntityTypeNeutral.SimpleBlue) return;
    if (shape.type == EEntityTypeNeutral.SimpleGreen) return;
    if (shape.type == EEntityTypeNeutral.SimpleRed) return;

    const entity = new Entity(shape.type); // TODO: Delegate to some other class

    if (putMutatedTo) field.putAt(putMutatedTo, entity);

    return field;
  }

  canModify(field: IField): boolean {
    return !!this.locateShape(field, this.shapes);
  }

  private locateShape(field: IField, shapes: Shape[]): Shape | undefined {
    const allShapes = shapes.map((s) => s.withAlternatives()).flat();

    return allShapes.find((shape: Shape) => this.canMutate(field, shape));
  }

  private canMutate(field: IField, shape: Shape) {
    const shapeCoordinatesInField = ShapeLocator.gatherCoordinates(field, shape);
    return shapeCoordinatesInField.length > 0;
  }
}

export default MutationModifier;

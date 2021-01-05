import { EEntityTypeNeutral, ICell, ICoordinates, IDimensions, IField, IModifier } from '../../types';
import Shape from '../Shape';

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

class Coordinates {
  static sum(a: ICoordinates, b: ICoordinates): ICoordinates {
    return { x: a.x + b.x, y: a.y + b.y };
  }
}

class MutationModifier implements IModifier {
  shapes: Shape[] = [];

  constructor(shapes: Shape[]) {
    this.shapes = shapes;
  }

  modify(field: IField) {
    const shape = this.locateShape(field, this.shapes);

    if (!shape) return;

    const coordinates = ShapeLocator.gatherCoordinates(field, shape);
    field.cellsAt(coordinates).forEach((cell: ICell) => cell.contentDestroy());

    if (shape.type == EEntityTypeNeutral.SimpleBlue) return;
    if (shape.type == EEntityTypeNeutral.SimpleGreen) return;
    if (shape.type == EEntityTypeNeutral.SimpleRed) return;

    const entity = new Entity(shape.type);

    field.put(entity, coordinates);
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

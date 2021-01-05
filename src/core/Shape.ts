import { ICoordinates, IDimensions, TEntityType } from '../types';

export type TFigure = Array<(0 | 1)[]>;

export interface IShape {
  figure: TFigure;
  dimensions: IDimensions;
  activeAt: (coordinates: ICoordinates) => boolean;
}

class Shape implements IShape {
  type: TEntityType;
  figure: TFigure;
  dimensions: IDimensions;

  constructor(figure: TFigure, type: TEntityType) {
    this.figure = figure;
    this.type = type;
    this.dimensions = {
      height: figure.length,
      width: figure[0].length,
    };
  }

  activeAt(coordinates: ICoordinates): boolean {
    const { x, y } = coordinates;
    return this.figure[x][y] == 1;
  }

  withAlternatives(): Shape[] {
    const _90deg = new Shape(this.rotateClockwise(), this.type);
    const _180deg = new Shape(_90deg.rotateClockwise(), this.type);
    const _270deg = new Shape(_180deg.rotateClockwise(), this.type);
    return [this, _90deg, _180deg, _270deg];
    // --OR--
    return [new Shape(this.figure, this.type), _90deg, _180deg, _270deg];
  }

  rotateClockwise(): TFigure {
    const figure = this.figure;
    return figure[0].map((_v, index) => figure.map((row) => row[index]).reverse());
  }
}

export default Shape;

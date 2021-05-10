import { ICoordinates } from '../types';

export class Coordinates {
  static area: ICoordinates[] = [];
  static point: ICoordinates;

  static sum(a: ICoordinates, b: ICoordinates): ICoordinates {
    return { x: a.x + b.x, y: a.y + b.y };
  }

  static unique(area: ICoordinates[]): ICoordinates[] {
    const points: ICoordinates[] = [];
    area.forEach((point: ICoordinates) => {
      const exists = points.some(this.__existancePredicate(point));
      if (!exists) points.push(point);
    });
    return points;
  }

  static from(area: ICoordinates[]) {
    this.area = area;
    return this;
  }

  static withdraw(area: ICoordinates[]): ICoordinates[] {
    return this.area.filter((point: ICoordinates) => {
      const exists = area.some(this.__existancePredicate(point));
      return !exists;
    });

    // test case:
    // const area1 = [
    //   { x: 1, y: 1 },
    //   { x: 1, y: 2 },
    //   { x: 2, y: 1 },
    //   { x: 2, y: 2 },
    // ];
    // const area2 = [
    //   { x: 1, y: 2 },
    //   { x: 2, y: 1 },
    // ];
    // Coordinates.from(area1).withdraw(area2);
    // Coordinates.from(area1).withdraw([]]); // => area1
    // Coordinates.from([]).withdraw(area2); // => []
  }

  static at(area: ICoordinates[]) {
    return this.from(area);
  }

  static exists(point: ICoordinates): boolean {
    return this.area.some(this.__existancePredicate(point));
  }

  static absent(point: ICoordinates): boolean {
    return !this.exists(point);
  }

  static __existancePredicate(point: ICoordinates): (point: ICoordinates) => boolean {
    return ({ x, y }: ICoordinates) => x == point.x && y == point.y;
  }
}

export default Coordinates;

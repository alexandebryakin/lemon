import { IField, ICoordinates } from '../../types';
import EventObserver, { EVENTS, IEntityPickedData, IEntityPlacedData } from '../EventObserver';

/** Moves entity by coordinates from one cell to another and fires events accordingly
 *   Usage:
 *     CellContentMover.with(field).moveFrom(coords).to(coords)
 */
class CellContentMover {
  static field: IField;
  static prevCoordinates: ICoordinates;

  static with(field: IField) {
    this.field = field;
    return this;
  }

  static moveFrom(coordinates: ICoordinates) {
    this.prevCoordinates = coordinates;
    return this;
  }

  static to(coordinates: ICoordinates): void {
    const entity = this.field.pickAt(this.prevCoordinates);
    EventObserver.fire(EVENTS.ENTITY_PICKED, { coordinates: this.prevCoordinates } as IEntityPickedData);

    this.field.putAt(coordinates, entity);
    EventObserver.fire(EVENTS.ENTITY_PICKED, { coordinates } as IEntityPlacedData);
  }
}

export default CellContentMover;

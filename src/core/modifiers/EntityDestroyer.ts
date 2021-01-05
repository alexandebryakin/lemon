import { ICoordinates, IField, IModifier, EEntityTypeDestructive } from '../../types';

interface IEntityDestroyer {
  destroy: (area: ICoordinates[], field: IField) => IField;
}
class EntityDestroyer implements IEntityDestroyer {
  destroy(area: ICoordinates[], field: IField) {
    const cells = area.map(field.cellAt);
    cells.forEach((cell) => cell.contentDestroy());
    return field;
  }
}
class DestroyerModifier implements IModifier {
  modify(field: IField, entity: IEntity): IField {
    if (entity.type == EEntityTypeDestructive.Bomb) {
      const area = this.bombDestructionArea(entity.coordinates);
      const affectedField = new EntityDestroyer().destroy(area, field);
      return affectedField;
    }

    return field;
  }

  private bombDestructionArea(center: ICoordinates): ICoordinates[] {
    const coordinates: ICoordinates[] = [];
    const { x, y } = center;
    coordinates.push(center);
    coordinates.push({ x: x - 1, y });
    coordinates.push({ x: x - 1, y: y - 1 });
    /// TODO: ... and so on ...
    return coordinates;
  }
}

export default DestroyerModifier;

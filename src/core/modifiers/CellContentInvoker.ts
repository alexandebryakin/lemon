import {
  ICoordinates,
  IField,
  IModifier,
  EEntityTypeDestructive,
  ICell,
  EAction,
  IEntity,
  ECellType,
} from '../../types';
import EventObserver, { EVENTS, IEntityDestroyedData, IProtectionDestroyedData } from '../EventObserver';

interface IInvoker {
  canInvoke: (cell: ICell, type: EAction) => boolean;
  invoke: (cell: ICell) => void;
}

class EmptyCellInvoker implements IInvoker {
  canInvoke(cell: ICell, _type: EAction): boolean {
    return cell.type == ECellType.None;
  }

  invoke(_cell: ICell) {
    return;
  }
}
class ProtectionInvoker implements IInvoker {
  canInvoke(cell: ICell, type: EAction): boolean {
    const protection = [...cell.content.protectors].pop();
    return !!protection?.destructibleBy(type);
  }

  invoke(cell: ICell) {
    const protection = cell.content.protectors.pop();
    const coordinates = cell.coordinates;
    const data = { protection, coordinates } as IProtectionDestroyedData;
    EventObserver.fire(EVENTS.PROTECTION_DESTROYED, data);
  }
}
class EntityInvoker implements IInvoker {
  canInvoke(cell: ICell, type: EAction): boolean {
    return cell.content.destructibleBy(type);
  }

  invoke(cell: ICell) {
    cell.contentDestroy();
    const data = { coordinates: cell.coordinates } as IEntityDestroyedData;
    EventObserver.fire(EVENTS.ENTITY_DESTROYED, data);
  }
}
export class CellContentInvoker {
  static field: IField;
  static area: ICoordinates[];

  static upon(field: IField) {
    this.field = field;
    return this;
  }

  static at(area: ICoordinates | ICoordinates[]) {
    const points = Array.isArray(area) ? area : [area];
    this.area = points;
    return this;
  }

  static perform(action: EAction): IField {
    const cells = this.area.map(this.field.cellAt);

    const handlers = [new EmptyCellInvoker(), new ProtectionInvoker(), new EntityInvoker()];

    cells.forEach((cell: ICell) => {
      const handler = handlers.find((h: IInvoker) => h.canInvoke(cell, action));
      handler?.invoke(cell);
    });

    return this.field;
  }
}

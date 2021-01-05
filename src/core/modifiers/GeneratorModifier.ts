import { IModifier, IField, ICell, EEntityTypeConstructive, ICoordinates, EDirection } from '../../types';

class GeneratorModifier implements IModifier {
  canModify(field: IField) {
    return false;
  }

  modify(field: IField) {
    const generators = (cell: ICell) => cell.content.type == EEntityTypeConstructive.Generator;
    const cellsWithGenerators = field.cells.flat().filter(generators);
    const findPlaceToPutEntity = (cell: ICell) => this.coordinatesByDirection(cell.coordinates, cell.content.direction);
    const generatorCell = cellsWithGenerators.find((cell: ICell) => {
      const coordinates = this.coordinatesByDirection(cell);
      return coordinates && field.cellAt(coordinates).isBlank();
    });
    if (!generatorCell) return;

    const coordinates = this.coordinatesByDirection(generatorCell);
    field.cellAt(coordinates).put(EntityGenerator.produce(generatorCell.content)); ////// --??????--
  }

  private coordinatesByDirection(cell: ICell): ICoordinates | undefined {
    const { x, y } = cell.coordinates;
    const direction = cell.content.direction;

    if (direction == EDirection.Top) return { x: x, y: y - 1 };
    if (direction == EDirection.Right) return { x: x + 1, y: y };
    if (direction == EDirection.Bottom) return { x: x, y: y + 1 };
    if (direction == EDirection.Left) return { x: x - 1, y: y };

    return undefined;
  }
}

export default GeneratorModifier;

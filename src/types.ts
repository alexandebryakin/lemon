import { Coordinates } from './core/Coordinates';
import { CellContentInvoker } from './core/modifiers/CellContentInvoker';
import GeneratorModifier from './core/modifiers/GeneratorModifier';
import GravityModifier from './core/modifiers/GravityModifier';
import MutationModifier from './core/modifiers/MutationModifier';
import Shape from './core/Shape';

export interface IDimensions {
  width: number;
  height: number;
}
export interface ICoordinates {
  x: number;
  y: number;
}
export interface IField {
  dimensions: IDimensions;
  cells: ICell[][];

  putAt: (coordinates: ICoordinates, entity: IEntity) => void;
  pickAt: (coordinates: ICoordinates) => IEntity;

  cellAt: (coordinate: ICoordinates) => ICell;
  cellsAt: (area: ICoordinates[]) => ICell[];

  swap: (e1: ICoordinates, e2: ICoordinates) => void;
}

// class Field implements IField {
//   constructor();
// }

export enum ECellType {
  None, // is not displayable and cannot keep anything inside
  Fillable, // displayable and can keep Entity inside
}

export interface ICell {
  type: ECellType;
  content: IEntity;

  gravity: IGravity;
  coordinates: ICoordinates;

  __properties: {
    canMoveTop: boolean;
    canMoveRight: boolean;
    canMoveBottom: boolean;
    canMoveLeft: boolean;
  };

  isBlank: () => boolean;
  isPresent: () => boolean;
  equalTo: (cell: ICell) => boolean;

  contentDestroy: () => void;

  canMoveTo: (coordinates: ICoordinates) => boolean;

  onEnterCell?: () => void;
  onLeaveCell?: () => void;
}

interface ISwappable {
  onSwapStart?: () => void;
  onSwapEnd?: () => void;
}

interface IMotionable {
  onMotionStart: () => void;
  onMotionEnd: () => void;
}

export enum EAction {
  DESTROY = 'DESTROY',
  HARD_TOUCH = 'HARD_TOUCH',
  SOFT_TOUCH = 'SOFT_TOUCH',
}
interface IDestructible {
  destructibleBy: (type: EAction) => boolean;
}
export interface IProtector extends IDestructible {}
class Protector implements IProtector {
  destructsBy: EAction[] = [];

  constructor(destructsBy: EAction[]) {
    this.destructsBy = destructsBy;
  }

  destructibleBy(type: EAction): boolean {
    return this.destructsBy.includes(type);
  }
}

interface IProtectable {
  protectionAttach: (protector: IProtector) => void;
  protectionDetach: (protector: IProtector) => void;
}

interface IEntityGenerator {
  types: TEntityType[];
  produce: () => IEntity;
}

export enum EEntityTypeConstructive {
  Generator = 'GENERATOR',
}
export enum EEntityTypeNeutral {
  SimpleRed = 'SIMPLE_RED',
  SimpleGreen = 'SIMPLE_GREEN',
  SimpleBlue = 'SIMPLE_BLUE',
}
export enum EEntityTypeDestructive {
  Airplane = 'AIRPLANE',
  Rocket = 'ROCKET',
  Bomb = 'BOMB',
}

export type TEntityType = EEntityTypeConstructive & EEntityTypeNeutral & EEntityTypeDestructive;

export interface IEntity extends IProtectable, IDestructible {
  type: TEntityType;
  // coordinates: ICoordinates;
  protectors: IProtector[];

  visible?: boolean;

  __properties?: any;

  onTouch?: () => void;
  onDestroy?: () => void;
}

export enum EDirection {
  None = 'NONE',

  Top = 'TOP',
  Right = 'RIGHT',
  Bottom = 'BOTTOM',
  Left = 'LEFT',

  TopRight = 'TOP_RIGHT',
  BottomRight = 'BOTTOM_RIGHT',
  BottomLeft = 'BOTTOM_LEFT',
  TopLeft = 'TOP_LEFT',
}

export interface IGravity {
  direction: EDirection | EDirection[];
  // direction: {
  //   main: EDirection;
  //   alternative: EDirection[];
  // };
}

enum EUserActionType {
  Tap,
  DoubleTap,
  Swap,
}

enum EActionType {
  Tap,
  DoubleTap,
  Swap,
  Merge,
}
interface IAction {
  type: EActionType;
  targetCoordinates: ICoordinates | ICoordinates[];
}

export interface IModifier {
  canModify?: (field: IField) => boolean;
  modify: (field: IField) => IField; // --OR-- void ???
}

type TCombinationRule = (type: TEntityType) => boolean;
class Combination {
  first: TEntityType;
  second: TEntityType;

  typeA: TEntityType;
  typeB: TEntityType;

  ruleA: TCombinationRule = (_type?: TEntityType) => false;

  constructor(first: TEntityType, second: TEntityType) {
    this.first = first;
    this.second = second;
  }
  rules() {
    return {
      oneOf: CombinationRules.oneOf,
      oneOfPrimitive: CombinationRules.oneOfPrimitive,
      equalTo: CombinationRules.equalTo,
    };
  }

  oneIs(rule: TCombinationRule) {
    this.ruleA = rule;
    return this;
  }

  andOtherIs(ruleB: TCombinationRule) {
    return (this.ruleA(this.first) && ruleB(this.second)) || this.ruleA(this.second) || ruleB(this.first);
  }
}
class CombinationRules {
  static primitives = [EEntityTypeNeutral.SimpleBlue, EEntityTypeNeutral.SimpleGreen, EEntityTypeNeutral.SimpleRed];

  static oneOf(types: unknown[]): TCombinationRule {
    return (type: unknown) => types.includes(type);
  }

  static oneOfPrimitive(): TCombinationRule {
    return this.oneOf(this.primitives);
  }

  static equalTo(typeB: unknown): TCombinationRule {
    return (typeA: unknown) => typeA === typeB;
  }

  static isPrimitive(type: TEntityType): boolean {
    return this.primitives.includes(type);
  }
}
class HardTouchAreaLocator {
  locate(area: ICoordinates[], dimensions: IDimensions): ICoordinates[] {
    const points = area.map((p) => this.forPoint(p, dimensions)).flat();

    const unique = Coordinates.unique(points);
    return Coordinates.from(unique).withdraw(area);
  }

  forPoint(point: ICoordinates, dimensions: IDimensions) {
    const { x, y } = point;
    const result: ICoordinates[] = [];
    if (x - 1 >= 0) result.push({ x: x - 1, y });
    if (x + 1 < dimensions.width) result.push({ x: x + 1, y });
    if (y - 1 >= 0) result.push({ x, y: y - 1 });
    if (y + 1 < dimensions.height) result.push({ x, y: y + 1 });
    return result;
  }
}

abstract class DestructionBehavior {
  field: IField;
  command: ICommandDestroy;

  constructor(field: IField, command: ICommandDestroy) {
    this.field = field;
    this.command = command;
  }

  perform(): IField {
    const point = this.command.coordinates;
    let modifiedField = CellContentInvoker.upon(this.field).at(point).perform(EAction.DESTROY);
    const area = new HardTouchAreaLocator().locate([point], this.field.dimensions);
    area.forEach((point: ICoordinates) => {
      modifiedField = CellContentInvoker.upon(modifiedField).at(point).perform(EAction.HARD_TOUCH);
    });

    return modifiedField;
  }

  destructionArea(): ICoordinates[] {
    throw 'Destruction area not implemented';
  }
}
class PrimitiveDestructionBehavior extends DestructionBehavior {
  destructionArea(): ICoordinates[] {
    return [this.command.coordinates];
  }
}

class BombDestructionBehavior extends DestructionBehavior {
  destructionArea(): ICoordinates[] {
    const center = this.command.coordinates;
    const coordinates: ICoordinates[] = [];
    const { x, y } = center;
    coordinates.push(center);
    coordinates.push({ x: x - 1, y });
    coordinates.push({ x: x - 1, y: y - 1 });
    /// TODO: ... and so on ... --OR-- by config
    return coordinates;
  }
}

class MutationBehavior {
  field: IField;
  command: ICommandSwap;

  constructor(field: IField, command: ICommandSwap) {
    this.field = field;
    this.command = command;
  }

  perform(): IField {
    const shape = ShapeLocator.upon(this.field).locate();
    if (!shape) return this.field;

    const entity = EntityBuilder.build(shape);
    const point = Coordinates.at(shape.area).exists(this.command.from) ? this.command.from : this.command.to;
    EntityPlacer.at(point).place(entity);
    // locate shape
    // destroy area of that shape
    // perform hard touch
    // build entity by that shape
    // define coordinates (by move --OR-- by Random)
    // place built entity at coordinates
  }
}

class BehaviorBuilder {
  shapes: Shape[] = [];

  constructor(shapes: Shape[]) {
    this.shapes = shapes;
  }

  build(field: IField, command: TCommand) {
    if (command.type == 'destroy') {
      const entity = field.cellAt(command.coordinates).content;

      if (CombinationRules.isPrimitive(entity.type)) return new PrimitiveDestructionBehavior(field, command);
      if (entity.type == EEntityTypeDestructive.Bomb) return new BombDestructionBehavior(field, command);

      // TODO: ... add behaviors for other types
    }

    // TODO: do I need it?
    if (command.type == 'activate') {
      const entity = field.cellAt(command.coordinates).content;

      if (CombinationRules.isPrimitive(entity.type)) return new PrimitiveActivationBehavior(field, command);
      if (entity.type == EEntityTypeDestructive.Bomb) return new BombActivationBehavior();

      // TODO: ... add behaviors for other types
    }

    if (command.type == 'swap') {
      const entityTypeA = field.cellAt(command.from).content.type;
      const entityTypeB = field.cellAt(command.to).content.type;

      const combinator = new Combination(entityTypeA, entityTypeB);
      const { equalTo, oneOfPrimitive } = combinator.rules();

      if (combinator.oneIs(oneOfPrimitive()).andOtherIs(oneOfPrimitive())) return new MutationBehavior(field, command);

      if (combinator.oneIs(equalTo(EEntityTypeDestructive.Bomb)).andOtherIs(oneOfPrimitive()))
        return new BombPrimitiveActivationBehavior();

      // TODO: ... add behaviors for other types
    }
  }
}

interface ICommandSwap {
  type: 'swap';
  from: ICoordinates;
  to: ICoordinates;
}
interface ICommandTouch {
  type: 'touch';
  coordinates: ICoordinates;
}
interface ICommandActivate {
  type: 'activate';
  coordinates: ICoordinates;
}
interface ICommandDestroy {
  type: 'destroy';
  coordinates: ICoordinates;
}
type TCommand = ICommandSwap | ICommandTouch | ICommandActivate | ICommandDestroy;

function runModifiers__1(field: IField, shapes: Shape[], command: TCommand) {
  const behavior = new BehaviorBuilder(shapes).build(field, command);
  const modifiedField = behavior.perform();

  // runModifiers(modifiedField, shapes);
}

function runModifiers(field: IField, shapes: Shape[], move: IUserMove) {
  const mutationModifier = new MutationModifier(shapes, move);
  // mutationModifier.consider(move).canModify(field)
  const gravityModifier = new GravityModifier();
  const generatorModifier = new GeneratorModifier();

  const behavior = new Mixer(shapes).mix(field, move);
  behavior.perform();

  // - use Mixer to define the product of the `move`
  //   --OR--
  // - use Mixer to define the Behavior of the `move`

  // - use `move` coordinates to locate shape
  // - gather area of that shape
  // - run EntityDestroyer
  // - run HardToucher
  // - by that shape build an entity
  // - put built entity into the cell based on `move` coordinates

  while (mutationModifier.canModify(field)) {
    mutationModifier.modify(field);

    while (gravityModifier.canModify(field)) {
      gravityModifier.modify(field);
      if (generatorModifier.canModify(field)) {
        generatorModifier.modify(field);
      }
    }
  }
}

function UserMove(): void {
  // Wait for move
  // Fixate direction
  // Check if possible to move in that direction
  // possible ->
  //    ? FireEvent() & ContinueIterationWithDirection() :
  //    ? FireEvent() & Start UserMove all over again
}
// When user performs a move there are a list of things to consider:
//   - protectors // entity with protectors is not swappable --OR-- it depends on protection itself
//                // for example: if protection is `chain` -> its completelly immovable
//                //              if protection is `ice`   -> it can be affected only by gravity
//   - whether cell is fillable or not
//   - borders: cell borders & field borders
//   If everything above is not an issue -> check if combination exists (can mutate)

// To be able to check if possible to make a move I need:
//   - direction
//   - current position

// IRelocation, Reposition Objective, Move
export interface IUserMove {
  from: ICoordinates;
  to: ICoordinates;
}

function Iteration(): void {
  // Read Config
  // Load Field
  // Run Modifiers before user's first move (initial run)
  // Wait for user to make his move until he does the right one
  // RunModifiers...
  // Collect statistics about everything that has been destroyed
  // FireEvent('MOVE_ACCOMPLISHED')
  // Check if posibble to make another move
  //     possible ? continue : `shake` the field so it would exist
}

// Behavior | Lifecycle
//
// Entity:
//   Actions:
//     - activate?
//     - destroy?
//     - swap?
//     - softTouch: does nothing but animation
//     - hardTouch: depending on logic can destruct a layer of protection
//
//   Properties:
//     - immovable (fixed)
//     - indestructible

// Entity has a lifecycle
//   Lyfecycle has a behavior --OR-- each lyfecycle step has a behavior

// DestructionObserver -> TouchAround
// ActivationObserver
// ... depends on lifecycle

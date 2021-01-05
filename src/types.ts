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

  put: (entity: IEntity, coordinates: ICoordinates[]) => void;

  cellAt: (coordinate: ICoordinates) => ICell;
  cellsAt: (coordinate: ICoordinates[]) => ICell[];

  onChange: (change: any) => void; // ??? Entrypoint by which VIEW can react
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

interface ITargetProtector {
  __properties: any;
}
interface IProtectable {
  protectionAttach: (protector: ITargetProtector) => void;
  protectionDetach: (protector: ITargetProtector) => void;
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

interface IEntity extends IProtectable {
  type: TEntityType;
  // coordinates: ICoordinates;
  protectors: ITargetProtector[];

  visible?: boolean;

  __properties?: any;

  onTouch?: () => void;
  onDestroy?: () => void;
}
class Entity implements IEntity {
  type: TEntityType;
  // coordinates: ICoordinates;
  protectors: ITargetProtector[];

  constructor(type: TEntityType) {
    // constructor(type: TEntityType, coordinates: ICoordinates) {
    this.type = type;
    // this.coordinates = coordinates;
    this.protectors = [];
  }
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
  target: ICoordinates | ICoordinates[];
}

export interface IModifier {
  canModify?: (field: IField) => boolean;
  modify: (field: IField, action?: IAction) => IField; // --OR-- void ???
}

function runModifiers(field: IField, shapes: Shape[]) {
  const mutationModifier = new MutationModifier(shapes);
  const gravityModifier = new GravityModifier();
  const generatorModifier = new GeneratorModifier();

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
//     -
//     -
//     -

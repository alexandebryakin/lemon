import { ICoordinates, IProtector } from '../types';

export const EVENTS = {
  ENTITY_PICKED: 'ENTITY_PICKED',
  ENTITY_PLACED: 'ENTITY_PLACED',
  ENTITY_DESTROYED: 'ENTITY_DESTROYED',
  PROTECTION_DESTROYED: 'PROTECTION_DESTROYED',
};

export interface IEntityPickedData {
  coordinates: ICoordinates;
}

export interface IEntityPlacedData {
  coordinates: ICoordinates;
}

export interface IEntityDestroyedData {
  coordinates: ICoordinates;
}

export interface IProtectionDestroyedData {
  protection: IProtector;
  coordinates: ICoordinates;
}

export type EventData = IEntityPickedData | IEntityPlacedData | IProtectionDestroyedData;

export type EventCallback = (data?: EventData) => void;
export interface IEvent {
  name: string;
  callbacks: EventCallback[];
}

/**
 * Can be used for UI to react on events.
 * USAGE:
 *   EventObserver.on(EVENTS.ENTITY_PICKED).do(() => console.log('entity_picked'))
 */
class EventObserver {
  static events: IEvent[] = [];

  static fire(eventName: string, data?: EventData): void {
    const subsriptor = this.__findSubscriptor(eventName);
    subsriptor.callbacks.forEach((callback) => callback(data));
  }

  static on(event: string): { do: (callback: EventCallback) => void } {
    const subscriptor = this.__findSubscriptor(event);

    return {
      do: (callback: EventCallback): void => {
        subscriptor.callbacks.push(callback);
      },
    };
  }

  static __findSubscriptor(eventName: string): IEvent {
    return this.events.find((s) => s.name == eventName) || this.__newSubscriptor(eventName);
  }

  static __newSubscriptor(eventName: string): IEvent {
    const event = {
      name: eventName,
      callbacks: [],
    };
    this.events.push(event);
    return event;
  }
}

export default EventObserver;

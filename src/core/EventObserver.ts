export const EVENTS = {
  ENTITY_PICKED: 'ENTITY_PICKED',
  ENTITY_PLACED: 'ENTITY_PLACED',
};

export interface IEvent {
  name: string;
  callbacks: ((data?: unknown) => void)[];
}

class EventObserver {
  // USAGE:
  // EventObserver.on(EVENT_NAMES.ENTITY_PICKED).do(() => console.log('entity_picked'))
  static events: IEvent[] = [];

  static fire(eventName: string, data?: unknown): void {
    const subsriptor = this.__findSubscriptor(eventName);
    subsriptor.callbacks.forEach((callback) => callback(data));
  }

  static on(event: string): { do: (callback: () => void) => void } {
    const subscriptor = this.__findSubscriptor(event);

    return {
      do: (callback: () => void): void => {
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

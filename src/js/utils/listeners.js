import { getElementIdentifier } from '.';

export class ListenerService {
  listeners = {};

  addListener(element, trigger, fn) {
    const elementId = getElementIdentifier(element);
    element.addEventListener(trigger, fn);
    const currListener = this.listeners[elementId] || [];
    this.listeners[elementId] = [...currListener, { element, trigger, fn }];
  }

  // remove all listeners with the given trigger
  removeListeners(element, trigger) {
    const elementId = getElementIdentifier(element);
    const currListener = this.listeners[elementId];

    if (!currListener) return;
    const filteredList = currListener.filter(item =>
      Array.isArray(trigger)
        ? trigger.includes(item.trigger)
        : trigger === item.trigger
    );

    for (let listener of filteredList) {
      listener.element.removeEventListener(listener.trigger, listener.fn);
    }

    if (filteredList.length === currListener.length)
      delete this.listeners[elementId];
    else this.listeners[elementId] = filteredList;
  }

  removeAll() {
    if (!Object.keys(this.listeners).length) return;

    const allListeners = Object.values(this.listeners).flat();

    for (let listener of allListeners) {
      listener.element.removeEventListener(listener.trigger, listener.fn);
    }
  }
}

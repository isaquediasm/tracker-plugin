export const mouseEvents = {
  events: [
    {
      name: 'click',
      description:
        'A pointing device button (ANY non-primary button) has been pressed and released on an element.',
    },
    {
      name: 'contextmenu',
      description:
        'A pointing device button (ANY non-primary button) has been pressed and released on an element.',
    },
    {
      name: 'dblclick',
      description:
        'A pointing device button (ANY non-primary button) has been pressed and released on an element.',
    },
    {
      name: 'mousedown',
      description:
        'A pointing device button (ANY non-primary button) has been pressed and released on an element.',
    },
    {
      name: 'mouseenter',
      description:
        'A pointing device button (ANY non-primary button) has been pressed and released on an element.',
    },
    {
      name: 'mouseleave',
      description:
        'A pointing device button (ANY non-primary button) has been pressed and released on an element.',
    },
    {
      name: 'mousemove',
      description:
        'A pointing device button (ANY non-primary button) has been pressed and released on an element.',
    },
    {
      name: 'mouseover',
      description:
        'A pointing device button (ANY non-primary button) has been pressed and released on an element.',
    },
    {
      name: 'mouseout',
      description:
        'A pointing device button (ANY non-primary button) has been pressed and released on an element.',
    },
    {
      name: 'mouseup',
      description:
        'A pointing device button (ANY non-primary button) has been pressed and released on an element.',
    },

    {
      name: 'select',
      description:
        'A pointing device button (ANY non-primary button) has been pressed and released on an element.',
    },
  ],
};

export const inputEvents = {
  // should validate here if elements is an input
  rules: element => !!element,
  events: [
    {
      name: 'change',
      description: `The change event is fired for <input>, <select>, and <textarea> elements when a change to the element's value is committed by the user.`,
    },
  ],
};

/**
 * This function should return all triggers avaiable
 * to a given element
 *
 * @param {*} element
 */
export function availableTriggers(element) {
  return mouseEvents;
}

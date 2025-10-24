export const emit = (el: Element, id: string, detail?: any, cancelable = false) =>
  el.dispatchEvent(new CustomEvent(`via-animated-headline:${id}`, { bubbles: true, cancelable, detail }));

export const emit = (el: Element, id: string, detail?: any, cancelable = false) =>
  el.dispatchEvent(new CustomEvent(`via-animated-headlines:${id}`, { bubbles: true, cancelable, detail }));

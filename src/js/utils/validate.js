export function isTagAllowed(element) {
  // those are the tags we support, mostly interactive tags (where the user can click on)
  const allowedTags = ['span', 'div', 'a', 'button', 'select', 'li'];

  return allowedTags.some(tag => element.nodeName.toLowerCase() === tag);
}

export function isInteractive(element) {
  return (
    getComputedStyle(element).cursor !== 'auto' ||
    element.style.cursor !== 'auto'
  );
}

export function isExternal(path) {
  return !path.some(({ className = '' }) => className.includes('tracker'));
}

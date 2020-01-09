import { array } from 'prop-types';

export function createListeners(rules, cb) {
  const rulesSet = Object.values(rules).reverse();

  const lastParent = rulesSet[0];
  const elements = lastParent.className.length
    ? document.getElementsByClassName(lastParent.className)
    : lastParent.id
    ? [document.getElementById(lastParent.id)]
    : [];

  for (let el of elements) {
    el.addEventListener(
      'click',
      function(event) {
        const { path } = event;

        console.log('clicked', event);

        const entries = Object.entries(rules);

        // every rules needs to be satisfy
        const check = entries.every(([idx, rule]) => {
          // tries to find element with the given classnames/id/tagnames
          return path.find(item => {
            const { id, tagName, className } = item;
            const rule = Object.values(rules)[0];

            const tagMatches = tagName === rule.tagName;
            const idMatches = rule.id === null || id === rule.id;
            const classMatches =
              !rule.className.length || className.includes(rule.className);

            console.log(
              '##path',
              '\n',
              'idx: ',
              idx,
              rule.id,
              ' | ',
              '\n',
              'idmatches: ',
              idMatches,
              id,
              ' | ',
              rule.id,
              '\n',
              'tagMatches: ',
              tagMatches,
              tagName,
              ' | ',
              rule.tagName,
              '\n',
              'classmathes: ',
              classMatches,
              className,
              ' | ',
              rule.className
            );
            return (tagMatches || idMatches) && classMatches;
          });
        });

        if (check) {
          cb(event);
        }
      },
      false
    );
  }
}

export function findMatches(rules) {
  const rulesSet = Object.values(rules).reverse();
  const query = rulesSet
    .map(
      item =>
        `${item.tagName}${item.id ? `#${item.id}` : ''}${
          item.className && item.className.length ? `.${item.className}` : ''
        }`
    )
    .join(' ');

  return document.querySelectorAll(query);
}

export function joinClassNames(element) {
  return new Array(...element.classList).join('.');
}

export function getElementIdentifier(element) {
  if (!element.target) return element.nodeName;

  const { target } = element;
  const id = target.id ? `#${target.id}` : '';
  const classNames = target.className.length
    ? `.${joinClassNames(target.className)}`
    : '';

  return `${target.tagName}${id}${classNames}`;
}

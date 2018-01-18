import select from 'select-dom';
import delegate from 'delegate';

function findClosestOfTag (tag, element) {
  if (element.tagName === tag.toUpperCase()) {
    return element;
  } else if (element === document.body) {
    return undefined;
  } else {
    return findClosestOfTag(tag, element.parentElement);
  }
};

export default () => {
  const observer = new IntersectionObserver(([{intersectionRatio, target}]) => {
    if (intersectionRatio === 0) {
      findClosestOfTag('details', target).open = false;
      observer.unobserve(target);
      console.log('Unobserved: ', target);
    }
  });

  delegate('.dropdown-details', 'click', event => {
    const dropdownDetails = event.delegateTarget;
    const dropdownMenu = select('.dropdown-menu', dropdownDetails);

    if (dropdownDetails.open) {
      observer.unobserve(dropdownMenu);
      console.log('Unobserved: ', dropdownMenu);
    } else {
      observer.observe(dropdownMenu);
      console.log('Observed: ', dropdownMenu);
    }
  });
};

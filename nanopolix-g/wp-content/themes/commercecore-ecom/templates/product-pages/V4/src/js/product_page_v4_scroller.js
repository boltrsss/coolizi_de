document.addEventListener('DOMContentLoaded', () => {
	const scrollers = document.querySelectorAll('.scroller-container');
  
	scrollers.forEach((container) => {
	  const scroller = container.querySelector('.scroller');
	  const items = Array.from(scroller.children);
  
	  if (items.length > 0) {
		const clonedItems = items.map((item) => {
		  const clone = item.cloneNode(true);
		  clone.setAttribute('aria-hidden', true);
		  return clone;
		});
  
		clonedItems.forEach((clone) => scroller.append(clone));
	  }
	});
  });
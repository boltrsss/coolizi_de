const footerContainer = document.querySelector('.footer__innerContainer');

footerContainer.addEventListener('click', (ev) => {
	if (!ev.target.classList.contains('footer__heading')) return;
	const card = ev.target;
	const list = card.closest('div');
	const chevron = list.querySelector('.footer__chevron');
	const ul = list.querySelector('ul');
	const attribute = ul.getAttribute('expanded');
	if (!attribute || attribute == 'false') {
		ul.setAttribute('expanded', 'true');
		chevron.style.transform = 'rotate(0deg)';
		ul.style.height = `${ul.scrollHeight}px`;
		ul.style.marginBottom = `25px`;
		ul.style.marginTop = `-9px`;
	} else {
		ul.style.height = '0px';
		ul.style.marginBottom = '0px';
		ul.style.marginTop = `0px`;
		chevron.style.transform = 'rotate(-90deg)';
		ul.setAttribute('expanded', 'false');
	}
});

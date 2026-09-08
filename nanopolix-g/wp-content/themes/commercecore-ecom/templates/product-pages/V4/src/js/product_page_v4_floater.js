const list = document.querySelector('.observer');
const floatingBar = document.querySelector('.floating-cta');
const stickyCta = document.querySelector('#sticky-cta');
const helpdesk = document.querySelector('#helpdesk');
let zendesk = null;

(function waitZendesk() {
	const iframe = document.querySelector('iframe#launcher');
	if (iframe) {
		zendesk = iframe;
		updateOffset();
	} else setTimeout(waitZendesk, 500);
})();

const getOffset = () =>
	(floatingBar && parseInt(floatingBar.style.height) > 0 ? floatingBar.scrollHeight : 0) +
	(stickyCta?.classList.contains('active') ? 90 : 0);

function updateOffset() {
	const offset = getOffset();
	[helpdesk, zendesk].forEach(el => el && (el.style.bottom = offset + 'px'));
}

const observer = new IntersectionObserver(([entry]) => {
	if (floatingBar) floatingBar.style.height = entry.isIntersecting ? '0px' : floatingBar.scrollHeight + 'px';
	updateOffset();
}, { root: null, threshold: 0, rootMargin: '0px 0px -20% 0px' });

if (list) observer.observe(list);

let timeout;
const resync = () => {
	clearTimeout(timeout);
	timeout = setTimeout(() => {
		if (list) {
			observer.disconnect();
			observer.observe(list);
			updateOffset();
		}
	}, 100);
};

['resize', 'scroll'].forEach(e => window.addEventListener(e, resync, { passive: true }));

if (stickyCta) {
	new MutationObserver(() => {
		requestAnimationFrame(() => {
			updateOffset();
			if (list) {
				observer.disconnect();
				observer.observe(list);
			}
		});
	}).observe(stickyCta, { attributes: true, attributeFilter: ['class'] });

	stickyCta.addEventListener('transitionend', updateOffset);
}
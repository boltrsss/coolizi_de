window.addEventListener('load', () => {
	const faviconMeta = document.getElementById('favicon-theme-color');
	const faviconObserver = document.getElementById('favicon-observer');

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const visibleColor = favicon_vars.faviconObserver;
				if (faviconMeta) {
					faviconMeta.setAttribute('content', visibleColor);
				}
			} else {
				const hiddenColor = favicon_vars.faviconColor;
				if (faviconMeta) {
					faviconMeta.setAttribute('content', hiddenColor);
				}
			}
		});
	});

	if (faviconObserver) {
		observer.observe(faviconObserver);
	}
});

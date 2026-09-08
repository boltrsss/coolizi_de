document.addEventListener('DOMContentLoaded', () => {
	const targets = document.querySelectorAll('.featuresList-card__video');
	const lazyVideos = document.querySelectorAll('.lazy-video');

	lazyVideos.forEach((video) => {
		const observer = new IntersectionObserver(
			(entries, observerInstance) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const source = video.querySelector('source');
						if (source) {
							source.src = source.dataset.src;
							source.removeAttribute('data-src');
							video.load();
							video.play();
						}
						observerInstance.unobserve(video);
					}
				});
			},
			{
				rootMargin: '300px',
			}
		);

		observer.observe(video);
	});

	targets.forEach((target) => {
		const observer = new IntersectionObserver(
			(entries, observerInstance) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						renderIframe(target);
						observerInstance.unobserve(target);
					}
				});
			},
			{
				rootMargin: '300px',
			}
		);

		observer.observe(target);
	});

	function renderIframe(target) {
		const videoId = target.getAttribute('data-video-id');
		if (!videoId) return;

		const iframe = document.createElement('iframe');
		iframe.title = 'Embedded Video';
		iframe.className = 'content__image-video';
		iframe.src = `https://iframe.videodelivery.net/${videoId}/iframe?controls=false&muted=true&autoplay=true&loop=true&preload=true`;
		iframe.style = 'position:absolute;height: 100%; width: 100%; ';
		iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
		iframe.allowFullscreen = true;

		target.appendChild(iframe);
	}
});

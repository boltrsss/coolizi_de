window.addEventListener('load', function () {
	const nextBtn = document.getElementById('testimonial-next');
	const prevBtn = document.getElementById('testimonial-prev');
	const testimonialsGlideElement = document.getElementById('testimonials-glide');

	if (testimonialsGlideElement) {
		const testimonialsGlide = new Glide(testimonialsGlideElement, {
			type: 'carousel',
			perView: 3,
			autoplay: 8000,
			startAt: 0,
			loop: true,
			gap: 16,
			swipeThreshold: 5,
			breakpoints: {
				767: {
					perView: 1,
					peek: 0,
				},
			},
		});

		if (nextBtn) {
			nextBtn.addEventListener('click', () => {
				testimonialsGlide.go('>');
			});
		}

		if (prevBtn) {
			prevBtn.addEventListener('click', () => {
				testimonialsGlide.go('<');
			});
		}

		function initializeGlide() {
			testimonialsGlide.mount();
			testimonialsGlide.update();
		}

		const resizeObserver = new ResizeObserver(() => {
			const slides = testimonialsGlideElement.querySelectorAll('.glide__slide');
			if (slides.length > 0 && slides[0].offsetWidth > 0) {
				initializeGlide();
				resizeObserver.disconnect();
			}
		});

		resizeObserver.observe(testimonialsGlideElement);
	}
});

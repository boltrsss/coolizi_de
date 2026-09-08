window.addEventListener('load', function () {
	const glideMain = new Glide('.glide-main', {
		type: 'carousel',
		perView: 1,
		autoplay: false,
		gap: 0,
		startAt: 0,
		animationDuration: 500,
	});

	// Handle Video Swiper Pointer Events
	function handleVideoPointerEvents() {
        const videoIframes = document.querySelectorAll('.hero-gallery__video iframe');
        videoIframes.forEach(iframe => {
            iframe.style.pointerEvents = 'none';
            iframe.addEventListener('mouseenter', function() {
                iframe.style.pointerEvents = 'auto';
            });
            
            iframe.addEventListener('mouseleave', function() {
                iframe.style.pointerEvents = 'none';
            });
            
            iframe.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1) {
                    iframe.style.pointerEvents = 'auto';
                    setTimeout(() => {
                        iframe.style.pointerEvents = 'none';
                    }, 500);
                }
            }, { passive: true });
        });
    }

	const thumbSlides = document.querySelectorAll('.glide-thumb .glide__slide');

	thumbSlides.forEach((slide, index) => {
		slide.addEventListener('click', function (e) {
			e.preventDefault();
			glideMain.go('=' + index);
			setActiveThumbnail(index);
		});
	});

	function setActiveThumbnail(index) {
		thumbSlides.forEach((slide) => slide.classList.remove('active'));
		if (thumbSlides[index]) {
			thumbSlides[index].classList.add('active');
		}
	}
	// preload second slide iframe if its video for smooth view
	handleVideoPointerEvents();
	initVideoIframes(2);
	setActiveThumbnail(0);

	function updateThumbTransformVertical(activeIndex) {
		const thumbContainer = document.querySelector('.glide-thumb .glide__slides');
		const containerHeight = document.querySelector('.glide-thumb').offsetHeight;
		const totalSlides = thumbSlides.length;

		const slideHeight = thumbSlides[0]?.offsetHeight + 10 || 0;
		const maxTranslate = totalSlides * slideHeight - containerHeight;

		const centerIndex = 2;
		let translateY = 0;

		if (activeIndex <= centerIndex) {
			translateY = 0;
		} else if (activeIndex >= totalSlides - centerIndex - 1) {
			translateY = maxTranslate;
		} else {
			translateY = (activeIndex - centerIndex) * slideHeight;
		}

		if (activeIndex === totalSlides - 1 || activeIndex === totalSlides - 2 || activeIndex === totalSlides - 3) {
			translateY -= 10;
		}

		thumbContainer.style.transition = 'transform 0.5s ease';
		thumbContainer.style.transform = `translate3d(0, ${-translateY}px, 0)`;
	}

	function updateThumbTransformHorizontal(activeIndex) {
		const thumbContainer = document.querySelector('.glide-thumb .glide__slides');
		const thumbWrapper = document.querySelector('.glide-thumb');
		const slide = thumbSlides[activeIndex];
		if (!slide) return;

		const containerWidth = thumbWrapper.offsetWidth;
		const totalContentWidth = thumbContainer.scrollWidth;

		const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;

		let translateX = slideCenter - containerWidth / 2;

		const maxTranslate = totalContentWidth - containerWidth;
		translateX = Math.max(0, Math.min(translateX, maxTranslate));

		if (activeIndex === thumbSlides.length - 1) {
			translateX += 1;
		}

		thumbContainer.style.transition = 'transform 0.5s ease';
		thumbContainer.style.transform = `translate3d(${-translateX}px, 0, 0)`;
	}

	glideMain.on('run', function () {
		setActiveThumbnail(glideMain.index);

		const width = window.innerWidth;
		if (width >= 768 && width <= 1131) {
			updateThumbTransformHorizontal(glideMain.index);
		} else {
			updateThumbTransformVertical(glideMain.index);
		}
	});

	glideMain.mount();

	const sliderMain = document.querySelector('.glide-main');
	const resizeObserver = new ResizeObserver((entries) => {
		for (let entry of entries) {
			if (entry.contentRect.width > 0) {
				glideMain.update();
				resizeObserver.disconnect();
			}
		}
	});
	resizeObserver.observe(sliderMain);

	glideMain.on('run.after', () => {
		const currentSlideIndex = glideMain.index + 1;
		const slideAfter = glideMain.index + 2;
		initVideoIframes(currentSlideIndex);
		initVideoIframes(slideAfter);
	});
});

function initVideoIframes(index) {
	const selectorA = `.hero-gallery__video[data-index="${index}"]`;
	const selectorB = `video[data-index="${index}"]`;

	let slideContainer = document.querySelectorAll(selectorA);
	if (slideContainer.length === 0) {
		slideContainer = document.querySelectorAll(selectorB);
	}

	if (!slideContainer) return;
	slideContainer.forEach((slide) => {
		const iframe = slide.querySelector('iframe[data-src]');
		if (iframe?.dataset?.src) {
			iframe.src = iframe.dataset.src;
			iframe.removeAttribute('data-src');
		}

		const source = slide.querySelector('source[data-src]');
		if (source?.dataset?.src) {
			source.src = source.dataset.src;
			source.removeAttribute('data-src');
			slide.load();
			slide.play();
		}
	});
}

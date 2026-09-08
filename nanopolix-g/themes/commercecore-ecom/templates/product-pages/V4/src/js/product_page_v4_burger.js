const menuBtn = document.getElementById('header__menuBtn')
const navMenu = document.querySelector('.navigation--mobile')
const header = document.querySelector('.header')
const mobileInnerWrapper = document.querySelector(
	'.navigation--mobile__innerWrapper',
)
const headerNav = document.querySelector('.header-navigation')
const ppV2List = document.querySelector('#mobile-nav')
const navigationLinks = document.querySelectorAll('.navigation-link--mobile')

menuBtn.addEventListener('click', () => {
	const state = menuBtn.getAttribute('aria-expanded')
	if (state === 'false') {
		menuBtn.classList.add('is-active')
		menuBtn.setAttribute('aria-expanded', 'true')
		navMenu.setAttribute('aria-expanded', 'true')
		navMenu.classList.remove('navigation__opacity')
		navMenu.classList.add('navigation--mobile-enabled')
		navMenu.classList.remove('navigation--mobile-disabled')
		navMenu.style.height = navMenu.scrollHeight + 1 + 'px'
	} else {
		menuBtn.classList.remove('is-active')
		menuBtn.setAttribute('aria-expanded', 'false')
		navMenu.setAttribute('aria-expanded', 'false')
		navMenu.classList.add('navigation--mobile-disabled')
		navMenu.style.height = 0
		navMenu.classList.remove('navigation--mobile-enabled')
	}
})

navigationLinks.forEach((link) => {
	link.addEventListener('click', (ev) => {
		ppV2List.classList.remove('navigation--mobile-enabled')
		ppV2List.classList.add('navigation--mobile-disabled')
		menuBtn.setAttribute('aria-expanded', 'false')
		menuBtn.classList.remove('is-active')
		navMenu.setAttribute('aria-expanded', 'false')
		navMenu.classList.add('navigation--mobile-disabled')
		navMenu.style.height = navMenu.clientHeight + 'px'
		navMenu.classList.remove('navigation--mobile-enabled')
	})
})

function scrollToTarget(element, duration) {
    let startTime = null;

    function easeInOutQuad(t, start, distance, dur) {
        t /= dur / 2;
        if (t < 1) return (distance / 2) * t * t + start;
        t--;
        return (-distance / 2) * (t * (t - 2) - 1) + start;
    }

    function scrollAnimation(currentTime) {
        if (startTime === null) startTime = currentTime;

        const currentStartPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        const currentTargetPosition = element.getBoundingClientRect().top;
        const currentDistance = currentTargetPosition;

        const elapsedTime = currentTime - startTime;
        const scrollProgress = easeInOutQuad(elapsedTime, currentStartPosition, currentDistance, duration);

        window.scrollTo(0, scrollProgress);

        if (elapsedTime < duration) {
            requestAnimationFrame(scrollAnimation);
        }
    }

    requestAnimationFrame(scrollAnimation);
}

document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
        const targetSection = document.querySelector(this.getAttribute('href'));
        e.preventDefault();
        scrollToTarget(targetSection, 800);
        navMenu.style.height = 0;
    });
});

window.addEventListener('resize', (e) => {
	if (window.innerWidth > 1128) {
		navMenu.style.height = '0px'
		menuBtn.setAttribute('aria-expanded', 'false')
	}
})
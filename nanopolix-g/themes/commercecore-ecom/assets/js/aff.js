(function () {
	function getCookie(key, defaultValue = null) {
		const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
			const [cookieKey, cookieValue] = cookie.split('=');
			acc[decodeURIComponent(cookieKey)] = decodeURIComponent(cookieValue);
			return acc;
		}, {});

		return cookies.hasOwnProperty(key) ? cookies[key] : defaultValue;
	}

	function setCookie(key, value, expirationInSeconds, path = '/') {
		if (value == null) return;
		const expires = new Date(Date.now() + expirationInSeconds * 1000).toUTCString();
		document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(value)}; expires=${expires}; path=${path}`;
	}

	function clearCookie(key, path = '/') {
		document.cookie = `${encodeURIComponent(key)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
	}

	function hasValidParamValue(value) {
		return value != null && value !== '' && value !== 'undefined' && value !== 'null';
	}

	// Funnel flow control (DEV-4687): the `pp` flag decides whether the product
	// page stays in the funnel. Propagate it onto outgoing CTA links so it
	// reaches the product page; only the documented values are honored.
	function getFunnelPpParam() {
		const value = new URLSearchParams(location.search).get('pp');
		return value === '0' || value === '1' ? value : null;
	}

	// Checkout hero visibility is URL-only. Propagate the flag from the current
	// page without storing it in or falling back to a cookie.
	function getCheckoutHeroParam() {
		const value = new URLSearchParams(location.search).get('hero');
		return value === '0' || value === '1' ? value : null;
	}

	function encodeAffiliateParams(affiliate, entryUrl, affiliateOverwrite, affiliateSource) {
		return {
			aff: window.btoa(affiliate),
			entryUrl: window.btoa(entryUrl),
			affiliateOverwrite: hasValidParamValue(affiliateOverwrite) ? window.btoa(affiliateOverwrite) : null,
			affSource: hasValidParamValue(affiliateSource) ? window.btoa(affiliateSource) : null,
		};
	}

	function isValidUrl(url) {
		return (
			typeof url === 'string' &&
			url.includes(location.hostname) &&
			!url.includes('legal') &&
			!url.includes('wp-login') &&
			!url.includes('wp-admin')
		);
	}

	function appendAffiliateParams(url, { aff, entryUrl, affiliateOverwrite, affSource }) {
		const originalUrl = url;
		const parsedUrl = new URL(url, location.origin);
		const isRelativeUrl = !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(originalUrl);

		const pp = getFunnelPpParam();
		if (pp !== null && !parsedUrl.searchParams.has('pp')) {
			parsedUrl.searchParams.set('pp', pp);
		}

		const hero = getCheckoutHeroParam();
		if (hero !== null && !parsedUrl.searchParams.has('hero')) {
			parsedUrl.searchParams.set('hero', hero);
		}

		if (!parsedUrl.searchParams.has('aff')) {
			parsedUrl.searchParams.set('aff', aff);
		}

		if (!parsedUrl.searchParams.has('entryUrl')) {
			parsedUrl.searchParams.set('entryUrl', entryUrl);
		}

		if (!parsedUrl.searchParams.has('affOverwrite') && hasValidParamValue(affiliateOverwrite)) {
			parsedUrl.searchParams.set('affOverwrite', affiliateOverwrite);
		} else if (!parsedUrl.searchParams.has('affOverwrite')) {
			parsedUrl.searchParams.delete('affOverwrite');
		}

		if (!parsedUrl.searchParams.has('affSource') && hasValidParamValue(affSource)) {
			parsedUrl.searchParams.set('affSource', affSource);
		}

		if (isRelativeUrl) {
			return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
		}

		return parsedUrl.toString();
	}

	function addAffiliateParamToLinks() {
		if (!window.affiliate) return;

		const links = [...document.getElementsByTagName('a')];
		const encodedAffiliate = encodeAffiliateParams(
			window.affiliate,
			window.entry_url,
			window.affiliateOverwrite,
			window.affiliateSource
		);

		links.forEach((link) => {
			let url = link.getAttribute('href')?.trim();

			if (!isValidUrl(url)) return;

			link.setAttribute('href', appendAffiliateParams(url, encodedAffiliate));
		});
	}

	function decodeQueryParam(param) {
		const value = new URLSearchParams(location.search).get(param);

		if (!hasValidParamValue(value)) {
			return null;
		}

		let decoded = value;
		try {
			decoded = window.atob(decodeURIComponent(value));
		} catch (e) {
			return null; // not base64
		}

		try {
			decoded = decodeURIComponent(decoded);
		} catch (e) {
			// decoded stays as the atob output; fall through to the validity check below
		}

		return hasValidParamValue(decoded) ? decoded : null;
	}

	function initEntryUrl() {
		const entryUrlFromCookie = getCookie('entrypoint_url');
		const entryUrlFromParams = decodeQueryParam('entryUrl');

		window.entry_url = entryUrlFromCookie || entryUrlFromParams || location.pathname;

		if (!entryUrlFromCookie) {
			setCookie('entrypoint_url', window.entry_url, 60 * 25); // 25 minutes
		}
	}

	function initAffiliateTag() {
		const { direct, productPack, entryReset = false } = info;

		// DEV-5824: entry templates release the affiliate state. The cookies are
		// expired server side and again in affiliate-entry-reset.js, and nothing
		// is written back here, so the visitor leaves the page with none of the
		// three affiliate cookies set. window.affiliate stays populated so the
		// funnel params on the page's own links keep being propagated.
		if (entryReset) {
			clearCookie('affiliate_tag');
			clearCookie('affiliate_overwrite');
			clearCookie('affiliate_source');
			window.affiliate = productPack || direct;
			window.affiliateOverwrite = '';
			window.affiliateSource = '';

			return;
		}

		const currentAffCookie = getCookie('affiliate_tag');
		const currentAffiliateOverwriteCookie = getCookie('affiliate_overwrite');
		const affFromParams = decodeQueryParam('aff');
		const affiliateOverwrite = decodeQueryParam('affOverwrite') ?? null;
		window.affiliate = productPack || affFromParams || currentAffCookie || direct;

		// Prevent placeholder overwrite cookies from being forwarded and decoded as garbage.
		if (currentAffiliateOverwriteCookie !== null && !hasValidParamValue(currentAffiliateOverwriteCookie)) {
			clearCookie('affiliate_overwrite');
		}

		if (hasValidParamValue(affFromParams) && productPack !== affFromParams && !affiliateOverwrite) {
			window.affiliateOverwrite = affFromParams;
			setCookie('affiliate_overwrite', window.affiliateOverwrite, 86400 * 30);
		}

		if (affiliateOverwrite !== null) {
			window.affiliateOverwrite = affiliateOverwrite;
			setCookie('affiliate_overwrite', window.affiliateOverwrite, 86400 * 30);
		}

		setCookie('affiliate_tag', window.affiliate, 86400 * 30); // 30 days

		const affSourceFromParams = decodeQueryParam('affSource');
		if (affSourceFromParams) {
			window.affiliateSource = affSourceFromParams;
			setCookie('affiliate_source', window.affiliateSource, 86400 * 30);
		} else {
			window.affiliateSource = '';
			clearCookie('affiliate_source');
		}
	}

	function runAffiliateTagging() {
		initEntryUrl();
		initAffiliateTag();
		addAffiliateParamToLinks();
	}

	if (!window.deferAffiliateAutoRun) {
		if (document.readyState === 'complete' || document.readyState === 'interactive') {
			runAffiliateTagging();
		} else {
			document.addEventListener('DOMContentLoaded', runAffiliateTagging);
		}
	}

	window.runAffiliateTagging = runAffiliateTagging;
})();

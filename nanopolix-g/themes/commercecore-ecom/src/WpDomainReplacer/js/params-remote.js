function getCookieReplacer(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		const cookiePart = parts.pop();
		return cookiePart ? cookiePart.split(';').shift() : null;
	}
	return null;
}

function normalizeHost(value) {
	if (!value || typeof value !== 'string') {
		return '';
	}

	try {
		return new URL(value.includes('://') ? value : `https://${value}`).hostname;
	} catch (error) {
		return '';
	}
}

function getAllowedRemoteHosts() {
	if (!domain_replacer) {
		return [];
	}

	const configuredHosts = [
		domain_replacer.domain,
		domain_replacer.replace_to,
		domain_replacer.rendered_replace_to,
		domain_replacer.default_replace_to,
		...(domain_replacer.aff_hosts || []),
	];

	return configuredHosts.map(normalizeHost).filter(Boolean);
}

async function resolveEffectiveCheckoutHost() {
	if (!domain_replacer?.rest_url || !domain_replacer?.post_id) {
		return;
	}

	try {
		const url = new URL(domain_replacer.rest_url, window.location.origin);
		const params = {
			postId: domain_replacer.post_id,
			aff: window.affiliate,
			affSource: window.affiliateSource,
			affOverwrite: window.affiliateOverwrite,
		};

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null && String(value).trim() !== '') {
				url.searchParams.set(key, String(value));
			}
		});

		const response = await fetch(url.toString(), {
			credentials: 'same-origin',
			cache: 'no-store',
		});

		if (!response.ok) {
			return;
		}

		const config = await response.json();
		const resolvedHost = normalizeHost(config?.replace_to);

		if (resolvedHost) {
			domain_replacer.rendered_replace_to =
				domain_replacer.rendered_replace_to || domain_replacer.replace_to;
			domain_replacer.replace_to = resolvedHost;
		}
	} catch (error) {
		// The server-side checkout redirect remains the fallback when resolution fails.
	}
}

function rewriteCheckoutHost(parsedUrl, allowedRemoteHosts) {
	const targetHost = normalizeHost(domain_replacer?.replace_to);

	if (
		!targetHost ||
		!parsedUrl.pathname.includes('/checkout') ||
		!allowedRemoteHosts.includes(parsedUrl.hostname)
	) {
		return false;
	}

	if (parsedUrl.hostname === targetHost) {
		return false;
	}

	parsedUrl.hostname = targetHost;

	return true;
}

function addAffParamToCtaLinksReplacer() {
	if (!window.affiliate || !window.entry_url || !domain_replacer) return;

	const allowedRemoteHosts = getAllowedRemoteHosts();

	const PARAMS_CONFIG = [
		{ key: 'tabId', cookieKey: 'cc_param_tabId', urlKey: 'tabId' },
		{ key: 'newsbreak_cid', cookieKey: 'cc_param_newsbreak_cid', urlKey: 'newsbreak_cid' },
		{ key: 'core_gclid', cookieKey: 'cc_param_core_gclid', urlKey: 'gclid' },
		{ key: 'core_gbraid', cookieKey: 'cc_param_core_gbraid', urlKey: 'gbraid' },
		{ key: 'core_wbraid', cookieKey: 'cc_param_core_wbraid', urlKey: 'wbraid' },
		{ key: 'tracking_id', cookieKey: 'cc_param_tracking_id', urlKey: 'tracking_id' },
		{ key: '_raclid', cookieKey: 'cc_param__raclid', urlKey: '_raclid' },
		{ key: 'caid', cookieKey: 'cc_param_caid', urlKey: 'caid' },
		{ key: 'performclickID', cookieKey: 'cc_param_performclickID', urlKey: 'performclickID' },
		{ key: 'adclid', cookieKey: 'cc_param_adclid', urlKey: 'adclid' },
		{ key: 'transaction_id', cookieKey: 'cc_param_transaction_id', urlKey: 'transaction_id' },
		{ key: 'campaignid', cookieKey: 'cc_param_campaignid', urlKey: 'campaignid' },
		{ key: 'pi_clickid', cookieKey: 'cc_param_pi_clickid', urlKey: 'pi_clickid' },
		{ key: 'pi_companyid', cookieKey: 'cc_param_pi_companyid', urlKey: 'pi_companyid' },
		{ key: 'obclid', cookieKey: 'cc_param_obclid', urlKey: 'obclid' },
		{ key: 'rc_uuid', cookieKey: 'cc_param_rc_uuid', urlKey: 'rc_uuid' },
		{ key: 'fbclid', cookieKey: 'cc_param_fbclid', urlKey: 'fbclid' },
		{ key: 'epik', cookieKey: 'cc_param_epik', urlKey: 'epik' },
		{ key: 'hero', urlKey: 'hero' },
		{ key: 'aleid', cookieKey: '_aleid', encode: false },
		{ key: 'axwrt', cookieKey:'_axwrt', encode: false},
	];

	let cookieParamString = '';
	const affiliateTag = getCookieReplacer('affiliate_tag') || window.affiliate;
	const affiliateSource = getCookieReplacer('affiliate_source') || window.affiliateSource || '';
	const affiliateOverwrite = getCookieReplacer('affiliate_overwrite') || window.affiliateOverwrite;

	PARAMS_CONFIG.forEach((config) => {
		const urlValue = new URLSearchParams(window.location.search).get(config.urlKey);
		const cookieValue = config.cookieKey ? getCookieReplacer(config.cookieKey) : null;
		const finalValue = urlValue || cookieValue;

		if (finalValue) {
			cookieParamString = cookieParamString + '&' + config.key + '=' + finalValue;
		}
	});

	if (window.EF) {
		const cc_ef_getCookie = (cname) => {
			var name = cname + '=';
			var decodedCookie = decodeURIComponent(document.cookie);
			var ca = decodedCookie.split(';');

			for (var i = 0; i < ca.length; i++) {
				var c = ca[i];
				while (c.charAt(0) === ' ') {
					c = c.substring(1);
				}
				if (c.indexOf(name) === 0) {
					return c.substring(name.length, c.length);
				}
			}
			return '';
		};

		let args = {
			offer_id: 'oid',
			affiliate_id: 'affid2',
			sub1: 'sub1',
			sub2: 'sub2',
			sub3: 'sub3',
			sub4: 'sub4',
			sub5: 'sub5',
			uid: 'uid',
			source_id: 'source_id',
			transaction_id: 'transaction_id',
		};

		let args2 = {
			offer_id: 'guoid',
			affiliate_id: 'guaffid',
		};

		for (let i in args) {
			if (args[i]) {
				let efValue = cc_ef_getCookie('ef_' + i);

				if (efValue) {
					cookieParamString = cookieParamString + '&' + args[i] + '=' + efValue;
				}
			}
		}

		for (let i in args2) {
			if (args2[i]) {
				let efValueGu = cc_ef_getCookie('ef_gu_' + i);

				if (efValueGu) {
					cookieParamString = cookieParamString + '&' + args2[i] + '=' + efValueGu;
				}
			}
		}
	}

	const allLinks = Array.from(document.getElementsByTagName('a'));

	allLinks.forEach((link) => {
		let url = link.getAttribute('href')?.trim() || '';

		let parsedUrl;
		try {
			parsedUrl = new URL(url, window.location.href);
		} catch (error) {
			return;
		}

		if (allowedRemoteHosts.includes(parsedUrl.hostname) && url.indexOf('legal') === -1) {
			const isRelativeUrl = !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
			const wasCheckoutHostRewritten = rewriteCheckoutHost(parsedUrl, allowedRemoteHosts);
			const hasAffParam = parsedUrl.searchParams.has('aff');
			const hasEntryUrlParam = parsedUrl.searchParams.has('entryUrl');
			const hasAffOverwriteParam = parsedUrl.searchParams.has('affOverwrite');
			const hasAffSourceParam = parsedUrl.searchParams.has('affSource');
			const hasPostIdParam = parsedUrl.searchParams.has('postId');

			if (!hasAffParam) {
				parsedUrl.searchParams.set('aff', window.btoa(affiliateTag));
			}

			if (!hasEntryUrlParam) {
				parsedUrl.searchParams.set('entryUrl', window.btoa(window.entry_url));
			}

			if (!hasAffOverwriteParam && affiliateOverwrite) {
				parsedUrl.searchParams.set('affOverwrite', window.btoa(affiliateOverwrite));
			}

			if (affiliateSource && !hasAffSourceParam) {
				parsedUrl.searchParams.set('affSource', window.btoa(affiliateSource));
			}

			if (!hasPostIdParam) {
				parsedUrl.searchParams.set('postId', 'remote');
			}

			if (cookieParamString) {
				new URLSearchParams(cookieParamString.slice(1)).forEach((value, key) => {
					parsedUrl.searchParams.set(key, value);
				});
			}

			link.setAttribute(
				'href',
				isRelativeUrl && !wasCheckoutHostRewritten
					? `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`
					: parsedUrl.toString()
			);
		}
	});
}

document.addEventListener('DOMContentLoaded', async () => {
	// Ensure aff.js has run and set window tracking params
	if (typeof window.runAffiliateTagging === 'function') {
		window.runAffiliateTagging();
	}

	await resolveEffectiveCheckoutHost();
	addAffParamToCtaLinksReplacer();
});

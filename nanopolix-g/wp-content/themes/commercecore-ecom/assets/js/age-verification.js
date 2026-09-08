(function () {
  var config = window.ageVerificationConfig;

  if (!config) {
    return;
  }

  var COOKIE_NAME = 'cc_age_verified';
  var COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, maxAgeSeconds) {
    document.cookie =
      name + '=' + encodeURIComponent(value) + '; max-age=' + maxAgeSeconds + '; path=/; SameSite=Lax';
  }

  // Mirrors assets/js/aff.js's hasValidParamValue(): filters out missing
  // params and the literal strings "undefined"/"null" that a broken URL
  // template can leave behind.
  function hasValidParamValue(value) {
    return value != null && value !== '' && value !== 'undefined' && value !== 'null';
  }

  // Mirrors assets/js/aff.js's decodeQueryParam(): ?aff=/?affSource=/
  // ?affOverwrite= are expected base64-encoded. Duplicated here (rather than
  // depending on aff.js's load order, which runs in the footer) so this
  // script can fire its effective-pack check immediately, without waiting.
  function decodeQueryParam(param) {
    var raw = new URLSearchParams(location.search).get(param);
    if (!hasValidParamValue(raw)) return '';
    var decoded;
    try {
      decoded = window.atob(decodeURIComponent(raw));
    } catch (e) {
      return '';
    }
    try {
      decoded = decodeURIComponent(decoded);
    } catch (e) {
      // keep the atob output
    }
    return hasValidParamValue(decoded) ? decoded : '';
  }

  function withUrls(text, cfg) {
    return String(text || '')
      .replace('{termsUrl}', cfg.termsUrl || '#')
      .replace('{privacyUrl}', cfg.privacyUrl || '#');
  }

  var overlay = null;
  var lockedElements = [];
  var lockStyle = null;

  function lockBackground() {
    lockStyle = document.createElement('style');
    lockStyle.id = 'age-verification-lock';
    lockStyle.textContent = 'html{overflow:hidden!important}';
    document.head.appendChild(lockStyle);

    lockedElements = [];
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === overlay) return;
      lockedElements.push({
        el: el,
        hadInert: el.hasAttribute('inert'),
        hadAriaHidden: el.getAttribute('aria-hidden'),
      });
      el.setAttribute('inert', '');
      el.setAttribute('aria-hidden', 'true');
    });
  }

  function unlockBackground() {
    if (lockStyle && lockStyle.parentNode) {
      lockStyle.parentNode.removeChild(lockStyle);
    }
    lockStyle = null;

    lockedElements.forEach(function (rec) {
      if (!rec.hadInert) {
        rec.el.removeAttribute('inert');
      }
      if (rec.hadAriaHidden === null) {
        rec.el.removeAttribute('aria-hidden');
      } else {
        rec.el.setAttribute('aria-hidden', rec.hadAriaHidden);
      }
    });
    lockedElements = [];
  }

  function getFocusable(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll('button, a[href], [tabindex]'),
      function (el) {
        return !el.hasAttribute('disabled') && el.offsetParent !== null;
      }
    );
  }

  function trapFocus(e) {
    if (e.key === 'Escape') {
      // Mandatory gate — Escape must not dismiss it.
      e.preventDefault();
      return;
    }

    if (e.key !== 'Tab') return;

    var focusable = getFocusable(overlay);

    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function focusFirst() {
    var focusable = getFocusable(overlay);
    (focusable[0] || overlay).focus();
  }

  // Wires up the interactive behavior (confirm/deny, focus trap, background
  // lock) onto `overlay`, whichever way it got into the DOM — either just
  // created by open() below, or already present because the server rendered
  // it (see AgeVerificationScriptLoader::render_gate_markup()).
  function wireGateInteractions(strings) {
    overlay.addEventListener('keydown', trapFocus);
    lockBackground();

    overlay.querySelector('[data-age-confirm]').addEventListener('click', function () {
      setCookie(COOKIE_NAME, '1', COOKIE_MAX_AGE);
      unlockBackground();
      overlay.parentNode.removeChild(overlay);
      overlay = null;
    });

    // No confirm/deny action here on purpose — once a visitor declines, the
    // page stays blocked (and the background stays locked/inert) for the
    // rest of this load with no way out.
    overlay.querySelector('[data-age-deny]').addEventListener('click', function () {
      showBlocked(strings);
    });

    focusFirst();
  }

  function renderGateContent(cfg) {
    var strings = cfg.strings || {};

    overlay.setAttribute('aria-labelledby', 'age-verification-title');
    overlay.setAttribute('aria-describedby', 'age-verification-body');
    overlay.innerHTML =
      '<div class="age-verification-card">' +
        '<div class="age-verification-header">' +
          '<h2 id="age-verification-title" class="age-verification-title">' + (strings.title || '') + '</h2>' +
          '<p id="age-verification-body" class="age-verification-copy">' + (strings.body || '') + '</p>' +
        '</div>' +
        '<div class="age-verification-actions">' +
          '<div class="age-verification-buttons">' +
            '<button type="button" class="age-verification-btn age-verification-btn-confirm" data-age-confirm>' +
              (strings.confirmButton || '') +
            '</button>' +
            '<button type="button" class="age-verification-btn age-verification-btn-deny" data-age-deny>' +
              (strings.denyButton || '') +
            '</button>' +
          '</div>' +
          '<p class="age-verification-disclaimer">' + withUrls(strings.disclaimer, cfg) + '</p>' +
        '</div>' +
      '</div>';
  }

  // Creates and appends a brand-new overlay — only safe to call once <body>
  // exists, i.e. from the REST-escalation path below (its fetch().then()
  // always resolves long after <body> has parsed). The cache-safe "required"
  // path never calls this: the server already rendered the markup, and
  // window.__ccAgeVerificationAttach (below) wires it up instead.
  function open(cfg) {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'age-verification-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');

    document.body.appendChild(overlay);
    renderGateContent(cfg);
    wireGateInteractions(cfg.strings || {});
  }

  function showBlocked(strings) {
    overlay.removeAttribute('aria-describedby');
    overlay.setAttribute('aria-labelledby', 'age-verification-blocked-title');
    overlay.innerHTML =
      '<div class="age-verification-card age-verification-card-blocked" tabindex="-1">' +
        '<div class="age-verification-blocked-banner">' + (strings.blockedBanner || '') + '</div>' +
        '<div class="age-verification-blocked-content">' +
          '<h1 id="age-verification-blocked-title" class="age-verification-blocked-title">' + (strings.blockedTitle || '') + '</h1>' +
          '<p class="age-verification-blocked-subtitle">' + (strings.blockedSubtitle || '') + '</p>' +
          '<p class="age-verification-copy">' + (strings.blockedBody || '') + '</p>' +
        '</div>' +
      '</div>';

    focusFirst();
  }

  // Called from a tiny inline <script> placed right after the server-
  // rendered gate in <body> (see AgeVerificationScriptLoader::
  // render_gate_markup()). This file itself is loaded in <head> and runs
  // before <body> exists at all, so it cannot touch document.body directly;
  // the inline script runs later, once the parser has reached that point in
  // <body>, so document.body — and the gate markup itself — reliably exist.
  window.__ccAgeVerificationAttach = function () {
    var existing = document.querySelector('.age-verification-overlay');
    if (!existing) return;

    // The static check that produced this markup can't know about a
    // visitor's cc_age_verified cookie (it has to stay cache-safe — see
    // AgeVerificationResolver's class doc) so an already-verified visitor
    // still gets the gate rendered into their HTML; remove it here instead.
    if (getCookie(COOKIE_NAME)) {
      existing.parentNode.removeChild(existing);
      return;
    }

    overlay = existing;
    wireGateInteractions((config && config.strings) || {});
  };

  if (getCookie(COOKIE_NAME)) {
    return;
  }

  if (config.enabled) {
    // Server already rendered the gate; window.__ccAgeVerificationAttach
    // (above) wires it up once <body> exists. Nothing left to do here.
    return;
  }

  // ?agegate=1 forces the gate open on any page — including pages with no
  // postId at all (this script now loads everywhere, not just on pages that
  // carry a product_pack) — so it's read directly, not through
  // decodeQueryParam()/aff.js's base64 convention.
  var forcedByParam = new URLSearchParams(location.search).get('agegate') === '1';

  // The cache-safe static check said "not required", but that only knows
  // this post's own product_pack assignment — not this visitor's ?aff=/
  // affSource/affiliate_overwrite/?agegate=/cookie state. Confirm against
  // the same effective-pack resolution the storefront itself uses, via an
  // uncached request, and escalate to the gate if it disagrees. Never
  // de-escalate: if the static check ever said required, the gate above
  // already opened. A missing postId (non-singular pages) is fine as long
  // as ?agegate= is what's driving the request — the REST endpoint falls
  // back to site-default copy for those.
  if (!config.restUrl || (!config.postId && !forcedByParam)) {
    return;
  }

  var params = new URLSearchParams({
    postId: config.postId || 0,
    aff: decodeQueryParam('aff'),
    affSource: decodeQueryParam('affSource'),
    affOverwrite: decodeQueryParam('affOverwrite'),
    agegate: forcedByParam ? '1' : '',
  });

  fetch(config.restUrl + '?' + params.toString(), { credentials: 'same-origin' })
    .then(function (res) {
      return res.ok ? res.json() : null;
    })
    .then(function (data) {
      if (data && data.enabled && !getCookie(COOKIE_NAME)) {
        open(data);
      }
    })
    .catch(function () {
      // Fail open — this is a UX compliance gate, not an access-control
      // boundary; a network error shouldn't break the page.
    });
})();

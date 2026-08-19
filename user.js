// ==UserScript==
// @name         Jenkins Build Status Favicon
// @namespace    https://github.com/kellyselden
// @version      7
// @description  Monitor builds using tab icons
// @updateURL    https://raw.githubusercontent.com/kellyselden/jenkins-build-status-favicon/main/meta.js
// @downloadURL  https://raw.githubusercontent.com/kellyselden/jenkins-build-status-favicon/main/user.js
// @author       Kelly Selden
// @license      MIT
// @source       https://github.com/kellyselden/jenkins-build-status-favicon
// @supportURL   https://github.com/kellyselden/jenkins-build-status-favicon/issues/new
// @include      http*://*jenkins*/job/*
// @run-at       document-start
// ==/UserScript==
'use strict';

const icons = {
  'In progress': '🔵',
  'Success': '🟢',
  'Failed': '🔴',
  'Unstable': '⚪️',
  'Aborted': '⚪️',
};

function getStatusFromCaption(container) {
  let svg = container.querySelector('svg[tooltip]');

  if (!svg) {
    return null;
  }

  return svg.getAttribute('tooltip')?.replace(' > Console Output', '');
}

function updateFavicon(container) {
  let statusText = getStatusFromCaption(container);

  if (!statusText) {
    return;
  }

  let href = buildFaviconHref(statusText);

  for (let link of document.head.querySelectorAll('link[rel*="icon"]')) {
    link.href = href;
  }
}

function buildFaviconHref(statusText) {
  let svg = document.createElement('svg');

  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  let icon = document.createElement('text');

  icon.setAttribute('font-size', '13');
  icon.setAttribute('y', '13');

  icon.textContent = icons[statusText] ?? '❓';

  svg.appendChild(icon);

  return `data:image/svg+xml,${svg.outerHTML}`;
}

new MutationObserver((mutationsList, observer) => {
  let container = document.querySelector('.jenkins-build-caption');

  if (container) {
    observer.disconnect();

    updateFavicon(container);

    new MutationObserver(() => {
      updateFavicon(container);
    }).observe(container, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['tooltip'],
    });
  }
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
});

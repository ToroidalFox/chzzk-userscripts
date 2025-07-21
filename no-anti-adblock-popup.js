// ==UserScript==
// @name CHZZK No Anti-Adblock Popup
// @author ToroidalFox
// @description Removes Anti-Adblock Popups from CHZZK Streaming Platform
// @version 0.1
// @license MIT
// @supportURL https://github.com/ToroidalFox/chzzk-userscripts/issues
// @updateURL https://raw.githubusercontent.com/ToroidalFox/chzzk-userscripts/refs/heads/master/no-anti-adblock-popup.js
// @downloadURL https://raw.githubusercontent.com/ToroidalFox/chzzk-userscripts/refs/heads/master/no-anti-adblock-popup.js
// @match https://chzzk.naver.com/*
// @grant none
// ==/UserScript==

(function() {
  "use strict";

  const body = document.body;
  const popup_observer = new MutationObserver(delete_anti_adblock_popup);
  const observer_options = {
    childList: true,
  };

  /**
   * @param {MutationRecord[]} records
   * @param {MutationObserver} observer
   */
  function delete_anti_adblock_popup(records, observer) {
    for (const record of records) {
      for (const _added_node of record.addedNodes) {
        if (_added_node.nodeType != Node.ELEMENT_NODE) {
          return;
        }

        /** @type {Element} */
        const added_node = _added_node;

        if (
          Array.prototype.find.call(added_node.classList, /** @param {String} s */s => s.startsWith("popup_dimmed"))
        ) {
          const anti_adblock_popup = added_node.querySelector("div[class^=\"popup_container\"]");
          if (anti_adblock_popup != null) anti_adblock_popup.remove();
          observer.disconnect(); // disable observer once deleted, will be re-enabled by code below
        }
      }
    }
  }

  const original_pushState = history.pushState;
  // overriding pushState to detect url changes
  history.pushState = function(...args) {
    original_pushState.apply(this, args);
    // re-enable observer
    popup_observer.observe(body, observer_options);
  }

  // initiate observer
  popup_observer.observe(body, observer_options);
})();

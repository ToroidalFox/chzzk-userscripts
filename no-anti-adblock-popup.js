// ==UserScript==
// @name CHZZK No Anti-Adblock Popup
// @author ToroidalFox
// @description Removes Anti-Adblock Popups from CHZZK Streaming Platform
// @version 0.3
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
          added_node.style.display = "none";
          const button = added_node.querySelector("button");
          if (button === null) {
            console.error("button not found");
          }
          const props_key = Object.keys(button).find(s => s.startsWith("__reactProps"));
          if (button === null) {
            console.error("props_key not found");
          }
          button[props_key].onClick({ isTrusted: true });
          observer.disconnect(); // disable observer once deleted, will be re-enabled by code below
        }
      }
    }
  }

  /**
   * @param {string} pathname
   * @returns boolean
   */
  function is_path_eligible(pathname) {
    const top_level_path = pathname.split('/').filter(Boolean)[0];
    const whitelist = ["live", "video"];
    return whitelist.includes(top_level_path)
  }

  const original_pushState = history.pushState;
  // overriding pushState to detect url changes
  history.pushState = function(...args) {
    original_pushState.apply(this, args);
    if (is_path_eligible(args[2])) {
      // re-enable observer
      popup_observer.observe(body, observer_options);
    }
  }

  if (is_path_eligible(window.location.pathname)) {
    // initiate observer
    popup_observer.observe(body, observer_options);
  }
})();

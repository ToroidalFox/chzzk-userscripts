// ==UserScript==
// @name CHZZK No Anti-Adblock Popup
// @author ToroidalFox
// @description Removes Anti-Adblock Popups from CHZZK Streaming Platform
// @version 0.3.1
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
          observer.disconnect();
          added_node.style.display = "none";
          const button = added_node.querySelector("button");
          if (button === null) {
            added_node.style.display = null;
            console.error("button not found");
            return;
          }
          const props_key = Object.keys(button).find(s => s.startsWith("__reactProps"));
          if (props_key === undefined) {
            added_node.style.display = null;
            console.error("props_key not found");
            return;
          }
          button[props_key].onClick({ isTrusted: true });
          setTimeout(() => {
            if(body.querySelector("div[class^=popup_dimmed]")) {
              added_node.style.display = null;
            }
          }, 500);
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

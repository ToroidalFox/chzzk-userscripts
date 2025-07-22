// ==UserScript==
// @name CHZZK Auto High Quality
// @author ToroidalFox
// @description Selects High Quality Automatically from CHZZK Streaming Platform
// @version 0.2
// @license MIT
// @supportURL https://github.com/ToroidalFox/chzzk-userscripts/issues
// @updateURL https://raw.githubusercontent.com/ToroidalFox/chzzk-userscripts/refs/heads/master/auto-high-quality.js
// @downloadURL https://raw.githubusercontent.com/ToroidalFox/chzzk-userscripts/refs/heads/master/auto-high-quality.js
// @match https://chzzk.naver.com/*
// @grant none
// ==/UserScript==

(function() {
  "use strict";

  const layout_body = document.querySelector("div#layout-body");
  const observer = new MutationObserver(get_selector_pane);
  const observer_options = {
    subtree: true,
    childList: true,
  };
  const quality_observer = new MutationObserver(observe_quality_item_changes);
  const quality_observer_options = {
    childList: true,
  };
  /** @type {Element | null} */
  let quality_observer_target = null;
  /** @type {number | null} */
  let timeout = null;

  const keydown_event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter", code: "Enter", keyCode: 13, which: 13 });
  /**
   * @param {MutationRecord[]} records
   * @param {MutationObserver} observer
   */
  function get_selector_pane(records, observer) {
    for (const record of records) {
      for (const _added_node of record.addedNodes) {
        if (_added_node.nodeType != Node.ELEMENT_NODE) {
          return;
        }

        /** @type {Element} */
        const added_node = _added_node;

        if (added_node.tagName === "DIV" && added_node.classList.contains("pzp") && added_node.classList.contains("pzp-pc")) {
          const quality_selector_pane = added_node.querySelector("ul[class*=quality-pane]");
          observer.disconnect();
          quality_observer.observe(quality_selector_pane, quality_observer_options);
          quality_observer_target = quality_selector_pane;
        }
      }
    }
  }


  /**
   * @param {MutationRecord[]} records
   * @param {MutationObserver} observer
   */
  function observe_quality_item_changes(records, observer) {
    for (const record of records) {
      for (const _added_node of record.addedNodes) {
        if (_added_node.nodeType != Node.ELEMENT_NODE) {
          return;
        }

        // HACK: fuck it, I can't figure out a clean solution. Using setTimeout.
        if (timeout != null) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(set_highest_quality, 10, observer);
      }
      for (const _removed_node of record.addedNodes) {
        if (_removed_node.nodeType != Node.ELEMENT_NODE) {
          return;
        }

        if (timeout != null) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(set_highest_quality, 10, observer);
      }
    }
  }

  /**
   * @param {MutationObserver} observer
   */
  function set_highest_quality() {
    if (quality_observer_target != null) {
      const highest_quality = quality_observer_target.firstChild;
      highest_quality.focus();
      highest_quality.dispatchEvent(keydown_event);
      observer.disconnect();
    }
  }

  /**
   * @param {string} pathname
   * @returns boolean
   */
  function is_path_eligible(pathname) {
    const top_level_path = pathname.split('/').filter(Boolean)[0];
    const whitelist= ["live"];
    return whitelist.includes(top_level_path)
  }

  const original_pushState = history.pushState;
  // overriding pushState to detect url changes
  history.pushState = function(...args) {
    original_pushState.apply(this, args);
    if (is_path_eligible(args[2])) {
      // re-enable observer
      observer.observe(layout_body, observer_options);
    }
  }

  if (is_path_eligible(window.location.pathname)) {
    // initiate observer
    observer.observe(layout_body, observer_options);
  }
})();

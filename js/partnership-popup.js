/* =====================================
   LB Physiotherapy — Partnership Popup
   Bottom floating card + Hero banner
   ===================================== */
(function() {
  "use strict";

  var STORAGE_KEY = 'lb_partnership_dismissed';
  var EXPIRY_DAYS = 5;

  function isDismissed() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!data || !data.timestamp) return false;
      var now = Date.now();
      var elapsed = now - data.timestamp;
      var maxAge = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      return elapsed < maxAge;
    } catch (e) {
      return false;
    }
  }

  function markDismissed() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        timestamp: Date.now()
      }));
    } catch (e) {}
  }

  function dismissPopup() {
    var popup = document.querySelector('.partnership-popup');
    if (popup) {
      popup.classList.remove('visible');
      popup.classList.add('hidden');
    }
    markDismissed();
  }

  function dismissBanner() {
    var banner = document.querySelector('.partnership-banner');
    if (banner) {
      banner.classList.add('hidden');
    }
    markDismissed();
  }

  function showPopup() {
    if (isDismissed()) return;
    var popup = document.querySelector('.partnership-popup');
    if (popup) {
      setTimeout(function() {
        popup.classList.add('visible');
      }, 3000);
    }
  }

  function init() {
    // Show popup after delay (if not dismissed)
    showPopup();

    // Close button handlers
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('partnership-popup-close')) {
        dismissPopup();
      }
      if (e.target.classList.contains('partnership-banner-close')) {
        dismissBanner();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
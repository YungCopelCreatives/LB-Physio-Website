/* =====================================
   LB Physiotherapy — Navigation
   Floating Glass Navbar + Mobile Slide Menu
   ===================================== */
(function($) {
  "use strict";

  $(function() {

    /* =====================================
       Mobile Navigation Drawer with Focus Trap & A11y
    =======================================*/
    var $toggler = $('.navbar-toggler');
    var $panel = $('.mobile-menu-panel');
    var $overlay = $('.mobile-menu-overlay');
    var lastFocusedElement = null;
    var focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function getFocusableElements() {
      return $panel.find(focusableSelector).filter(function() {
        return $(this).is(':visible') && $(this).css('visibility') !== 'hidden';
      });
    }

    function openMobileMenu(triggerEl) {
      lastFocusedElement = triggerEl || document.activeElement;
      
      $toggler.addClass('active').attr('aria-expanded', 'true');
      $panel.addClass('active').attr('aria-hidden', 'false').removeAttr('inert');
      $overlay.addClass('active');
      $('body').addClass('mobile-menu-open');

      // Shift focus to the close button or first interactive element inside drawer
      setTimeout(function() {
        var $focusable = getFocusableElements();
        var $closeBtn = $panel.find('.mobile-menu-close');
        if ($closeBtn.length && $closeBtn.is(':visible')) {
          $closeBtn.trigger('focus');
        } else if ($focusable.length) {
          $focusable.first().trigger('focus');
        }
      }, 50);
    }

    function closeMobileMenu() {
      $toggler.removeClass('active').attr('aria-expanded', 'false');
      $panel.removeClass('active').attr('aria-hidden', 'true');
      $overlay.removeClass('active');
      $('body').removeClass('mobile-menu-open');

      // Return focus to the trigger button for seamless keyboard flow
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        try {
          lastFocusedElement.focus();
        } catch (err) {
          $toggler.first().trigger('focus');
        }
      } else {
        $toggler.first().trigger('focus');
      }
    }

    // Expose functions globally
    window.openMobileMenu = openMobileMenu;
    window.closeMobileMenu = closeMobileMenu;

    // Toggle button click/tap/keyboard
    $(document).on('click', '.navbar-toggler', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if ($panel.hasClass('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu(this);
      }
    });

    // Close button inside panel
    $(document).on('click', '.mobile-menu-close', function(e) {
      e.preventDefault();
      e.stopPropagation();
      closeMobileMenu();
    });

    // Overlay tap/click
    $(document).on('click touchstart', '.mobile-menu-overlay', function(e) {
      if ($panel.hasClass('active')) {
        e.preventDefault();
        closeMobileMenu();
      }
    });

    // Close on any link or button click inside mobile panel
    $(document).on('click', '.mobile-menu-panel a, .mobile-menu-panel .btn', function() {
      closeMobileMenu();
    });

    /* =====================================
       Focus Trap & Keydown Event Management
    =======================================*/
    $(document).on('keydown', function(e) {
      if (!$panel.hasClass('active')) return;

      var isTab = e.key === 'Tab' || e.keyCode === 9;
      var isEscape = e.key === 'Escape' || e.keyCode === 27;

      // Handle ESC key
      if (isEscape) {
        e.preventDefault();
        closeMobileMenu();
        return;
      }

      // Handle Focus Trapping via TAB / SHIFT+TAB
      if (isTab) {
        var $focusable = getFocusableElements();
        if ($focusable.length === 0) {
          e.preventDefault();
          return;
        }

        var firstEl = $focusable[0];
        var lastEl = $focusable[$focusable.length - 1];
        var activeEl = document.activeElement;

        if (e.shiftKey) {
          // Backward tab: if at first element or outside panel, wrap to last
          if (activeEl === firstEl || !$.contains($panel[0], activeEl)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          // Forward tab: if at last element or outside panel, wrap to first
          if (activeEl === lastEl || !$.contains($panel[0], activeEl)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    });

    // Auto-close on viewport resize to desktop
    var resizeTimer;
    $(window).on('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if ($(window).width() > 991 && $panel.hasClass('active')) {
          closeMobileMenu();
        }
      }, 100);
    });

    // Touch swipe right to close drawer
    var touchStartX = 0;
    var touchStartY = 0;
    var touchEndX = 0;
    var touchEndY = 0;

    $panel.on('touchstart', function(e) {
      if (e.originalEvent && e.originalEvent.touches && e.originalEvent.touches.length > 0) {
        touchStartX = e.originalEvent.touches[0].clientX;
        touchStartY = e.originalEvent.touches[0].clientY;
      }
    });

    $panel.on('touchend', function(e) {
      if (e.originalEvent && e.originalEvent.changedTouches && e.originalEvent.changedTouches.length > 0) {
        touchEndX = e.originalEvent.changedTouches[0].clientX;
        touchEndY = e.originalEvent.changedTouches[0].clientY;
        
        var diffX = touchEndX - touchStartX;
        var diffY = Math.abs(touchEndY - touchStartY);
        
        // Swiped right more than 60px with minimal vertical angle
        if (diffX > 60 && diffY < 80) {
          closeMobileMenu();
        }
      }
    });

    // Highlight active page automatically with clean URL support
    var rawPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    var currentPath = rawPath.replace(/\.html$/, '');
    if (currentPath === '' || currentPath === 'index') currentPath = '';
    
    $('.header .nav li, .mobile-menu-panel .mobile-nav-links li').each(function() {
      var href = $(this).find('a').attr('href');
      if (href) {
        var linkTarget = href.split('#')[0].replace(/^\/+|\/+$/g, '').toLowerCase().replace(/\.html$/, '');
        if (linkTarget === 'index') linkTarget = '';
        if (linkTarget === currentPath || (currentPath === 'portfolio-details' && linkTarget === 'recovery-stories')) {
          $(this).addClass('active');
        }
      }
    });

  });

})(jQuery);
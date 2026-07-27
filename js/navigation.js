/* =====================================
   LB Physiotherapy — Navigation
   Floating Glass Navbar + Mobile Menu
   ===================================== */
(function($) {
  "use strict";

  $(function() {

    /* =====================================
       Mobile Hamburger Menu (Phase 3)
    =======================================*/
    var $toggler = $('.navbar-toggler');
    var $panel = $('.mobile-menu-panel');
    var $overlay = $('.mobile-menu-overlay');

    function openMobileMenu() {
      $toggler.addClass('active');
      $panel.addClass('active');
      $overlay.addClass('active');
      $('body').css('overflow', 'hidden');
    }

    function closeMobileMenu() {
      $toggler.removeClass('active');
      $panel.removeClass('active');
      $overlay.removeClass('active');
      $('body').css('overflow', '');
    }

    $toggler.on('click', function(e) {
      e.preventDefault();
      if ($panel.hasClass('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    $overlay.on('click', function() {
      closeMobileMenu();
    });

    // Close on link click
    $panel.find('a').on('click', function() {
      closeMobileMenu();
    });

    // Close on ESC
    $(document).on('keydown', function(e) {
      if (e.key === 'Escape') {
        closeMobileMenu();
      }
    });

  });

})(jQuery);
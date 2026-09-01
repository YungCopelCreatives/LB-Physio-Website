/* =====================================
   LB Physiotherapy — Main JavaScript
   ===================================== */
(function($) {
  "use strict";

  $(function() {

    /* =====================================
       Sticky Header + Utility Bar
    =======================================*/
    function checkStickyHeader() {
      var currentScroll = $(window).scrollTop() || $(document).scrollTop() || 0;
      if (currentScroll > 30) {
        $('.header').addClass("sticky");
      } else {
        $('.header').removeClass("sticky");
      }
    }

    $(window).on('scroll resize', checkStickyHeader);
    window.addEventListener('scroll', checkStickyHeader, { passive: true });
    checkStickyHeader();

    /* =====================================
       Hero Slider (Owl Carousel)
    =======================================*/
    if ($.fn.owlCarousel && $(".hero-slider").length) {
      $(".hero-slider").owlCarousel({
        loop: true,
        autoplay: true,
        smartSpeed: 800,
        autoplayTimeout: 5000,
        singleItem: true,
        autoplayHoverPause: true,
        items: 1,
        nav: false,
        dots: false,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
      });
    }

    /* =====================================
       Portfolio Slider (Owl Carousel)
    =======================================*/
    if ($.fn.owlCarousel && $('.portfolio-slider').length) {
      $('.portfolio-slider').owlCarousel({
        autoplay: true,
        autoplayTimeout: 4000,
        margin: 15,
        smartSpeed: 300,
        autoplayHoverPause: true,
        loop: true,
        nav: true,
        dots: false,
        responsive: {
          300:  { items: 1 },
          480:  { items: 2 },
          768:  { items: 2 },
          1170: { items: 4 },
        }
      });
    }

    /* =====================================
       Clients Slider (Owl Carousel)
    =======================================*/
    if ($.fn.owlCarousel && $('.clients-slider').length) {
      $('.clients-slider').owlCarousel({
        items: 5,
        autoplay: true,
        autoplayTimeout: 3500,
        margin: 15,
        smartSpeed: 400,
        autoplayHoverPause: true,
        loop: true,
        nav: false,
        dots: false,
        responsive: {
          300:  { items: 1 },
          480:  { items: 2 },
          768:  { items: 3 },
          1170: { items: 5 },
        }
      });
    }

    /* =====================================
       Single Portfolio Slider (Owl Carousel)
    =======================================*/
    if ($.fn.owlCarousel && $('.pf-details-slider').length) {
      $('.pf-details-slider').owlCarousel({
        items: 1,
        autoplay: false,
        autoplayTimeout: 5000,
        smartSpeed: 400,
        autoplayHoverPause: true,
        loop: true,
        merge: true,
        nav: true,
        dots: false,
        navText: [
          '<i class="icofont-rounded-left"></i>',
          '<i class="icofont-rounded-right"></i>'
        ],
      });
    }

    /* =====================================
       Accordion (FAQ)
    =======================================*/
    if ($('.accordion').length) {
      $('.accordion > li:eq(0) a').addClass('active').next().slideDown();
      $('.accordion a').on('click', function(j) {
        var dropDown = $(this).closest('li').find('p');
        $(this).closest('.accordion').find('p').not(dropDown).slideUp(300);
        if ($(this).hasClass('active')) {
          $(this).removeClass('active');
        } else {
          $(this).closest('.accordion').find('a.active').removeClass('active');
          $(this).addClass('active');
        }
        dropDown.stop(false, true).slideToggle(300);
        j.preventDefault();
      });
    }

    /* =====================================
       Date Picker
    =======================================*/
    if ($.fn.datepicker && $("#datepicker").length) {
      $("#datepicker").datepicker();
    }

  });

  /* =====================================
     Preloader (First Visit Animation)
  =======================================*/
  var hasVisited = false;
  try {
    hasVisited = sessionStorage.getItem('lb_visited') === 'true';
  } catch (err) {
    hasVisited = false;
  }

  if (hasVisited) {
    $('.preloader').addClass('preloader-deactivate');
  } else {
    $(window).on('load', function() {
      setTimeout(function() {
        $('.preloader').addClass('preloader-deactivate');
        try {
          sessionStorage.setItem('lb_visited', 'true');
        } catch (e) {}
      }, 400);
    });
  }

})(jQuery);
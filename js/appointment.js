/* =====================================
   LB Physiotherapy — Appointment Modal
   Shared across all pages
   ===================================== */
(function($) {
  "use strict";

  /* =====================================
     Open / Close Modal
  =======================================*/
  window.openAppointmentModal = function(e) {
    if (e) e.preventDefault();
    var modal = document.getElementById('appointmentModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeAppointmentModal = function() {
    var modal = document.getElementById('appointmentModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  /* Close on ESC key */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      window.closeAppointmentModal();
    }
  });

  /* =====================================
     WhatsApp Form Submission
     — Double-submit prevention
     — Standardized professional WhatsApp template
  =======================================*/
  function formatWhatsAppAppointment(data) {
    return '*New Appointment Request - LB Physiotherapy*\n' +
      '------------------------------------\n' +
      '• *Patient Name:* ' + (data.name || 'Not provided') + '\n' +
      '• *Phone:* ' + (data.phone || 'Not provided') + '\n' +
      (data.email ? '• *Email:* ' + data.email + '\n' : '') +
      '• *Service / Condition:* ' + (data.service || 'General Assessment') + '\n' +
      '• *Preferred Date:* ' + (data.date || 'Earliest Available') + '\n' +
      (data.time ? '• *Preferred Time:* ' + data.time + '\n' : '') +
      (data.message ? '• *Notes / Symptoms:* ' + data.message + '\n' : '') +
      '------------------------------------\n' +
      '_Practice No: 0720001171704 | HPCSA: PT 0154997_';
  }

  // Modal Appointment Form
  $(document).on('submit', '#modalAppointmentForm', function(event) {
    event.preventDefault();
    var form = this;
    var submitBtn = form.querySelector('.btn-submit');
    if (submitBtn && submitBtn.disabled) return;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Redirecting to WhatsApp...';
    }
    var fd = new FormData(form);
    var data = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      service: fd.get('service'),
      date: fd.get('date'),
      time: fd.get('time'),
      message: fd.get('message')
    };
    var msg = formatWhatsAppAppointment(data);
    window.location.href = 'https://wa.me/27739480811?text=' + encodeURIComponent(msg);
    setTimeout(function() {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request Appointment';
      }
    }, 3000);
  });

  // Homepage Appointment Form
  $(document).on('submit', '#homeAppointmentForm', function(event) {
    event.preventDefault();
    var form = this;
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn && submitBtn.disabled) return;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Redirecting to WhatsApp...';
    }
    var fd = new FormData(form);
    var data = {
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      service: fd.get('service'),
      date: fd.get('date'),
      time: fd.get('time'),
      message: fd.get('message')
    };
    var msg = formatWhatsAppAppointment(data);
    window.location.href = 'https://wa.me/27739480811?text=' + encodeURIComponent(msg);
    setTimeout(function() {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book An Appointment';
      }
    }, 3000);
  });

  /* =====================================
     Modal Datepicker
  =======================================*/
  $(function() {
    if ($.fn.datepicker) {
      $('#modalDatepicker').datepicker({
        dateFormat: 'DD, MM d, yy',
        minDate: 0,
        beforeShowDay: $.datepicker.noWeekends
      }).attr('readonly', 'readonly');
    }
  });

  /* =====================================
     Pricing Table Toggle
  =======================================*/
  window.togglePricingDetails = function(table) {
    var details = table.querySelector('.pricing-details');
    var hint = table.querySelector('.table-toggle-hint');
    var isActive = details.classList.contains('active');
    if (isActive) {
      details.classList.remove('active');
      if (hint) {
        hint.style.display = 'block';
        hint.innerHTML = '<i class="fa fa-chevron-down"></i> Tap to view details';
      }
    } else {
      details.classList.add('active');
      if (hint) {
        hint.innerHTML = '<i class="fa fa-chevron-up"></i> Tap to collapse';
      }
    }
  };

  /* =====================================
     Service Card Toggle (Phase 5)
     — Only ONE card open at a time
     — Surrounding cards dim when one is open
     — Arrow rotates on toggle
  =======================================*/
  window.toggleServiceDetails = function(btn) {
    var card = btn.closest('.single-service');
    var details = card.querySelector('.details');
    var isActive = details.classList.contains('active');
    var allCards = document.querySelectorAll('.services .single-service');

    // Close all other open details and reset dimming
    allCards.forEach(function(c) {
      var d = c.querySelector('.details');
      var b = c.querySelector('.learn-more-toggle');
      if (d && d.classList.contains('active')) {
        d.classList.remove('active');
        if (b) {
          b.textContent = 'Learn More';
          b.classList.remove('active');
        }
      }
      c.classList.remove('dimmed', 'has-active');
    });

    if (!isActive) {
      // Open this card
      details.classList.add('active');
      btn.textContent = 'Show Less';
      btn.classList.add('active');
      card.classList.add('has-active');

      // Dim all other cards
      allCards.forEach(function(c) {
        if (c !== card) {
          c.classList.add('dimmed');
        }
      });
    }
  };

  /* =====================================
     Gallery Card Toggle (Case Studies)
  =======================================*/
  window.toggleDetails = function(button) {
    if (!button) return;
    var controlsId = button.getAttribute('aria-controls');
    var details = controlsId ? document.getElementById(controlsId) : null;
    if (!details) {
      var card = button.closest('.service-card');
      if (card) {
        details = card.querySelector('.details');
      }
    }
    if (!details) return;

    var isExpanded = button.getAttribute('aria-expanded') === 'true' || 
                     details.classList.contains('open') || 
                     details.classList.contains('active');

    if (isExpanded) {
      details.classList.remove('open', 'active');
      details.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-expanded', 'false');
      var btnText = button.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = 'View Case Study';
      }
    } else {
      details.classList.add('open', 'active');
      details.setAttribute('aria-hidden', 'false');
      button.setAttribute('aria-expanded', 'true');
      var btnText = button.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = 'Hide Case Study';
      }
    }
  };

})(jQuery);
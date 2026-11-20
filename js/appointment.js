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
     Email Form Submission (mail/mail.php)
     — Appointment, contact and call-back forms
     — Sent to the Practice Manager as a branded email
     — Double-submit prevention, inline errors, WhatsApp fallback
  =======================================*/
  var MAIL_ENDPOINT = '/mail/mail.php';
  var WHATSAPP_URL = 'https://wa.me/27739480811';

  var FORMS = [
    { selector: '#modalAppointmentForm', type: 'appointment' },
    { selector: '#homeAppointmentForm', type: 'appointment' },
    { selector: '#appointmentForm', type: 'appointment', page: 'appointment' },
    { selector: '#mainContactForm', type: 'contact' },
    { selector: '.footer-consultation-form', type: 'callback' }
  ];

  function formMessageBox(form) {
    var box = form.querySelector('.form-mail-status');
    if (!box) {
      box = document.createElement('div');
      box.className = 'form-mail-status';
      box.setAttribute('role', 'alert');
      box.setAttribute('aria-live', 'polite');
      form.appendChild(box);
    }
    return box;
  }

  function showFormError(form, text) {
    var box = formMessageBox(form);
    box.innerHTML = '';
    var p = document.createElement('span');
    p.textContent = text + ' ';
    var a = document.createElement('a');
    a.href = WHATSAPP_URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'WhatsApp us instead';
    box.appendChild(p);
    box.appendChild(a);
    box.style.display = 'block';
  }

  function clearFormError(form) {
    var box = form.querySelector('.form-mail-status');
    if (box) { box.style.display = 'none'; box.innerHTML = ''; }
  }

  function addHoneypot(form) {
    if (form.querySelector('input[name="website"]')) return;
    var hp = document.createElement('input');
    hp.type = 'text';
    hp.name = 'website';
    hp.tabIndex = -1;
    hp.autocomplete = 'off';
    hp.setAttribute('aria-hidden', 'true');
    hp.className = 'form-hp-field';
    form.appendChild(hp);
  }

  function submitToMail(form, cfg) {
    var btn = form.querySelector('button[type="submit"], .btn-submit, .button');
    if (btn && btn.disabled) return;
    clearFormError(form);

    // Date must be picked from the calendar
    var dateInput = form.querySelector('input[name="date"]');
    if (cfg.type === 'appointment' && dateInput && !dateInput.value) {
      showFormError(form, 'Please choose a preferred date from the calendar.');
      if (dateInput._flatpickr) dateInput._flatpickr.open();
      return;
    }

    var fd = new FormData(form);
    fd.set('form_type', cfg.type);
    if (cfg.page) fd.set('page', cfg.page);

    var original = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      if (!btn.classList.contains('button')) btn.textContent = 'Sending...';
    }

    fetch(MAIL_ENDPOINT, {
      method: 'POST',
      body: fd,
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      credentials: 'same-origin'
    }).then(function(res) {
      return res.json().catch(function() { return { ok: false }; });
    }).then(function(data) {
      if (data && data.ok) {
        window.location.href = data.redirect || '/mail-success';
        return;
      }
      showFormError(form, (data && data.message) || "Sorry, your message couldn't be sent.");
      if (btn) { btn.disabled = false; btn.innerHTML = original; }
    }).catch(function() {
      showFormError(form, "Sorry, your message couldn't be sent. Please check your connection.");
      if (btn) { btn.disabled = false; btn.innerHTML = original; }
    });
  }

  FORMS.forEach(function(cfg) {
    $(document).on('submit', cfg.selector, function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      submitToMail(this, cfg);
    });
  });

  /* =====================================
     Preferred Date — calendar pick only
     — No past dates, Sundays closed, up to 3 months ahead
     — Patients see "Saturday, 28 November 2026"; the form sends 2026-11-28
  =======================================*/
  function initDatePickers() {
    if (typeof window.flatpickr !== 'function') return;
    var fields = document.querySelectorAll('#datepicker, #modalDatepicker, #app_date, input.js-date-pick');
    Array.prototype.forEach.call(fields, function(input) {
      if (input._flatpickr) return;
      input.setAttribute('type', 'text');
      var placeholder = input.getAttribute('placeholder') || 'Select a date';
      window.flatpickr(input, {
        dateFormat: 'Y-m-d',
        altInput: true,
        altFormat: 'l, j F Y',
        minDate: 'today',
        maxDate: new Date().fp_incr ? new Date().fp_incr(90) : null,
        disable: [function(date) { return date.getDay() === 0; }],
        locale: { firstDayOfWeek: 1 },
        disableMobile: true,
        onReady: function(sel, str, fp) {
          if (fp.altInput) {
            fp.altInput.setAttribute('placeholder', placeholder);
            fp.altInput.setAttribute('aria-label', 'Preferred date (choose from calendar)');
            fp.altInput.setAttribute('readonly', 'readonly');
            fp.altInput.classList.add('date-pick-input');
          }
        },
        onChange: function(sel, str, fp) {
          var form = fp.input.form;
          if (form && str) clearFormError(form);
        }
      });
    });
  }

  $(function() {
    FORMS.forEach(function(cfg) {
      Array.prototype.forEach.call(document.querySelectorAll(cfg.selector), addHoneypot);
    });
    initDatePickers();
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
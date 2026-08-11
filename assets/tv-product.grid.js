/*
 * TV PRODUCT GRID — hotspot / popup open-close
 * Handles all .tv-product-grid sections on the page.
 */
(function () {
  function initGrid(section) {
    var hotspots = section.querySelectorAll('.tv-product-hotspot');
    var popups = document.querySelectorAll('[data-popup]');

    function openPopup(hotspot) {
      var popupId = hotspot.getAttribute('aria-controls');
      if (!popupId) return;

      var popup = document.getElementById(popupId);
      if (!popup) return;

      popups.forEach(function (item) {
        item.classList.remove('is-open');
        item.setAttribute('aria-hidden', 'true');
      });

      hotspots.forEach(function (item) {
        item.setAttribute('aria-expanded', 'false');
      });

      popup.classList.add('is-open');
      popup.setAttribute('aria-hidden', 'false');
      hotspot.setAttribute('aria-expanded', 'true');

      document.documentElement.classList.add('tv-product-popup-open');
      document.body.classList.add('tv-product-popup-open');
    }

    function closePopup(popup) {
      if (!popup) return;
      popup.classList.remove('is-open');
      popup.setAttribute('aria-hidden', 'true');

      hotspots.forEach(function (item) {
        item.setAttribute('aria-expanded', 'false');
      });

      document.documentElement.classList.remove('tv-product-popup-open');
      document.body.classList.remove('tv-product-popup-open');
    }

    hotspots.forEach(function (hotspot) {
      hotspot.addEventListener('click', function () {
        openPopup(hotspot);
      });
    });

    popups.forEach(function (popup) {
      popup.querySelectorAll('[data-popup-close]').forEach(function (el) {
        el.addEventListener('click', function () {
          closePopup(popup);
        });
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      popups.forEach(function (popup) {
        if (popup.classList.contains('is-open')) closePopup(popup);
      });
    });
  }

  document.querySelectorAll('.tv-product-grid').forEach(initGrid);
})();

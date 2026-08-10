(function () {
  'use strict';

  function initProductGrid() {
    const hotspots = document.querySelectorAll(
      '[data-product-hotspot]'
    );

    if (!hotspots.length) {
      return;
    }

    hotspots.forEach(function (hotspot) {
      hotspot.addEventListener('click', function () {
        const wrapper = hotspot.closest(
          '.tv-product-grid__image-wrapper'
        );

        if (!wrapper) {
          return;
        }

        const productDataElement = wrapper.querySelector(
          '.tv-product-grid__product-data'
        );

        if (!productDataElement) {
          return;
        }

        let product;

        try {
          product = JSON.parse(
            productDataElement.textContent
          );
        } catch (error) {
          console.error(
            'TV Product Grid: unable to read product data.',
            error
          );

          return;
        }

        document.dispatchEvent(
          new CustomEvent('tv:product:open', {
            detail: {
              product: product
            }
          })
        );
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      initProductGrid
    );
  } else {
    initProductGrid();
  }
})();

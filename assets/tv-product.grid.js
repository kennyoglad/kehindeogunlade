(() => {
  'use strict';

  const initProductGrid = () => {
    const hotspots = document.querySelectorAll(
      '.tv-product-grid__hotspot'
    );

    if (!hotspots.length) {
      return;
    }

    hotspots.forEach((hotspot) => {
      if (hotspot.dataset.tvProductGridBound === 'true') {
        return;
      }

      hotspot.dataset.tvProductGridBound = 'true';

      hotspot.addEventListener('click', () => {
        const handle = hotspot.dataset.productHandle;

        if (!handle) {
          return;
        }

        const modal = document.querySelector(
          '[data-tv-product-modal]'
        );

        if (!modal) {
          console.warn(
            'TV Product Modal was not found.'
          );

          return;
        }

        if (
          typeof window.TvProductModalOpen === 'function'
        ) {
          window.TvProductModalOpen(handle);
        }
      });
    });
  };

  document.addEventListener(
    'DOMContentLoaded',
    initProductGrid
  );

  document.addEventListener(
    'shopify:section:load',
    initProductGrid
  );

  window.TvProductGridInit = initProductGrid;
})();

/*
 * TV PRODUCT GRID
 * ============================================================
 * Handles:
 *
 * - Product hotspot / popup opening
 * - Popup closing
 * - ESC key closing
 * - Color selection
 * - Shopify variant matching
 * - Add to Cart
 * - Automatic Soft Winter Jacket addition
 *
 * IMPORTANT:
 * The automatic jacket product handle is:
 * dark-winter-jacket
 * ============================================================
 */

(function () {
  'use strict';

  /*
   * ==========================================================
   * INITIALIZE PRODUCT GRID
   * ==========================================================
   */

  function initGrid(section) {
    if (!section) return;

    const hotspots = section.querySelectorAll(
      '.tv-product-hotspot'
    );

    const popups = section.querySelectorAll(
      '[data-popup]'
    );


    /*
     * ========================================================
     * OPEN POPUP
     * ========================================================
     */

    function openPopup(hotspot) {
      const popupId = hotspot.getAttribute(
        'aria-controls'
      );

      if (!popupId) return;

      const popup = document.getElementById(
        popupId
      );

      if (!popup) return;


      /*
       * Close any other popup first.
       */

      popups.forEach(function (item) {
        item.classList.remove('is-open');

        item.setAttribute(
          'aria-hidden',
          'true'
        );
      });


      hotspots.forEach(function (item) {
        item.setAttribute(
          'aria-expanded',
          'false'
        );
      });


      /*
       * Open selected popup.
       */

      popup.classList.add('is-open');

      popup.setAttribute(
        'aria-hidden',
        'false'
      );

      hotspot.setAttribute(
        'aria-expanded',
        'true'
      );


      /*
       * Prevent background scrolling.
       */

      document.documentElement.classList.add(
        'tv-product-popup-open'
      );

      document.body.classList.add(
        'tv-product-popup-open'
      );
    }


    /*
     * ========================================================
     * CLOSE POPUP
     * ========================================================
     */

    function closePopup(popup) {
      if (!popup) return;

      popup.classList.remove(
        'is-open'
      );

      popup.setAttribute(
        'aria-hidden',
        'true'
      );


      hotspots.forEach(function (item) {
        item.setAttribute(
          'aria-expanded',
          'false'
        );
      });


      document.documentElement.classList.remove(
        'tv-product-popup-open'
      );

      document.body.classList.remove(
        'tv-product-popup-open'
      );
    }


    /*
     * ========================================================
     * HOTSPOT CLICK
     * ========================================================
     */

    hotspots.forEach(function (hotspot) {
      hotspot.addEventListener(
        'click',
        function () {
          openPopup(hotspot);
        }
      );
    });


    /*
     * ========================================================
     * CLOSE BUTTON / OVERLAY
     * ========================================================
     */

    popups.forEach(function (popup) {
      const closeElements =
        popup.querySelectorAll(
          '[data-popup-close]'
        );

      closeElements.forEach(
        function (element) {
          element.addEventListener(
            'click',
            function () {
              closePopup(popup);
            }
          );
        }
      );
    });


    /*
     * ========================================================
     * ESC KEY
     * ========================================================
     */

    document.addEventListener(
      'keydown',
      function (event) {
        if (event.key !== 'Escape') return;

        popups.forEach(
          function (popup) {
            if (
              popup.classList.contains(
                'is-open'
              )
            ) {
              closePopup(popup);
            }
          }
        );
      }
    );


    /*
     * ========================================================
     * GET SELECTED SHOPIFY VARIANT
     * ========================================================
     */
function getSelectedVariant(form) {

  const variantsElement =
    form.querySelector(
      '.tv-product-popup__variants'
    );

  if (!variantsElement) {

    console.error(
      'Variant JSON not found.'
    );

    return null;
  }


  let variants;

  try {

    variants =
      JSON.parse(
        variantsElement.textContent
      );

  } catch (error) {

    console.error(
      'Unable to parse product variants:',
      error
    );

    return null;
  }


  /*
   * ------------------------------------------------------
   * GET PRODUCT OPTION NAMES
   * ------------------------------------------------------
   *
   * We use the controls in the popup to build the
   * customer's selection.
   * ------------------------------------------------------
   */

  const selections = {};


  /*
   * COLOR
   */

  const activeColor =
    form.querySelector(
      '.tv-product-popup__color.active'
    );

  if (activeColor) {

    selections.Color =
      activeColor.dataset.color
        .trim();

  }


  /*
   * OTHER OPTIONS
   */

  const selects =
    form.querySelectorAll(
      '.tv-product-popup__select'
    );

  selects.forEach(function (select) {

    const optionName =
      select.dataset.optionName;

    if (!optionName) return;

    selections[optionName] =
      select.value.trim();

  });


  console.log(
    'Customer selections:',
    selections
  );


  /*
   * ------------------------------------------------------
   * FIND THE VARIANT
   * ------------------------------------------------------
   *
   * Shopify gives every variant an "options" array.
   *
   * Example:
   *
   * ["Black", "Medium"]
   *
   * We compare that array against the customer's
   * selections in the same order as the product options.
   * ------------------------------------------------------
   */

  const selectedVariant =
    variants.find(function (variant) {

      if (!variant.available) {
        return false;
      }


      /*
       * Shopify's variant.options array contains
       * the values in the correct option order.
       */

      if (
        !variant.options ||
        !Array.isArray(variant.options)
      ) {
        return false;
      }


      /*
       * Get the values the customer selected.
       */

      const selectedValues =
        Object.values(
          selections
        );


      /*
       * Every selected value must exist in
       * the variant's options.
       */

      return selectedValues.every(
        function (selectedValue) {

          return variant.options.some(
            function (variantValue) {

              return (
                String(variantValue)
                  .trim()
                  .toLowerCase() ===
                String(selectedValue)
                  .trim()
                  .toLowerCase()
              );

            }
          );

        }
      );

    });


  console.log(
    'MATCHED PRODUCT VARIANT:',
    selectedVariant
  );


  return selectedVariant || null;
}

    /*
     * ========================================================
     * COLOR SELECTION
     * ========================================================
     */

    section
      .querySelectorAll(
        '.tv-product-popup__colors'
      )
      .forEach(
        function (group) {
          const buttons =
            group.querySelectorAll(
              '.tv-product-popup__color'
            );


          buttons.forEach(
            function (button) {
              button.addEventListener(
                'click',
                function () {

                  buttons.forEach(
                    function (btn) {
                      btn.classList.remove(
                        'active'
                      );
                    }
                  );


                  button.classList.add(
                    'active'
                  );
                }
              );
            }
          );
        }
      );


    /*
     * ========================================================
     * ADD ITEMS TO SHOPIFY CART
     * ========================================================
     */

    async function addToCart(items) {
      const response =
        await fetch(
          window.Shopify.routes.root +
          'cart/add.js',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',

              'Accept':
                'application/json'
            },

            body: JSON.stringify({
              items: items
            })
          }
        );


      if (!response.ok) {
        let errorData = null;

        try {
          errorData =
            await response.json();
        } catch (error) {
          /*
           * Ignore JSON parsing errors.
           */
        }


        throw new Error(
          errorData?.description ||
          'Unable to add product to cart.'
        );
      }


      return response.json();
    }


/*
 * ========================================================
 * GET SOFT WINTER JACKET VARIANT
 * ========================================================
 *
 * Product handle:
 * dark-winter-jacket
 *
 * Required jacket variant:
 * Color = Black
 * Size  = Medium
 * ========================================================
 */

function getSoftWinterJacketVariant() {

  const variantsElement =
    document.getElementById(
      'tv-soft-winter-jacket-variants'
    );

  if (!variantsElement) {
    throw new Error(
      'Soft Winter Jacket variants were not found.'
    );
  }


  let variants;

  try {

    variants =
      JSON.parse(
        variantsElement.textContent
      );

  } catch (error) {

    console.error(
      'Unable to parse Soft Winter Jacket variants:',
      error
    );

    throw new Error(
      'Unable to load Soft Winter Jacket variants.'
    );
  }


  console.log(
    'Soft Winter Jacket variants:',
    variants
  );


  /*
   * Find:
   *
   * Black
   * Medium
   *
   * and make sure the variant is available.
   */

  const jacketVariant =
    variants.find(function (variant) {

      if (!variant.available) {
        return false;
      }


      const options = [
        variant.option1,
        variant.option2,
        variant.option3
      ]
        .filter(function (value) {
          return (
            value !== null &&
            value !== undefined &&
            value !== ''
          );
        })
        .map(function (value) {
          return String(value)
            .trim()
            .toLowerCase();
        });


      return (
        options.includes('black') &&
        options.includes('medium')
      );

    });


  if (!jacketVariant) {

    console.error(
      'No available Black + Medium Soft Winter Jacket variant found.',
      variants
    );

    throw new Error(
      'The Black + Medium Soft Winter Jacket variant is unavailable.'
    );
  }


  console.log(
    'FOUND JACKET VARIANT:',
    jacketVariant
  );


  return Number(
    jacketVariant.id
  );
}

   /*
 * ========================================================
 * ADD TO CART BUTTON
 * ========================================================
 */

section
  .querySelectorAll(
    '.tv-product-popup__add'
  )
  .forEach(function (button) {

    button.addEventListener(
      'click',
      async function () {

        const form =
          button.closest(
            '.tv-product-popup__form'
          );

        if (!form) return;


        /*
         * ------------------------------------------------
         * FIND SELECTED SHOPIFY VARIANT
         * ------------------------------------------------
         */

        const variant =
          getSelectedVariant(form);

        if (!variant) {
          alert(
            'Please select a color and size.'
          );

          return;
        }


        /*
         * ------------------------------------------------
         * CHECK PRODUCT VARIANT AVAILABILITY
         * ------------------------------------------------
         */

        if (!variant.available) {
          alert(
            'This variant is currently unavailable.'
          );

          return;
        }


        /*
         * ------------------------------------------------
         * PREVENT DOUBLE CLICKS
         * ------------------------------------------------
         */

        button.disabled = true;

        const originalText =
          button.querySelector('span');

        if (originalText) {
          originalText.textContent =
            'ADDING...';
        }


        try {

          /*
           * ------------------------------------------------
           * START WITH THE SELECTED PRODUCT
           * ------------------------------------------------
           */

          const cartItems = [
            {
              id: Number(variant.id),
              quantity: 1
            }
          ];


          /*
           * ------------------------------------------------
           * GET THE ACTUAL SELECTED VARIANT OPTIONS
           * ------------------------------------------------
           */

         const variantOptions = [
  variant.option1,
  variant.option2,
  variant.option3
]
  .filter(function (value) {
    return (
      value !== null &&
      value !== undefined &&
      value !== ''
    );
  })
  .map(function (value) {
    return String(value)
      .trim()
      .toLowerCase();
  });


const isBlackMedium =
  variantOptions.includes('black') &&
  variantOptions.includes('medium');


console.log(
  'SELECTED VARIANT:',
  variant
);

console.log(
  'SELECTED OPTIONS:',
  variantOptions
);

console.log(
  'IS BLACK + MEDIUM:',
  isBlackMedium
);


if (isBlackMedium) {

  const jacketVariantId =
    getSoftWinterJacketVariant();


  console.log(
    'ADDING JACKET VARIANT:',
    jacketVariantId
  );


  cartItems.push({
    id: jacketVariantId,
    quantity: 1
  });

}


console.log(
  'FINAL CART ITEMS:',
  cartItems
);


await addToCart(
  cartItems
);


          /*
           * ------------------------------------------------
           * DETECT BLACK + MEDIUM
           * ------------------------------------------------
           *
           * The selected variant must contain BOTH:
           *
           * black
           * medium
           *
           * The order of the options does not matter.
           * ------------------------------------------------
           */

          const hasBlack =
            variantOptions.includes('black');

          const hasMedium =
            variantOptions.includes('medium');

          const isBlackMedium =
            hasBlack && hasMedium;


          console.log(
            'Has Black:',
            hasBlack
          );

          console.log(
            'Has Medium:',
            hasMedium
          );

          console.log(
            'Black + Medium:',
            isBlackMedium
          );


          /*
           * ------------------------------------------------
           * AUTOMATIC SOFT WINTER JACKET
           * ------------------------------------------------
           */

          if (isBlackMedium) {

            console.log(
              'Black + Medium detected.'
            );

            console.log(
              'Getting Soft Winter Jacket Black + Medium variant...'
            );

            const jacketVariantId =
              await getSoftWinterJacketVariant();

            console.log(
              'Jacket variant ID:',
              jacketVariantId
            );


            /*
             * Add the jacket to the same cart request.
             */

            cartItems.push({
              id: jacketVariantId,
              quantity: 1
            });

          }


          /*
           * ------------------------------------------------
           * ADD EVERYTHING TO CART
           * ------------------------------------------------
           */

          console.log(
            'Final cart items:',
            cartItems
          );

          await addToCart(cartItems);


          /*
           * ------------------------------------------------
           * BUTTON FEEDBACK
           * ------------------------------------------------
           */

          if (originalText) {
            originalText.textContent =
              'ADDED TO CART';
          }


          /*
           * ------------------------------------------------
           * REDIRECT TO CART
           * ------------------------------------------------
           */

          window.location.href = '/cart';

        } catch (error) {

          console.error(
            'Add to cart failed:',
            error
          );

          alert(
            error.message ||
            'Unable to add product to cart.'
          );

          if (originalText) {
            originalText.textContent =
              'ADD TO CART';
          }

        } finally {

          button.disabled = false;

        }

      }
    );

  });

  }


  /*
   * ==========================================================
   * INITIALIZE ALL PRODUCT GRID SECTIONS
   * ==========================================================
   */

 function initializeProductGrids() {
  document
    .querySelectorAll('.tv-product-grid')
    .forEach(function (section) {
      initGrid(section);
    });
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    initializeProductGrids
  );
} else {
  initializeProductGrids();
}

})();

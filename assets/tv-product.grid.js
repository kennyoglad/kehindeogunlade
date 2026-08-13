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
        variants = JSON.parse(
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
       * Store the selected options.
       */

      const selections = {};


      /*
       * ------------------------------------------------------
       * COLOR
       * ------------------------------------------------------
       */

      const activeColor =
        form.querySelector(
          '.tv-product-popup__color.active'
        );

      if (activeColor) {
        selections.Color =
          activeColor.dataset.color.trim();
      }


      /*
       * ------------------------------------------------------
       * OTHER OPTIONS / SIZE
       * ------------------------------------------------------
       */

      const selects =
        form.querySelectorAll(
          '.tv-product-popup__select'
        );

      selects.forEach(
        function (select) {
          const optionName =
            select.dataset.optionName ||
            select
              .closest(
                '.tv-product-popup__option'
              )
              ?.querySelector(
                '.tv-product-popup__label'
              )
              ?.textContent
              .trim();

          if (!optionName) return;

          selections[optionName] =
            select.value.trim();
        }
      );


      console.log(
        'Selected options:',
        selections
      );

      console.log(
        'Available variants:',
        variants
      );


      /*
       * ------------------------------------------------------
       * DETERMINE REQUIRED OPTIONS
       * ------------------------------------------------------
       */

      const requiredOptionNames = [];


      /*
       * Color is required when color buttons exist.
       */

      if (
        form.querySelector(
          '.tv-product-popup__colors'
        )
      ) {
        requiredOptionNames.push(
          'Color'
        );
      }


      /*
       * Add all other select options.
       */

      selects.forEach(
        function (select) {
          const optionName =
            select.dataset.optionName ||
            select
              .closest(
                '.tv-product-popup__option'
              )
              ?.querySelector(
                '.tv-product-popup__label'
              )
              ?.textContent
              .trim();

          if (
            optionName &&
            !requiredOptionNames.includes(
              optionName
            )
          ) {
            requiredOptionNames.push(
              optionName
            );
          }
        }
      );


      /*
       * ------------------------------------------------------
       * CHECK FOR MISSING OPTIONS
       * ------------------------------------------------------
       */

      const missingOption =
        requiredOptionNames.find(
          function (name) {
            return !selections[name];
          }
        );


      if (missingOption) {
        console.warn(
          'Missing variant option:',
          missingOption
        );

        return null;
      }


      /*
       * ------------------------------------------------------
       * FIND MATCHING SHOPIFY VARIANT
       * ------------------------------------------------------
       */

      const selectedVariant =
        variants.find(
          function (variant) {
            const variantOptions = [
              variant.option1,
              variant.option2,
              variant.option3
            ].filter(
              function (value) {
                return (
                  value !== null &&
                  value !== undefined
                );
              }
            );


            return requiredOptionNames.every(
              function (optionName) {
                return variantOptions.includes(
                  selections[optionName]
                );
              }
            );
          }
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
 * Shopify product handle:
 * dark-winter-jacket
 *
 * The first available variant is used.
 * ========================================================
 */

/*
 * ========================================================
 * GET SOFT WINTER JACKET VARIANT
 * ========================================================
 *
 * The variant ID is resolved by Liquid.
 *
 * Liquid searches for:
 *
 * Product:
 * dark-winter-jacket
 *
 * Fallback:
 * soft-winter-jacket
 *
 * Variant:
 * Black + Medium
 *
 * JavaScript simply reads the exact Shopify variant ID.
 * ========================================================
 */

function getSoftWinterJacketVariant() {

  const configElement =
    document.getElementById(
      'tv-soft-winter-jacket-config'
    );


  if (!configElement) {

    console.error(
      'SOFT WINTER JACKET: Liquid configuration element was not found.'
    );

    throw new Error(
      'Soft Winter Jacket configuration was not found.'
    );

  }


  let config;

  try {

    config =
      JSON.parse(
        configElement.textContent
      );

  } catch (error) {

    console.error(
      'SOFT WINTER JACKET: Could not parse Liquid configuration.',
      error
    );

    throw new Error(
      'Could not read Soft Winter Jacket configuration.'
    );

  }


  console.log(
    '================================================'
  );

  console.log(
    'SOFT WINTER JACKET CONFIG:'
  );

  console.log(
    config
  );

  console.log(
    '================================================'
  );


  /*
   * ------------------------------------------------------
   * PRODUCT NOT FOUND
   * ------------------------------------------------------
   */

  if (!config.productFound) {

    console.error(
      'SOFT WINTER JACKET: Product was not found.'
    );

    throw new Error(
      'Soft Winter Jacket product was not found.'
    );

  }


  /*
   * ------------------------------------------------------
   * BLACK + MEDIUM VARIANT NOT FOUND
   * ------------------------------------------------------
   */

  if (
    !config.variantFound ||
    !config.variantId
  ) {

    console.error(
      'SOFT WINTER JACKET: Black + Medium variant was not found or is unavailable.'
    );

    console.error(
      'Product handle:',
      config.productHandle
    );

    throw new Error(
      'Black + Medium Soft Winter Jacket variant is unavailable.'
    );

  }


  /*
   * ------------------------------------------------------
   * SUCCESS
   * ------------------------------------------------------
   */

  const variantId =
    Number(
      config.variantId
    );


  if (!variantId) {

    console.error(
      'SOFT WINTER JACKET: Invalid variant ID:',
      config.variantId
    );

    throw new Error(
      'Invalid Soft Winter Jacket variant ID.'
    );

  }


  console.log(
    'SOFT WINTER JACKET FOUND'
  );

  console.log(
    'Product handle:',
    config.productHandle
  );

  console.log(
    'Black + Medium variant ID:',
    variantId
  );


  return variantId;
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
      .forEach(
        function (button) {

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
                 * CHECK THE ACTUAL SHOPIFY VARIANT
                 *
                 * We intentionally check the selected Shopify
                 * variant rather than only checking the UI.
                 * ------------------------------------------------
                 */

                const variantOptions = [
                  variant.option1,
                  variant.option2,
                  variant.option3
                ]
                  .filter(
                    function (value) {
                      return (
                        value !== null &&
                        value !== undefined
                      );
                    }
                  )
                  .map(
                    function (value) {
                      return value
                        .trim()
                        .toLowerCase();
                    }
                  );


                /*
                 * ------------------------------------------------
                 * BLACK + MEDIUM DETECTION
                 * ------------------------------------------------
                 */

                const isBlackMedium =
                  variantOptions.includes(
                    'black'
                  ) &&
                  variantOptions.includes(
                    'medium'
                  );


                console.log(
                  'Selected Shopify variant:',
                  variant
                );

                console.log(
                  'Selected variant options:',
                  variantOptions
                );

                console.log(
                  'Black + Medium detected:',
                  isBlackMedium
                );


                /*
                 * ------------------------------------------------
                 * AUTOMATICALLY ADD SOFT WINTER JACKET
                 * ------------------------------------------------
                 *
                 * Only happens when the selected product variant
                 * contains both:
                 *
                 * Black
                 * Medium
                 * ------------------------------------------------
                 */

                if (isBlackMedium) {

                console.log(
                  '================================================'
                );
              
                console.log(
                  'BLACK + MEDIUM MATCHED.'
                );
              
                console.log(
                  'Loading Soft Winter Jacket Black + Medium variant...'
                );
              
                console.log(
                  '================================================'
                );
              
              
                const jacketVariantId =
                  getSoftWinterJacketVariant();
              
              
                console.log(
                  'Soft Winter Jacket Black + Medium variant ID:',
                  jacketVariantId
                );
              
              
                /*
                 * Add the jacket to the SAME cart request.
                 */
              
                cartItems.push({
                  id: Number(
                    jacketVariantId
                  ),
                  quantity: 1
                });
              
              
                console.log(
                  '================================================'
                );
              
                console.log(
                  'FINAL CART ITEMS:'
                );
              
                console.log(
                  cartItems
                );
              
                console.log(
                  '================================================'
                );
              
              }


                /*
                 * ------------------------------------------------
                 * ADD EVERYTHING IN ONE SHOPIFY REQUEST
                 * ------------------------------------------------
                 */

                console.log(
                  'Final cart items:',
                  cartItems
                );


                await addToCart(
                  cartItems
                );


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

                window.location.href =
                  '/cart';

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

        }
      );

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

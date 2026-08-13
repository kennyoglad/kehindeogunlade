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
 * The automatic jacket product handles are:
 * dark-winter-jacket
 * soft-winter-jacket
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
     * Shopify product handles:
     *
     * 1. dark-winter-jacket
     * 2. soft-winter-jacket
     *
     * The product is loaded directly from Shopify.
     *
     * Then JavaScript searches its variants for:
     *
     * - Black
     * - Medium OR M
     *
     * This removes the dependency on the Liquid
     * all_products lookup.
     * ========================================================
     */

    async function getSoftWinterJacketVariant() {

      const handles = [
        'dark-winter-jacket',
        'soft-winter-jacket'
      ];


      let product = null;


      /*
       * ------------------------------------------------------
       * FIND THE PRODUCT
       * ------------------------------------------------------
       */

      for (const handle of handles) {

        try {

          const response =
            await fetch(
              window.Shopify.routes.root +
              'products/' +
              handle +
              '.js',
              {
                method: 'GET',

                headers: {
                  'Accept':
                    'application/json'
                }
              }
            );


          if (!response.ok) {
            console.warn(
              'Soft Winter Jacket product request failed:',
              handle,
              response.status
            );

            continue;
          }


          const data =
            await response.json();


          if (
            data &&
            Array.isArray(data.variants)
          ) {

            product = data;

            console.log(
              'Soft Winter Jacket product found:',
              handle
            );

            break;
          }

        } catch (error) {

          console.error(
            'Unable to load product:',
            handle,
            error
          );

        }

      }


      /*
       * ------------------------------------------------------
       * PRODUCT NOT FOUND
       * ------------------------------------------------------
       */

      if (!product) {

        console.error(
          'SOFT WINTER JACKET: Product could not be found.'
        );

        throw new Error(
          'Soft Winter Jacket product could not be found.'
        );

      }


      console.log(
        '================================================'
      );

      console.log(
        'SOFT WINTER JACKET PRODUCT:'
      );

      console.log(
        product
      );

      console.log(
        '================================================'
      );


      /*
       * ------------------------------------------------------
       * FIND BLACK + MEDIUM VARIANT
       * ------------------------------------------------------
       */

      const jacketVariant =
        product.variants.find(
          function (variant) {

            const options = [
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


            const isBlack =
              options.includes('black');


            /*
             * Shopify may store Medium as either:
             *
             * - "Medium"
             * - "M"
             *
             * Treat both values as Medium.
             */

            const isMedium =
              options.includes('medium') ||
              options.includes('m');


            return (
              isBlack &&
              isMedium &&
              variant.available
            );

          }
        );


      /*
       * ------------------------------------------------------
       * BLACK + MEDIUM VARIANT NOT FOUND
       * ------------------------------------------------------
       */

      if (!jacketVariant) {

        console.error(
          'SOFT WINTER JACKET: Black + Medium variant was not found or is unavailable.'
        );

        console.error(
          'Product:',
          product
        );

        console.error(
          'Available variants:',
          product.variants
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
          jacketVariant.id
        );


      if (!variantId) {

        console.error(
          'SOFT WINTER JACKET: Invalid variant ID:',
          jacketVariant.id
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
        product.handle
      );

      console.log(
        'Product title:',
        product.title
      );

      console.log(
        'Black + Medium variant:',
        jacketVariant
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
                    id: Number(
                      variant.id
                    ),
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

                const isBlack =
                  variantOptions.includes(
                    'black'
                  );


                /*
                 * Shopify may store Medium as either:
                 *
                 * - "Medium"
                 * - "M"
                 *
                 * Treat both values as Medium.
                 */

                const isMedium =
                  variantOptions.includes(
                    'medium'
                  ) ||
                  variantOptions.includes(
                    'm'
                  );


                const isBlackMedium =
                  isBlack &&
                  isMedium;


                console.log(
                  'Selected Shopify variant:',
                  variant
                );

                console.log(
                  'Selected variant options:',
                  variantOptions
                );

                console.log(
                  'Black detected:',
                  isBlack
                );

                console.log(
                  'Medium detected:',
                  isMedium
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
                 * Medium OR M
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


                  /*
                   * IMPORTANT:
                   *
                   * The function is async because it retrieves
                   * the product directly from Shopify.
                   *
                   * Therefore we MUST use await here.
                   */

                  const jacketVariantId =
                    await getSoftWinterJacketVariant();


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
      .querySelectorAll(
        '.tv-product-grid'
      )
      .forEach(
        function (section) {
          initGrid(section);
        }
      );

  }


  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      initializeProductGrids
    );

  } else {

    initializeProductGrids();

  }

})();

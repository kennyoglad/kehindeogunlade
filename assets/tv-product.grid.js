/*
 * TV PRODUCT GRID
 * ============================================================
 *
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
 * AUTOMATIC JACKET:
 *
 * Handle:
 *   dark-winter-jacket
 *
 * The actual available variant ID is supplied by Liquid through:
 *
 *   data-jacket-variant-id
 *
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


      popup.classList.add('is-open');

      popup.setAttribute(
        'aria-hidden',
        'false'
      );

      hotspot.setAttribute(
        'aria-expanded',
        'true'
      );


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
     * PARSE VARIANTS
     * ========================================================
     */

    function getVariants(form) {
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


      try {
        return JSON.parse(
          variantsElement.textContent
        );
      } catch (error) {
        console.error(
          'Unable to parse product variants:',
          error
        );

        return null;
      }
    }


    /*
     * ========================================================
     * GET SELECTED OPTIONS
     * ========================================================
     *
     * Creates an object like:
     *
     * {
     *   Color: "Black",
     *   Size: "Medium"
     * }
     *
     * ========================================================
     */

    function getSelectedOptions(form) {
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
       * OTHER OPTIONS
       * ------------------------------------------------------
       */

      const selects =
        form.querySelectorAll(
          '.tv-product-popup__select'
        );


      selects.forEach(
        function (select) {
          const optionName =
            select.dataset.optionName;


          if (!optionName) return;


          selections[optionName] =
            select.value.trim();
        }
      );


      return selections;
    }


    /*
     * ========================================================
     * GET PRODUCT OPTION POSITIONS
     * ========================================================
     *
     * Shopify variant data uses:
     *
     * option1
     * option2
     * option3
     *
     * We need to know which product option corresponds to
     * each position.
     *
     * Example:
     *
     * option1 = Color
     * option2 = Size
     *
     * ========================================================
     */

    function getOptionPositions(form) {
      const positions = {};


      /*
       * Color buttons always represent the Color option.
       */

      if (
        form.querySelector(
          '.tv-product-popup__colors'
        )
      ) {
        positions.Color = 1;
      }


      /*
       * Other options explicitly carry their Shopify
       * option position from Liquid.
       */

      const selects =
        form.querySelectorAll(
          '.tv-product-popup__select'
        );


      selects.forEach(
        function (select) {
          const optionName =
            select.dataset.optionName;

          const position =
            Number(
              select.dataset.optionPosition
            );


          if (
            optionName &&
            position
          ) {
            positions[optionName] =
              position;
          }
        }
      );


      return positions;
    }


    /*
     * ========================================================
     * GET SELECTED SHOPIFY VARIANT
     * ========================================================
     */

    function getSelectedVariant(form) {
      const variants =
        getVariants(form);

      if (!variants) {
        return null;
      }


      const selections =
        getSelectedOptions(form);

      const optionPositions =
        getOptionPositions(form);


      console.log(
        'Selected options:',
        selections
      );

      console.log(
        'Option positions:',
        optionPositions
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

      const requiredOptionNames =
        Object.keys(
          optionPositions
        );


      /*
       * ------------------------------------------------------
       * CHECK MISSING OPTIONS
       * ------------------------------------------------------
       */

      const missingOption =
        requiredOptionNames.find(
          function (optionName) {
            return !selections[optionName];
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
       * FIND MATCHING VARIANT
       * ------------------------------------------------------
       */

      const selectedVariant =
        variants.find(
          function (variant) {

            return requiredOptionNames.every(
              function (optionName) {

                const position =
                  optionPositions[
                    optionName
                  ];

                const variantOption =
                  variant[
                    'option' + position
                  ];


                if (
                  variantOption === null ||
                  variantOption === undefined
                ) {
                  return false;
                }


                return (
                  String(
                    variantOption
                  )
                    .trim()
                    .toLowerCase() ===
                  String(
                    selections[optionName]
                  )
                    .trim()
                    .toLowerCase()
                );
              }
            );
          }
        );


      console.log(
        'Matched Shopify variant:',
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
     *
     * Shopify supports multiple items in a single
     * /cart/add.js request.
     *
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


      let responseData = null;


      try {
        responseData =
          await response.json();
      } catch (error) {
        /*
         * Ignore JSON parsing errors.
         */
      }


      if (!response.ok) {

        console.error(
          'Shopify cart error:',
          responseData
        );


        throw new Error(
          responseData?.description ||
          responseData?.message ||
          'Unable to add product to cart.'
        );
      }


      return responseData;
    }


    /*
     * ========================================================
     * GET CURRENT CART
     * ========================================================
     */

    async function getCart() {

      const response =
        await fetch(
          window.Shopify.routes.root +
          'cart.js',
          {
            method: 'GET',

            headers: {
              'Accept':
                'application/json'
            }
          }
        );


      if (!response.ok) {
        throw new Error(
          'Unable to read the current cart.'
        );
      }


      return response.json();
    }


    /*
     * ========================================================
     * CHECK WHETHER VARIANT IS ALREADY IN CART
     * ========================================================
     */

    async function isVariantInCart(
      variantId
    ) {

      const cart =
        await getCart();


      return cart.items.some(
        function (item) {
          return (
            Number(item.variant_id) ===
            Number(variantId)
          );
        }
      );
    }


    /*
     * ========================================================
     * GET AUTOMATIC JACKET VARIANT
     * ========================================================
     *
     * The variant ID comes directly from Liquid:
     *
     * data-jacket-variant-id="..."
     *
     * ========================================================
     */

    function getAutomaticJacketVariantId() {

      const jacketVariantId =
        section.dataset.jacketVariantId;


      if (!jacketVariantId) {

        console.error(
          'Automatic Soft Winter Jacket variant ID is missing.'
        );

        console.error(
          'Check that the product handle "dark-winter-jacket" exists, is available, and is published to the Online Store.'
        );

        return null;
      }


      return Number(
        jacketVariantId
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
               * FIND SELECTED VARIANT
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
               * CHECK VARIANT AVAILABILITY
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
               * PREVENT DOUBLE CLICK
               * ------------------------------------------------
               */

              button.disabled = true;


              const originalText =
                button.querySelector(
                  'span'
                );


              if (originalText) {
                originalText.textContent =
                  'ADDING...';
              }


              try {

                /*
                 * ------------------------------------------------
                 * START WITH SELECTED PRODUCT
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
                 * DETERMINE SELECTED VARIANT OPTIONS
                 * ------------------------------------------------
                 */

                const selectedOptions =
                  getSelectedOptions(form);


                const normalizedOptions =
                  Object.keys(
                    selectedOptions
                  ).reduce(
                    function (
                      result,
                      optionName
                    ) {

                      result[
                        optionName
                      ] =
                        selectedOptions[
                          optionName
                        ]
                          .trim()
                          .toLowerCase();

                      return result;
                    },
                    {}
                  );


                console.log(
                  'Selected normalized options:',
                  normalizedOptions
                );


                /*
                 * ------------------------------------------------
                 * BLACK + MEDIUM DETECTION
                 * ------------------------------------------------
                 *
                 * We specifically check the OPTION NAMES here.
                 *
                 * This prevents another combination such as:
                 *
                 * Color = Medium
                 * Size  = Black
                 *
                 * from accidentally triggering the jacket.
                 * ------------------------------------------------
                 */

                const isBlackMedium =
                  normalizedOptions.Color ===
                    'black' &&
                  normalizedOptions.Size ===
                    'medium';


                console.log(
                  'Black + Medium detected:',
                  isBlackMedium
                );


                /*
                 * ------------------------------------------------
                 * AUTOMATIC SOFT WINTER JACKET
                 * ------------------------------------------------
                 */

                if (isBlackMedium) {

                  console.log(
                    'BLACK + MEDIUM MATCHED'
                  );


                  const jacketVariantId =
                    getAutomaticJacketVariantId();


                  if (!jacketVariantId) {

                    throw new Error(
                      'Soft Winter Jacket could not be resolved.'
                    );
                  }


                  console.log(
                    'Soft Winter Jacket variant ID:',
                    jacketVariantId
                  );


                  /*
                   * ------------------------------------------------
                   * DO NOT ADD JACKET TWICE
                   * ------------------------------------------------
                   */

                  const jacketAlreadyInCart =
                    await isVariantInCart(
                      jacketVariantId
                    );


                  console.log(
                    'Soft Winter Jacket already in cart:',
                    jacketAlreadyInCart
                  );


                  if (
                    !jacketAlreadyInCart
                  ) {

                    cartItems.push({
                      id:
                        jacketVariantId,

                      quantity: 1
                    });

                    console.log(
                      'Soft Winter Jacket added to pending cart items.'
                    );

                  } else {

                    console.log(
                      'Soft Winter Jacket is already in cart. Skipping duplicate.'
                    );

                  }

                }


                /*
                 * ------------------------------------------------
                 * FINAL DEBUG
                 * ------------------------------------------------
                 */

                console.log(
                  '================================='
                );

                console.log(
                  'FINAL CART ITEMS:',
                  cartItems
                );

                console.log(
                  'SELECTED VARIANT:',
                  variant
                );

                console.log(
                  'SELECTED OPTIONS:',
                  selectedOptions
                );

                console.log(
                  'JACKET VARIANT FROM LIQUID:',
                  section.dataset.jacketVariantId
                );

                console.log(
                  '================================='
                );


                /*
                 * ------------------------------------------------
                 * ADD EVERYTHING TO SHOPIFY
                 * ------------------------------------------------
                 */

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
                  window.Shopify.routes.root +
                  'cart';


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

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
 * AUTOMATIC JACKET:
 *
 * Product handle:
 * dark-winter-jacket
 *
 * Required jacket variant:
 *
 * Color = Black
 * Size  = Medium
 *
 * IMPORTANT:
 *
 * The Liquid section generates the exact jacket variant ID:
 *
 * tv-soft-winter-jacket-config-{{ section.id }}
 *
 * JavaScript reads that configuration.
 *
 * ============================================================
 */

(function () {
  'use strict';


  /*
   * ==========================================================
   * NORMALIZE VALUE
   * ==========================================================
   *
   * Makes comparison safe:
   *
   * "Black"
   * " black "
   * "BLACK"
   *
   * all become:
   *
   * "black"
   *
   * ==========================================================
   */

  function normalizeValue(value) {

    if (
      value === null ||
      value === undefined
    ) {
      return '';
    }

    return String(value)
      .trim()
      .toLowerCase();

  }


  /*
   * ==========================================================
   * INITIALIZE PRODUCT GRID
   * ==========================================================
   */

  function initGrid(section) {

    if (!section) {
      return;
    }


    /*
     * --------------------------------------------------------
     * SECTION ID
     * --------------------------------------------------------
     */

    const sectionId =
      section.dataset.sectionId;


    console.log(
      '================================================'
    );

    console.log(
      'TV PRODUCT GRID INITIALIZED'
    );

    console.log(
      'SECTION ID:',
      sectionId
    );

    console.log(
      '================================================'
    );


    /*
     * --------------------------------------------------------
     * HOTSPOTS
     * --------------------------------------------------------
     */

    const hotspots =
      section.querySelectorAll(
        '.tv-product-hotspot'
      );


    /*
     * --------------------------------------------------------
     * POPUPS
     * --------------------------------------------------------
     */

    const popups =
      section.querySelectorAll(
        '[data-popup]'
      );


    /*
     * ========================================================
     * OPEN POPUP
     * ========================================================
     */

    function openPopup(hotspot) {

      const popupId =
        hotspot.getAttribute(
          'aria-controls'
        );


      if (!popupId) {
        return;
      }


      const popup =
        document.getElementById(
          popupId
        );


      if (!popup) {

        console.error(
          'TV PRODUCT GRID: Popup not found:',
          popupId
        );

        return;
      }


      /*
       * Close every other popup.
       */

      popups.forEach(
        function (item) {

          item.classList.remove(
            'is-open'
          );

          item.setAttribute(
            'aria-hidden',
            'true'
          );

        }
      );


      /*
       * Reset hotspot states.
       */

      hotspots.forEach(
        function (item) {

          item.setAttribute(
            'aria-expanded',
            'false'
          );

        }
      );


      /*
       * Open selected popup.
       */

      popup.classList.add(
        'is-open'
      );


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

      if (!popup) {
        return;
      }


      popup.classList.remove(
        'is-open'
      );


      popup.setAttribute(
        'aria-hidden',
        'true'
      );


      hotspots.forEach(
        function (item) {

          item.setAttribute(
            'aria-expanded',
            'false'
          );

        }
      );


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

    hotspots.forEach(
      function (hotspot) {

        hotspot.addEventListener(
          'click',
          function () {

            openPopup(
              hotspot
            );

          }
        );

      }
    );


    /*
     * ========================================================
     * CLOSE BUTTON / OVERLAY
     * ========================================================
     */

    popups.forEach(
      function (popup) {

        const closeElements =
          popup.querySelectorAll(
            '[data-popup-close]'
          );


        closeElements.forEach(
          function (element) {

            element.addEventListener(
              'click',
              function () {

                closePopup(
                  popup
                );

              }
            );

          }
        );

      }
    );


    /*
     * ========================================================
     * ESC KEY
     * ========================================================
     */

    document.addEventListener(
      'keydown',
      function (event) {

        if (
          event.key !== 'Escape'
        ) {
          return;
        }


        popups.forEach(
          function (popup) {

            if (
              popup.classList.contains(
                'is-open'
              )
            ) {

              closePopup(
                popup
              );

            }

          }
        );

      }
    );


    /*
     * ========================================================
     * GET SELECTED SHOPIFY VARIANT
     * ========================================================
     *
     * Reads:
     *
     * .tv-product-popup__variants
     *
     * Then compares the customer's selections against
     * Shopify's variant options.
     *
     * This intentionally does NOT assume:
     *
     * Color / Size
     *
     * or:
     *
     * Size / Color
     *
     * because we compare the selected values as a group.
     *
     * ========================================================
     */

    function getSelectedVariant(form) {

      if (!form) {

        console.error(
          'TV PRODUCT GRID: Product form not found.'
        );

        return null;
      }


      /*
       * ------------------------------------------------------
       * GET VARIANT JSON
       * ------------------------------------------------------
       */

      const variantsElement =
        form.querySelector(
          '.tv-product-popup__variants'
        );


      if (!variantsElement) {

        console.error(
          'TV PRODUCT GRID: Variant JSON element not found.'
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
          'TV PRODUCT GRID: Unable to parse variant JSON.',
          error
        );

        return null;
      }


      if (!Array.isArray(variants)) {

        console.error(
          'TV PRODUCT GRID: Variant JSON is not an array.',
          variants
        );

        return null;
      }


      /*
       * ------------------------------------------------------
       * CUSTOMER SELECTIONS
       * ------------------------------------------------------
       */

      const selectedValues = [];


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

        const color =
          normalizeValue(
            activeColor.dataset.color
          );


        if (color) {

          selectedValues.push(
            color
          );

        }

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

          const value =
            normalizeValue(
              select.value
            );


          /*
           * Ignore the placeholder.
           */

          if (value) {

            selectedValues.push(
              value
            );

          }

        }
      );


      console.log(
        'TV PRODUCT GRID - SELECTED VALUES:',
        selectedValues
      );


      /*
       * ------------------------------------------------------
       * NO SELECTION
       * ------------------------------------------------------
       */

      if (
        selectedValues.length === 0
      ) {

        console.warn(
          'TV PRODUCT GRID: No options selected.'
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

            /*
             * Skip unavailable variants.
             */

            if (
              variant.available === false
            ) {

              return false;
            }


            /*
             * Shopify variant options.
             */

            let variantOptions = [];


            if (
              Array.isArray(
                variant.options
              )
            ) {

              variantOptions =
                variant.options;

            } else {

              variantOptions = [
                variant.option1,
                variant.option2,
                variant.option3
              ];

            }


            /*
             * Remove empty options.
             */

            variantOptions =
              variantOptions
                .filter(
                  function (value) {

                    return (
                      value !== null &&
                      value !== undefined &&
                      String(value).trim() !== ''
                    );

                  }
                )
                .map(
                  function (value) {

                    return normalizeValue(
                      value
                    );

                  }
                );


            /*
             * The number of selected values must equal
             * the number of variant options.
             *
             * Example:
             *
             * Selected:
             * Black
             *
             * Variant:
             * Black / Medium
             *
             * NOT a match.
             */

            if (
              selectedValues.length !==
              variantOptions.length
            ) {

              return false;
            }


            /*
             * Copy variant options.
             */

            const remainingOptions =
              variantOptions.slice();


            /*
             * Match each selected value exactly once.
             */

            for (
              let i = 0;
              i < selectedValues.length;
              i++
            ) {

              const selectedValue =
                selectedValues[i];


              const matchIndex =
                remainingOptions.findIndex(
                  function (variantValue) {

                    return (
                      variantValue ===
                      selectedValue
                    );

                  }
                );


              /*
               * No matching value.
               */

              if (
                matchIndex === -1
              ) {

                return false;
              }


              /*
               * Remove matched option.
               */

              remainingOptions.splice(
                matchIndex,
                1
              );

            }


            /*
             * Exact match.
             */

            return (
              remainingOptions.length === 0
            );

          }
        );


      console.log(
        'TV PRODUCT GRID - MATCHED VARIANT:',
        selectedVariant
      );


      return (
        selectedVariant ||
        null
      );

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

                  /*
                   * Remove active state from
                   * every color button in this group.
                   */

                  buttons.forEach(
                    function (btn) {

                      btn.classList.remove(
                        'active'
                      );

                    }
                  );


                  /*
                   * Activate selected color.
                   */

                  button.classList.add(
                    'active'
                  );


                  console.log(
                    'TV PRODUCT GRID - COLOR SELECTED:',
                    button.dataset.color
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

      if (
        !Array.isArray(items) ||
        items.length === 0
      ) {

        throw new Error(
          'No products were selected.'
        );

      }


      console.log(
        '================================================'
      );

      console.log(
        'TV PRODUCT GRID - ADDING ITEMS TO CART'
      );

      console.log(
        'CART ITEMS:',
        items
      );

      console.log(
        '================================================'
      );


      /*
       * Shopify root URL.
       */

      const root =
        window.Shopify &&
        window.Shopify.routes &&
        window.Shopify.routes.root
          ? window.Shopify.routes.root
          : '/';


      const cartUrl =
        root +
        'cart/add.js';


      console.log(
        'CART URL:',
        cartUrl
      );


      /*
       * Send cart request.
       */

      const response =
        await fetch(
          cartUrl,
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


      /*
       * Parse response.
       */

      let data = null;


      try {

        data =
          await response.json();

      } catch (error) {

        console.error(
          'TV PRODUCT GRID: Could not parse Shopify response.',
          error
        );

      }


      console.log(
        'SHOPIFY CART STATUS:',
        response.status
      );


      console.log(
        'SHOPIFY CART RESPONSE:',
        data
      );


      /*
       * Handle Shopify errors.
       */

      if (!response.ok) {

        throw new Error(
          data?.description ||
          data?.message ||
          'Shopify could not add the products to the cart.'
        );

      }


      return data;

    }


    /*
     * ========================================================
     * GET SOFT WINTER JACKET VARIANT
     * ========================================================
     *
     * IMPORTANT:
     *
     * DO NOT fetch /products/dark-winter-jacket.js here.
     *
     * The Liquid file has already found the exact:
     *
     * Black + Medium
     *
     * available jacket variant.
     *
     * Liquid creates:
     *
     * tv-soft-winter-jacket-config-{{ section.id }}
     *
     * We read that configuration here.
     *
     * ========================================================
     */

    function getSoftWinterJacketVariant(section) {

      /*
       * ------------------------------------------------------
       * BUILD CONFIG ELEMENT ID
       * ------------------------------------------------------
       */

      const currentSectionId =
        section.dataset.sectionId;


      const configId =
        'tv-soft-winter-jacket-config-' +
        currentSectionId;


      console.log(
        'LOOKING FOR JACKET CONFIG:',
        configId
      );


      /*
       * ------------------------------------------------------
       * FIND CONFIGURATION
       * ------------------------------------------------------
       */

      const configElement =
        document.getElementById(
          configId
        );


      if (!configElement) {

        console.error(
          'TV PRODUCT GRID: Soft Winter Jacket config element not found.',
          configId
        );


        throw new Error(
          'Soft Winter Jacket configuration was not found.'
        );

      }


      /*
       * ------------------------------------------------------
       * PARSE CONFIGURATION
       * ------------------------------------------------------
       */

      let config;


      try {

        config =
          JSON.parse(
            configElement.textContent
          );

      } catch (error) {

        console.error(
          'TV PRODUCT GRID: Unable to parse jacket configuration.',
          error
        );


        throw new Error(
          'Unable to read Soft Winter Jacket configuration.'
        );

      }


      /*
       * ------------------------------------------------------
       * DEBUG
       * ------------------------------------------------------
       */

      console.log(
        '================================================'
      );

      console.log(
        'JACKET CONFIG:'
      );

      console.log(
        config
      );

      console.log(
        'JACKET PRODUCT FOUND:',
        config.productFound
      );

      console.log(
        'JACKET VARIANT ID:',
        config.variantId
      );

      console.log(
        '================================================'
      );


      /*
       * ------------------------------------------------------
       * PRODUCT DOES NOT EXIST
       * ------------------------------------------------------
       */

      if (
        !config.productFound
      ) {

        throw new Error(
          'Product "dark-winter-jacket" was not found.'
        );

      }


      /*
       * ------------------------------------------------------
       * VARIANT DOES NOT EXIST
       * ------------------------------------------------------
       */

      if (
        !config.variantId ||
        Number(config.variantId) === 0
      ) {

        throw new Error(
          'Black + Medium Soft Winter Jacket variant was not found or is unavailable.'
        );

      }


      /*
       * ------------------------------------------------------
       * VALIDATE VARIANT ID
       * ------------------------------------------------------
       */

      const jacketVariantId =
        Number(
          config.variantId
        );


      if (
        !Number.isFinite(
          jacketVariantId
        ) ||
        jacketVariantId <= 0
      ) {

        console.error(
          'TV PRODUCT GRID: Invalid jacket variant ID:',
          config.variantId
        );


        throw new Error(
          'The Soft Winter Jacket variant ID is invalid.'
        );

      }


      console.log(
        'JACKET VARIANT ID:',
        jacketVariantId
      );


      return jacketVariantId;

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

              console.log(
                '================================================'
              );

              console.log(
                'TV PRODUCT GRID - ADD TO CART CLICKED'
              );

              console.log(
                'SECTION ID:',
                sectionId
              );

              console.log(
                '================================================'
              );


              /*
               * ------------------------------------------------
               * FIND FORM
               * ------------------------------------------------
               */

              const form =
                button.closest(
                  '.tv-product-popup__form'
                );


              if (!form) {

                console.error(
                  'TV PRODUCT GRID: Product form not found.'
                );

                return;
              }


              /*
               * ------------------------------------------------
               * GET SELECTED PRODUCT VARIANT
               * ------------------------------------------------
               */

              const variant =
                getSelectedVariant(
                  form
                );


              console.log(
                'TV PRODUCT GRID - SELECTED PRODUCT VARIANT:',
                variant
              );


              /*
               * ------------------------------------------------
               * NO VARIANT
               * ------------------------------------------------
               */

              if (!variant) {

                alert(
                  'Please select a color and size.'
                );

                return;
              }


              /*
               * ------------------------------------------------
               * CHECK PRODUCT AVAILABILITY
               * ------------------------------------------------
               */

              if (
                variant.available === false
              ) {

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
                 * CUSTOMER PRODUCT
                 * ------------------------------------------------
                 */

                const cartItems = [
                  {
                    id:
                      Number(
                        variant.id
                      ),

                    quantity: 1
                  }
                ];


                /*
                 * ------------------------------------------------
                 * GET ACTUAL SHOPIFY VARIANT OPTIONS
                 * ------------------------------------------------
                 */

                let variantOptions = [];


                if (
                  Array.isArray(
                    variant.options
                  )
                ) {

                  variantOptions =
                    variant.options;

                } else {

                  variantOptions = [
                    variant.option1,
                    variant.option2,
                    variant.option3
                  ];

                }


                variantOptions =
                  variantOptions
                    .filter(
                      function (value) {

                        return (
                          value !== null &&
                          value !== undefined &&
                          String(value).trim() !== ''
                        );

                      }
                    )
                    .map(
                      function (value) {

                        return normalizeValue(
                          value
                        );

                      }
                    );


                console.log(
                  'TV PRODUCT GRID - ACTUAL VARIANT OPTIONS:',
                  variantOptions
                );


                /*
                 * ------------------------------------------------
                 * DETECT BLACK + MEDIUM
                 * ------------------------------------------------
                 */

                const hasBlack =
                  variantOptions.includes(
                    'black'
                  );


                const hasMedium =
                  variantOptions.includes(
                    'medium'
                  );


                const isBlackMedium =
                  hasBlack &&
                  hasMedium;


                console.log(
                  'HAS BLACK:',
                  hasBlack
                );


                console.log(
                  'HAS MEDIUM:',
                  hasMedium
                );


                console.log(
                  'BLACK + MEDIUM:',
                  isBlackMedium
                );


                /*
                 * ------------------------------------------------
                 * AUTOMATIC SOFT WINTER JACKET
                 * ------------------------------------------------
                 *
                 * THIS IS THE IMPORTANT PART.
                 *
                 * Pass "section" into the function.
                 *
                 * ------------------------------------------------
                 */

                if (
                  isBlackMedium
                ) {

                  console.log(
                    '================================================'
                  );

                  console.log(
                    'BLACK + MEDIUM DETECTED'
                  );

                  console.log(
                    'GETTING JACKET CONFIGURATION FROM LIQUID'
                  );

                  console.log(
                    '================================================'
                  );


                  /*
                   * IMPORTANT:
                   *
                   * Must be:
                   *
                   * getSoftWinterJacketVariant(section)
                   *
                   * NOT:
                   *
                   * getSoftWinterJacketVariant()
                   */

                  const jacketVariantId =
                    getSoftWinterJacketVariant(
                      section
                    );


                  console.log(
                    'JACKET VARIANT ID TO ADD:',
                    jacketVariantId
                  );


                  /*
                   * Add jacket to SAME Shopify request.
                   */

                  cartItems.push(
                    {
                      id:
                        jacketVariantId,

                      quantity: 1
                    }
                  );


                  console.log(
                    'SOFT WINTER JACKET ADDED TO CART ITEMS.'
                  );

                } else {

                  console.log(
                    'Selected product is NOT Black + Medium.'
                  );

                  console.log(
                    'No jacket will be added.'
                  );

                }


                /*
                 * ------------------------------------------------
                 * FINAL CART ITEMS
                 * ------------------------------------------------
                 */

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


                /*
                 * ------------------------------------------------
                 * SEND EVERYTHING TO SHOPIFY
                 * ------------------------------------------------
                 */

                const cart =
                  await addToCart(
                    cartItems
                  );


                console.log(
                  'FINAL SHOPIFY CART RESPONSE:',
                  cart
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
                  '================================================'
                );

                console.error(
                  'TV PRODUCT GRID - ADD TO CART FAILED'
                );

                console.error(
                  'ERROR:',
                  error
                );

                console.error(
                  'MESSAGE:',
                  error.message
                );

                console.error(
                  '================================================'
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

                button.disabled =
                  false;

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

    const sections =
      document.querySelectorAll(
        '.tv-product-grid'
      );


    console.log(
      'TV PRODUCT GRID - FOUND SECTIONS:',
      sections.length
    );


    sections.forEach(
      function (section) {

        initGrid(
          section
        );

      }
    );

  }


  /*
   * ==========================================================
   * START
   * ==========================================================
   */

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

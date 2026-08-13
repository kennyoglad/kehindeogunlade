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
 * Primary product handle:
 * dark-winter-jacket
 *
 * Fallback product handle:
 * soft-winter-jacket
 *
 * Required jacket variant:
 *
 * Color = Black
 * Size  = Medium
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

    if (!section) {
      return;
    }


    const hotspots =
      section.querySelectorAll(
        '.tv-product-hotspot'
      );


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
        return;
      }


      /*
       * Close all other popups.
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
     * NORMALIZE VALUE
     * ========================================================
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
     * ========================================================
     * GET SELECTED SHOPIFY VARIANT
     * ========================================================
     *
     * IMPORTANT:
     *
     * We do NOT depend on:
     *
     * .tv-product-popup__option-names
     *
     * because that element does not exist in your current
     * tv-product-grid.liquid.
     *
     * Instead, we read the actual values selected in the
     * popup and compare them against Shopify's variant.options.
     *
     * This also works regardless of whether the Shopify product
     * option order is:
     *
     * Color / Size
     *
     * or:
     *
     * Size / Color
     *
     * ========================================================
     */

    function getSelectedVariant(form) {

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


      if (
        !Array.isArray(
          variants
        )
      ) {

        console.error(
          'TV PRODUCT GRID: Variant JSON is not an array.',
          variants
        );

        return null;

      }


      /*
       * ------------------------------------------------------
       * BUILD CUSTOMER SELECTIONS
       * ------------------------------------------------------
       */

      const selectedValues = [];


      /*
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
       * MAKE SURE CUSTOMER SELECTED SOMETHING
       * ------------------------------------------------------
       */

      if (
        selectedValues.length === 0
      ) {

        console.warn(
          'TV PRODUCT GRID: No product options selected.'
        );

        return null;

      }


      /*
       * ------------------------------------------------------
       * FIND EXACT MATCHING VARIANT
       * ------------------------------------------------------
       *
       * We compare values without relying on option order.
       *
       * Example:
       *
       * Customer:
       *
       * Black
       * Medium
       *
       * Shopify:
       *
       * ["Black", "Medium"]
       *
       * MATCH
       *
       * Shopify:
       *
       * ["Medium", "Black"]
       *
       * ALSO MATCH
       *
       * ======================================================
       */

      const selectedVariant =
        variants.find(
          function (variant) {

            /*
             * Only available variants.
             */

            if (
              variant.available === false
            ) {

              return false;

            }


            /*
             * Shopify normally provides:
             *
             * variant.options
             *
             * but we also support option1/2/3.
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
             * Remove empty values.
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
             * Number of selected values must match
             * number of variant options.
             *
             * This prevents:
             *
             * Black
             *
             * from accidentally matching:
             *
             * Black / Medium
             */

            if (
              selectedValues.length !==
              variantOptions.length
            ) {

              return false;

            }


            /*
             * Copy variant options so we can remove
             * matches one by one.
             */

            const remainingOptions =
              variantOptions.slice();


            /*
             * Every selected value must have one
             * corresponding variant value.
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
               * No match.
               */

              if (
                matchIndex === -1
              ) {

                return false;

              }


              /*
               * Remove matched value.
               */

              remainingOptions.splice(
                matchIndex,
                1
              );

            }


            /*
             * All values matched.
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

      console.log(
        '================================================'
      );

      console.log(
        'TV PRODUCT GRID - ADDING TO CART'
      );

      console.log(
        'CART ITEMS:',
        items
      );

      console.log(
        '================================================'
      );


      const cartUrl =
        window.Shopify.routes.root +
        'cart/add.js';


      console.log(
        'CART URL:',
        cartUrl
      );


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


      let data = null;


      try {

        data =
          await response.json();

      } catch (error) {

        console.error(
          'TV PRODUCT GRID - Could not parse Shopify response.',
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
     * We intentionally fetch the product from Shopify.
     *
     * Primary handle:
     *
     * dark-winter-jacket
     *
     * Fallback:
     *
     * soft-winter-jacket
     *
     * Shopify's Product Ajax API supports:
     *
     * /products/{product-handle}.js
     *
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
       * TRY EACH HANDLE
       * ------------------------------------------------------
       */

      for (
        let i = 0;
        i < handles.length;
        i++
      ) {

        const handle =
          handles[i];


        const productUrl =
          window.Shopify.routes.root +
          'products/' +
          handle +
          '.js';


        console.log(
          'TV PRODUCT GRID - TRYING JACKET:',
          productUrl
        );


        try {

          const response =
            await fetch(
              productUrl,
              {
                method: 'GET',

                headers: {
                  'Accept':
                    'application/json'
                }
              }
            );


          console.log(
            'JACKET RESPONSE STATUS:',
            handle,
            response.status
          );


          if (
            !response.ok
          ) {

            continue;

          }


          const candidate =
            await response.json();


          console.log(
            'JACKET PRODUCT FOUND:',
            candidate
          );


          if (
            candidate &&
            Array.isArray(
              candidate.variants
            )
          ) {

            product =
              candidate;

            break;

          }

        } catch (error) {

          console.error(
            'ERROR FETCHING JACKET HANDLE:',
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

        throw new Error(
          'Soft Winter Jacket product could not be found. Check its Shopify handle.'
        );

      }


      /*
       * ------------------------------------------------------
       * FIND BLACK + MEDIUM VARIANT
       * ------------------------------------------------------
       */

      console.log(
        'SEARCHING JACKET VARIANTS:',
        product.variants
      );


      const jacketVariant =
        product.variants.find(
          function (variant) {

            if (
              variant.available === false
            ) {

              return false;

            }


            let options = [];


            /*
             * Prefer Shopify's options array.
             */

            if (
              Array.isArray(
                variant.options
              )
            ) {

              options =
                variant.options;

            } else {

              options = [
                variant.option1,
                variant.option2,
                variant.option3
              ];

            }


            options =
              options
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
              'CHECKING JACKET VARIANT:',
              variant.id,
              options
            );


            return (
              options.includes(
                'black'
              ) &&
              options.includes(
                'medium'
              )
            );

          }
        );


      /*
       * ------------------------------------------------------
       * JACKET VARIANT NOT FOUND
       * ------------------------------------------------------
       */

      if (!jacketVariant) {

        console.error(
          'TV PRODUCT GRID - BLACK + MEDIUM JACKET VARIANT NOT FOUND.'
        );


        console.error(
          'AVAILABLE JACKET VARIANTS:',
          product.variants
        );


        throw new Error(
          'The Soft Winter Jacket Black + Medium variant is unavailable.'
        );

      }


      /*
       * ------------------------------------------------------
       * FOUND JACKET
       * ------------------------------------------------------
       */

      console.log(
        '================================================'
      );

      console.log(
        'SOFT WINTER JACKET VARIANT FOUND'
      );

      console.log(
        'JACKET PRODUCT:',
        product.title
      );

      console.log(
        'JACKET HANDLE:',
        product.handle
      );

      console.log(
        'JACKET VARIANT:',
        jacketVariant
      );

      console.log(
        'JACKET VARIANT ID:',
        jacketVariant.id
      );

      console.log(
        '================================================'
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
      .forEach(
        function (button) {

          button.addEventListener(
            'click',
            async function () {

              console.log(
                'TV PRODUCT GRID - ADD TO CART CLICKED'
              );


              const form =
                button.closest(
                  '.tv-product-popup__form'
                );


              if (!form) {

                console.error(
                  'TV PRODUCT GRID - Product form not found.'
                );

                return;

              }


              /*
               * ------------------------------------------------
               * FIND SELECTED PRODUCT VARIANT
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
                 * START WITH CUSTOMER'S PRODUCT
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
                 * GET ACTUAL SELECTED VARIANT OPTIONS
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
                  'TV PRODUCT GRID - ACTUAL SHOPIFY VARIANT OPTIONS:',
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
                  'TV PRODUCT GRID - HAS BLACK:',
                  hasBlack
                );


                console.log(
                  'TV PRODUCT GRID - HAS MEDIUM:',
                  hasMedium
                );


                console.log(
                  'TV PRODUCT GRID - BLACK + MEDIUM:',
                  isBlackMedium
                );


                /*
                 * ------------------------------------------------
                 * AUTOMATIC JACKET
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
                    'LOADING SOFT WINTER JACKET...'
                  );

                  console.log(
                    '================================================'
                  );


                  const jacketVariantId =
                    await getSoftWinterJacketVariant();


                  console.log(
                    'ADDING JACKET TO CART:',
                    jacketVariantId
                  );


                  /*
                   * Add jacket to SAME cart request.
                   */

                  cartItems.push(
                    {
                      id:
                        Number(
                          jacketVariantId
                        ),

                      quantity: 1
                    }
                  );


                } else {

                  console.log(
                    'Selected product is NOT Black + Medium.'
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
                 * SEND TO SHOPIFY
                 * ------------------------------------------------
                 */

                const cart =
                  await addToCart(
                    cartItems
                  );


                console.log(
                  'FINAL SHOPIFY CART:',
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
                 * REDIRECT
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
                  error
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

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
 * The automatic jacket product is loaded from:
 *
 * tv-soft-winter-jacket-variants
 *
 * This JSON must be provided by tv-product-grid.liquid.
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


      if (!popupId) return;


      const popup =
        document.getElementById(
          popupId
        );


      if (!popup) return;


      /*
       * Close any other popup first.
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

      if (!popup) return;


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
 * Uses the ACTUAL Shopify product option order.
 *
 * This is important because the popup visually places
 * Color first, but Shopify may internally have:
 *
 * option1 = Size
 * option2 = Color
 *
 * or:
 *
 * option1 = Color
 * option2 = Size
 *
 * This function handles both correctly.
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
   * GET ACTUAL SHOPIFY OPTION ORDER
   * ------------------------------------------------------
   */

  const optionNamesElement =
    form.querySelector(
      '.tv-product-popup__option-names'
    );


  if (!optionNamesElement) {

    console.error(
      'Product option names JSON not found.'
    );

    return null;

  }


  let optionNames;


  try {

    optionNames =
      JSON.parse(
        optionNamesElement.textContent
      );

  } catch (error) {

    console.error(
      'Unable to parse product option names:',
      error
    );

    return null;

  }


  console.log(
    'SHOPIFY OPTION ORDER:',
    optionNames
  );


  /*
   * ------------------------------------------------------
   * GET CUSTOMER SELECTIONS
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


  selects.forEach(
    function (select) {

      const optionName =
        select.dataset.optionName;


      if (!optionName) {
        return;
      }


      selections[optionName] =
        select.value.trim();

    }
  );


  console.log(
    'CUSTOMER SELECTIONS:',
    selections
  );


  /*
   * ------------------------------------------------------
   * CHECK THAT EVERY OPTION HAS BEEN SELECTED
   * ------------------------------------------------------
   */

  const missingOption =
    optionNames.find(
      function (optionName) {

        return !selections[
          optionName
        ];

      }
    );


  if (missingOption) {

    console.warn(
      'Missing product option:',
      missingOption
    );

    return null;

  }


  /*
   * ------------------------------------------------------
   * FIND EXACT SHOPIFY VARIANT
   * ------------------------------------------------------
   *
   * Shopify's:
   *
   * option1
   * option2
   * option3
   *
   * correspond directly to:
   *
   * optionNames[0]
   * optionNames[1]
   * optionNames[2]
   * ------------------------------------------------------
   */

  const selectedVariant =
    variants.find(
      function (variant) {

        /*
         * Ignore unavailable variants.
         */

        if (!variant.available) {
          return false;
        }


        /*
         * Build the variant's option values
         * in Shopify's actual option order.
         */

        const variantOptions = [
          variant.option1,
          variant.option2,
          variant.option3
        ];


        /*
         * Compare every Shopify option.
         */

        return optionNames.every(
          function (
            optionName,
            index
          ) {

            const customerValue =
              selections[
                optionName
              ];


            const variantValue =
              variantOptions[
                index
              ];


            if (
              customerValue ===
                undefined ||
              customerValue ===
                null
            ) {

              return false;

            }


            if (
              variantValue ===
                undefined ||
              variantValue ===
                null
            ) {

              return false;

            }


            return (
              String(
                customerValue
              )
                .trim()
                .toLowerCase() ===
              String(
                variantValue
              )
                .trim()
                .toLowerCase()
            );

          }
        );

      }
    );


  /*
   * ------------------------------------------------------
   * DEBUG
   * ------------------------------------------------------
   */

  console.log(
    'MATCHED PRODUCT VARIANT:',
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
     * The jacket variants are provided by Liquid through:
     *
     * #tv-soft-winter-jacket-variants
     *
     * Required variant:
     *
     * Color = Black
     * Size  = Medium
     *
     * ========================================================
     */

    function getSoftWinterJacketVariant() {

      const variantsElement =
        document.getElementById(
          'tv-soft-winter-jacket-variants'
        );


      if (!variantsElement) {

        console.error(
          'Soft Winter Jacket variants element was not found.'
        );


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
        'SOFT WINTER JACKET VARIANTS:',
        variants
      );


      /*
       * ------------------------------------------------------
       * FIND BLACK + MEDIUM JACKET VARIANT
       * ------------------------------------------------------
       */

      const jacketVariant =
        variants.find(
          function (variant) {

            /*
             * Must be available.
             */

            if (!variant.available) {
              return false;
            }


            /*
             * Shopify gives us option1/2/3.
             */

            const options = [
              variant.option1,
              variant.option2,
              variant.option3
            ]
              .filter(
                function (value) {

                  return (
                    value !== null &&
                    value !== undefined &&
                    value !== ''
                  );

                }
              )
              .map(
                function (value) {

                  return String(value)
                    .trim()
                    .toLowerCase();

                }
              );


            /*
             * Must contain BOTH Black and Medium.
             */

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
      .forEach(
        function (button) {

          button.addEventListener(
            'click',
            async function () {

              const form =
                button.closest(
                  '.tv-product-popup__form'
                );


              if (!form) {
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
                 * GET ACTUAL SELECTED VARIANT OPTIONS
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
                        value !== undefined &&
                        value !== ''
                      );

                    }
                  )
                  .map(
                    function (value) {

                      return String(value)
                        .trim()
                        .toLowerCase();

                    }
                  );


                console.log(
                  'SELECTED VARIANT:',
                  variant
                );


                console.log(
                  'SELECTED OPTIONS:',
                  variantOptions
                );


                /*
                 * ------------------------------------------------
                 * DETECT BLACK + MEDIUM
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
                  'IS BLACK + MEDIUM:',
                  isBlackMedium
                );


                /*
                 * ------------------------------------------------
                 * AUTOMATIC SOFT WINTER JACKET
                 * ------------------------------------------------
                 */

                if (
                  isBlackMedium
                ) {

                  console.log(
                    'BLACK + MEDIUM DETECTED.'
                  );


                  const jacketVariantId =
                    getSoftWinterJacketVariant();


                  console.log(
                    'ADDING JACKET VARIANT:',
                    jacketVariantId
                  );


                  cartItems.push({
                    id:
                      jacketVariantId,
                    quantity: 1
                  });

                }


                /*
                 * ------------------------------------------------
                 * FINAL CART ITEMS
                 * ------------------------------------------------
                 */

                console.log(
                  'FINAL CART ITEMS:',
                  cartItems
                );


                /*
                 * IMPORTANT:
                 *
                 * There is ONLY ONE cart request.
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

    document
      .querySelectorAll(
        '.tv-product-grid'
      )
      .forEach(
        function (section) {

          initGrid(
            section
          );

        }
      );

  }


  /*
   * ==========================================================
   * DOCUMENT READY
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

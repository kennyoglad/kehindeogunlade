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
       * Close other popups.
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
     * Uses the REAL Shopify option order.
     *
     * Example:
     *
     * product.options =
     * ["Color", "Size"]
     *
     * or:
     *
     * product.options =
     * ["Size", "Color"]
     *
     * This function handles both.
     *
     * ========================================================
     */

    function getSelectedVariant(form) {

      /*
       * ------------------------------------------------------
       * VARIANT JSON
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
       * SHOPIFY OPTION NAMES
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
       * CUSTOMER SELECTIONS
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
       * CHECK MISSING OPTIONS
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
       * FIND EXACT VARIANT
       * ------------------------------------------------------
       */

      const selectedVariant =
        variants.find(
          function (variant) {

            /*
             * Only available variants.
             */

            if (!variant.available) {
              return false;
            }


            /*
             * Shopify option values.
             */

            const variantOptions = [
              variant.option1,
              variant.option2,
              variant.option3
            ];


            /*
             * Compare each option using Shopify's
             * actual option order.
             */

            return optionNames.every(
              function (
                optionName,
                index
              ) {

                const selectedValue =
                  selections[
                    optionName
                  ];


                const variantValue =
                  variantOptions[
                    index
                  ];


                if (
                  selectedValue ===
                    undefined ||
                  selectedValue ===
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
                    selectedValue
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
     *
     * Shopify supports multiple variants in one
     * /cart/add.js request.
     *
     * ========================================================
     */

    async function addToCart(items) {

      console.log(
        'ADDING ITEMS TO CART:',
        items
      );


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

          console.error(
            'Unable to parse cart error:',
            error
          );

        }


        throw new Error(
          errorData?.description ||
          'Unable to add product to cart.'
        );

      }


      const data =
        await response.json();


      console.log(
        'SHOPIFY CART RESPONSE:',
        data
      );


      return data;

    }


   /*
 * ========================================================
 * GET SOFT WINTER JACKET VARIANT
 * ========================================================
 *
 * The exact Black + Medium variant ID is generated by
 * Shopify Liquid.
 *
 * JavaScript does NOT guess or fetch the jacket anymore.
 * ========================================================
 */

function getSoftWinterJacketVariant(section) {

  const configElement =
    document.getElementById(
      'tv-soft-winter-jacket-config-' +
      section.dataset.sectionId
    );


  if (!configElement) {

    console.error(
      'Soft Winter Jacket configuration was not found.'
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
      'Unable to read Soft Winter Jacket configuration:',
      error
    );

    throw new Error(
      'Unable to read Soft Winter Jacket configuration.'
    );

  }


  console.log(
    'SOFT WINTER JACKET CONFIG:',
    config
  );


  if (!config.productFound) {

    throw new Error(
      'Soft Winter Jacket product was not found.'
    );

  }


  if (!config.variantId) {

    throw new Error(
      'Black + Medium Soft Winter Jacket variant was not found or is unavailable.'
    );

  }


  console.log(
    'SOFT WINTER JACKET VARIANT ID:',
    config.variantId
  );


  return Number(
    config.variantId
  );

}


      /*
       * ------------------------------------------------------
       * CHECK PRODUCT
       * ------------------------------------------------------
       */

      if (
        !product ||
        !product.variants
      ) {

        throw new Error(
          'Soft Winter Jacket has no variants.'
        );

      }


      /*
       * ------------------------------------------------------
       * FIND BLACK + MEDIUM
       * ------------------------------------------------------
       */

      const jacketVariant =
        product.variants.find(
          function (variant) {

            if (!variant.available) {
              return false;
            }


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

                  return String(
                    value
                  )
                    .trim()
                    .toLowerCase();

                }
              );


            console.log(
              'CHECKING JACKET VARIANT:',
              variant,
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
       * JACKET NOT FOUND
       * ------------------------------------------------------
       */

      if (!jacketVariant) {

        console.error(
          'No available Black + Medium jacket variant found.',
          product.variants
        );


        throw new Error(
          'The Black + Medium Soft Winter Jacket variant is unavailable.'
        );

      }


      console.log(
        'FOUND SOFT WINTER JACKET VARIANT:',
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
               * GET SELECTED VARIANT
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
               * CHECK AVAILABILITY
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
                 * START CART ITEMS
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
                 * GET SELECTED VARIANT OPTIONS
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

                      return String(
                        value
                      )
                        .trim()
                        .toLowerCase();

                    }
                  );


                console.log(
                  'SELECTED VARIANT:',
                  variant
                );


                console.log(
                  'SELECTED VARIANT OPTIONS:',
                  variantOptions
                );


                /*
                 * ------------------------------------------------
                 * BLACK + MEDIUM DETECTION
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
                 * ADD SOFT WINTER JACKET
                 * ------------------------------------------------
                 */

                if (isBlackMedium) {

                  console.log(
                    'BLACK + MEDIUM DETECTED.'
                  );


                  console.log(
                    'Getting Soft Winter Jacket Black + Medium variant...'
                  );


                  const jacketVariantId =
                    await getSoftWinterJacketVariant();


                  console.log(
                    'JACKET VARIANT ID:',
                    jacketVariantId
                  );


                  /*
                   * Add jacket to the SAME request.
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


                  console.log(
                    'JACKET ADDED TO CART ITEMS.'
                  );

                } else {

                  console.log(
                    'Selected variant is NOT Black + Medium. No jacket will be added.'
                  );

                }


                /*
                 * ------------------------------------------------
                 * FINAL CART REQUEST
                 * ------------------------------------------------
                 */

                console.log(
                  'FINAL CART ITEMS:',
                  cartItems
                );


                const cart =
                  await addToCart(
                    cartItems
                  );


                console.log(
                  'FINAL CART RESULT:',
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
                  'ADD TO CART FAILED:',
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

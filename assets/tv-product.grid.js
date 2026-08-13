/*
 * TV PRODUCT GRID
 * ============================================================
 *
 * Handles:
 *
 * - Product hotspot / popup opening
 * - Product popup closing
 * - ESC key closing
 * - Color selection
 * - Product option selection
 * - Exact Shopify variant matching
 * - Add to Cart
 * - Automatic Soft Winter Jacket addition
 *
 * AUTOMATIC JACKET:
 *
 * Liquid supplies the exact jacket variant ID through:
 *
 * #tv-soft-winter-jacket-config-{section.id}
 *
 * Required jacket:
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
   * GLOBAL DEBUG PREFIX
   * ==========================================================
   */

  const LOG_PREFIX =
    'TV PRODUCT GRID';


  /*
   * ==========================================================
   * LOGGING HELPERS
   * ==========================================================
   */

  function log() {

    console.log(
      LOG_PREFIX + ':',
      ...arguments
    );

  }


  function warn() {

    console.warn(
      LOG_PREFIX + ':',
      ...arguments
    );

  }


  function error() {

    console.error(
      LOG_PREFIX + ':',
      ...arguments
    );

  }


  /*
   * ==========================================================
   * NORMALIZE VALUE
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
      .replace(/\s+/g, ' ')
      .toLowerCase();

  }


  /*
   * ==========================================================
   * GET SHOPIFY ROOT URL
   * ==========================================================
   */

  function getShopifyRoot() {

    if (
      window.Shopify &&
      window.Shopify.routes &&
      window.Shopify.routes.root
    ) {

      return window.Shopify.routes.root;

    }


    return '/';

  }


  /*
   * ==========================================================
   * INITIALIZE GRID
   * ==========================================================
   */

  function initGrid(section) {

    if (!section) {

      return;

    }


    /*
     * --------------------------------------------------------
     * Prevent duplicate initialization.
     * --------------------------------------------------------
     */

    if (
      section.dataset.tvGridInitialized === 'true'
    ) {

      return;

    }


    section.dataset.tvGridInitialized = 'true';


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


    log(
      'Initializing section:',
      section.dataset.sectionId,
      'Hotspots:',
      hotspots.length,
      'Popups:',
      popups.length
    );


    /*
     * ========================================================
     * OPEN POPUP
     * ========================================================
     */

    function openPopup(hotspot) {

      if (!hotspot) {

        return;

      }


      const popupId =
        hotspot.getAttribute(
          'aria-controls'
        );


      if (!popupId) {

        warn(
          'Hotspot has no aria-controls.'
        );

        return;

      }


      const popup =
        document.getElementById(
          popupId
        );


      if (!popup) {

        error(
          'Popup not found:',
          popupId
        );

        return;

      }


      /*
       * Close all popups in this section.
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


      log(
        'Popup opened:',
        popupId
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


      log(
        'Popup closed.'
      );

    }


    /*
     * ========================================================
     * HOTSPOT CLICK EVENTS
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
     * CLOSE EVENTS
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

    function handleEscape(event) {

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


    document.addEventListener(
      'keydown',
      handleEscape
    );


    /*
     * ========================================================
     * READ JSON SCRIPT
     * ========================================================
     */

    function readJsonElement(element) {

      if (!element) {

        return null;

      }


      const text =
        element.textContent.trim();


      if (!text) {

        return null;

      }


      try {

        return JSON.parse(
          text
        );

      } catch (jsonError) {

        error(
          'Could not parse JSON:',
          jsonError,
          text
        );

        return null;

      }

    }


    /*
     * ========================================================
     * GET PRODUCT OPTION NAMES
     * ========================================================
     *
     * Your Liquid currently outputs:
     *
     * <script class="tv-product-popup__option-names">
     *   {{ product.options | json }}
     * </script>
     *
     * Example:
     *
     * [
     *   "Color",
     *   "Size"
     * ]
     *
     * This is the REAL Shopify option order.
     *
     * ========================================================
     */

    function getProductOptionNames(form) {

      const element =
        form.querySelector(
          '.tv-product-popup__option-names'
        );


      const optionNames =
        readJsonElement(
          element
        );


      if (
        !Array.isArray(
          optionNames
        )
      ) {

        error(
          'Product option names are missing or invalid.',
          optionNames
        );

        return [];

      }


      return optionNames.map(
        function (name) {

          return String(
            name
          ).trim();

        }
      );

    }


    /*
     * ========================================================
     * GET PRODUCT VARIANTS
     * ========================================================
     */

    function getProductVariants(form) {

      const element =
        form.querySelector(
          '.tv-product-popup__variants'
        );


      const variants =
        readJsonElement(
          element
        );


      if (
        !Array.isArray(
          variants
        )
      ) {

        error(
          'Product variants are missing or invalid.',
          variants
        );

        return [];

      }


      return variants;

    }


    /*
     * ========================================================
     * GET SELECTED FORM VALUES
     * ========================================================
     */

    function getSelectedValues(form) {

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
          String(
            activeColor.dataset.color || ''
          ).trim();

      }


      /*
       * ------------------------------------------------------
       * SELECT ELEMENTS
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


          if (!optionName) {

            return;

          }


          selections[
            optionName
          ] =
            String(
              select.value || ''
            ).trim();

        }
      );


      return selections;

    }


    /*
     * ========================================================
     * FIND EXACT PRODUCT VARIANT
     * ========================================================
     *
     * This is the important part.
     *
     * We use Shopify's actual option order:
     *
     * ["Color", "Size"]
     *
     * and compare:
     *
     * selections.Color
     * selections.Size
     *
     * against:
     *
     * variant.options[0]
     * variant.options[1]
     *
     * ========================================================
     */

    function getSelectedVariant(form) {

      const optionNames =
        getProductOptionNames(
          form
        );


      const variants =
        getProductVariants(
          form
        );


      const selections =
        getSelectedValues(
          form
        );


      log(
        'OPTION NAMES:',
        optionNames
      );


      log(
        'CUSTOMER SELECTIONS:',
        selections
      );


      log(
        'VARIANTS:',
        variants
      );


      /*
       * ------------------------------------------------------
       * Make sure options exist.
       * ------------------------------------------------------
       */

      if (
        optionNames.length === 0
      ) {

        error(
          'No Shopify product option names were found.'
        );

        return null;

      }


      if (
        variants.length === 0
      ) {

        error(
          'No Shopify product variants were found.'
        );

        return null;

      }


      /*
       * ------------------------------------------------------
       * Make sure EVERY option is selected.
       * ------------------------------------------------------
       */

      for (
        let i = 0;
        i < optionNames.length;
        i++
      ) {

        const optionName =
          optionNames[i];


        const selectedValue =
          selections[
            optionName
          ];


        if (
          !selectedValue
        ) {

          warn(
            'Missing option:',
            optionName
          );


          return null;

        }

      }


      /*
       * ------------------------------------------------------
       * FIND MATCH
       * ------------------------------------------------------
       */

      for (
        let i = 0;
        i < variants.length;
        i++
      ) {

        const variant =
          variants[i];


        /*
         * Ignore unavailable variants.
         */

        if (
          variant.available === false
        ) {

          continue;

        }


        /*
         * Shopify now exposes variant.options.
         *
         * Older JSON can expose option1/2/3.
         */

        let variantOptions = [];


        if (
          Array.isArray(
            variant.options
          ) &&
          variant.options.length > 0
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
         * Compare every Shopify option by POSITION.
         */

        let matches =
          true;


        for (
          let optionIndex = 0;
          optionIndex < optionNames.length;
          optionIndex++
        ) {

          const optionName =
            optionNames[
              optionIndex
            ];


          const selectedValue =
            normalizeValue(
              selections[
                optionName
              ]
            );


          const variantValue =
            normalizeValue(
              variantOptions[
                optionIndex
              ]
            );


          log(
            'COMPARING:',
            optionName,
            'customer=',
            selectedValue,
            'shopify=',
            variantValue
          );


          if (
            selectedValue !==
            variantValue
          ) {

            matches =
              false;

            break;

          }

        }


        if (matches) {

          log(
            'EXACT VARIANT FOUND:',
            variant
          );


          return variant;

        }

      }


      /*
       * ------------------------------------------------------
       * No match.
       * ------------------------------------------------------
       */

      error(
        'NO MATCHING SHOPIFY VARIANT.',
        {
          optionNames: optionNames,
          selections: selections,
          variants: variants
        }
      );


      return null;

    }


    /*
     * ========================================================
     * COLOR BUTTONS
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
                    function (item) {

                      item.classList.remove(
                        'active'
                      );

                      item.setAttribute(
                        'aria-pressed',
                        'false'
                      );

                    }
                  );


                  button.classList.add(
                    'active'
                  );


                  button.setAttribute(
                    'aria-pressed',
                    'true'
                  );


                  log(
                    'COLOR SELECTED:',
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
     * SELECT CHANGE EVENTS
     * ========================================================
     */

    section
      .querySelectorAll(
        '.tv-product-popup__select'
      )
      .forEach(
        function (select) {

          select.addEventListener(
            'change',
            function () {

              log(
                'OPTION CHANGED:',
                select.dataset.optionName,
                select.value
              );

            }
          );

        }
      );


    /*
     * ========================================================
     * GET JACKET CONFIGURATION
     * ========================================================
     *
     * Your Liquid creates:
     *
     * id="tv-soft-winter-jacket-config-{{ section.id }}"
     *
     * with:
     *
     * {
     *   "productFound": true,
     *   "variantId": 123456789
     * }
     *
     * ========================================================
     */

    function getSoftWinterJacketVariant() {

      const sectionId =
        section.dataset.sectionId;


      if (!sectionId) {

        throw new Error(
          'Product grid section ID is missing.'
        );

      }


      const configId =
        'tv-soft-winter-jacket-config-' +
        sectionId;


      const configElement =
        document.getElementById(
          configId
        );


      if (!configElement) {

        error(
          'Jacket configuration element not found:',
          configId
        );


        throw new Error(
          'Soft Winter Jacket configuration was not found.'
        );

      }


      const config =
        readJsonElement(
          configElement
        );


      log(
        'JACKET CONFIGURATION:',
        config
      );


      if (!config) {

        throw new Error(
          'Soft Winter Jacket configuration could not be read.'
        );

      }


      if (
        config.productFound !== true
      ) {

        throw new Error(
          'Soft Winter Jacket product was not found.'
        );

      }


      if (
        !config.variantId
      ) {

        throw new Error(
          'Black + Medium Soft Winter Jacket variant was not found or is unavailable.'
        );

      }


      const variantId =
        Number(
          config.variantId
        );


      if (
        !Number.isFinite(
          variantId
        ) ||
        variantId <= 0
      ) {

        throw new Error(
          'Soft Winter Jacket variant ID is invalid.'
        );

      }


      log(
        'JACKET VARIANT ID:',
        variantId
      );


      return variantId;

    }


    /*
     * ========================================================
     * ADD ITEMS TO SHOPIFY CART
     * ========================================================
     *
     * Shopify officially supports:
     *
     * POST /cart/add.js
     *
     * with:
     *
     * {
     *   items: [
     *     {
     *       id: variantId,
     *       quantity: 1
     *     }
     *   ]
     * }
     *
     * Multiple variants can be included in the same request.
     *
     * ========================================================
     */

    async function addToCart(items) {

      if (
        !Array.isArray(
          items
        ) ||
        items.length === 0
      ) {

        throw new Error(
          'No products were supplied to Shopify.'
        );

      }


      log(
        'ADDING ITEMS:',
        items
      );


      const url =
        getShopifyRoot() +
        'cart/add.js';


      log(
        'CART URL:',
        url
      );


      const response =
        await fetch(
          url,
          {
            method: 'POST',

            credentials: 'same-origin',

            headers: {
              'Content-Type':
                'application/json',

              'Accept':
                'application/json',

              'X-Requested-With':
                'XMLHttpRequest'
            },

            body: JSON.stringify({
              items: items
            })
          }
        );


      let data =
        null;


      const responseText =
        await response.text();


      try {

        data =
          responseText
            ? JSON.parse(
                responseText
              )
            : null;

      } catch (parseError) {

        error(
          'Shopify returned non-JSON:',
          responseText
        );

      }


      log(
        'CART HTTP STATUS:',
        response.status
      );


      log(
        'CART RESPONSE:',
        data
      );


      if (
        !response.ok
      ) {

        const message =
          (
            data &&
            (
              data.description ||
              data.message ||
              data.status
            )
          ) ||
          responseText ||
          'Shopify could not add the product to the cart.';


        throw new Error(
          message
        );

      }


      return data;

    }


    /*
     * ========================================================
     * ADD TO CART BUTTONS
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
            async function (event) {

              event.preventDefault();


              log(
                '========================================'
              );


              log(
                'ADD TO CART CLICKED'
              );


              log(
                '========================================'
              );


              /*
               * ------------------------------------------------
               * Find form.
               * ------------------------------------------------
               */

              const form =
                button.closest(
                  '.tv-product-popup__form'
                );


              if (!form) {

                error(
                  'Could not find product form.'
                );


                alert(
                  'Unable to find the product form.'
                );


                return;

              }


              /*
               * ------------------------------------------------
               * Find selected product variant.
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


              log(
                'SELECTED PRODUCT VARIANT:',
                variant
              );


              /*
               * ------------------------------------------------
               * Validate variant ID.
               * ------------------------------------------------
               */

              const productVariantId =
                Number(
                  variant.id
                );


              if (
                !Number.isFinite(
                  productVariantId
                ) ||
                productVariantId <= 0
              ) {

                error(
                  'Invalid product variant ID:',
                  variant.id
                );


                alert(
                  'This product variant is invalid.'
                );


                return;

              }


              /*
               * ------------------------------------------------
               * Disable button.
               * ------------------------------------------------
               */

              button.disabled =
                true;


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
                    id:
                      productVariantId,

                    quantity:
                      1
                  }
                ];


                log(
                  'INITIAL CART ITEMS:',
                  cartItems
                );


                /*
                 * ------------------------------------------------
                 * DETERMINE IF SELECTED PRODUCT IS BLACK/MEDIUM
                 * ------------------------------------------------
                 *
                 * IMPORTANT:
                 *
                 * We inspect the ACTUAL MATCHED Shopify variant.
                 *
                 * We do not inspect the customer's raw button
                 * selections.
                 *
                 * ------------------------------------------------
                 */

                let actualVariantOptions =
                  [];


                if (
                  Array.isArray(
                    variant.options
                  ) &&
                  variant.options.length > 0
                ) {

                  actualVariantOptions =
                    variant.options;

                } else {

                  actualVariantOptions = [
                    variant.option1,
                    variant.option2,
                    variant.option3
                  ];

                }


                const normalizedVariantOptions =
                  actualVariantOptions
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


                log(
                  'ACTUAL VARIANT OPTIONS:',
                  normalizedVariantOptions
                );


                const hasBlack =
                  normalizedVariantOptions.includes(
                    'black'
                  );


                const hasMedium =
                  normalizedVariantOptions.includes(
                    'medium'
                  );


                const isBlackMedium =
                  hasBlack &&
                  hasMedium;


                log(
                  'HAS BLACK:',
                  hasBlack
                );


                log(
                  'HAS MEDIUM:',
                  hasMedium
                );


                log(
                  'IS BLACK + MEDIUM:',
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

                  log(
                    'BLACK + MEDIUM DETECTED.'
                  );


                  log(
                    'GETTING JACKET VARIANT FROM LIQUID...'
                  );


                  const jacketVariantId =
                    getSoftWinterJacketVariant();


                  log(
                    'JACKET VARIANT ID:',
                    jacketVariantId
                  );


                  /*
                   * Add jacket to same request.
                   */

                  cartItems.push(
                    {
                      id:
                        jacketVariantId,

                      quantity:
                        1
                    }
                  );


                  log(
                    'JACKET ADDED TO CART ITEMS.'
                  );

                } else {

                  log(
                    'SELECTED PRODUCT IS NOT BLACK + MEDIUM.'
                  );

                }


                /*
                 * ------------------------------------------------
                 * FINAL CART ITEMS
                 * ------------------------------------------------
                 */

                log(
                  '========================================'
                );


                log(
                  'FINAL CART ITEMS:',
                  cartItems
                );


                log(
                  '========================================'
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


                log(
                  'SHOPIFY CART SUCCESS:',
                  cart
                );


                /*
                 * ------------------------------------------------
                 * SUCCESS BUTTON
                 * ------------------------------------------------
                 */

                if (originalText) {

                  originalText.textContent =
                    'ADDED TO CART';

                }


                /*
                 * ------------------------------------------------
                 * Redirect to cart.
                 * ------------------------------------------------
                 */

                window.location.href =
                  getShopifyRoot() +
                  'cart';

              } catch (cartError) {

                error(
                  '========================================'
                );


                error(
                  'ADD TO CART FAILED'
                );


                error(
                  cartError
                );


                error(
                  '========================================'
                );


                alert(
                  cartError.message ||
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
   * INITIALIZE ALL PRODUCT GRIDS
   * ==========================================================
   */

  function initializeProductGrids() {

    const sections =
      document.querySelectorAll(
        '.tv-product-grid'
      );


    log(
      'PRODUCT GRID SECTIONS FOUND:',
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
   * SHOPIFY THEME EDITOR SUPPORT
   * ==========================================================
   *
   * Shopify can dynamically reload sections inside the
   * Theme Editor.
   *
   * These events make sure the grid gets initialized again
   * when a section is loaded.
   *
   * ==========================================================
   */

  document.addEventListener(
    'shopify:section:load',
    function (event) {

      const section =
        event.target.querySelector(
          '.tv-product-grid'
        );


      if (section) {

        initGrid(
          section
        );

      }

    }
  );


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

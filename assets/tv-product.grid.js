(() => {
  'use strict';

  const popup = document.getElementById(
    'tv-product-popup'
  );

  if (!popup) {
    return;
  }


  /* ========================================================
     ELEMENTS
     ======================================================== */

  const image =
    document.getElementById(
      'tv-product-popup-image'
    );

  const title =
    document.getElementById(
      'tv-product-popup-title'
    );

  const price =
    document.getElementById(
      'tv-product-popup-price'
    );

  const description =
    document.getElementById(
      'tv-product-popup-description'
    );

  const optionsContainer =
    document.getElementById(
      'tv-product-popup-options'
    );

  const form =
    document.getElementById(
      'tv-product-popup-form'
    );

  const errorElement =
    document.getElementById(
      'tv-product-popup-error'
    );

  const submitButton =
    form.querySelector(
      '.tv-product-popup__add'
    );


  /* ========================================================
     STATE
     ======================================================== */

  let currentProduct = null;

  let selectedOptions = [];

  let selectedVariant = null;

  let lastFocusedElement = null;


  /* ========================================================
     AUTOMATIC PRODUCT
     ======================================================== */

  const autoAddProductHandle =
    popup.dataset.autoAddProductHandle || '';


  /* ========================================================
     SHOPIFY ROOT
     ======================================================== */

  const shopifyRoot =
    window.Shopify &&
    window.Shopify.routes &&
    window.Shopify.routes.root
      ? window.Shopify.routes.root
      : '/';


  /* ========================================================
     OPEN POPUP
     ======================================================== */

  async function openProduct(productHandle) {

    if (!productHandle) {
      return;
    }

    lastFocusedElement =
      document.activeElement;


    popup.classList.add('is-open');

    popup.classList.add('is-loading');

    popup.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'tv-product-popup-open'
    );

    resetPopup();


    try {

      const response = await fetch(
        `/products/${encodeURIComponent(
          productHandle
        )}.js`,
        {
          headers: {
            Accept: 'application/json'
          }
        }
      );


      if (!response.ok) {
        throw new Error(
          'Unable to load product.'
        );
      }


      currentProduct =
        await response.json();


      renderProduct(
        currentProduct
      );


      requestAnimationFrame(() => {

        const closeButton =
          popup.querySelector(
            '[data-popup-close]'
          );

        if (closeButton) {
          closeButton.focus();
        }

      });

    } catch (error) {

      console.error(error);

      showError(
        'Sorry, this product could not be loaded.'
      );

    } finally {

      popup.classList.remove(
        'is-loading'
      );

    }

  }


  /* ========================================================
     CLOSE POPUP
     ======================================================== */

  function closePopup() {

    popup.classList.remove(
      'is-open'
    );

    popup.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'tv-product-popup-open'
    );

    currentProduct = null;

    selectedOptions = [];

    selectedVariant = null;


    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus ===
        'function'
    ) {

      lastFocusedElement.focus();

    }

  }


  /* ========================================================
     RESET POPUP
     ======================================================== */

  function resetPopup() {

    image.removeAttribute('src');

    image.alt = '';

    title.textContent = '';

    price.textContent = '';

    description.innerHTML = '';

    optionsContainer.innerHTML = '';

    errorElement.hidden = true;

    errorElement.textContent = '';

    selectedOptions = [];

    selectedVariant = null;

  }


  /* ========================================================
     RENDER PRODUCT
     ======================================================== */

  function renderProduct(product) {

    title.textContent =
      product.title || '';


    price.textContent =
      formatMoney(
        product.price
      );


    description.innerHTML =
      product.description || '';


    if (product.featured_image) {

      image.src =
        product.featured_image;

      image.alt =
        product.title || '';

    }


    renderOptions(
      product
    );


    updateSelectedVariant();

  }


  /* ========================================================
     RENDER OPTIONS
     ======================================================== */

  function renderOptions(product) {

    optionsContainer.innerHTML = '';

    selectedOptions = [];


    if (
      !product.options ||
      !product.options.length
    ) {

      return;

    }


    product.options.forEach(
      (option, optionIndex) => {

        const fieldset =
          document.createElement(
            'fieldset'
          );

        fieldset.className =
          'tv-product-popup__option';


        const legend =
          document.createElement(
            'legend'
          );

        legend.className =
          'tv-product-popup__option-title';

        legend.textContent =
          option.name;


        fieldset.appendChild(
          legend
        );


        const values =
          document.createElement(
            'div'
          );

        values.className =
          'tv-product-popup__values';


        values.style.setProperty(
          '--option-count',
          option.values.length
        );


        /*
         * Default to the first available
         * combination where possible.
         */

        const firstValue =
          option.values[0] || '';

        selectedOptions[
          optionIndex
        ] = firstValue;


        option.values.forEach(
          (value) => {

            const button =
              document.createElement(
                'button'
              );

            button.type =
              'button';

            button.className =
              'tv-product-popup__value';

            button.textContent =
              value;

            button.dataset.optionIndex =
              String(optionIndex);

            button.dataset.optionValue =
              value;


            if (
              value === firstValue
            ) {

              button.classList.add(
                'is-selected'
              );

            }


            button.addEventListener(
              'click',
              () => {

                selectOption(
                  optionIndex,
                  value
                );

              }
            );


            values.appendChild(
              button
            );

          }
        );


        fieldset.appendChild(
          values
        );


        optionsContainer.appendChild(
          fieldset
        );

      }
    );

  }


  /* ========================================================
     SELECT OPTION
     ======================================================== */

  function selectOption(
    optionIndex,
    value
  ) {

    selectedOptions[
      optionIndex
    ] = value;


    const buttons =
      optionsContainer.querySelectorAll(
        `[data-option-index="${optionIndex}"]`
      );


    buttons.forEach(
      (button) => {

        button.classList.toggle(
          'is-selected',
          button.dataset.optionValue ===
            value
        );

      }
    );


    updateSelectedVariant();

  }


  /* ========================================================
     FIND SELECTED VARIANT
     ======================================================== */

  function updateSelectedVariant() {

    if (!currentProduct) {
      return;
    }


    selectedVariant =
      currentProduct.variants.find(
        (variant) => {

          return variant.options.every(
            (optionValue, index) => {

              return (
                optionValue ===
                selectedOptions[index]
              );

            }
          );

        }
      );


    if (!selectedVariant) {

      showError(
        'This combination is unavailable.'
      );

      return;

    }


    if (!selectedVariant.available) {

      showError(
        'This variant is currently unavailable.'
      );

    } else {

      clearError();

    }


    /*
     * Update price when a variant has
     * its own price.
     */

    if (
      typeof selectedVariant.price ===
        'number'
    ) {

      price.textContent =
        formatMoney(
          selectedVariant.price
        );

    }

  }


  /* ========================================================
     ADD TO CART
     ======================================================== */

  async function addToCart(event) {

    event.preventDefault();

    clearError();


    if (!currentProduct) {

      showError(
        'Please select a product.'
      );

      return;

    }


    if (!selectedVariant) {

      showError(
        'Please select a valid product variant.'
      );

      return;

    }


    if (!selectedVariant.available) {

      showError(
        'This variant is currently unavailable.'
      );

      return;

    }


    submitButton.disabled = true;

    submitButton.classList.add(
      'is-adding'
    );


    try {

      /*
       * Always add the selected product first.
       */

      await addVariantToCart(
        selectedVariant.id,
        1
      );


      /*
       * Special condition:
       *
       * Color = Black
       * Size  = Medium
       */

      if (
        isBlackAndMediumVariant(
          currentProduct,
          selectedVariant
        )
      ) {

        await addCompanionProduct();

      }


      /*
       * Notify the theme.
       */

      document.dispatchEvent(
        new CustomEvent(
          'cart:refresh'
        )
      );

      document.dispatchEvent(
        new CustomEvent(
          'cart:updated'
        )
      );


      /*
       * Refresh common Shopify/theme
       * cart components when available.
       */

      if (
        typeof window.Shopify !==
          'undefined' &&
        typeof window.Shopify.onCartUpdate ===
          'function'
      ) {

        window.Shopify.onCartUpdate();

      }


      /*
       * Refresh cart drawer if the theme
       * exposes its common update methods.
       */

      document.dispatchEvent(
        new CustomEvent(
          'cart:update'
        )
      );


      closePopup();


    } catch (error) {

      console.error(error);

      showError(
        error.message ||
        'Unable to add the product to cart.'
      );

    } finally {

      submitButton.disabled = false;

      submitButton.classList.remove(
        'is-adding'
      );

    }

  }


  /* ========================================================
     ADD VARIANT
     ======================================================== */

  async function addVariantToCart(
    variantId,
    quantity
  ) {

    const response =
      await fetch(
        `${shopifyRoot}cart/add.js`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json'
          },

          body: JSON.stringify({
            items: [
              {
                id: variantId,
                quantity
              }
            ]
          })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.description ||
        data.message ||
        'Unable to add product.'
      );

    }


    return data;

  }


  /* ========================================================
     AUTOMATIC COMPANION PRODUCT
     ======================================================== */

  async function addCompanionProduct() {

    if (!autoAddProductHandle) {

      return;

    }


    const response =
      await fetch(
        `/products/${encodeURIComponent(
          autoAddProductHandle
        )}.js`,
        {
          headers: {
            Accept: 'application/json'
          }
        }
      );


    if (!response.ok) {

      throw new Error(
        'Unable to load the automatic product.'
      );

    }


    const companionProduct =
      await response.json();


    const companionVariant =
      companionProduct.variants.find(
        (variant) =>
          variant.available
      );


    if (!companionVariant) {

      throw new Error(
        'The automatic product is unavailable.'
      );

    }


    await addVariantToCart(
      companionVariant.id,
      1
    );

  }


  /* ========================================================
     BLACK + MEDIUM CHECK
     ======================================================== */

  function isBlackAndMediumVariant(
    product,
    variant
  ) {

    if (
      !product ||
      !variant ||
      !product.options
    ) {

      return false;

    }


    let color = '';

    let size = '';


    product.options.forEach(
      (option, index) => {

        const name =
          String(
            option.name || ''
          )
            .toLowerCase()
            .trim();


        if (name === 'color') {

          color =
            String(
              variant.options[index] ||
              ''
            )
              .toLowerCase()
              .trim();

        }


        if (name === 'size') {

          size =
            String(
              variant.options[index] ||
              ''
            )
              .toLowerCase()
              .trim();

        }

      }
    );


    return (
      color === 'black' &&
      size === 'medium'
    );

  }


  /* ========================================================
     MONEY
     ======================================================== */

  function formatMoney(
    cents
  ) {

    if (
      window.Shopify &&
      typeof window.Shopify.formatMoney ===
        'function'
    ) {

      return window.Shopify.formatMoney(
        cents
      );

    }


    const currency =
      window.Shopify &&
      window.Shopify.currency &&
      window.Shopify.currency.active
        ? window.Shopify.currency.active
        : 'EUR';


    return new Intl.NumberFormat(
      document.documentElement.lang ||
        'en',
      {
        style: 'currency',
        currency
      }
    ).format(
      Number(cents || 0) / 100
    );

  }


  /* ========================================================
     ERROR
     ======================================================== */

  function showError(
    message
  ) {

    errorElement.textContent =
      message;

    errorElement.hidden =
      false;

  }


  function clearError() {

    errorElement.textContent =
      '';

    errorElement.hidden =
      true;

  }


  /* ========================================================
     HOTSPOTS
     ======================================================== */

  document.addEventListener(
    'click',
    (event) => {

      const hotspot =
        event.target.closest(
          '.tv-product-grid__hotspot'
        );


      if (!hotspot) {
        return;
      }


      const handle =
        hotspot.dataset.productHandle;


      if (!handle) {
        return;
      }


      event.preventDefault();


      openProduct(
        handle
      );

    }
  );


  /* ========================================================
     CLOSE BUTTON / OVERLAY
     ======================================================== */

  popup.addEventListener(
    'click',
    (event) => {

      if (
        event.target.closest(
          '[data-popup-close]'
        )
      ) {

        closePopup();

      }

    }
  );


  /* ========================================================
     ESCAPE
     ======================================================== */

  document.addEventListener(
    'keydown',
    (event) => {

      if (
        event.key === 'Escape' &&
        popup.classList.contains(
          'is-open'
        )
      ) {

        closePopup();

      }

    }
  );


  /* ========================================================
     FORM
     ======================================================== */

  form.addEventListener(
    'submit',
    addToCart
  );

})();

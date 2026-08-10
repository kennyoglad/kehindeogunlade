(() => {
  'use strict';

  const popup = document.getElementById('tv-product-popup');

  if (!popup) {
    return;
  }

  const image = document.getElementById('tv-product-popup-image');
  const title = document.getElementById('tv-product-popup-title');
  const price = document.getElementById('tv-product-popup-price');
  const description = document.getElementById('tv-product-popup-description');
  const optionsContainer = document.getElementById('tv-product-popup-options');
  const form = document.getElementById('tv-product-popup-form');
  const errorElement = document.getElementById('tv-product-popup-error');

  let currentProduct = null;
  let selectedOptions = [];
  let selectedVariant = null;

  /*
   * Shopify product selected in the Theme Editor.
   *
   * This value is inserted from Liquid below.
   */
  const autoAddProductHandle =
    popup.dataset.autoAddProductHandle || '';

  /* ========================================================
     OPEN POPUP
     ======================================================== */

  async function openProduct(productHandle) {

    popup.classList.add('is-open');
    popup.classList.add('is-loading');

    popup.setAttribute('aria-hidden', 'false');

    document.body.classList.add('tv-product-popup-open');

    resetPopup();

    try {

      const response = await fetch(
        `/products/${productHandle}.js`
      );

      if (!response.ok) {
        throw new Error('Unable to load product.');
      }

      currentProduct = await response.json();

      renderProduct(currentProduct);

    } catch (error) {

      console.error(error);

      showError(
        'Sorry, this product could not be loaded.'
      );

    } finally {

      popup.classList.remove('is-loading');
    }
  }


  /* ========================================================
     CLOSE POPUP
     ======================================================== */

  function closePopup() {

    popup.classList.remove('is-open');

    popup.setAttribute('aria-hidden', 'true');

    document.body.classList.remove(
      'tv-product-popup-open'
    );

    currentProduct = null;
    selectedOptions = [];
    selectedVariant = null;
  }


  /* ========================================================
     RESET
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

    title.textContent = product.title;

    price.textContent = formatMoney(
      product.price
    );

    description.innerHTML =
      product.description || '';

    if (product.featured_image) {

      image.src = product.featured_image;

      image.alt = product.title;
    }

    renderOptions(product);

    updateSelectedVariant();
  }


  /* ========================================================
     RENDER VARIANTS
     ======================================================== */

  function renderOptions(product) {

    optionsContainer.innerHTML = '';

    /*
     * Shopify's product JSON contains:
     *
     * product.options
     *
     * Example:
     *
     * [
     *   {
     *     name: "Color",
     *     values: ["White", "Black"]
     *   },
     *   {
     *     name: "Size",
     *     values: ["Small", "Medium", "Large"]
     *   }
     * ]
     */

    product.options.forEach(
      (option, optionIndex) => {

        const fieldset =
          document.createElement('fieldset');

        fieldset.className =
          'tv-product-popup__option';

        const legend =
          document.createElement('legend');

        legend.className =
          'tv-product-popup__option-title';

        legend.textContent =
          option.name;

        fieldset.appendChild(legend);

        const values =
          document.createElement('div');

        values.className =
          'tv-product-popup__values';

        values.style.setProperty(
          '--option-count',
          option.values.length
        );

        option.values.forEach(
          (value, valueIndex) => {

            const button =
              document.createElement('button');

            button.type = 'button';

            button.className =
              'tv-product-popup__value';

            button.textContent = value;

            button.dataset.optionIndex =
              optionIndex;

            button.dataset.optionValue =
              value;

            /*
             * First value of each option is
             * selected initially.
             */
            if (valueIndex === 0) {
              button.classList.add(
                'is-selected'
              );

              selectedOptions[optionIndex] =
                value;
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

            values.appendChild(button);
          }
        );

        fieldset.appendChild(values);

        optionsContainer.appendChild(fieldset);
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

    selectedOptions[optionIndex] =
      value;

    const buttons =
      optionsContainer.querySelectorAll(
        `[data-option-index="${optionIndex}"]`
      );

    buttons.forEach(
      button => {

        button.classList.toggle(
          'is-selected',
          button.dataset.optionValue === value
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
        variant => {

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

    if (
      selectedVariant &&
      !selectedVariant.available
    ) {

      showError(
        'This variant is currently unavailable.'
      );

    } else {

      clearError();
    }
  }


  /* ========================================================
     ADD TO CART
     ======================================================== */

  async function addToCart(event) {

    event.preventDefault();

    clearError();

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

    const submitButton =
      form.querySelector(
        '.tv-product-popup__add'
      );

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
       * Check for the special condition:
       *
       * Color = Black
       * Size  = Medium
       *
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
       * Tell Shopify/theme that the cart changed.
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
       * Open/refresh the theme cart drawer
       * if the theme exposes a common method.
       */

      if (
        window.Shopify &&
        typeof window.Shopify.onCartUpdate ===
          'function'
      ) {

        window.Shopify.onCartUpdate();
      }


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

    const response = await fetch(
      `${window.Shopify.routes.root}cart/add.js`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',

          'Accept':
            'application/json'
        },

        body: JSON.stringify({
          items: [
            {
              id: variantId,
              quantity: quantity
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
     COMPANION PRODUCT
     ======================================================== */

  async function addCompanionProduct() {

    if (!autoAddProductHandle) {
      return;
    }

    /*
     * Fetch Soft Winter Jacket dynamically.
     */

    const response = await fetch(
      `/products/${autoAddProductHandle}.js`
    );

    if (!response.ok) {

      throw new Error(
        'Unable to load the automatic product.'
      );
    }

    const companionProduct =
      await response.json();


    /*
     * Pick the first available variant.
     *
     * If Soft Winter Jacket only has one variant,
     * that variant is used.
     */

    const companionVariant =
      companionProduct.variants.find(
        variant => variant.available
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
          option.name
            .toLowerCase()
            .trim();

        if (name === 'color') {

          color =
            variant.options[index]
              .toLowerCase()
              .trim();
        }

        if (name === 'size') {

          size =
            variant.options[index]
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

    return (
      (cents / 100).toFixed(2)
      + '€'
    );
  }


  /* ========================================================
     ERROR
     ======================================================== */

  function showError(message) {

    errorElement.textContent =
      message;

    errorElement.hidden = false;
  }

  function clearError() {

    errorElement.textContent = '';

    errorElement.hidden = true;
  }


  /* ========================================================
     HOTSPOTS
     ======================================================== */

  document.addEventListener(
    'click',
    event => {

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

      openProduct(handle);
    }
  );


  /* ========================================================
     CLOSE BUTTON / OVERLAY
     ======================================================== */

  popup.addEventListener(
    'click',
    event => {

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
    event => {

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

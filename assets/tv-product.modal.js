(function () {
  'use strict';

  let modal = null;
  let dialog = null;
  let form = null;

  let image = null;
  let title = null;
  let price = null;
  let description = null;
  let optionsContainer = null;
  let errorContainer = null;
  let addButton = null;

  let currentProduct = null;
  let currentSelections = {};
  let lastFocusedElement = null;


  /* ========================================================
     INITIALIZATION
     ======================================================== */

  function init() {
    modal = document.getElementById(
      'tv-product-modal'
    );

    if (!modal) {
      return;
    }

    dialog = modal.querySelector(
      '.tv-product-modal__dialog'
    );

    form = document.getElementById(
      'tv-product-popup-form'
    );

    image = document.getElementById(
      'tv-product-popup-image'
    );

    title = document.getElementById(
      'tv-product-popup-title'
    );

    price = document.getElementById(
      'tv-product-popup-price'
    );

    description = document.getElementById(
      'tv-product-popup-description'
    );

    optionsContainer = document.getElementById(
      'tv-product-popup-options'
    );

    errorContainer = document.getElementById(
      'tv-product-popup-error'
    );

    addButton = document.getElementById(
      'tv-product-popup-add'
    );


    document.addEventListener(
      'tv:product:open',
      function (event) {
        if (
          event.detail &&
          event.detail.product
        ) {
          openProduct(
            event.detail.product
          );
        }
      }
    );


    modal.addEventListener(
      'click',
      handleModalClick
    );


    form.addEventListener(
      'submit',
      handleAddToCart
    );


    document.addEventListener(
      'keydown',
      handleKeydown
    );
  }


  /* ========================================================
     OPEN PRODUCT
     ======================================================== */

  function openProduct(product) {
    currentProduct = product;

    currentSelections = {};

    lastFocusedElement =
      document.activeElement;


    clearError();


    renderProduct();


    modal.hidden = false;

    modal.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'tv-product-modal-open'
    );


    requestAnimationFrame(function () {
      dialog.focus();
    });
  }


  /* ========================================================
     CLOSE PRODUCT
     ======================================================== */

  function closeProduct() {
    if (!modal) {
      return;
    }

    modal.hidden = true;

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove(
      'tv-product-modal-open'
    );


    if (
      lastFocusedElement &&
      typeof lastFocusedElement.focus === 'function'
    ) {
      lastFocusedElement.focus();
    }
  }


  /* ========================================================
     RENDER PRODUCT
     ======================================================== */

  function renderProduct() {
    if (!currentProduct) {
      return;
    }


    /* ------------------------------------------------------
       Image
       ------------------------------------------------------ */

    if (
      currentProduct.featured_image
    ) {
      image.src =
        currentProduct.featured_image;

      image.alt =
        currentProduct.featured_image_alt ||
        currentProduct.title ||
        '';
    } else {
      image.removeAttribute('src');

      image.alt =
        currentProduct.title ||
        '';
    }


    /* ------------------------------------------------------
       Title
       ------------------------------------------------------ */

    title.textContent =
      currentProduct.title || '';


    /* ------------------------------------------------------
       Price
       ------------------------------------------------------ */

    price.textContent =
      currentProduct.price_formatted || '';


    /* ------------------------------------------------------
       Description
       ------------------------------------------------------ */

    description.innerHTML =
      currentProduct.description_html || '';


    /* ------------------------------------------------------
       Variant options
       ------------------------------------------------------ */

    renderOptions();


    updateVariantState();
  }


  /* ========================================================
     RENDER OPTIONS
     ======================================================== */

  function renderOptions() {
    optionsContainer.innerHTML = '';

    if (
      !currentProduct.options ||
      !currentProduct.options.length
    ) {
      return;
    }


    currentProduct.options.forEach(
      function (optionName, optionIndex) {

        const optionNumber =
          optionIndex + 1;

        const group =
          document.createElement('div');

        group.className =
          'tv-product-popup__option-group';

        group.dataset.optionIndex =
          String(optionIndex);


        const label =
          document.createElement('div');

        label.className =
          'tv-product-popup__option-label';

        label.textContent =
          optionName;


        const values =
          getOptionValues(optionNumber);


        const valuesContainer =
          document.createElement('div');

        valuesContainer.className =
          'tv-product-popup__option-values';


        values.forEach(
          function (value) {

            const button =
              document.createElement('button');

            button.type =
              'button';

            button.className =
              'tv-product-popup__option-value';

            button.dataset.optionIndex =
              String(optionIndex);

            button.dataset.optionValue =
              value;

            button.textContent =
              value;


            button.addEventListener(
              'click',
              function () {
                selectOption(
                  optionIndex,
                  value
                );
              }
            );


            valuesContainer.appendChild(
              button
            );
          }
        );


        group.appendChild(label);

        group.appendChild(
          valuesContainer
        );

        optionsContainer.appendChild(
          group
        );
      }
    );
  }


  /* ========================================================
     GET UNIQUE OPTION VALUES
     ======================================================== */

  function getOptionValues(
    optionNumber
  ) {
    const values = [];

    currentProduct.variants.forEach(
      function (variant) {

        const value =
          variant[
            'option' +
            optionNumber
          ];

        if (
          value &&
          values.indexOf(value) === -1
        ) {
          values.push(value);
        }
      }
    );

    return values;
  }


  /* ========================================================
     SELECT OPTION
     ======================================================== */

  function selectOption(
    optionIndex,
    value
  ) {
    currentSelections[
      optionIndex
    ] = value;


    /*
      Clear selections that come after
      the option that was changed.

      This prevents an invalid combination
      from remaining selected.
    */

    Object.keys(
      currentSelections
    ).forEach(
      function (key) {

        if (
          Number(key) >
          optionIndex
        ) {
          delete currentSelections[key];
        }
      }
    );


    updateVariantState();
  }


  /* ========================================================
     UPDATE VARIANT STATE
     ======================================================== */

  function updateVariantState() {
    if (!currentProduct) {
      return;
    }


    const buttons =
      optionsContainer.querySelectorAll(
        '.tv-product-popup__option-value'
      );


    buttons.forEach(
      function (button) {

        const optionIndex =
          Number(
            button.dataset.optionIndex
          );

        const value =
          button.dataset.optionValue;


        const isSelected =
          currentSelections[
            optionIndex
          ] === value;


        button.classList.toggle(
          'is-selected',
          isSelected
        );


        const available =
          isOptionValueAvailable(
            optionIndex,
            value
          );


        button.classList.toggle(
          'is-disabled',
          !available
        );


        button.disabled =
          !available;
      }
    );


    const selectedVariant =
      findSelectedVariant();


    if (selectedVariant) {

      if (
        selectedVariant.price_formatted
      ) {
        price.textContent =
          selectedVariant.price_formatted;
      }


      if (
        selectedVariant.featured_image
      ) {
        image.src =
          selectedVariant.featured_image;

        image.alt =
          currentProduct.title || '';
      }


      addButton.disabled =
        !selectedVariant.available;

    } else {

      price.textContent =
        currentProduct.price_formatted || '';


      image.src =
        currentProduct.featured_image || '';


      image.alt =
        currentProduct.featured_image_alt ||
        currentProduct.title ||
        '';


      addButton.disabled =
        true;
    }


    if (
      currentProduct.options &&
      currentProduct.options.length
    ) {

      addButton.disabled =
        !selectedVariant ||
        !selectedVariant.available;
    }
  }


  /* ========================================================
     CHECK OPTION VALUE AVAILABILITY
     ======================================================== */

  function isOptionValueAvailable(
    optionIndex,
    value
  ) {
    const optionNumber =
      optionIndex + 1;


    return currentProduct.variants.some(
      function (variant) {

        if (!variant.available) {
          return false;
        }


        if (
          variant[
            'option' +
            optionNumber
          ] !== value
        ) {
          return false;
        }


        for (
          let index = 0;
          index < optionIndex;
          index++
        ) {

          if (
            currentSelections[index] &&
            variant[
              'option' +
              (index + 1)
            ] !==
              currentSelections[index]
          ) {
            return false;
          }
        }


        return true;
      }
    );
  }


  /* ========================================================
     FIND SELECTED VARIANT
     ======================================================== */

  function findSelectedVariant() {
    if (!currentProduct) {
      return null;
    }


    if (
      !currentProduct.options ||
      !currentProduct.options.length
    ) {
      return (
        currentProduct.variants[0] ||
        null
      );
    }


    const allSelected =
      currentProduct.options.every(
        function (_, index) {
          return (
            currentSelections[index]
          );
        }
      );


    if (!allSelected) {
      return null;
    }


    return (
      currentProduct.variants.find(
        function (variant) {

          return currentProduct.options.every(
            function (_, index) {

              return (
                variant[
                  'option' +
                  (index + 1)
                ] ===
                currentSelections[index]
              );
            }
          );
        }
      ) || null
    );
  }


  /* ========================================================
     ADD TO CART
     ======================================================== */

  async function handleAddToCart(
    event
  ) {
    event.preventDefault();


    clearError();


    if (!currentProduct) {
      return;
    }


    const selectedVariant =
      findSelectedVariant();


    if (!selectedVariant) {

      showError(
        'Please select all product options.'
      );

      return;
    }


    if (
      !selectedVariant.available
    ) {

      showError(
        'This variant is currently unavailable.'
      );

      return;
    }


    setLoading(true);


    try {

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
              items: [
                {
                  id:
                    selectedVariant.id,

                  quantity: 1
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
          'Unable to add the product to cart.'
        );
      }


      /*
        Tell the rest of the theme that
        the cart has changed.

        Different Shopify theme components
        can listen for these events.
      */

      document.dispatchEvent(
        new CustomEvent(
          'cart:updated',
          {
            detail: {
              cart: data
            }
          }
        )
      );


      document.dispatchEvent(
        new CustomEvent(
          'cart:refresh',
          {
            detail: {
              cart: data
            }
          }
        )
      );


      /*
        Refresh cart information where
        supported by Shopify's cart APIs.
      */

      try {

        const cartResponse =
          await fetch(
            window.Shopify.routes.root +
              'cart.js'
          );

        const cart =
          await cartResponse.json();


        document.dispatchEvent(
          new CustomEvent(
            'cart:updated',
            {
              detail: {
                cart: cart
              }
            }
          )
        );

      } catch (cartError) {

        /*
          The product has already been
          successfully added, so failure
          to refresh the optional cart
          state should not be treated as
          an Add to Cart failure.
        */

        console.warn(
          'Cart was updated, but the cart UI could not be refreshed.',
          cartError
        );
      }


      setLoading(false);

      closeProduct();

    } catch (error) {

      console.error(
        'TV Product Modal:',
        error
      );


      showError(
        error.message ||
        'Unable to add the product to cart.'
      );


      setLoading(false);
    }
  }


  /* ========================================================
     LOADING STATE
     ======================================================== */

  function setLoading(
    loading
  ) {
    if (!addButton) {
      return;
    }


    addButton.disabled =
      loading;


    if (loading) {

      addButton
        .querySelector(
          '.tv-product-popup__add-label'
        )
        .textContent =
        'ADDING...';

    } else {

      addButton
        .querySelector(
          '.tv-product-popup__add-label'
        )
        .textContent =
        'ADD TO CART';
    }
  }


  /* ========================================================
     ERROR
     ======================================================== */

  function showError(
    message
  ) {
    errorContainer.textContent =
      message;

    errorContainer.hidden =
      false;
  }


  function clearError() {
    if (!errorContainer) {
      return;
    }

    errorContainer.textContent =
      '';

    errorContainer.hidden =
      true;
  }


  /* ========================================================
     MODAL CLICK HANDLING
     ======================================================== */

  function handleModalClick(
    event
  ) {
    const closeButton =
      event.target.closest(
        '[data-popup-close]'
      );


    if (closeButton) {
      closeProduct();
    }
  }


  /* ========================================================
     KEYBOARD
     ======================================================== */

  function handleKeydown(
    event
  ) {
    if (
      !modal ||
      modal.hidden
    ) {
      return;
    }


    if (
      event.key === 'Escape'
    ) {
      closeProduct();

      return;
    }


    if (
      event.key !== 'Tab'
    ) {
      return;
    }


    trapFocus(event);
  }


  /* ========================================================
     FOCUS TRAP
     ======================================================== */

  function trapFocus(
    event
  ) {
    const focusable =
      dialog.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );


    if (!focusable.length) {
      return;
    }


    const first =
      focusable[0];

    const last =
      focusable[
        focusable.length - 1
      ];


    if (
      event.shiftKey &&
      document.activeElement === first
    ) {

      event.preventDefault();

      last.focus();

    } else if (
      !event.shiftKey &&
      document.activeElement === last
    ) {

      event.preventDefault();

      first.focus();
    }
  }


  /* ========================================================
     START
     ======================================================== */

  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      init
    );

  } else {

    init();
  }

})();

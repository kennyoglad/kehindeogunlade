(() => {
  'use strict';

  let currentProduct = null;

  const modal = document.querySelector(
    '[data-tv-product-modal]'
  );

  const form = document.getElementById(
    'tv-product-popup-form'
  );

  const image = document.getElementById(
    'tv-product-popup-image'
  );

  const title = document.getElementById(
    'tv-product-popup-title'
  );

  const price = document.getElementById(
    'tv-product-popup-price'
  );

  const description = document.getElementById(
    'tv-product-popup-description'
  );

  const optionsContainer = document.getElementById(
    'tv-product-popup-options'
  );

  const errorMessage = document.getElementById(
    'tv-product-popup-error'
  );

  if (!modal || !form) {
    return;
  }

  const formatMoney = (amount) => {
    const value = Number(amount) / 100;

    return new Intl.NumberFormat(
      document.documentElement.lang || 'en',
      {
        style: 'currency',
        currency: window.Shopify?.currency?.active || 'USD'
      }
    ).format(value);
  };


  const showError = (message) => {
    if (!errorMessage) {
      return;
    }

    errorMessage.textContent = message;
    errorMessage.hidden = false;
  };


  const clearError = () => {
    if (!errorMessage) {
      return;
    }

    errorMessage.textContent = '';
    errorMessage.hidden = true;
  };


  const openModal = () => {
    modal.classList.add(
      'tv-product-modal--open'
    );

    modal.setAttribute(
      'aria-hidden',
      'false'
    );

    document.documentElement.classList.add(
      'tv-product-modal-open'
    );

    document.body.classList.add(
      'tv-product-modal-open'
    );
  };


  const closeModal = () => {
    modal.classList.remove(
      'tv-product-modal--open'
    );

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    document.documentElement.classList.remove(
      'tv-product-modal-open'
    );

    document.body.classList.remove(
      'tv-product-modal-open'
    );

    clearError();
  };


  const getSelectedOptions = () => {
    const selects = optionsContainer.querySelectorAll(
      '[data-option-index]'
    );

    return Array.from(selects).map(
      (select) => select.value
    );
  };


  const findSelectedVariant = () => {
    if (!currentProduct?.variants) {
      return null;
    }

    const selectedOptions = getSelectedOptions();

    return currentProduct.variants.find(
      (variant) => {
        if (!variant.options) {
          return false;
        }

        return variant.options.every(
          (option, index) =>
            option === selectedOptions[index]
        );
      }
    ) || null;
  };


  const updateVariantImage = (variant) => {
    if (!image || !variant) {
      return;
    }

    if (
      variant.featured_image &&
      variant.featured_image.src
    ) {
      image.src = variant.featured_image.src;

      image.alt =
        variant.featured_image.alt ||
        currentProduct.title;

      return;
    }

    if (
      currentProduct.featured_image &&
      currentProduct.featured_image.src
    ) {
      image.src =
        currentProduct.featured_image.src;

      image.alt =
        currentProduct.featured_image.alt ||
        currentProduct.title;
    }
  };


  const updateVariantPrice = (variant) => {
    if (!price || !variant) {
      return;
    }

    price.textContent = formatMoney(
      variant.price
    );
  };


  const updateVariant = () => {
    clearError();

    const variant = findSelectedVariant();

    if (!variant) {
      return;
    }

    updateVariantImage(variant);
    updateVariantPrice(variant);
  };


  const createOption = (
    option,
    optionIndex
  ) => {
    const wrapper =
      document.createElement('div');

    wrapper.className =
      'tv-product-popup__option';


    const label =
      document.createElement('label');

    label.className =
      'tv-product-popup__option-label';

    label.textContent =
      option.name;


    const select =
      document.createElement('select');

    select.className =
      'tv-product-popup__select';

    select.dataset.optionIndex =
      String(optionIndex);

    select.name =
      `option-${optionIndex}`;


    option.values.forEach((value) => {
      const optionElement =
        document.createElement('option');

      optionElement.value = value;
      optionElement.textContent = value;

      select.appendChild(
        optionElement
      );
    });


    select.addEventListener(
      'change',
      updateVariant
    );


    wrapper.appendChild(label);
    wrapper.appendChild(select);

    return wrapper;
  };


  const renderOptions = () => {
    optionsContainer.innerHTML = '';

    if (
      !currentProduct.options ||
      !currentProduct.options.length
    ) {
      return;
    }

    currentProduct.options.forEach(
      (option, index) => {
        optionsContainer.appendChild(
          createOption(
            option,
            index
          )
        );
      }
    );

    updateVariant();
  };


  const renderProduct = () => {
    if (!currentProduct) {
      return;
    }

    title.textContent =
      currentProduct.title || '';


    price.textContent =
      currentProduct.variants?.[0]
        ? formatMoney(
            currentProduct.variants[0].price
          )
        : '';


    description.innerHTML =
      currentProduct.description || '';


    if (
      currentProduct.featured_image &&
      currentProduct.featured_image.src
    ) {
      image.src =
        currentProduct.featured_image.src;

      image.alt =
        currentProduct.featured_image.alt ||
        currentProduct.title;
    } else {
      image.removeAttribute('src');
      image.alt = '';
    }


    renderOptions();
  };


  const loadProduct = async (
    handle
  ) => {
    clearError();

    try {
      const response =
        await fetch(
          `/products/${encodeURIComponent(handle)}.js`,
          {
            headers: {
              Accept:
                'application/json'
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

      renderProduct();
      openModal();

    } catch (error) {
      console.error(error);

      showError(
        'Unable to load this product. Please try again.'
      );

      openModal();
    }
  };


  const addToCart = async (
    event
  ) => {
    event.preventDefault();

    clearError();

    const variant =
      findSelectedVariant();

    if (!variant) {
      showError(
        'Please select a valid product option.'
      );

      return;
    }

    if (!variant.available) {
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

    try {
      const response =
        await fetch(
          `${window.Shopify.routes.root}cart/add.js`,
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
                  id: variant.id,
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
          'Unable to add product to cart.'
        );
      }

      closeModal();

      document.dispatchEvent(
        new CustomEvent(
          'cart:refresh'
        )
      );

      document.dispatchEvent(
        new CustomEvent(
          'cart:updated',
          {
            detail: data
          }
        )
      );

    } catch (error) {
      console.error(error);

      showError(
        error.message ||
        'Unable to add product to cart.'
      );

    } finally {
      submitButton.disabled = false;
    }
  };


  form.addEventListener(
    'submit',
    addToCart
  );


  modal
    .querySelectorAll(
      '[data-popup-close]'
    )
    .forEach((element) => {
      element.addEventListener(
        'click',
        closeModal
      );
    });


  document.addEventListener(
    'keydown',
    (event) => {
      if (
        event.key === 'Escape' &&
        modal.classList.contains(
          'tv-product-modal--open'
        )
      ) {
        closeModal();
      }
    }
  );


  window.TvProductModalOpen =
    loadProduct;

})();

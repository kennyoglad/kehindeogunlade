/*
 * TV PRODUCT MODAL — variant selection + Add to Cart
 * ------------------------------------------------------------
 * - Reads each form's embedded variant JSON.
 * - Tracks selected option values per option index.
 * - Finds the matching variant and keeps the hidden id input,
 *   price, and button state in sync.
 * - Posts to /cart/add.js on submit.
 * - Special rule: if the chosen variant's options include
 *   "Black" and "Medium" (case-insensitive, any order), also
 *   adds the default variant of the "Soft Winter Jacket"
 *   product in the same request.
 */
(function () {
  var AUTO_ADD_HANDLE = 'soft-winter-jacket'; // <-- update if the real handle differs
  var AUTO_ADD_TRIGGER_VALUES = ['black', 'medium'];

  function formatMoney(cents, format) {
    // Falls back to a plain decimal if Shopify.money isn't loaded.
    if (window.Shopify && typeof window.Shopify.formatMoney === 'function') {
      return window.Shopify.formatMoney(cents, format);
    }
    return (cents / 100).toFixed(2);
  }

  function getVariantOptionValues(variant) {
    return [variant.option1, variant.option2, variant.option3].filter(Boolean);
  }

  function matchesAutoAddTrigger(variant) {
    var values = getVariantOptionValues(variant).map(function (v) {
      return (v || '').toLowerCase();
    });
    return AUTO_ADD_TRIGGER_VALUES.every(function (trigger) {
      return values.indexOf(trigger) !== -1;
    });
  }

  function findVariant(variants, selected) {
    return variants.find(function (variant) {
      var values = getVariantOptionValues(variant);
      return selected.every(function (val, i) {
        return val == null || values[i] === val;
      });
    });
  }

  function initForm(form) {
    var jsonEl = form.querySelector('[data-product-json]');
    if (!jsonEl) return;

    var variants;
    try {
      variants = JSON.parse(jsonEl.textContent);
    } catch (e) {
      console.error('tv-product-modal: could not parse variant JSON', e);
      return;
    }

    var optionEls = form.querySelectorAll('[data-option-index]');
    var optionCount = optionEls.length ? Math.max.apply(
      null,
      Array.prototype.map.call(optionEls, function (el) {
        return parseInt(el.getAttribute('data-option-index'), 10);
      })
    ) + 1 : 0;

    var selected = new Array(optionCount).fill(null);

    // Seed defaults from any pre-selected color swatch (first value marked active).
    form.querySelectorAll('.tv-product-popup__color.active').forEach(function (btn) {
      var idx = parseInt(btn.getAttribute('data-option-index'), 10);
      selected[idx] = btn.getAttribute('data-option-value');
    });

    var hiddenIdInput = form.querySelector('[data-selected-variant-id]');
    var priceCurrentEl = form.querySelector('[data-price-current]');
    var addButton = form.querySelector('[data-add-to-cart]');
    var addButtonText = form.querySelector('[data-add-to-cart-text]');
    var errorEl = form.querySelector('[data-form-error]');

    function setError(message) {
      if (!errorEl) return;
      if (message) {
        errorEl.textContent = message;
        errorEl.hidden = false;
      } else {
        errorEl.textContent = '';
        errorEl.hidden = true;
      }
    }

    function updateVariant() {
      setError('');

      var variant = findVariant(variants, selected);
      var allSelected = selected.every(function (v) {
        return v != null;
      });

      if (variant) {
        hiddenIdInput.value = variant.id;

        if (priceCurrentEl && variant.price != null) {
          priceCurrentEl.textContent = formatMoney(variant.price);
        }

        if (variant.available) {
          addButton.disabled = false;
          if (addButtonText) addButtonText.textContent = 'ADD TO CART';
        } else {
          addButton.disabled = true;
          if (addButtonText) addButtonText.textContent = 'SOLD OUT';
        }
      } else {
        hiddenIdInput.value = '';
        addButton.disabled = !allSelected ? true : true;
        if (addButtonText) {
          addButtonText.textContent = allSelected ? 'UNAVAILABLE' : 'ADD TO CART';
        }
      }
    }

    // Color swatch buttons
    form.querySelectorAll('.tv-product-popup__color').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = parseInt(btn.getAttribute('data-option-index'), 10);
        var value = btn.getAttribute('data-option-value');

        btn.closest('.tv-product-popup__colors').querySelectorAll('.tv-product-popup__color').forEach(function (sibling) {
          sibling.classList.remove('active');
          sibling.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');

        selected[idx] = value;
        updateVariant();
      });
    });

    // Size / other selects
    form.querySelectorAll('[data-option-select]').forEach(function (select) {
      select.addEventListener('change', function () {
        var idx = parseInt(select.getAttribute('data-option-index'), 10);
        selected[idx] = select.value || null;
        updateVariant();
      });
    });

    // Initial state
    updateVariant();

    // Submit / Add to Cart
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var variant = findVariant(variants, selected);

      if (!variant) {
        setError('Please select all options.');
        return;
      }

      if (!variant.available) {
        setError('This variant is sold out.');
        return;
      }

      var items = [{ id: variant.id, quantity: 1 }];

      if (matchesAutoAddTrigger(variant)) {
        var jacketVariantId = window.tvAutoAddVariants && window.tvAutoAddVariants[AUTO_ADD_HANDLE];
        if (jacketVariantId) {
          items.push({ id: jacketVariantId, quantity: 1 });
        }
      }

      addButton.disabled = true;
      var originalText = addButtonText ? addButtonText.textContent : '';
      if (addButtonText) addButtonText.textContent = 'ADDING...';

      fetch(window.Shopify && window.Shopify.routes && window.Shopify.routes.root
        ? window.Shopify.routes.root + 'cart/add.js'
        : '/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items: items })
      })
        .then(function (response) {
          if (!response.ok) {
            return response.json().then(function (data) {
              throw new Error(data.description || 'Could not add to cart.');
            });
          }
          return response.json();
        })
        .then(function () {
          document.dispatchEvent(new CustomEvent('cart:refresh'));
          document.documentElement.dispatchEvent(new CustomEvent('cart:build'));

          if (addButtonText) addButtonText.textContent = 'ADDED ✓';
          setTimeout(function () {
            if (addButtonText) addButtonText.textContent = originalText;
            addButton.disabled = false;
          }, 1500);
        })
        .catch(function (err) {
          setError(err.message || 'Something went wrong.');
          addButton.disabled = false;
          if (addButtonText) addButtonText.textContent = originalText;
        });
    });
  }

  document.querySelectorAll('[data-product-form]').forEach(initForm);
})();

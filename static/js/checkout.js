jQuery(window).on('load', function () {
    "use strict";

    const cookies = [
        {
            type: 'Milk Chocolate',
            prices: {
                halfDozen: 10,
                fullDozen: 15
            }
        },
        {
            type: 'White Chocolate',
            prices: {
                halfDozen: 10,
                fullDozen: 15
            }
        },
        {
            type: 'Dulce de Leche',
            prices: {
                halfDozen: 10,
                fullDozen: 15
            }
        },
        {
            type: 'Dark Chocolate',
            prices: {
                halfDozen: 10,
                fullDozen: 15
            }
        },
        {
            type: 'M & M',
            prices: {
                halfDozen: 10,
                fullDozen: 15
            }
        },
        {
            type: 'KitKat',
            prices: {
                halfDozen: 10,
                fullDozen: 15
            }
        },
        {
            type: 'Mix Box',
            prices: {
                halfDozen: 20,
                fullDozen: 20
            }
        },
    ];
    let shippingCost = 3;


    // Helpers

    function getFormItems(data) {
        let items = [];
        for (let item of data) {
            let nameSplit = item.name.split('-');
            const index = +nameSplit[1] - 1;
            const key = nameSplit[0];
            if (!items[index]) {
                items[index] = {};
            }
            items[index][key] = item.value;
        }

        // Remove any items that 
        let finalItems = items.filter(function (item) {
            if (item.type && item.dozens) {
                return {
                    type: item.type,
                    dozens: +item.dozens
                };
            }
        });

        return finalItems;
    }

    function getCookieDetails(type) {
        return cookies.find((cookie) => {
            return cookie.type == type;
        })
    }

    function getOrder() {
        let formData = $('.checkout-form').serializeArray();
        let formItems = getFormItems(formData);
        let flatLineItems = getFlatLineItems(formItems);
        let lineItems = [];
        let total = 0;

        for (let item of flatLineItems) {
            const quantity = item.dozens * 12; // Cookie count
            total += item.total;
            lineItems.push({
                name: `${item.type} (${item.dozens} dozen)`,
                unit_amount: {
                    currency_code: 'CAD',
                    value: String(item.total),
                },
                quantity: '1',
            });
        }

        // Get tip if set
        const tip = +($('.tip').val());
        if (tip && tip > 0) {
            total += tip;
            lineItems.push({
                name: 'Tip',
                unit_amount: {
                    currency_code: 'CAD',
                    value: String(tip),
                },
                quantity: 1,
            });
        }

        return {
            total: total,
            lineItems: lineItems,
            tip: tip,
        };
    }

    function getFlatLineItems(formItems) {
        const fullDozens = [];
        const halfDozens = [];
        const lineItems = [];

        for (let item of formItems) {
            switch (item.dozens) {
                case '0.5': halfDozens.push(item); break;
                case '1': fullDozens.push(item); break;
                default: break;
            }
        }

        // Add full dozen line items
        while (fullDozens.length > 0) {
            const item = fullDozens.shift();
            const cookie = getCookieDetails(item.type);
            lineItems.push({
                type: cookie.type,
                total: cookie.prices.fullDozen,
                dozens: 1
            });
        }

        // Flatten half dozens into dozens
        while (halfDozens.length > 0) {
            // If last one
            if (halfDozens.length === 1) {
                const item = halfDozens.shift();
                const cookie = getCookieDetails(item.type);
                lineItems.push({
                    type: cookie.type,
                    total: cookie.prices.halfDozen,
                    dozens: 0.5
                });
            } else {
                // Pull 2 items and join into a dozen
                const halfDozenOne = halfDozens.shift();
                const cookieOne = getCookieDetails(halfDozenOne.type);

                const halfDozenTwo = halfDozens.shift();
                const cookieTwo = getCookieDetails(halfDozenTwo.type);

                // Check which one costs more
                lineItems.push({
                    type: `${cookieOne.type} + ${cookieTwo.type}`,
                    total: Math.max(cookieOne.prices.fullDozen, cookieTwo.prices.fullDozen),
                    dozens: 1
                });
            }
        }
        return lineItems;
    }

    function isForPickup() {
        return $('.pickup').is(":checked");
    }

    function getShippingCost() {
        return !isForPickup() ? shippingCost: 0
    }

    function getDescription() {
        return `Delivery date: ${$('.delivery-date').val()} | Notes: ${$('.instructions').val()}`;
    }

    // DOM Draw

    function addFormGroup() {
        // Count how many form groups we have
        let count = $('.checkout-form').find('.form-group').toArray().length + 1;
        let options = '';
        for (let cookie of cookies) {
            options = `${options}<option value="${cookie.type}">${cookie.type}</option>`
        }
        $('.checkout-form').append(`
            <div class="form-group margin-bottom-20">
                <select name="dozens-${count}" class="quantity-select margin-bottom-20">
                    <option disabled selected>Quantity</option>
                    <option value="0.5">1/2 Dozen</option>
                    <option value="1">1 Dozen</option>
                </select>
                <select name="type-${count}">
                    <option disabled selected>Choose your cookie</option>
                    ${options}
                </select>
            </div>`);
    }

    function updateTotalBreakdown() {
        let order = getOrder();
        $('.order-breakdown').empty();
        for (const item of order.lineItems) {
            $('.order-breakdown').append(`
                <tr>
                    <td>${item.name}</td>
                    <td align="right">
                        <div>$${item.unit_amount.value}</div>
                    </td>
                </tr>
            `);
        }
        $('.order-breakdown').append(`
            <tr class="margin-top-20">
                <td>TOTAL</td>
                <td align="right">
                    <div>$${order.total}</div>
                </td>
            </tr>
        `);
    }

    paypal.Buttons({
        createOrder: function (data, actions) {
            // This function sets up the details of the transaction, including the amount and line item details.
            let order = getOrder();
            const orderTotal = order.total + getShippingCost();
            let body = {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'CAD',
                        value: String(orderTotal),
                        breakdown: {
                            shipping: {
                                currency_code: 'CAD',
                                value: String(getShippingCost()),
                            },
                            item_total: {
                                currency_code: 'CAD',
                                value: String(order.total),
                            }
                        }
                    },
                    items: order.lineItems,
                    soft_descriptor: 'THEGOOODCOOKIE',
                    description: getDescription(),
                }],
            };

            // If order 
            if (order.total === 0 && order.items.length === 0) {
                $('.form-errors').html('<h3>Please add some cookies to your order.</h3>');
                return false;
            } else {
                $('.form-errors').html('');
            }
            return actions.order.create(body);
        },
        onApprove: function (data, actions) {
            actions.order.get().then(function (orderDetails) {
                // Cancel order if shipping address is not valid
                if (!isShippingValid(orderDetails.purchase_units[0].shipping.address)) {
                    // Restart
                    console.log('Shipping address is not valid, exiting!');
                    $('.form-errors').html('<h3>Please add a valid shipping address to your order.</h3>');
                    return;
                }
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function (details) {
                    // Clear checkout wrapper and add confirmation messages
                    $('.checkout-wrapper').html(`
                    <h3 align="center">Payment successful!</h align="center">
                    <h4 align="center">We will contact you when your cookies are being delivered.</h4>
                    <h5 align="center">Contact us via instagram or facebook for specific delivery instructions.</h5>
                `);
                });
            });
        },
        onShippingChange: function (data, actions) {
            // IF shipping address is NOT valid
            if (!isShippingValid(data.shipping_address)) {
                return actions.reject();
            }
            return actions.resolve();
        },
        onError: function (err) {
            console.log(err);
            return true;
        }
    }).render('#paypal-button-container');

    function isShippingValid(address) {
        // If map is available and not set for pickup, shipping is "valid"
        if (map && !isForPickup()) {
            var service = new google.maps.places.PlacesService(map);
            var request = {
                query: address.postal_code, // Search by postal code
                fields: ['name', 'geometry'],
            };
            service.findPlaceFromQuery(request, function (results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    // Check if within perimiter
                    var eligible = google.maps.geometry.poly.containsLocation(results[0].geometry.location, deliveryPerimiter)
                    console.log('Found location', results[0], 'eligible: ' + eligible);
                    if (eligible) {
                        console.log('Order shipping address is valid!');
                        return true;
                    } else {
                        console.log('Order shipping address is NOT valid.');
                        return false;
                    }
                }
            });
        } else {
            console.log('Order for pickup, skipping address check');
        }
        return true;
    }

    // MAIN

    // Group addition
    $('.add-group').click(function () {
        addFormGroup();
    });

    // If select forms are changed, update total price
    $('.checkout-form').on('change', 'select', function () {
        updateTotalBreakdown();
    });

    // If quantity selects are changed to one dozen add mix cookie option
    $('.checkout-form').on('change', '.quantity-select', function () {
        // If option is 1 dozen, add mix cookie to respective cookie select in form
        const val = +$(this).val();
        const formGroup = $(this).attr('name').split('-')[1];
        if (val === 1) {
            $(`.checkout-form select[name="type-${formGroup}"] option[value="Mix Box"]`).remove();
            $(`.checkout-form select[name=type-${formGroup}`).append($('<option>', {
                value: 'Mix Box',
                text: 'Mix Box'
            }));
        } else {
            $(`.checkout-form select[name="type-${formGroup}"] option[value="Mix Box"]`).remove();
        }
    });

    $('.tip').change(function () {
        updateTotalBreakdown();
    });

    // Set today as default delivery date
    $('.delivery-date').val(new Date().toISOString().slice(0, 10));

    // Add the first group by default
    addFormGroup();

    // Testing

    let newTotals = getFlatLineItems([
        { type: "White Chocolate", dozens: "0.5" },
        { type: "Dulce de Leche", dozens: "1" },

        { type: "Milk Chocolate", dozens: "1" },
        { type: "Dulce de Leche", dozens: "0.5" },
        { type: "KitKat", dozens: "1" },
        { type: "M & M", dozens: "0.5" },

    ]);
});
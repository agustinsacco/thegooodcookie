jQuery(window).on('load', function () {
    "use strict";

    const cookies = [
        {
            type: 'Milk Chocolate',
        },
        {
            type: 'White Chocolate',
        },
        {
            type: 'Dark Chocolate',
        },
        {
            type: 'M & M',
        },
    ];
    let dozenCost = 15;
    let halfDozenCost = 10;

    function addFormGroup() {
        // Count how many form groups we have
        let count = $('.checkout-form').find('.form-group').toArray().length + 1;
        let options = '';
        for (let cookie of cookies) {
            options = `${options}<option value="${cookie.type}">${cookie.type}</option>`
        }
        $('.checkout-form').append(`
            <div class="form-group margin-bottom-20">
                <select name="type-${count}" class="margin-bottom-20">
                    <option disabled selected>Choose your cookie</option>
                    ${options}
                </select>
                <select name="dozens-${count}">
                    <option disabled selected>Quantity</option>
                    <option value="0.5">1/2 Dozen</option>
                    <option value="1">1 Dozen</option>
                </select>
            </div>`);
    }

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

    function calculateLineItems(data) {
        let items = getFormItems(data);
        let totals = getTotalBreakdown(items);
        let totalDozens = 0;
        // Each line item can be 1 doze
        for (let item of items) {
            totalDozens += +item.dozens;
        }

        // Not used for now
        const pricePerCookie = totals.total / (totals.dozens * 12)

        let lineItems = [];
        for (let item of items) {
            const quantity = item.dozens * 12; // Cookie count
            lineItems.push({
                name: item.type,
                unit_amount: {
                    currency_code: 'CAD',
                    value: '0',
                },
                quantity: String(quantity),
            });
        }

        // Get tip if set
        const tip = +($('.tip').val());
        if (tip && tip > 0) {
            totals.total += tip;
            lineItems.push({
                name: 'Tip',
                unit_amount: {
                    currency_code: 'CAD',
                    value: '0',
                },
                quantity: 1,
            });
        }

        return {
            total: totals.total,
            dozens: totals.dozens,
            tip: tip,
            items: lineItems
        };
    }

    function getTotalBreakdown(formItems) {
        let totalDozens = 0;
        let totalCost = 0;

        for (let item of formItems) {
            totalDozens += +item.dozens;
        }

        // If totalDozens is whole, we just multiply by dozen cost
        if (Number.isInteger(totalDozens)) {
            totalCost = totalDozens * dozenCost;
            // If totalDozens is not whole, the last half dozen is charged halfDozenCost
        } else {
            totalCost = (Math.floor(totalDozens) * dozenCost) + halfDozenCost;
        }

        return {
            dozens: totalDozens,
            total: totalCost,
        }
    }

    function updateTotal() {
        let formData = $('.checkout-form').serializeArray();
        let items = calculateLineItems(formData);
        $('.checkout-wrapper .total').html(`$${items.total}`);
    }

    function getDescription() {
        return `Delivery: ${$('.delivery-date').val()} - Tip: ${+$('.tip').val()} - Notes: ${$('.instructions').val()}`
    }

    paypal.Buttons({
        createOrder: function (data, actions) {
            // This function sets up the details of the transaction, including the amount and line item details.
            let formData = $('.checkout-form').serializeArray();
            let items = calculateLineItems(formData);
            let description = getDescription();
            let body = {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'CAD',
                        value: String(items.total),
                    },
                    items: items.items,
                    description: description
                }],
            };
            return actions.order.create(body);
        },
        onApprove: function (data, actions) {
            // This function captures the funds from the transaction.
            return actions.order.capture().then(function (details) {
                // Clear checkout wrapper and add confirmation messages
                $('.checkout-wrapper').html(`
                    <h3 align="center">Payment successful!</h align="center">
                    <h4 align="center">We will contact you when your cookies are being delivered.</h4>
                    <h5 align="center">Contact us via instagram or facebook for specific delivery instructions.</h5>
                `);
            });
        }
    }).render('#paypal-button-container');

    // MAIN

    // Handlers

    // Group addition
    $('.add-group').click(function () {
        addFormGroup();
    });

    // Tester function
    $('h1').click(function () {
        let formData = $('.checkout-form').serializeArray();
        let result = calculateLineItems(formData);
        let description = getDescription();
        console.log(result, description);
    });

    // If select forms are changed, update total price
    $('.checkout-form').on('change', 'select', function () {
        updateTotal();
    });

    $('.tip').change(function () {
        updateTotal();
    });

    // Set today as default delivery date
    $('.delivery-date').val(new Date().toISOString().slice(0, 10));

    // Add the first group by default
    addFormGroup();
});
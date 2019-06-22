const baseRequest = {
    apiVersion: 2,
    apiVersionMinor: 0
};

const allowedCardNetworks = ["AMEX", "DISCOVER", "JCB", "MASTERCARD", "VISA"]; //type of bank card we can use

const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"]; //

const tokenizationSpecification = { // Cambiar?
    type: 'PAYMENT_GATEWAY',
    parameters: {
        'gateway': 'stripe',
        'stripe:version': '2019-05-16',
        'stripe:publishableKey': STRIPE_KEY
    }
};

const baseCardPaymentMethod = {
    type: 'CARD',
    parameters: {
        allowedAuthMethods: allowedCardAuthMethods,
        allowedCardNetworks: allowedCardNetworks
    }
};

const cardPaymentMethod = Object.assign(
    {tokenizationSpecification: tokenizationSpecification},
    baseCardPaymentMethod
);

let paymentsClient = null;


function getGoogleIsReadyToPayRequest() {
    const isReadyToPayRequest = Object.assign({}, baseRequest);
    isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];

    return isReadyToPayRequest;
}

function getGooglePaymentDataRequest() {
    const paymentDataRequest = Object.assign({}, baseRequest);
    paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
    paymentDataRequest.transactionInfo = getGoogleTransactionInfo();
    paymentDataRequest.merchantInfo = {
        // See {@link https://developers.google.com/pay/api/web/guides/test-and-deploy/integration-checklist|Integration checklist}
        merchantId: GOOGLE_PAY_MERCHANT_ID,
        merchantName: 'World Tournaments S.L.'
    };
    console.log(paymentDataRequest);
    return paymentDataRequest;
}

function getGooglePaymentsClient() {
    const paymentsClient = new
    google.payments.api.PaymentsClient({environment: 'PRODUCTION'});
    return paymentsClient;
}

function onGooglePayLoaded() {
    const paymentsClient = getGooglePaymentsClient();
    paymentsClient.isReadyToPay( getGoogleIsReadyToPayRequest()).then( function(response) {
        if (response.result) {
            addGooglePayButton();//cambiar!
            // @todo prefetch payment data to improve performance after confirming site functionality
            prefetchGooglePaymentData();
        }
    }).catch(function(err) {
        // show error in developer console for debugging
        console.error(err);
    });
}

function addGooglePayButton() {
    const paymentsClient = getGooglePaymentsClient();
    const button = paymentsClient.createButton({
        onClick: onGooglePaymentButtonClicked,
        buttonType: 'short',
        buttonColor: 'black'});
    document.getElementById('googlepay-button-container').appendChild(button);
}

function getGoogleTransactionInfo() {
    return {
        currencyCode: 'EUR',
        totalPriceStatus: 'FINAL',
        totalPrice: GOOGLE_PAY_QUANTITY // set to cart total
    };
}

function prefetchGooglePaymentData() {
    const paymentDataRequest = getGooglePaymentDataRequest();
    // transactionInfo must be set but does not affect cache
    paymentDataRequest.transactionInfo = {
        totalPriceStatus: 'NOT_CURRENTLY_KNOWN',
        currencyCode: 'EUR'
    };
    const paymentsClient = getGooglePaymentsClient();
    paymentsClient.prefetchPaymentData(paymentDataRequest);
}

function onGooglePaymentButtonClicked() {
    const paymentDataRequest = getGooglePaymentDataRequest();
    paymentDataRequest.transactionInfo = getGoogleTransactionInfo();

    const paymentsClient = getGooglePaymentsClient();
    paymentsClient.loadPaymentData(paymentDataRequest)
        .then(function(paymentData) {
            // handle the response
            console.log(paymentData);
            processPayment(paymentData);
        })
        .catch(function(err) {
            // show error in developer console for debugging
            console.error(err);
        });
}

function processPayment(paymentData) {
    // show returned data in developer console for debugging
    // @todo pass payment token to your gateway to process payment
    paymentToken = paymentData.paymentMethodData.tokenizationData.token;

    $.ajax({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        url: GOOGLE_PAY_URL,
        data: {
            token: GOOGLE_PAY_TOKEN,
            paytoken: paymentToken
        },
        type: 'POST',
        dataType: 'json',
        success: function(data) {
            window.location.href = data.url;
        },
    });
}

/*
* APPLE PAY
*/

/*
* Step 1: Set up Stripe Elements
* Elements is available as part of Stripe.js.
* Include this in your page and create a container that will be used for the paymentRequestButton Element:
*/
//
// var stripe = Stripe( HOSTNAME );
//
// /*
// * Step 2: Create the PaymentRequest instance
// * Create an instance of stripe.paymentRequest with all required options.
// */
// var paymentRequest = stripe.paymentRequest({
//     country: COUNTRY,
//     currency: 'EUR',
//     total: {
//         label: 'APPLE PAY',
//         amount: GOOGLE_PAY_QUANTITY,
//     },
//     requestPayerName: true,
//     requestPayerEmail: true,
// });
//
// /*
// * Step 3: Create and mount the paymentRequestButton Element
// * Create the paymentRequestButton Element and check to make sure that your customer has an active payment method using canMakePayment().
// * If they do, mount the Element to the container to display the Payment Request Button.
// * If they do not, you cannot mount the Element, and we encourage you to show a traditional checkout form instead.
// */
//
// var elements = stripe.elements();
// var prButton = elements.create('paymentRequestButton', {
//     paymentRequest: paymentRequest,
// });
//
// // Check the availability of the Payment Request API first.
// paymentRequest.canMakePayment().then(function(result) {
//     if (result) {
//         prButton.mount('#payment-request-button');
//     } else {
//         document.getElementById('payment-request-button').style.display = 'none';
//     }
// });
//
// /*
// * Step 4: Complete the payment using the emitted token or source
// * Charges API PaymentIntents API
// * Finally, listen to the token event to receive a Token object.
// * Send this token to your server to charge it and complete the payment.
// */
// paymentRequest.on('token', function(ev) {
//     // Send the token to your server to charge it!
//     fetch('/charges', {
//         method: 'POST',
//         body: JSON.stringify({token: ev.token.id}),
//         headers: {'content-type': 'application/json'},
//     })
//         .then(function(response) {
//             if (response.ok) {
//                 // Report to the browser that the payment was successful, prompting
//                 // it to close the browser payment interface.
//                 ev.complete('success');
//             } else {
//                 // Report to the browser that the payment failed, prompting it to
//                 // re-show the payment interface, or show an error message and close
//                 // the payment interface.
//                 ev.complete('fail');
//             }
//         });
// });
//
// /* **************************************** */
//
// /*
// * Collecting shipping information
// * To collect shipping information, begin by including requestShipping: true when creating the payment request.
// * You may also provide an array of shippingOptions at this point, if your shipping options do not depend on the customer’s address.
// */
//
// // var paymentRequest = stripe.paymentRequest({
// //     country: 'US',
// //     currency: 'usd',
// //     total: {
// //         label: 'Demo total',
// //         amount: 1000,
// //     },
// //
// //     requestShipping: true,
// //     // `shippingOptions` is optional at this point:
// //     shippingOptions: [
// //         // The first shipping option in this list appears as the default
// //         // option in the browser payment interface.
// //         {
// //             id: 'free-shipping',
// //             label: 'Free shipping',
// //             detail: 'Arrives in 5 to 7 days',
// //             amount: 0,
// //         },
// //     ],
// // });
//
//
// /*
// * Next, listen to the shippingaddresschange event to detect when a customer selects a shipping address.
// * Use the address to fetch valid shipping options from your server, update the total, or perform other business logic.
// * The address data on the shippingaddresschange event may be anynomized by the browser to not reveal sensitive information that is not necessary for shipping cost calculation.
// *
// * Note that valid shippingOptions must be supplied at this point for the customer to proceed in the flow.
// */
// paymentRequest.on('shippingaddresschange', function(ev) {
//     if (ev.shippingAddress.country !== 'US') {
//         ev.updateWith({
//             status: 'invalid_shipping_address'
//         });
//     } else {
//         // Perform server-side request to fetch shipping options
//         fetch('/calculateShipping', {
//             data: JSON.stringify({
//                 shippingAddress: ev.shippingAddress
//             })
//         }).then(function(response) {
//             return response.json();
//         }).then(function(result) {
//             ev.updateWith({
//                 status: 'success',
//                 shippingOptions: result.supportedShippingOptions,
//             });
//         });
//     }
// });
//
// /*
// * Styling the Payment Request Button Element
// * Use the following parameters to customize the Element:
// */
// elements.create('paymentRequestButton', {
//     paymentRequest: paymentRequest,
//     style: {
//         paymentRequestButton: {
//             type: 'buy',
//             theme: 'light',
//             height: '64px',
//         },
//         // paymentRequestButton: {
//         //     type: 'default' | 'donate' | 'buy', // default: 'default'
//         //     theme: 'dark' | 'light' | 'light-outline', // default: 'dark'
//         //     height: '64px', // default: '40px', the width is always '100%'
//         // },
//     },
// });

/*
if (window.ApplePaySession) {
    var merchantIdentifier = '';

    var promise = ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
    promise.then(function (canMakePayments) {
        if (canMakePayments){

        }
        // Display Apple Pay button here.
    });
}*/

/*
*
* define('PRODUCTION_CURRENCYCODE', 'GBP');	/
define('PRODUCTION_COUNTRYCODE', 'GB');
define('PRODUCTION_DISPLAYNAME', 'My Test Shop');*/

if (window.ApplePaySession) {
    var merchantIdentifier = '0123456789';
    var promise = ApplePaySession.canMakePaymentsWithActiveCard(merchantIdentifier);
    promise.then(function (canMakePayments) {
        document.getElementById("applePay").style.display = "block";

        if (canMakePayments) {
            document.getElementById("applePay").style.display = "block";
            logit('hi, I can do ApplePay');
        } else {
            document.getElementById("got_notactive").style.display = "block";
            logit('ApplePay is possible on this browser, but not currently activated.');
        }
    });
} else {
    logit('ApplePay is not available on this browser');
    document.getElementById("notgot").style.display = "block";
}
document.getElementById("applePay").onclick = function(evt) {
    var runningAmount 	= 42;
    var runningPP		= 0; getShippingCosts('domestic_std', true);
    var runningTotal	= function() { return runningAmount + runningPP; }
    var shippingOption = "";

    var subTotalDescr	= "Test Goodies";

    function getShippingOptions(shippingCountry){
        logit('getShippingOptions: ' + shippingCountry );
        if( shippingCountry.toUpperCase() == "34" ) {
            shippingOption = [{label: 'Standard Shipping', amount: getShippingCosts('domestic_std', true), detail: '3-5 days', identifier: 'domestic_std'},{label: 'Expedited Shipping', amount: getShippingCosts('domestic_exp', false), detail: '1-3 days', identifier: 'domestic_exp'}];
        } else {
            shippingOption = [{label: 'International Shipping', amount: getShippingCosts('international', true), detail: '5-10 days', identifier: 'international'}];
        }

    }

    function getShippingCosts(shippingIdentifier, updateRunningPP ){

        var shippingCost = 0;

        switch(shippingIdentifier) {
            case 'domestic_std':
                shippingCost = 3;
                break;
            case 'domestic_exp':
                shippingCost = 6;
                break;
            case 'international':
                shippingCost = 9;
                break;
            default:
                shippingCost = 11;
        }

        if (updateRunningPP == true) {
            runningPP = shippingCost;
        }

        logit('getShippingCosts: ' + shippingIdentifier + " - " + shippingCost +"|"+ runningPP );

        return shippingCost;

    }
    var paymentRequest = {
        currencyCode: 'EUR',
        countryCode: 'ESP',
        requiredShippingContactFields: ['postalAddress'],
        //requiredShippingContactFields: ['postalAddress','email', 'name', 'phone'],
        //requiredBillingContactFields: ['postalAddress','email', 'name', 'phone'],
        lineItems: [{label: subTotalDescr, amount: runningAmount }, {label: 'P&P', amount: runningPP }],
        total: {
            label: 'Merchan name example',
            amount: runningTotal()
        },
        supportedNetworks: ['amex', 'masterCard', 'jcb', 'discover', 'visa' ],
        merchantCapabilities: [ 'supports3DS', 'supportsEMV', 'supportsCredit', 'supportsDebit' ]
    };

    var session = new ApplePaySession(1, paymentRequest);

    // Merchant Validation
    session.onvalidatemerchant = function (event) {
        logit(event);
        var promise = performValidation(event.validationURL);
        promise.then(function (merchantSession) {
            session.completeMerchantValidation(merchantSession);
        });
    }

    function performValidation(valURL) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                var data = JSON.parnotgotse(this.responseText);
                logit(data);
                resolve(data);
            };
            xhr.onerror = reject;
            xhr.open('GET', 'apple_pay_comm.php?u=' + valURL);
            xhr.send();
        });
    }
    session.onshippingcontactselected = function(event) {
        logit('starting session.onshippingcontactselected');
        logit('NB: At this stage, apple only reveals the Country, Locality and 4 characters of the PostCode to protect the privacy of what is only a *prospective* customer at this point. This is enough for you to determine shipping costs, but not the full address of the customer.');
        logit(event);

        getShippingOptions( event.shippingContact.countryCode );

        var status = ApplePaySession.STATUS_SUCCESS;
        var newShippingMethods = shippingOption;
        var newTotal = { type: 'final', label: 'Merchant Name Example', amount: runningTotal() };
        var newLineItems =[{type: 'final',label: subTotalDescr, amount: runningAmount }, {type: 'final',label: 'P&P', amount: runningPP }];

        session.completeShippingContactSelection(status, newShippingMethods, newTotal, newLineItems );


    }

    session.onshippingmethodselected = function(event) {
        logit('starting session.onshippingmethodselected');
        logit(event);

        getShippingCosts( event.shippingMethod.identifier, true );

        var status = ApplePaySession.STATUS_SUCCESS;
        var newTotal = { type: 'final', label: 'Merchant Name Example', amount: runningTotal() };
        var newLineItems =[{type: 'final',label: subTotalDescr, amount: runningAmount }, {type: 'final',label: 'P&P', amount: runningPP }];

        session.completeShippingMethodSelection(status, newTotal, newLineItems );


    }

    session.onpaymentmethodselected = function(event) {
        logit('starting session.onpaymentmethodselected');
        logit(event);

        var newTotal = { type: 'final', label: 'Merchant Name Example', amount: runningTotal() };
        var newLineItems =[{type: 'final',label: subTotalDescr, amount: runningAmount }, {type: 'final',label: 'P&P', amount: runningPP }];

        session.completePaymentMethodSelection( newTotal, newLineItems );


    }

    session.onpaymentauthorized = function (event) {
        logit('starting session.onpaymentauthorized');
        logit('NB: This is the first stage when you get the *full shipping address* of the customer, in the event.payment.shippingContact object');
        logit(event);
        var promise = sendPaymentToken(event.payment.token);
        promise.then(function (success) {
            var status;
            if (success){
                status = ApplePaySession.STATUS_SUCCESS;
                document.getElementById("applePay").style.display = "none";
                document.getElementById("success").style.display = "block";
            } else {
                status = ApplePaySession.STATUS_FAILURE;
            }

            logit( "result of sendPaymentToken() function =  " + success );
            session.completePayment(status);
        });
    }
    function sendPaymentToken(paymentToken) {
        return new Promise(function(resolve, reject) {
            logit('starting function sendPaymentToken()');
            logit(paymentToken);

            logit("this is where you would pass the payment token to your third-party payment provider to use the token to charge the card. Only if your provider tells you the payment was successful should you return a resolve(true) here. Otherwise reject;");
            logit("defaulting to resolve(true) here, just to show what a successfully completed transaction flow looks like");
            if ( debug == true )
                resolve(true);
            else
                reject;
        });
    }

    session.oncancel = function(event) {
        logit('starting session.cancel');
        logit(event);
    }

    session.begin();
};

function logit( data ){
        console.log(data);
};
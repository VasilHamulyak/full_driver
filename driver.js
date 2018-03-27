let promoCode = ['BH460', 'BH475', 'BHTCR', 'BHSIGNUP', 'BH490'];
const resultArrayForAllCode = [];
const formInputs = document.querySelectorAll('#aspnetForm input');
let cartOriginalPrice = 0;
let checkoutOriginalPrice = 0;


Promise.each = async (arr, fn) => {
    for (let item of arr) await fn(item);
}
/************************************** Cart page logic ********************************************/
/* this function take original price on shopping cart page */
const getOriginalPriceCart = () => {
    const originalPrice = document.querySelector('#ctl00_GlobalBodyPlaceHolder_ucTotals_lblNonFinalSubTotal').textContent;
    return Number(originalPrice.match(/\d+\.\d+/).pop());
}
/* this function checks the presence of the applied code on the cart page */
const cartGetExistingCode = () => {
    const cartExistingCode = document.querySelector('.promo-disclosure > span');
    if (cartExistingCode) {
        const set = new Set(promoCode);
        const existingCode = cartExistingCode.textContent.match(/Promo Code:(.*?)\,/)[1].trim();
        set.add(existingCode);
        promoCode = [...set];
    }
    return cartRemoveCode()
         .then(response => getPriceWithDiscountCart(response))
         .then(price => cartOriginalPrice = price)
}

/* this function set the parameters for the object URLSearchParams on the cart page */
const setParams = form => {
    const params = new URLSearchParams();
    [...form].forEach(element => params.set(element.name, element.value));
    return params;
}
/* this function apply the code on the cart page */
const cartApplyCode = code => {
    const params = setParams(formInputs);
    params.set('ctl00$GlobalBodyPlaceHolder$ucPromotionCode$txtCode', code)
    params.set('ctl00$GlobalBodyPlaceHolder$ucPromotionCode$ibtnApplyCode.x', 35)
    params.set('ctl00$GlobalBodyPlaceHolder$ucPromotionCode$ibtnApplyCode.y', 5)
    return fetch('http://www.brylanehome.com/shopping_bag/ShoppingBag.aspx', {
        credentials: 'include',
        method: 'POST',
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Content-type": "application/x-www-form-urlencoded"
        },
        body: params
    })
        .then(response => {
            return response.text();
        })
        .catch(error => {
            console.log('Request failed', error);
        });
};
/* this function remove the code on the cart page */
const cartRemoveCode = () => {
    const params = setParams(formInputs);
    params.set('__EVENTTARGET', 'ctl00$GlobalBodyPlaceHolder$ucDisplayPromotionCode$promoCodeRpt$ctl00$lbtnRemovePromo')
    params.set('ctl00$GlobalBodyPlaceHolder$ucPromotionCode$txtCode', '')
    return fetch('http://www.brylanehome.com/Shopping_bag/ShoppingBag.aspx', {
        credentials: 'include',
        method: 'POST',
        headers: {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
            "Content-type": "application/x-www-form-urlencoded"
        },
        body: params
    })
        .then(response => {
            return response.text();
        })
        .catch(error => {
            console.log('Request failed', error);
        });
};
/* this function get price after applied code on the cart page */
const getPriceWithDiscountCart = response => {
    const parser = new DOMParser();
    const document = parser.parseFromString(response, "text/html");
    const priceWithDiscount = document.getElementById('ctl00_GlobalBodyPlaceHolder_ucTotals_lblNonFinalSubTotal').textContent;
    return Number(priceWithDiscount.match(/\d+\.\d+/).pop());
}
/********************************************** Checkout page logic ********************************************/
/* this function take original price on checkout page */
const getOriginalPriceCheckout = () => {
    const checkoutOriginPrice = document.querySelector('#ctl00_BodyContent_OrderTotal_OrderTotal > div > div.AddTotal').textContent;
    return Number(checkoutOriginPrice.match(/\d+\.\d+/)[0]);
}
/* this function get price after applied code */
const getPriceWithDiscountCheckout = () => {
    return fetch('https://www.brylanehome.com/Checkout/Checkout.aspx', {
        credentials: 'include',
        method: 'GET'
    }).then(response => response.text()
        .then(response => {
            const parser = new DOMParser();
            const document = parser.parseFromString(response, "text/html");
            const priceWithDiscount = document.querySelector('#ctl00_BodyContent_OrderTotal_OrderTotal > div > div.AddTotal').textContent;
            return Number(priceWithDiscount.match(/\d+\.\d+/g)[0]);
        })
    )
    .catch(error => {
        console.log('Request failed', error);
    });
}

/* this function check the presence of the applied code on the checkout page */
const checkoutGetExistingCode = () => {
    const checkoutExistingCode = document.querySelector('.code-applied').textContent;
    if(checkoutExistingCode) {
        const set = new Set(promoCode);
        set.add(checkoutExistingCode);
        promoCode = [...set];
    }
    return checkoutRemoveCode(checkoutExistingCode)
        .then(() => getPriceWithDiscountCheckout()
            .then(price => checkoutOriginalPrice = price));
}
/* this function set verification token */
const setVerificationToken = () => {
    const requestVarificationInput = document.querySelector("[name='__RequestVerificationInput']");
    return requestVarificationInput.value;
}
/* this function apply code on checkout page */
const checkoutApplyCode = code => {
    const params = new URLSearchParams();
    params.set("InputData", JSON.stringify({"PromotionCode": code}));
    return fetch('https://www.brylanehome.com/checkout/processcheckout.ashx?Action=ApplyPromotion', {
        credentials: 'include',
        method: 'POST',
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
            "X-Request-Verification-Token": setVerificationToken(),
            "X-Requested-With": "XMLHttpRequest"
        },
        body: params
    })
        .then(response => {
            return response.json();
        })
        .catch(error => {
            console.log('Request failed', error);
        });
};
/* this function remove code on checkout page */
const checkoutRemoveCode = code => {
    const params = new URLSearchParams();
    params.set("InputData", JSON.stringify({"PromotionCode": code}));
    return fetch('https://www.brylanehome.com/checkout/processcheckout.ashx?Action=RemovePromotion', {
        credentials: 'include',
        method: 'POST',
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
            "X-Request-Verification-Token": setVerificationToken(),
            "X-Requested-With": "XMLHttpRequest"
        },
        body: params
    })
        .then(response => {
            return response.json();
        })
        .catch(error => {
            console.log('Request failed', error);
        });
};
const definePage = () => {
    if (window.location.href.includes('Checkout.aspx')) {
        checkoutOriginalPrice = getOriginalPriceCheckout();
        return checkoutGetExistingCode()
                .then(() => {
                    Promise.each(promoCode, code => {
                        return checkoutApplyCode(code)
                            .then(() => getPriceWithDiscountCheckout()
                            .then(price => {
                                var discount = checkoutOriginalPrice - price;
                                resultArrayForAllCode.push({code, checkoutOriginalPrice, discount});
                                console.log(code, checkoutOriginalPrice, discount);
                                return checkoutRemoveCode(code)
                                    .then(() => Promise.resolve());
                            }))
                    }).then(() => {
                       resultArrayForAllCode.sort((a, b) => a.discount < b.discount);
                       checkoutApplyCode(resultArrayForAllCode[0].code);
                       console.log('Done!'); 
                    });
                })
    } else {
        cartOriginalPrice = getOriginalPriceCart();
         return cartGetExistingCode()
            .then(() => {
                Promise.each(promoCode, code => {
                    return cartApplyCode(code)
                        .then(response => getPriceWithDiscountCart(response))
                        .then(price => {            
                            const discount = cartOriginalPrice - price;
                            resultArrayForAllCode.push({ code, cartOriginalPrice, discount });
                            console.log(code, cartOriginalPrice, discount);
                            return cartRemoveCode()
                                 .then(() => Promise.resolve());
                        });
                })
                    .then(() => {
                        resultArrayForAllCode.sort((a, b) => a.discount < b.discount);
                        cartApplyCode(resultArrayForAllCode[0].code);
                        console.log('Done!')
                    });;
            });
    }
}
definePage();



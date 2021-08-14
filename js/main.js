// variables and constants
const productList = document.querySelector('#products__list');
const modalTriggers = document.querySelectorAll('.popup-trigger')
const bodyBlackout = document.querySelector('.body-blackout')
const popup = document.querySelector(".popup-modal");
const popupMobile = document.querySelector(".mobile-modal");
const buttonCart = document.querySelector('#cart-icon');
const buttonCartMobile = document.querySelector('#cart-icon-mobile');
var burgerMenu = document.getElementById('hamburger_icon');
var overlay = document.getElementById('mobile__menu');
const data = {};

window.addEventListener('DOMContentLoaded', () => {
    burgerMenu.addEventListener('click',function(){
        this.classList.toggle("close");
        overlay.classList.toggle("overlay");
    });


    data.cart = getLocalStorageItem("cart");

    if (!data.cart){
        buttonCart.disabled = true;
    } 
    refreshBadge();
    loadProducts();

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
          const { popupTrigger } = trigger.dataset
          const popupModal = document.querySelector(`[data-popup-modal="${popupTrigger}"]`)
      
          popupModal.classList.add('is--visible')
          bodyBlackout.classList.add('is-blacked-out')
                    
          bodyBlackout.addEventListener('click', () => {
            //close modal
            popupModal.classList.remove('is--visible')
            bodyBlackout.classList.remove('is-blacked-out')
          })
        })
    })

    // console.log(data)
    // console.log(data.cart)
    // console.log(data.cart.length)

    document.getElementById("cart-icon").addEventListener("click", showCart);
    document.getElementById("cart-icon-mobile").addEventListener("click", showCart);
    
});

function refreshBadge(){
    document.querySelector("#cart-icon .badge-cart").textContent = data.cart.length ? Number(data.cart.length) : "0";
    document.querySelector("#cart-icon-mobile .badge-cart").textContent = data.cart.length ? Number(data.cart.length) : "0";
}

// load product items content from JSON file
function loadProducts(){
    fetch('https://my-json-server.typicode.com/ivan-ilic/msg-typicode/products')
    .then(response => response.json())
    .then(data =>{
        console.log(data);
        printProducts(data);
        bindAddToCartButton();
    })
    .catch(error => {
        alert(`An error occurred` + error);
        console.warn("An error occurred" + error);
    })
}

function printProducts(products){
    data.products = products;
    let output = '';
    products.forEach(product => {
        output += `
            <article class="product col-lg-4 col-md-12 d-flex flex-column align-items-center justify-content-center p-3 border border-dark" data-id="${product.id}">
                <div class="product__icon d-flex align-items-center justify-content-center p-5">
                    <img src="${product.imageUrl}" alt="${product.name}" class="img-fluid">
                </div>
                <div class="product__details">
                    <div class="product__name">
                        <h3>
                            ${product.name}
                        </h3>
                    </div>
                    <div class="product__price">
                        <p>
                            $${product.price}
                        </p>
                    </div>
                    <div class="addToCart">
                        <a href="#!"  class="btn btn-dark add-to-cart-btn add-to-cart" data-id="${product.id}" data-price="${product.price}">
                            Add to Cart
                        </a>
                    </div>
                </div>
            </article>
        `;
    });
    productList.innerHTML = output;
}

//LOCAL STORAGE
function getLocalStorageItem(name){
    let item = localStorage.getItem(name);
    if(item){
        parsedItem = JSON.parse(item);
        if(parsedItem.length > 0){
            return parsedItem;
        }
    }
    return false;
}
   
function getCartProductIndexByID(id){
    let productIndex = -1;
    data.cart.find((el,ind)=>{
        if(el.id == id){
            productIndex = ind;
            return true;
        }
        return false;
    });
    return productIndex;
}

function setCartProduct(productID, quantity, add = false, priceProd){
    if(data.cart){
        let productIndex = getCartProductIndexByID(productID);
        if(productIndex > -1){
            let newQuantity = quantity;
            if(add){
                newQuantity += data.cart[productIndex].quantity;
            }
            data.cart[productIndex].quantity = newQuantity;
        }else {
            data.cart.push({"id": productID, "quantity": quantity, "priceProd": priceProd});
        }
    }else {
        data.cart = [{"id": productID, "quantity": quantity, "priceProd": priceProd}];
    }

    localStorage.setItem("cart", JSON.stringify(data.cart));

    refreshBadge();
    buttonCart.disabled = false;
    buttonCartMobile.disabled = false;
}

function removeCartProduct(productID){
    let index = getCartProductIndexByID(productID)
    let prod = data.cart[index];
    let quantity = prod.quantity;
    if(quantity > 1){
        prod.quantity--;
        localStorage.setItem("cart",JSON.stringify(data.cart));
        showCart();
    }else{
        data.cart.splice(getCartProductIndexByID(productID), 1);
        localStorage.setItem("cart",JSON.stringify(data.cart));
        
            if (popup.classList.contains("is--visible") || popupMobile.classList.contains("is--visible")) {
                popup.classList.remove('is--visible');
                popupMobile.classList.remove("is--visible")
            }
    }

    refreshBadge();
}

function bindAddToCartButton(){
    $(".add-to-cart").click(function(){
        let id = this.dataset.id;
        let priceVal = this.dataset.price;
        // console.log("Id: " + id + ",price: " + priceVal);
        setCartProduct(Number(id), 1, true, Number(priceVal));

        alert("Successfully added to cart.");
        buttonCart.disabled = false;
        buttonCartMobile.disabled = false;
        if (popup.classList.contains("is--visible") || popupMobile.classList.contains("is--visible")) {
            popup.classList.remove('is--visible');
            popupMobile.classList.remove("is--visible")
        }
    });
}

function showCartItems(htmlContent){
    let cartProds = document.querySelectorAll(".cart__products");
    for (let cart = 0; cart < cartProds.length; cart++) {
        cartProds[cart].innerHTML = htmlContent;
        
    }
}

function showCart(){
    let html = createCartContent(data.cart);

    showCartItems(html);
    showCartTotal();
    
    $(".remove-cart-item").click(function(){
        let product = this.dataset.product;
        removeCartProduct(Number(product));
        $(this).parent().parent().fadeOut(300, showCart);
    });    
}

function showCartTotal(){
    if(data.cart && data.cart.length > 0){
        let total = 0;
        $(data.cart).each(function(){
            // console.log(this)
            total += this.priceProd * this.quantity;
            console.log(total)
        });

        let totalPrices = document.querySelectorAll(".total__price");
        let html = `<div class="total__price__heading">
                        <p>Total:</p>
                    </div>
                    <div class="total__price__value">
                        ${formatPrice(total)}
                    </div>`;
        for (let t = 0; t < totalPrices.length; t++) {
            totalPrices[t].innerHTML = html;
        }
    }
}
   
function getItemByID(array, ID){
    return array.find(el => el.id == ID);
}

function createCartContent(array){
    let html = "";
        if(array && array.length > 0){
            for(i in array){
                let product = getItemByID(data.products, array[i].id);

                html += `<div class="cart__product p-2">
                            <div class="cart__product__up d-flex justify-content-between align-items-start p-2" data-product="${product.id}">
                                <div class="cart__product__image">
                                    <img src="${product.imageUrl}" alt="glasses-icon" class="img-fluid">
                                </div>
                                <div class="cart__product__remove">
                                    <a href="#!" class="remove-cart-item" data-product="${product.id}">
                                        Remove
                                    </a>
                                </div>
                            </div>
                            <div class="cart__product__details d-flex justify-content-between ">
                                <div class="details__name">
                                    <p>${product.name}</p>
                                </div>`
                       
                html += getCartItemDetails(product, i);
                html+=`</div></div>`;
            }
        }

        return html;
}

//CART ITEMS
function getCartItemDetails(product, index){
    let price = product.price * Number(data.cart[index].quantity);

    return ` <div class="details__quantity">
                (${data.cart[index].quantity})
            </div>
            <div class="details__price">
                ${formatPrice(price)}
            </div>`;
}

function formatPrice(price){
    return price.toLocaleString("en-US",{style: 'currency', currency: 'USD'});
}
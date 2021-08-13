// variables and constants
const productList = document.querySelector('#products__list');

const modalTriggers = document.querySelectorAll('.popup-trigger')
const bodyBlackout = document.querySelector('.body-blackout')
// const buttonCart = document.querySelector('#cart-icon');
const buttonCart = $('#cart-icon');
const data = {};

window.addEventListener('DOMContentLoaded', () => {
    data.cart = getLocalStorageItem("cart");
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

    $('#cart-icon').on('click', showCart);
    
});

function refreshBadge(){
    $("#cart-icon .badge-cart").text(data.cart.length ? Number(data.cart.length) : "0");
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
                        <a href="#"  class="btn btn-dark add-to-cart-btn add-to-cart" data-id="${product.id}" data-price="${product.price}">
                            Add to Cart
                        </a>
                    </div>
                </div>
            </article>
        `;
    });
    productList.innerHTML = output;
}

//SESSION STORAGE
function getLocalStorageItem(name){
    let item = sessionStorage.getItem(name);
    if(item){
        parsedItem = JSON.parse(item);
        if(parsedItem.length > 0){
            return parsedItem;
        }
    }
    return false;
}

function removeLocalStorageItem(name){
    data[name] = [];
    sessionStorage.removeItem(name);
    refreshBadge();
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

    sessionStorage.setItem("cart", JSON.stringify(data.cart));
    refreshBadge();
    buttonCart.prop('disabled', false);
}

function removeCartProduct(productID){
    data.cart.splice(getCartProductIndexByID(productID), 1);
    sessionStorage.setItem("cart",JSON.stringify(data.cart));
    refreshBadge();
}

function bindAddToCartButton(){
    $(".add-to-cart").click(function(){
    setCartProduct(Number($(this).data("id")), 1, true, Number($(this).data("price")));

    alert("Successfully added to cart.");
    buttonCart.prop('disabled', false);
    });
}

function showCartItems(htmlContent){
    $("#cart__products").html(htmlContent);
}

function showCart(){
    let html = createSidebarContent(data.cart, "cart");

    showCartItems(html);
    showCartTotal();
    
    $(".remove-cart-item").click(function(){
        removeCartProduct(Number($(this).data("product-id")));
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

        $("#total__price").html(`<div id="total__price__heading">
                                        <p>Total:</p>
                                    </div>
                                    <div id="total__price__value">
                                        ${formatPrice(total)}
                                    </div>`);
    
    }
}
   
function getItemByID(array, ID){
    return array.find(el => el.id == ID);
}

function createSidebarContent(array, type){
    let html = "";

    let cart = type == "cart";
        if(array && array.length > 0){
            for(i in array){
                let product = cart ? getItemByID(data.products, array[i].id) : getItemByID(data.products, array[i]);

                html += `<div class="cart__product p-2">
                            <div class="cart__product__up d-flex justify-content-between align-items-start p-2" data-product-id="${product.id}">
                                <div class="cart__product__image">
                                    <img src="${product.imageUrl}" alt="glasses-icon" class="img-fluid">
                                </div>
                                <div class="cart__product__remove">
                                    <a href="#" class="remove-cart-item" data-product-id="${product.id}">
                                        Remove
                                    </a>
                                </div>
                            </div>
                            <div class="cart__product__details d-flex justify-content-between ">
                                <div class="details__name">
                                    <p>${product.name}</p>
                                </div>`
                               
                                if(cart){
                                    html += getSidebarCartItemControls(product, i);
                                }

                html+=`</div></div>`;
            }
        }

        return html;
}

//CART ITEMS
function getSidebarCartItemControls(product, index){
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
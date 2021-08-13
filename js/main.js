// variables and constants
const productList = document.querySelector('#products__list');

const modalTriggers = document.querySelectorAll('.popup-trigger')
const bodyBlackout = document.querySelector('.body-blackout')

window.addEventListener('DOMContentLoaded', () => {
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
      
});


// load product items content from JSON file
function loadProducts(){
    fetch('https://my-json-server.typicode.com/ivan-ilic/msg-typicode/products')
    .then(response => response.json())
    .then(data =>{
        // console.log(data);
        printProducts(data);
    })
    .catch(error => {
        alert(`An error occurred` + error);
        console.warn("An error occurred" + error);
    })
}
function printProducts(products){
    // console.log(products);
    let output = '';
    products.forEach(product => {
        output += `
            <article class="product col-lg-4 col-md-12 d-flex flex-column align-items-center justify-content-center p-3 border border-dark">
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
                        <a href="#" class="btn btn-dark add-to-cart-btn" data-id="${product.id}">
                            Add to Cart
                        </a>
                    </div>
                </div>
            </article>
        `;
    });
    productList.innerHTML = output;
}





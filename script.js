let products = [];
let cartItems = [];
const CARTITEMCLASS = '.cart__items';

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function createLoading() {
  const loading = document.createElement('span');
  loading.className = 'loading';
  loading.innerText = 'Carregando...';
  document.body.appendChild(loading);
}

function getSkufromCart(element) {
  const idxSku = element.innerText.indexOf(' | NAME');
  const sku = element.innerText.substring(5, idxSku);
  return sku;
}

function setTotalCart(total) {
  document.querySelector('.total-price').innerText = total;
}

function setCartItemJson(item) {
  localStorage.setItem('cartItens', JSON.stringify(item));
}

function calcTotalCart() {
  let sumTotal = 0;
  const CartElement = document.querySelector(CARTITEMCLASS).children;
  for (let i = 0; i < CartElement.length; i += 1) {
    const idxPrice = CartElement[i].innerText.indexOf('PRICE');
    const vlPrice = CartElement[i].innerText.substring(idxPrice + 8, CartElement[i].length);
    sumTotal += parseFloat(vlPrice);
  }
  setTotalCart(sumTotal);
}

function emptyCartItems() {
  document.querySelector(CARTITEMCLASS).textContent = '';
  cartItems = [];
  setCartItemJson(cartItems);
  calcTotalCart();
 }

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function cartItemClickListener(event) {
  const CartElement = document.querySelector(CARTITEMCLASS);
  const cod = getSkufromCart(event.target);
  cartItems = cartItems.filter(function (element) {
      return element.sku !== cod;
  });
  setCartItemJson(cartItems);
  CartElement.removeChild(event.target);
  calcTotalCart();
}

function createCartItemElement({ sku, name, salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  cartItems.push({ sku, name, salePrice });
  setCartItemJson(cartItems);
  return li;
}

function getListCartItens() { 
  const cartItens = JSON.parse(localStorage.getItem('cartItens'));
  if (cartItens !== null) {
    cartItens.forEach((element) => {
      document.querySelector(CARTITEMCLASS).appendChild(createCartItemElement(element));
    });
    calcTotalCart();
  }
}

function addApiCart(sku) {
  createLoading();
  const request = new XMLHttpRequest();
  request.open('GET', `https://api.mercadolibre.com/items/${sku}`, true);
  request.onreadystatechange = function () {
    if ((request.readyState === 4) && (request.status === 200) && (request.responseText)) {
      document.getElementsByClassName('loading')[0].remove();
    }
  };
  request.send();
}

function filterUnityToProducts(sku) {
  const filterItem = products.results.filter(function (a) {
    return a.id === sku;
  });

  const product = { 
    sku: filterItem[0].id, 
    name: filterItem[0].title, 
    salePrice: filterItem[0].price, 
  };
  return product;
}

function addCartItemClickListener(event) {
  const sku = getSkuFromProductItem(event.target.parentNode);
  addApiCart(sku);
  const product = filterUnityToProducts(sku);
  document.querySelector(CARTITEMCLASS).appendChild(createCartItemElement(product));
  calcTotalCart();
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  
  if (className === 'item__add') {
    e.addEventListener('click', addCartItemClickListener);
  }
  return e;
}

function createProductItemElement({ sku, name, image }) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function setListProducts(response) {
  products = JSON.parse(response);
  const secItems = document.querySelector('.items');
 
  products.results.forEach((element) => {
     const unity = { 
       sku: element.id, 
       name: element.title, 
       image: element.thumbnail,
       salePrice: element.price, 
     }; 
     secItems.appendChild(createProductItemElement(unity));
  });
}

function getListProducts(query) {
  createLoading();  
  const request = new XMLHttpRequest();
  request.open('GET', `https://api.mercadolibre.com/sites/MLB/search?q=${query}`, true);
  request.onreadystatechange = function () {
    if ((request.readyState === 4) && (request.status === 200) && (request.responseText)) {
      document.getElementsByClassName('loading')[0].remove();
      setListProducts(request.responseText);
    }
  };
  request.send();
}

window.onload = () => { 
  getListProducts('computador');
  getListCartItens();
  const emptyCart = document.querySelector('.empty-cart');
  emptyCart.addEventListener('click', emptyCartItems);
};

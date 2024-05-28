"use strict";

import { 
    showErrorMessage
} from './utils.js';

import { 
    COUNT_SHOW_CARDS_CLICK, 
    ERROR_SERVER,
    NO_PRODUCTS_IN_THIS_CATEGORY
} from './constants.js';

const cards = document.querySelector('.cards');
const btnShowCards = document.querySelector('.show-cards');
let shownCards = COUNT_SHOW_CARDS_CLICK;
let countClickBtnShowCards = 1;
let productsData = [];

// Завантаження продуктів з localStorage при завантаженні сторінки
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromLocalStorage();
    getProducts();
    setImagesFromLocalStorage();
    
});

btnShowCards.addEventListener('click', sliceArrCards);
cards.addEventListener('click', handleCardClick);

async function getProducts() {
    try {
        if (!productsData.length) {
            const res = await fetch('../data/products.json');
            if (!res.ok) {
                throw new Error(res.statusText);
            }
            productsData = await res.json();

            // Зберігаємо продукти в localStorage, якщо їх немає
            productsData.forEach(product => {
                if (!localStorage.getItem(`product_${product.id}`)) {
                    localStorage.setItem(`product_${product.id}`, JSON.stringify(product));
                }
            });
        }

        if ((productsData.length > COUNT_SHOW_CARDS_CLICK) && 
            btnShowCards.classList.contains('none')) {
            btnShowCards.classList.remove('none');
        }

        renderStartPage(productsData);

    } catch (err) {
        showErrorMessage(ERROR_SERVER);
        console.log(err.message);
    }
}

function renderStartPage(data) {
    if (!data || !data.length) {
        showErrorMessage(NO_PRODUCTS_IN_THIS_CATEGORY);
        return;
    }

    const arrCards = data.slice(0, COUNT_SHOW_CARDS_CLICK);
    createCards(arrCards);
}

function sliceArrCards() {
    if (shownCards >= productsData.length) return;

    countClickBtnShowCards++;
    const countShowCards = COUNT_SHOW_CARDS_CLICK * countClickBtnShowCards;

    const arrCards = productsData.slice(shownCards, countShowCards);
    createCards(arrCards);
    shownCards = cards.children.length;

    if (shownCards >= productsData.length) {
        btnShowCards.classList.add('none');
    }
}

function handleCardClick(event) {
    if (event.target.closest('.card__delete')) {
        const card = event.target.closest('.card');
        const id = card.dataset.productId;
        handleDeleteButtonClick(id);
    } else if (event.target.closest('.card__edit')) {
        handleEditButtonClick(event);
    }
}

function handleDeleteButtonClick(productId) {
    // Remove the product from productsData
    const deletedProduct = productsData.find(product => product.id === productId);
    productsData = productsData.filter(product => product.id !== productId);

    // Remove the product from localStorage
    localStorage.removeItem(`product_${productId}`);

    // Remove the product card from the DOM
    const card = document.querySelector(`.card[data-product-id="${productId}"]`);
    if (card) {
        card.remove();
    }
}

function handleEditButtonClick(event) {
    const targetButton = event.target.closest('.card__edit');
    if (!targetButton) return;

    // Отримуємо ID продукту
    productId = targetButton.dataset.productId;

    // Показуємо модальне вікно
    modal.style.display = 'block';

    // Отримуємо продукт та заповнюємо форму
    const product = getProductById(productId);
    fillEditForm(product);
}

function createCards(data) {
    data.forEach(card => {
        const { id, img, title, price, discount, category, expiry_date, manufacturer, composition } = card;
        const priceDiscount = price - ((price * discount) / 100);
        const cardItem = 
            `
                <div class="card" data-product-id="${id}">
                    <div class="card__top">
                        <a href="/card.html?id=${id}" class="card__image">
                            <img
                                src="${img}"   <!-- Перевірте правильність шляху до зображення -->
                                alt="${title}"
                                onerror="this.onerror=null;this.src='./images/default.jpg';" <!-- Додаємо обробку помилок -->
                            />
                        </a>
                        ${discount ? `<div class="card__label">-${discount}% знижка</div>` : ''}
                    </div>
                    <div class="card__bottom">
                        <div class="card__prices">
                            ${discount ? `<div class="card__price card__price--discount">${priceDiscount.toFixed(2)}грн</div>` : ''}
                            <div class="card__price card__price--common">${price}грн</div>
                        </div>
                        <a href="/card.html?id=${id}" class="card__title">${title}</a>
                        <div class="card__category"><b>Категорія:</b> ${category}</div>
                        <div class="card__expiry"><b>Термін придатності:</b> ${expiry_date}</div>
                        <div class="card__manufacturer"><b>Виробник:</b> ${manufacturer}</div>
                        <div class="card__composition"><b>Склад:</b> ${composition}</div>
                        <button class="card__edit" data-product-id="${id}">Редагувати</button>
                        <button class="card__delete" data-product-id="${id}">Видалити картку товару</button>
                    </div>
                </div>
            `;
        cards.insertAdjacentHTML('beforeend', cardItem);
    });
}


function loadProductsFromLocalStorage() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('product_')) {
            const product = JSON.parse(localStorage.getItem(key));
            productsData.push(product);
        }
    });
}

function setImagesFromLocalStorage() {
    productsData.forEach(product => {
        const card = document.querySelector(`.card[data-product-id="${product.id}"]`);
        if (card) {
            const image = card.querySelector('.card__image img');
            image.src = product.img; // Встановлюємо src атрибут збереженого URL-адресу
            image.onerror = function() {
                this.onerror = null;
                this.src = './images/default.jpg'; // Обробка помилок, якщо зображення не завантажується
            };
        }
    });
}

let productId; // Оголошуємо змінну productId в глобальному контексті

// JavaScript для відображення модального вікна при натисканні на кнопку "Редагувати"
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');

cards.addEventListener('click', handleEditButtonClick);

// Отримати дані про продукт за його ID
function getProductById(id) {
    return productsData.find(product => product.id === id);
}

// Заповнити форму редагування даними продукту
function fillEditForm(product) {
    editForm.elements.editTitle.value = product.title;
    editForm.elements.editPrice.value = product.price;
    editForm.elements.editDiscount.value = product.discount;
    editForm.elements.editImg.value = product.img;
    editForm.elements.editDescr.value = product.descr;
    editForm.elements.editCategory.value = product.category;
    editForm.elements.editExpiry.value = product.expiry_date;
    editForm.elements.editManufacturer.value = product.manufacturer;
    editForm.elements.editComposition.value = product.composition;
}

// Закриття модального вікна при кліці на хрестик
closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
});

// Закриття модального вікна при кліці за межами вікна
window.addEventListener('click', function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Отримуємо форму з модального вікна
const editForm = document.getElementById('editForm');

// Додаємо обробник події для подання форми
editForm.addEventListener('submit', (event) => {
    event.preventDefault(); // Зупиняємо стандартну подію перезавантаження сторінки

    // Отримуємо дані з форми
    // Отримуємо дані з форми
const title = editForm.elements['editTitle'].value;
const price = editForm.elements['editPrice'].value;
let discount = 0; // Значення за замовчуванням
if (editForm.elements['applyDiscount'].checked) {
    discount = editForm.elements['editDiscount'].value;
}
const img = editForm.elements['editImg'].value;
const description = editForm.elements['editDescr'].value;
const category = editForm.elements['editCategory'].value;
const expiry = editForm.elements['editExpiry'].value;
const manufacturer = editForm.elements['editManufacturer'].value;
const composition = editForm.elements['editComposition'].value;


    // Перевіряємо, чи існує productId (тобто чи це редагування існуючого товару, чи додавання нового)
    if (productId) {
        // Якщо productId існує, то це редагування існуючого товару

        // Оновлюємо відповідний об'єкт продукту в productsData
        const editedProductIndex = productsData.findIndex(product => product.id === productId);
        productsData[editedProductIndex] = {
            id: productId,
            title: title,
            price: parseFloat(price),
            discount: parseFloat(discount),
            img: img,
            description: description,
            category: category,
            expiry_date: expiry,
            manufacturer: manufacturer,
            composition: composition
        };

        // Оновлюємо відповідний об'єкт продукту в localStorage
        localStorage.setItem(`product_${productId}`, JSON.stringify(productsData[editedProductIndex]));

        // Оновлюємо відображення карточки продукту
        updateProductCard(productsData[editedProductIndex]);

        // Закриваємо модальне вікно
        closeModal();
    } else {
        // Якщо productId не існує, то це додавання нового товару

        // Створюємо об'єкт нового товару
        const newProduct = {
            id: generateProductId(), // Генеруємо новий ідентифікатор для нового товару
            title: title,
            price: parseFloat(price),
            discount: parseFloat(discount),
            img: img,
            description: description,
            category: category,
            expiry_date: expiry,
            manufacturer: manufacturer,
            composition: composition
        };

        // Додаємо новий товар до productsData
        productsData.push(newProduct);

        // Зберігаємо новий товар в localStorage
        localStorage.setItem(`product_${newProduct.id}`, JSON.stringify(newProduct));

        // Створюємо карточку для нового товару
        createCard(newProduct);

        // Закриваємо модальне вікно
        closeModal();
    }
});

// Функція для генерації нового ідентифікатора для товару
function generateProductId() {
    // Реалізуйте генерацію унікального ідентифікатора тут, наприклад, можна використати timestamp
    return Date.now();
}

// Функція для оновлення відображення карточки продукту
function updateProductCard(editedProduct) {
    const card = document.querySelector(`.card[data-product-id="${editedProduct.id}"]`);
    if (card) {
        card.querySelector('.card__image img').src = editedProduct.img;
        card.querySelector('.card__title').textContent = editedProduct.title;
        card.querySelector('.card__price--discount').textContent = `${(editedProduct.price - ((editedProduct.price * editedProduct.discount) / 100)).toFixed(2)}грн`;
        card.querySelector('.card__price--common').textContent = `${editedProduct.price}грн`;
        card.querySelector('.card__category').textContent = `Категорія: ${editedProduct.category}`;
        card.querySelector('.card__expiry').textContent = `Термін придатності: ${editedProduct.expiry_date}`;
        card.querySelector('.card__manufacturer').textContent = `Виробник: ${editedProduct.manufacturer}`;
        card.querySelector('.card__composition').textContent = `Склад: ${editedProduct.composition}`;
    }
}

// Отримуємо кнопку "Додати нову карточку товару"
const addCardBtn = document.querySelector('.add-card-btn');

// Додаємо обробник подій для кнопки "Додати нову карточку товару"
addCardBtn.addEventListener('click', () => {
    // Відкриваємо модальне вікно
    openModal();
});

// Функція для відкриття модального вікна
function openModal() {
    modal.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
    const icona = document.querySelector('.searchInput .icona');
    const searchInput = document.querySelector('.searchInput');
    const searchField = document.querySelector('#searchInput');

    icona.onclick = function() {
        searchInput.classList.toggle('active');
    };

    searchField.addEventListener('input', handleSearchInput);

    function handleSearchInput(event) {
        const query = event.target.value.trim().toLowerCase(); // Отримуємо введений текст і перетворюємо його на нижній регістр

        // Отримуємо всі товари з LocalStorage
        const allProducts = getAllProductsFromLocalStorage();

        // Фільтруємо товари за введеним користувачем запитом
        const filteredProducts = allProducts.filter(product => {
            return product.title.toLowerCase().includes(query);
        });

        renderSearchResults(filteredProducts); // Відображаємо знайдені товари на сторінці
    }

    // Функція для отримання всіх товарів з LocalStorage
    function getAllProductsFromLocalStorage() {
        const products = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('product_')) {
                const product = JSON.parse(localStorage.getItem(key));
                products.push(product);
            }
        }
        return products;
    }

    // Функція відображення результатів пошуку
    function renderSearchResults(products) {
        const cardsContainer = document.querySelector('.cards');
        cardsContainer.innerHTML = ''; // Очищуємо контейнер з карточками

        if (products.length === 0) {
            const message = document.getElementById('message');
            message.textContent = 'Товарів з такою назвою не знайдено';
            message.style.display = 'block';
        } else {
            const message = document.getElementById('message');
            message.style.display = 'none';
            products.forEach(product => {
                const cardItem = `
                    <div class="card" data-product-id="${product.id}">
                        <a href="/card.html?id=${product.id}">
                            <h2>${product.title}</h2>
                        </a>
                    </div>
                `;
                cardsContainer.insertAdjacentHTML('beforeend', cardItem);
            });
        }
    }
});


// Отримуємо чекбокс для знижки
const discountCheckbox = document.getElementById('editDiscountCheckbox');

// Додаємо обробник події для зміни стану галочки
document.addEventListener('DOMContentLoaded', function() {
    const discountCheckbox = document.getElementById('discountCheckbox');
    const discountInput = document.getElementById('editDiscount');

    if (discountCheckbox && discountInput) {
        discountCheckbox.addEventListener('change', function() {
            // Якщо галочка вибрана, робимо поле обов'язковим для заповнення
            if (discountCheckbox.checked) {
                discountInput.required = true;
            } else {
                // Якщо галочка не вибрана, забираємо обов'язковість з поля для знижки
                discountInput.required = false;
            }
        });
    } else {
        console.error('Element with ID discountCheckbox or editDiscount not found.');
    }
});



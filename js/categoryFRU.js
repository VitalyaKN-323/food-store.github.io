"use strict";

import { showErrorMessage } from './utils.js';
import { COUNT_SHOW_CARDS_CLICK, ERROR_SERVER, NO_PRODUCTS_IN_THIS_CATEGORY } from './constants.js';

const cards = document.querySelector('.cards');
let productsData = [];

document.addEventListener('DOMContentLoaded', () => {
    // Завантаження продуктів з localStorage при завантаженні сторінки
    loadProductsFromLocalStorage();
    // Отримання і відображення карточок товарів
    getProducts();
});

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

        // Фільтруємо карточки за категорією "фрукти"
        const fruitProducts = productsData.filter(product => product.category === "фрукти");

        // Відображаємо карточки тільки для категорії "фрукти"
        renderStartPage(fruitProducts);

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

"use strict";

document.addEventListener('DOMContentLoaded', () => {
    displayProductDetails();
});

function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

function getProductById(productId) {
    return JSON.parse(localStorage.getItem(`product_${productId}`));
}

function displayProductDetails() {
    const productId = getProductIdFromURL();
    if (!productId) {
        alert('Product ID not found in the URL');
        return;
    }

    const product = getProductById(productId);
    if (!product) {
        alert('Product not found');
        return;
    }

    document.querySelector('.product-image img').src = product.img;
    document.querySelector('.product-title').textContent = product.title;
    document.querySelector('.product-description').textContent = product.description;
    document.querySelector('.product-price').textContent = `${product.price} грн`;
    document.querySelector('.product-discount').textContent = `Знижка: ${product.discount}%`;
    document.querySelector('.product-category').textContent = `Категорія: ${product.category}`;
    document.querySelector('.product-expiry').textContent = `Термін придатності: ${product.expiry_date}`;
    document.querySelector('.product-manufacturer').textContent = `Виробник: ${product.manufacturer}`;
    document.querySelector('.product-composition').textContent = `Склад: ${product.composition}`;
}

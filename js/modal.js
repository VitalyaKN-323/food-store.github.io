// Функція для відкриття модального вікна для редагування товару
function openEditModal(product) {
    const modal = document.getElementById('editModal');
    modal.style.display = 'block';
    // Додайте код для заповнення полів модального вікна з даними товару
}

// Функція для закриття модального вікна
function closeModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
}

// Обробник події для кнопки "Зберегти зміни"
document.getElementById('saveChangesBtn').addEventListener('click', saveChanges);

// Функція для збереження змін, внесених користувачем у модальному вікні
function saveChanges() {
    // Отримайте значення з полів модального вікна та збережіть їх
    closeModal();
}

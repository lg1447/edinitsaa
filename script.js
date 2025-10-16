// DOM элементы
const inStock = document.getElementById('in_stock');
const collectionList = document.getElementById('collection-list');
const categoryList = document.getElementById('category-list');
const productsGrid = document.getElementById('products-grid');
const productDetail = document.getElementById('product-detail');
const mainImage = document.getElementById('main-image');
const thumbnails = document.getElementById('thumbnails');
const productTitleDetail = document.getElementById('product-title-detail');
const productPriceDetail = document.getElementById('product-price-detail');
const productDescription = document.getElementById('product-description');
const searchInput = document.getElementById('search-input');
const backButton = document.getElementById('back-button');
const buyButton = document.getElementById('buy-button');
const pageHeader = document.getElementById('page-header');
const mobileToggle = document.getElementById('mobile-toggle');
const sidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

// Данные магазина
let storeData;

// Текущее состояние
let currentCollection = null;
let currentCategory = null;
let currentSearch = '';
let selectedProduct = null;

// Инициализация приложения
function initApp() {
    renderCollections();
    renderCategories();
    renderProducts(storeData.products);
    setupEventListeners();
}

// Рендер списка коллекций
function renderCollections() {
    collectionList.innerHTML = '';
    
    // Добавляем "Все товары"
    const allItem = document.createElement('li');
    const allLink = document.createElement('a');
    allLink.href = '#';
    allLink.innerHTML = 'Все товары';
    allLink.classList.add('active');
    allLink.addEventListener('click', (e) => {
        e.preventDefault();
        setActiveCollection(null);
    });
    allItem.appendChild(allLink);
    collectionList.appendChild(allItem);
    
    // Добавляем коллекции
    storeData.collections.forEach(collection => {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.innerHTML = collection.name;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveCollection(collection.id);
        });
        item.appendChild(link);
        collectionList.appendChild(item);
    });
}

// Рендер категорий
function renderCategories() {
    categoryList.innerHTML = '';
    
    storeData.categories.forEach(category => {
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = category;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            setActiveCategory(category);
        });
        categoryList.appendChild(link);
    });
}

// Рендер товаров
function renderProducts(products) {
    productsGrid.innerHTML = '';
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="loading">
                <i class="fas fa-search"></i>
                <p>Товары не найдены</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card fade-in';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}" class="img1">
                <img src="${product.images[1]}" alt="${product.name}" class="img2">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">${product.price}</div>
            </div>
        `;
        card.addEventListener('click', () => showProductDetail(product));
        productsGrid.appendChild(card);
    });
}

// Показать детали товара
function showProductDetail(product) {
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }

    selectedProduct = product;
    
    // Заголовок и цена
    productTitleDetail.textContent = product.name;
    productPriceDetail.innerHTML = product.price;
    productDescription.innerHTML = product.description;
    
    // Основное изображение
    mainImage.innerHTML = `<img src="${product.images[0]}" alt="${product.name}">`;
    
    // Миниатюры
    thumbnails.innerHTML = '';
    product.images.forEach((image, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'thumbnail';
        if (index === 0) thumb.classList.add('active');
        thumb.innerHTML = `<img src="${image}" alt="Thumbnail ${index + 1}">`;
        thumb.addEventListener('click', () => {
            mainImage.innerHTML = `<img src="${image}" alt="${product.name}">`;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
        });
        thumbnails.appendChild(thumb);
    });
    
    // Показать детали товара, скрыть список
    productsGrid.style.display = 'none';
    productDetail.style.display = 'block';
    pageHeader.textContent = product.name;
}

// Установить активную коллекцию
function setActiveCollection(collectionId) {
    currentCollection = collectionId;
    currentCategory = null;
    
    // Обновить активные ссылки
    document.querySelectorAll('#collection-list a').forEach(link => {
        link.classList.remove('active');
    });
    
    if (collectionId === null) {
        document.querySelectorAll('#collection-list a')[0].classList.add('active');
        pageHeader.textContent = 'Все товары';
    } else {
        const collection = storeData.collections.find(c => c.id === collectionId);
        document.querySelectorAll('#collection-list a').forEach(link => {
            if (link.innerHTML === collection.name) link.classList.add('active');
        });
        pageHeader.textContent = collection.name;
    }
    
    filterProducts();
}

// Установить активную категорию
function setActiveCategory(category) {
    currentCategory = category;
    currentCollection = null;
    
    // Обновить активные ссылки
    document.querySelectorAll('#collection-list a').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelectorAll('#collection-list a')[0].classList.add('active');
    
    pageHeader.textContent = category;
    filterProducts();
}

// Фильтрация товаров
function filterProducts() {
    let filteredProducts = storeData.products;
    
    // Фильтр по коллекции
    if (currentCollection) {
        filteredProducts = filteredProducts.filter(p => p.collection_id === currentCollection);
    }
    
    // Фильтр по категории
    if (currentCategory) {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }
    
    // Фильтр по поиску
    if (currentSearch) {
        const searchTerm = currentSearch.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.description.toLowerCase().includes(searchTerm) ||
            p.category.toLowerCase().includes(searchTerm)
        );
    }

    filteredProducts = filteredProducts.filter(p => in_stock.classList.contains('active') <= p.in_stock);
    
    renderProducts(filteredProducts);
}

// Настройка обработчиков событий
function setupEventListeners() {
    // В наличии
    in_stock.addEventListener('click', (e) => {
        e.preventDefault();
        if (in_stock.classList.contains('active')) {
            in_stock.classList.remove('active');
        } else {
            in_stock.classList.add('active');
        }
        filterProducts();
    });
    
    // Поиск
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        currentCollection = null;
        currentCategory = null;
        
        // Обновить активные ссылки
        document.querySelectorAll('#collection-list a').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelectorAll('#collection-list a')[0].classList.add('active');
        
        pageHeader.textContent = currentSearch ? `Поиск: ${currentSearch}` : 'Все товары';
        filterProducts();
    });
    
    // Кнопка "Назад"
    backButton.addEventListener('click', (e) => {
        e.preventDefault();
        productDetail.style.display = 'none';
        productsGrid.style.display = 'grid';
        pageHeader.textContent = currentCollection 
            ? storeData.collections.find(c => c.id === currentCollection).name 
            : currentCategory || 'Все товары';
    });
    
    // Мобильное меню
    mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');
    });

    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', () => {
    fetch('/data.json', { cache: 'no-store' }).then(response => response.json()).then(data => { storeData = data; initApp(); })
});
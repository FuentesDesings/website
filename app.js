/* ==============================================
   MOTORSTREC - STORM LIGHT SPORT
   JavaScript principal
   ============================================== */

(function() {
    'use strict';

    // ============ OBTENER DATOS ============
    // Los datos vienen de data.js (window.__SITE_DATA__)
    const siteData = window.__SITE_DATA__;

    // Si no hay datos, mostramos error
    if (!siteData || !siteData.categorias || Object.keys(siteData.categorias).length === 0) {
        document.getElementById('heroMessage').textContent = 'Error: No se encontraron datos. Revisa data.js';
        document.getElementById('categoriesGrid').innerHTML = '<div class="status-message">⚠️ No se pudieron cargar los datos.</div>';
        throw new Error('window.__SITE_DATA__ no está definido correctamente en data.js');
    }

    let lightboxImages = [];
    let lightboxIndex = 0;

    // ============ AL CARGAR LA PÁGINA ============
    document.addEventListener('DOMContentLoaded', function() {
        initApp();
    });

    // ============ INICIALIZAR APP ============
    function initApp() {
        updateBanner();
        renderCategories();
        setupNavigation();
        setupLightbox();
        setupMobileMenu();
        console.log('✅ MOTORSTREC cargado correctamente con ' + 
            Object.keys(siteData.categorias).length + ' categorías');
    }

    // ============ BANNER ============
    function updateBanner() {
        const heroMessageEl = document.getElementById('heroMessage');
        heroMessageEl.textContent = siteData.banner.subtitulo || 'Elige entre nuestros diseños modernos para tu máquina.';

        const bgSlider = document.getElementById('heroBgSlider');
        bgSlider.innerHTML = '';
        const fondos = siteData.banner.fondos || [];

        if (fondos.length === 0) {
            const slide = document.createElement('div');
            slide.classList.add('hero-bg-slide', 'active');
            slide.style.background = 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #0d0d0d 100%)';
            bgSlider.appendChild(slide);
            return;
        }

        fondos.forEach(function(src, i) {
            const slide = document.createElement('div');
            slide.classList.add('hero-bg-slide');
            if (i === 0) slide.classList.add('active');
            slide.style.backgroundImage = 'url(\'' + src + '\')';
            slide.style.backgroundColor = '#1a1a1a';
            bgSlider.appendChild(slide);
        });

        if (fondos.length > 1) {
            let currentSlide = 0;
            const slides = bgSlider.querySelectorAll('.hero-bg-slide');
            setInterval(function() {
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
            }, 4000);
        }
    }

    // ============ RENDER CATEGORÍAS ============
    function renderCategories() {
        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = '';
        const categorias = siteData.categorias;
        const icons = {
            'Motorinas': '🛵',
            'Motores': '🏍️',
            'Vehiculos': '🚗',
            'Motocicletas': '🏍️',
            'Coches': '🚗',
            'Motos': '🏍️'
        };

        for (const catName in categorias) {
            if (!categorias.hasOwnProperty(catName)) continue;
            const modelos = categorias[catName];

            const card = document.createElement('div');
            card.classList.add('category-card');
            card.setAttribute('data-category', catName);

            let bgImage = '';
            if (modelos && modelos.length > 0 && modelos[0].fotos && modelos[0].fotos.length > 0) {
                bgImage = modelos[0].fotos[0];
            }

            const numModelos = modelos ? modelos.length : 0;

            card.innerHTML =
                '<div class="category-card-bg" style="background-image:url(\'' + bgImage + '\');background-color:#1a1a1a;"></div>' +
                '<div class="category-card-content">' +
                '<div class="icon">' + (icons[catName] || '🔧') + '</div>' +
                '<h3>' + catName + '</h3>' +
                '<div class="count">' + numModelos + ' modelo' + (numModelos !== 1 ? 's' : '') + '</div>' +
                '</div>' +
                '<div class="arrow-icon">→</div>';

            card.addEventListener('click', function() {
                showModels(catName);
            });

            grid.appendChild(card);
        }
    }

    // ============ MOSTRAR MODELOS ============
    function showModels(categoryName) {
        const modelos = siteData.categorias[categoryName] || [];
        document.getElementById('modelsCategoryLabel').textContent = categoryName;
        document.getElementById('modelsTitle').textContent = 'Selecciona un diseño';

        const grid = document.getElementById('modelsGrid');
        grid.innerHTML = '';

        if (modelos.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">No hay modelos disponibles en esta categoría.</p>';
        }

        modelos.forEach(function(modelo) {
            const card = document.createElement('div');
            card.classList.add('model-card');
            const thumbSrc = (modelo.fotos && modelo.fotos.length > 0) ? modelo.fotos[0] : '';

            card.innerHTML =
                '<div class="model-card-thumb" style="background-image:url(\'' + thumbSrc + '\');background-color:#1a1a1a;"></div>' +
                '<div class="model-card-info">' +
                '<h4>' + modelo.nombre + '</h4>' +
                '<div class="photo-count">' + (modelo.fotos ? modelo.fotos.length : 0) + ' diseño' + (modelo.fotos && modelo.fotos.length !== 1 ? 's' : '') + '</div>' +
                '</div>';

            card.addEventListener('click', function() {
                showGallery(categoryName, modelo);
            });

            grid.appendChild(card);
        });

        switchView('models');
        document.getElementById('view-models').setAttribute('data-current-category', categoryName);
    }

    // ============ MOSTRAR GALERÍA ============
    function showGallery(categoryName, modelo) {
        document.getElementById('galleryModelLabel').textContent = categoryName + ' / ' + modelo.nombre;
        document.getElementById('galleryTitle').textContent = modelo.nombre;

        const grid = document.getElementById('galleryGrid');
        grid.innerHTML = '';

        if (!modelo.fotos || modelo.fotos.length === 0) {
            grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem;">No hay fotos disponibles para este modelo.</p>';
        } else {
            modelo.fotos.forEach(function(src, index) {
                const item = document.createElement('div');
                item.classList.add('gallery-item');
                item.style.backgroundImage = 'url(\'' + src + '\')';
                item.style.backgroundColor = '#1a1a1a';
                item.setAttribute('data-src', src);
                item.setAttribute('data-index', index);
                item.addEventListener('click', function() {
                    openLightbox(modelo.fotos, index);
                });
                grid.appendChild(item);
            });
        }

        switchView('gallery');
        document.getElementById('view-gallery').setAttribute('data-current-category', categoryName);
    }

    // ============ CAMBIO DE VISTAS ============
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(function(v) {
        v.classList.remove('active');
    });
    const targetView = document.getElementById('view-' + viewName);
    if (targetView) targetView.classList.add('active');
    
    // OCULTAR O MOSTRAR EL BANNER SEGÚN LA VISTA
    const heroSection = document.getElementById('hero');
    if (viewName === 'categories') {
        heroSection.style.display = '';
        document.body.classList.remove('no-banner');  // AÑADIR
    } else {
        heroSection.style.display = 'none';
        document.body.classList.add('no-banner');     // AÑADIR
    }
    
    document.getElementById('categorias').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
    // ============ NAVEGACIÓN ============
    function setupNavigation() {
document.getElementById('backToCategories').addEventListener('click', function() {
    document.getElementById('hero').style.display = '';
    switchView('categories');
});

        document.getElementById('backToModels').addEventListener('click', function() {
            const categoryName = document.getElementById('view-gallery').getAttribute('data-current-category');
            if (categoryName) {
                showModels(categoryName);
            } else {
                switchView('categories');
            }
        });

        // Links del header
document.querySelectorAll('[data-nav]').forEach(function(link) {
    link.addEventListener('click', function(e) {
        const target = this.getAttribute('data-nav');
        if (target === 'home') {
            // Restaurar banner
            document.getElementById('hero').style.display = '';
            switchView('categories');
            document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
        } else if (target === 'categorias') {
            // Restaurar banner
            document.getElementById('hero').style.display = '';
            switchView('categories');
            document.getElementById('categorias').scrollIntoView({ behavior: 'smooth' });
        } else if (target === 'contacto') {
            document.getElementById('contacto').scrollIntoView({ behavior: 'smooth' });
        }
        document.getElementById('navLinks').classList.remove('open');
        document.getElementById('menuToggle').classList.remove('active');
    });
});

    }

    // ============ LIGHTBOX ============
    function setupLightbox() {
        const lightbox = document.getElementById('lightbox');

        document.getElementById('lightboxClose').addEventListener('click', closeLightbox);

        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) closeLightbox();
        });

        document.getElementById('lightboxPrev').addEventListener('click', function() {
            lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
            updateLightboxImage();
        });

        document.getElementById('lightboxNext').addEventListener('click', function() {
            lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
            updateLightboxImage();
        });

        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') {
                lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
                updateLightboxImage();
            }
            if (e.key === 'ArrowRight') {
                lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
                updateLightboxImage();
            }
        });
    }

    function openLightbox(images, index) {
        lightboxImages = images;
        lightboxIndex = index;
        document.getElementById('lightbox').classList.add('active');
        document.body.style.overflow = 'hidden';
        updateLightboxImage();
    }

    function closeLightbox() {
        document.getElementById('lightbox').classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateLightboxImage() {
        document.getElementById('lightboxImg').src = lightboxImages[lightboxIndex];
        document.getElementById('lightboxCounter').textContent =
            (lightboxIndex + 1) + ' / ' + lightboxImages.length;
    }

    // ============ MENÚ MÓVIL ============
    function setupMobileMenu() {
        const toggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');

        toggle.addEventListener('click', function() {
            toggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });

        document.addEventListener('click', function(e) {
            if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
                toggle.classList.remove('active');
                navLinks.classList.remove('open');
            }
        });
    }

})();
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Referencias a elementos del DOM
        const filterButtons = document.querySelectorAll('.filter-btn');
        const certificateItems = document.querySelectorAll('.certificate-item');
        const certificateCount = document.getElementById('certificateCount');
        const noResultsMessage = document.querySelector('.no-certificates-found');
        const certificateViewLinks = document.querySelectorAll('.view-certificate');
        const certificateModal = document.getElementById('certificateModal');
        const modalImage = document.getElementById('modalCertificateImg');
        const closeModalBtn = document.querySelector('.close-modal');
        const zoomControls = document.querySelectorAll('.zoom-control');
        
        // Estado actual del zoom
        let currentZoom = 1;

        // Verificar que los elementos necesarios existen
        if (certificateCount) {
            // Inicializar contador solo si el elemento existe
            updateCounter('all');
        }
        
        // Manejar clicks en botones de filtro
        if (filterButtons.length > 0) {
            filterButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const filter = this.dataset.filter;
                    
                    // Actualizar botones activos
                    filterButtons.forEach(button => button.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Filtrar certificados
                    filterCertificates(filter);
                });
            });
        }
        
        // Función para filtrar certificados
        function filterCertificates(filter) {
            let visibleCount = 0;
            
            certificateItems.forEach(item => {
                const category = item.dataset.category;
                
                if (filter === 'all' || filter === category) {
                    item.style.display = 'block';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Actualizar contador
            updateCounter(visibleCount);
            
            // Mostrar mensaje si no hay resultados (si el elemento existe)
            if (noResultsMessage) {
                if (visibleCount === 0) {
                    noResultsMessage.style.display = 'block';
                } else {
                    noResultsMessage.style.display = 'none';
                }
            }
        }
        
        // Actualizar contador de certificados
        function updateCounter(count) {
            if (certificateCount) {
                if (count === 'all') {
                    certificateCount.textContent = certificateItems.length;
                } else {
                    certificateCount.textContent = count;
                }
            }
        }
        
        // Manejar visualización de certificados
        if (certificateViewLinks.length > 0 && certificateModal && modalImage) {
            certificateViewLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const certImg = this.dataset.certificateImg;
                    openCertificateModal(certImg);
                });
            });
        }
        
        // Función para abrir modal con certificado
        function openCertificateModal(imgSrc) {
            if (modalImage && certificateModal) {
                modalImage.src = imgSrc;
                certificateModal.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Resetear zoom
                currentZoom = 1;
                modalImage.style.transform = `scale(${currentZoom})`;
            }
        }
        
        // Cerrar modal
        if (closeModalBtn && certificateModal) {
            closeModalBtn.addEventListener('click', function() {
                certificateModal.classList.remove('active');
                document.body.style.overflow = '';
            });
            
            // También cerrar al hacer clic fuera del contenido
            certificateModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    certificateModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Controles de zoom
        if (zoomControls.length > 0 && modalImage) {
            zoomControls.forEach(control => {
                control.addEventListener('click', function() {
                    const action = this.dataset.zoom;
                    
                    switch (action) {
                        case 'in':
                            currentZoom += 0.25;
                            if (currentZoom > 3) currentZoom = 3; // límite máximo
                            break;
                        case 'out':
                            currentZoom -= 0.25;
                            if (currentZoom < 0.5) currentZoom = 0.5; // límite mínimo
                            break;
                        case 'reset':
                            currentZoom = 1;
                            break;
                    }
                    
                    modalImage.style.transform = `scale(${currentZoom})`;
                });
            });
        }
        
        // Añadir efectos de animación a las tarjetas
        function animateCertificateCards() {
            if (certificateItems.length > 0) {
                certificateItems.forEach((card, index) => {
                    card.style.animationDelay = `${index * 0.05}s`;
                });
            }
        }
        
        // Inicializar animaciones
        animateCertificateCards();
        
        // Inicializar tooltips
        initTooltips();
        
        // Inicializar filtros (aplica el filtro "all" por defecto)
        const defaultFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
        if (defaultFilterBtn) {
            defaultFilterBtn.classList.add('active');
            filterCertificates('all');
        }
        
    } catch (error) {
        // Error silencioso sin console.error
    }
    
    // Función para agregar tooltip a ciertos elementos
    function initTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        // La funcionalidad ya está en CSS
    }
});

// Añadir esta función nueva para el efecto 3D
function initCertificateCardEffect() {
    const certificateCards = document.querySelectorAll('.certificate-card-3d');
    
    if (certificateCards.length === 0) {
        return;
    }
    
    certificateCards.forEach(card => {
        const cardInner = card.querySelector('.certificate-card-inner');
        
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 768) return; // No aplicar en móviles
            
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Calcular la rotación basada en la posición del ratón
            const rotateY = ((mouseX - centerX) / (rect.width / 2)) * 5;
            const rotateX = ((centerY - mouseY) / (rect.height / 2)) * 5;
            
            // Aplicar la transformación
            cardInner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });
        
        // Restaurar al estado original cuando el ratón sale
        card.addEventListener('mouseleave', () => {
            cardInner.style.transform = 'rotateX(0) rotateY(0)';
        });
    });
    
    // Aplicar una animación de entrada cuando el carousel cambia de slide
    const carousel = document.getElementById('certificatesCarousel');
    if (carousel) {
        carousel.addEventListener('slide.bs.carousel', (e) => {
            const nextSlide = e.relatedTarget;
            const cardInner = nextSlide.querySelector('.certificate-card-inner');
            if (cardInner) {
                cardInner.style.transform = 'rotateX(8deg) scale(0.95)';
                setTimeout(() => {
                    cardInner.style.transform = 'rotateX(0) scale(1)';
                }, 10);
            }
        });
    }
}

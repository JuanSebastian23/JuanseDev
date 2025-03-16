document.addEventListener('DOMContentLoaded', function() {
    // Array con todos los componentes que deben cargarse
    const components = [
        { id: 'header-component', path: 'components/header.html' },
        { id: 'hero-component', path: 'components/hero.html' },
        { id: 'experience-component', path: 'components/experience.html' },
        { id: 'projects-component', path: 'components/projects.html' },
        { id: 'about-component', path: 'components/about.html' },
        { id: 'education-component', path: 'components/education.html' },
        { id: 'certificates-component', path: 'components/certificates.html' },
        { id: 'technologies-component', path: 'components/technologies.html' },
        { id: 'footer-component', path: 'components/footer.html' }
    ];

    // Función para cargar un componente
    function loadComponent(component) {
        const element = document.getElementById(component.id);
        
        // Verificar si el elemento existe en el DOM
        if (!element) {
            console.error(`Elemento con ID '${component.id}' no encontrado en el DOM`);
            return Promise.reject(`Elemento con ID '${component.id}' no encontrado`);
        }
        
        return fetch(component.path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`No se pudo cargar el componente desde ${component.path}`);
                }
                return response.text();
            })
            .then(html => {
                element.innerHTML = html;
                console.log(`Componente ${component.id} cargado exitosamente`);
                
                // Reinicializar AOS después de cargar el componente
                if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                }
                
                return component.id;
            })
            .catch(error => {
                console.error(`Error al cargar ${component.path}:`, error);
                element.innerHTML = `<div class="alert alert-danger">Error al cargar el componente</div>`;
            });
    }

    // Cargar componentes en secuencia
    let promiseChain = Promise.resolve();
    
    components.forEach(component => {
        promiseChain = promiseChain.then(() => loadComponent(component));
    });
    
    // Configurar el botón de scroll hacia arriba
    const scrollTopButton = document.getElementById('scroll-top');
    
    if (scrollTopButton) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                scrollTopButton.classList.add('visible');
            } else {
                scrollTopButton.classList.remove('visible');
            }
        });
        
        scrollTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// Manejo de certificados
let currentZoom = 1;
const zoomStep = 0.2;
let translateX = 0;
let translateY = 0;

// Delegación de eventos para componentes cargados dinámicamente
$(document).on('click', '.view-certificate', function(e) {
    e.preventDefault();
    const imgSrc = $(this).data('certificate-img');
    $('#modalCertificateImg').attr('src', imgSrc);
    $('#certificateModal').addClass('active');
    // Resetear valores al abrir
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
    updateZoom();
    $('body').css('overflow', 'hidden');
});

// Cerrar modal con botón X
$(document).on('click', '.close-modal', function() {
    closeModal();
});

// Cerrar modal con Escape
$(document).keydown(function(e) {
    if (e.key === "Escape") {
        closeModal();
    }
});

// Cerrar modal clickeando fuera
$(document).on('click', '.certificate-modal', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Controles de zoom
$(document).on('click', '.zoom-control', function() {
    const action = $(this).data('zoom');
    if (action === 'in' && currentZoom < 3) {
        currentZoom += zoomStep;
    } else if (action === 'out' && currentZoom > 0.5) {
        currentZoom -= zoomStep;
    }
    updateZoom();
});

function closeModal() {
    $('#certificateModal').removeClass('active');
    $('body').css('overflow', '');
    // Resetear valores al cerrar
    currentZoom = 1;
    translateX = 0;
    translateY = 0;
}

function updateZoom() {
    $('#modalCertificateImg').css('transform', 
        `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`);
}

// Manejo del arrastre de imagen
let isDragging = false;
let startX, startY;

$(document).on('mousedown touchstart', '#modalCertificateImg', function(e) {
    if (currentZoom > 1) {
        isDragging = true;
        const evt = e.type === 'mousedown' ? e : e.touches[0];
        startX = evt.clientX - translateX;
        startY = evt.clientY - translateY;
    }
});

$(document).on('mousemove touchmove', function(e) {
    if (isDragging && currentZoom > 1) {
        e.preventDefault();
        const evt = e.type === 'mousemove' ? e : e.touches[0];
        translateX = evt.clientX - startX;
        translateY = evt.clientY - startY;
        updateZoom();
    }
});

$(document).on('mouseup touchend', function() {
    isDragging = false;
});

// Add jQuery easing if not included
$.easing.easeInOutQuart = function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
};

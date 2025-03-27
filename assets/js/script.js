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
                
                // Si es el componente hero, inicializar los modales personalizados
                if (component.id === 'hero-component') {
                    initializeCustomModals();
                }
                
                // Reinicializar AOS después de cargar el componente
                if (typeof AOS !== 'undefined') {
                    AOS.refresh();
                }
                
                return component.id;
            })
            .catch(error => {
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

// Función para inicializar los modales personalizados
function initializeCustomModals() {
    // Referencias a los elementos del DOM (ahora podemos localizarlos correctamente)
    const cvBtn = document.getElementById('cvBtn');
    const contactBtn = document.getElementById('contactBtn');
    const customCVModal = document.getElementById('customCVModal');
    const customContactModal = document.getElementById('customContactModal');
    const closeCVModal = document.getElementById('closeCVModal');
    const closeContactModal = document.getElementById('closeContactModal');
    
    // Verificar si los elementos existen
    if (!customCVModal || !customContactModal) {
        return;
    }
    
    // Inicializar la navegación de páginas del CV
    initCVPageNavigation();
    
    // Funcionalidad para abrir/cerrar modales
    function openModal(modal) {
        document.body.classList.add('no-scroll');
        modal.classList.add('active');
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
    }
    
    function closeModal(modal) {
        modal.classList.remove('visible');
        setTimeout(() => {
            modal.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }, 300);
    }
    
    // Event listeners para abrir modales si existen
    if (cvBtn) {
        cvBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Si es móvil, abrir en nueva pestaña
            if (window.innerWidth < 768) {
                window.open('assets/archives/Cv_Juan Sebastian Quinto H.pdf', '_blank');
            } else {
                openModal(customCVModal);
            }
        });
    }
    
    if (contactBtn) {
        contactBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(customContactModal);
        });
    }
    
    // Event listeners para cerrar modales
    if (closeCVModal) {
        closeCVModal.addEventListener('click', () => {
            closeModal(customCVModal);
        });
    }
    
    if (closeContactModal) {
        closeContactModal.addEventListener('click', () => {
            closeModal(customContactModal);
        });
    }
    
    // Cerrar al hacer clic en backdrop
    const modalBackdrops = document.querySelectorAll('.custom-modal-backdrop');
    modalBackdrops.forEach(backdrop => {
        backdrop.addEventListener('click', function(e) {
            e.stopPropagation();
            const modal = this.closest('.custom-modal');
            closeModal(modal);
        });
    });
    
    // Cerrar con la tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (customCVModal.classList.contains('active')) closeModal(customCVModal);
            if (customContactModal.classList.contains('active')) closeModal(customContactModal);
        }
    });
    
    // Inicializar formulario de contacto si existe
    const form = document.getElementById('contactForm');
    if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        
        // Animación para inputs del formulario
        inputs.forEach(input => {
            // Establecer estado activo si ya tiene valor
            if (input.value) {
                input.parentElement.classList.add('active');
            }
            
            // Eventos para la animación
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('active');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('active');
                }
            });
        });
        
        // Validación del formulario
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            let isValid = true;
            // Limpiar mensajes de error previos
            form.querySelectorAll('.error-message').forEach(msg => {
                msg.textContent = '';
            });
            
            // Validar cada campo
            inputs.forEach(input => {
                const errorEl = input.closest('.custom-form-group').querySelector('.error-message');
                
                if (!input.value) {
                    errorEl.textContent = 'Este campo es obligatorio';
                    isValid = false;
                    input.parentElement.classList.add('error');
                } else if (input.type === 'email' && !validateEmail(input.value)) {
                    errorEl.textContent = 'Ingresa un email válido';
                    isValid = false;
                    input.parentElement.classList.add('error');
                } else {
                    input.parentElement.classList.remove('error');
                }
            });
            
            if (isValid) {
                submitForm(form, inputs);
            }
        });
    }
}

// Nueva función para manejar la navegación de las páginas del CV
function initCVPageNavigation() {
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    const pages = document.querySelectorAll('.cv-page');
    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    
    // Referencias para el zoom
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomLevelEl = document.querySelector('.zoom-level');
    
    let zoomLevel = 100; // Porcentaje de zoom actual
    const zoomStep = 20; // Incremento/decremento de zoom en porcentaje
    const minZoom = 60; // Zoom mínimo
    const maxZoom = 200; // Zoom máximo
    
    if (!prevBtn || !nextBtn || !pages.length || !currentPageEl || !totalPagesEl) {
        return;
    }
    
    let currentPage = 1;
    const totalPages = pages.length;
    
    // Actualizar el contador total de páginas
    totalPagesEl.textContent = totalPages;
    
    function showPage(pageNum) {
        // Ocultar todas las páginas
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Mostrar la página actual
        const activePage = document.querySelector(`.cv-page[data-page="${pageNum}"]`);
        if (activePage) {
            activePage.classList.add('active');
            currentPage = pageNum;
            currentPageEl.textContent = currentPage;
            
            // Actualizar estado de los botones
            prevBtn.disabled = currentPage === 1;
            nextBtn.disabled = currentPage === totalPages;
        }
    }
    
    // Función para actualizar el zoom
    function updateZoom() {
        // Actualizar todas las páginas para mantener consistencia
        pages.forEach(page => {
            page.style.transform = `scale(${zoomLevel / 100})`;
        });
        
        // Actualizar el indicador de nivel de zoom
        zoomLevelEl.textContent = `${zoomLevel}%`;
        
        // Actualizar estado de los botones de zoom
        zoomOutBtn.disabled = zoomLevel <= minZoom;
        zoomInBtn.disabled = zoomLevel >= maxZoom;
        
        // Agregar clase para indicar cuando el zoom está activo
        const cvImageContainer = document.querySelector('.cv-image-container');
        if (cvImageContainer) {
            if (zoomLevel > 100) {
                cvImageContainer.classList.add('zoom-active');
            } else {
                cvImageContainer.classList.remove('zoom-active');
            }
        }
    }
    
    // Event listeners para los botones de navegación
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            showPage(currentPage - 1);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            showPage(currentPage + 1);
        }
    });
    
    // Event listeners para los botones de zoom
    if (zoomInBtn && zoomOutBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (zoomLevel < maxZoom) {
                zoomLevel += zoomStep;
                updateZoom();
            }
        });
        
        zoomOutBtn.addEventListener('click', () => {
            if (zoomLevel > minZoom) {
                zoomLevel -= zoomStep;
                updateZoom();
            }
        });
    }
    
    // Inicializar mostrando la primera página
    showPage(1);
    // Inicializar zoom
    updateZoom();
    
    // Permitir navegación con teclado cuando el modal está activo
    document.addEventListener('keydown', function(e) {
        const cvModal = document.getElementById('customCVModal');
        if (cvModal && cvModal.classList.contains('active')) {
            if (e.key === 'ArrowLeft' && currentPage > 1) {
                showPage(currentPage - 1);
            } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
                showPage(currentPage + 1);
            } else if (e.key === '+' || e.key === '=') {
                // Tecla + para hacer zoom in
                if (zoomLevel < maxZoom) {
                    zoomLevel += zoomStep;
                    updateZoom();
                }
            } else if (e.key === '-' || e.key === '_') {
                // Tecla - para hacer zoom out
                if (zoomLevel > minZoom) {
                    zoomLevel -= zoomStep;
                    updateZoom();
                }
            } else if (e.key === '0') {
                // Tecla 0 para resetear zoom
                zoomLevel = 100;
                updateZoom();
            }
        }
    });
}

function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function submitForm(form, inputs) {
    // Mostrar estado de carga
    const submitBtn = form.querySelector('.custom-submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const originalText = btnText.textContent;
    
    submitBtn.classList.add('loading');
    btnText.textContent = 'Enviando...';
    
    // Ocultar mensajes previos
    document.querySelector('.form-response .success-message').style.display = 'none';
    document.querySelector('.form-response .error-message-box').style.display = 'none';
    
    // Enviar formulario con fetch
    const formData = new FormData(form);
    
    // Agregamos un timeout más largo para entornos con conexiones lentas
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos de timeout
    
    fetch(form.action, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
        headers: {
            // No incluir Content-Type para dejar que el navegador lo maneje con FormData
        }
    })
    .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // Mostrar mensaje de éxito
            document.querySelector('.form-response .success-message').style.display = 'flex';
            document.querySelector('.form-response .success-message span').textContent = data.message;
            
            // Limpiar formulario
            form.reset();
            inputs.forEach(input => {
                input.parentElement.classList.remove('active');
            });
            
            // Cerrar modal después de 3 segundos
            setTimeout(() => {
                const customContactModal = document.getElementById('customContactModal');
                customContactModal.classList.remove('visible');
                setTimeout(() => {
                    customContactModal.classList.remove('active');
                    document.body.classList.remove('no-scroll');
                }, 300);
            }, 3000);
        } else {
            // Mostrar mensaje de error
            document.querySelector('.form-response .error-message-box').style.display = 'flex';
            document.querySelector('.form-response .error-message-box span').textContent = data.message;
        }
    })
    .catch(error => {
        clearTimeout(timeoutId);
        
        // Intentar envío alternativo en caso de error
        retryWithXHR(form, formData);
    })
    .finally(() => {
        // Restaurar botón
        submitBtn.classList.remove('loading');
        btnText.textContent = originalText;
    });
}

// Función de respaldo usando XMLHttpRequest en caso de fallo con fetch
function retryWithXHR(form, formData) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', form.action, true);
    xhr.timeout = 30000; // 30 segundos
    
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            try {
                const response = JSON.parse(xhr.responseText);
                
                if (response.success) {
                    document.querySelector('.form-response .success-message').style.display = 'flex';
                    document.querySelector('.form-response .success-message span').textContent = response.message;
                    
                    form.reset();
                    
                    setTimeout(() => {
                        const customContactModal = document.getElementById('customContactModal');
                        customContactModal.classList.remove('visible');
                        setTimeout(() => {
                            customContactModal.classList.remove('active');
                            document.body.classList.remove('no-scroll');
                        }, 300);
                    }, 3000);
                } else {
                    document.querySelector('.form-response .error-message-box').style.display = 'flex';
                    document.querySelector('.form-response .error-message-box span').textContent = response.message;
                }
            } catch (e) {
                document.querySelector('.form-response .error-message-box').style.display = 'flex';
                document.querySelector('.form-response .error-message-box span').textContent = 'Error al procesar la respuesta del servidor';
            }
        } else {
            document.querySelector('.form-response .error-message-box').style.display = 'flex';
            document.querySelector('.form-response .error-message-box span').textContent = 'Error de conexión. Por favor, intenta de nuevo.';
        }
    };
    
    xhr.onerror = function() {
        document.querySelector('.form-response .error-message-box').style.display = 'flex';
        document.querySelector('.form-response .error-message-box span').textContent = 'Error de conexión. Por favor, intenta de nuevo.';
    };
    
    xhr.ontimeout = function() {
        document.querySelector('.form-response .error-message-box').style.display = 'flex';
        document.querySelector('.form-response .error-message-box span').textContent = 'La conexión ha tardado demasiado. Por favor, intenta de nuevo.';
    };
    
    xhr.send(formData);
}
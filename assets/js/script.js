/* global $ */
$(document).ready(function() {
    $("#header-component").load("components/header.html", function() {
        // Actualizar link activo basado en la sección visible
        $(window).on('scroll', function() {
            $('.section').each(function() {
                if($(this).offset().top - $(window).scrollTop() < 200) {
                    var id = $(this).attr('id');
                    $('.nav-link').removeClass('active');
                    $('.nav-link[href="#'+ id +'"]').addClass('active');
                }
            });
        });
    });
    $("#hero-component").load("components/hero.html");
    $("#experience-component").load("components/experience.html");
    $("#education-component").load("components/education.html");
    $("#certificates-component").load("components/certificates.html");
    $("#technologies-component").load("components/technologies.html");
    $("#projects-component").load("components/projects.html");
    $("#footer-component").load("components/footer.html");
    $("#about-component").load("components/about.html");

    // Scroll to top functionality
    const scrollBtn = $("#scroll-top");
    
    $(window).scroll(function() {
        if ($(window).scrollTop() > 300) {
            scrollBtn.addClass("visible");
        } else {
            scrollBtn.removeClass("visible");
        }
    });

    scrollBtn.click(function() {
        $("html, body").animate({
            scrollTop: 0
        }, {
            duration: 800,
            easing: "easeInOutQuart"
        });
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
});

// Add jQuery easing if not included
$.easing.easeInOutQuart = function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
};

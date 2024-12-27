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
});

// Add jQuery easing if not included
$.easing.easeInOutQuart = function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
};

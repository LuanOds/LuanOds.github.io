document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const loadingScreen = document.getElementById('loadingScreen');
    const header = document.querySelector('.header');
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('.nav');
    const body = document.body;
    
    // Loading screen
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.body.classList.remove('no-scroll');
        }, 500);
    }, 1500);

    // Header scroll effect
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile menu
    const toggleMenu = () => {
        mobileMenuBtn.classList.toggle('active');
        nav.classList.toggle('active');
        body.classList.toggle('no-scroll');
    };

    mobileMenuBtn.addEventListener('click', toggleMenu);

    // Fecha menu ao clicar nos links
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            nav.classList.remove('active');
            body.classList.remove('no-scroll');
        });
    });

    // Scroll suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Animações
    const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('skill-bar')) {
                    entry.target.style.width = entry.target.dataset.level + '%';
                }
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(animateOnScroll, { threshold: 0.1 });
    document.querySelectorAll('.skill-bar, .tech-grid').forEach(el => observer.observe(el));

    // Animação das células da grade
    const animateGrid = () => {
        const cells = document.querySelectorAll('.grid-cell');
        let delay = 0;
        
        cells.forEach(cell => {
            setTimeout(() => cell.classList.add('active'), delay);
            setTimeout(() => cell.classList.remove('active'), delay + 1000);
            delay += 100;
        });

        setInterval(() => {
            const randomCell = Math.floor(Math.random() * cells.length);
            cells[randomCell].classList.add('active');
            setTimeout(() => cells[randomCell].classList.remove('active'), 1000);
        }, 300);
    };

    // Formulário
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Mensagem enviada com sucesso! Entrarei em contato em breve.');
            this.reset();
        });
    }

    // Elementos indisponíveis
    document.querySelectorAll('.unavailable').forEach(el => {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.add('shake');
            setTimeout(() => this.classList.remove('shake'), 500);
            alert('Esta funcionalidade estará disponível em breve!');
        });
    });

    // Hexágono responsivo
    const handleHexagonResize = () => {
        const techCircle = document.querySelector('.tech-circle');
        techCircle.classList.toggle('mobile-view', window.innerWidth <= 768);
        techCircle.classList.toggle('desktop-view', window.innerWidth > 768);
    };

    window.addEventListener('load', handleHexagonResize);
    window.addEventListener('resize', handleHexagonResize);
});
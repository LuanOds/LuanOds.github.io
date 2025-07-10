document.addEventListener('DOMContentLoaded', function() {
    // Loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    
    // Simulate loading
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500);
    
    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('.nav');
    const body = document.body;
    
    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        nav.classList.toggle('active');
        body.classList.toggle('no-scroll');
    });
    
    // Close menu when clicking on nav links
    document.querySelectorAll('.nav a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            nav.classList.remove('active');
            body.classList.remove('no-scroll');
        });
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Animate skill bars
    const skillBars = document.querySelectorAll('.skill-bar');
    
    function animateSkillBars() {
        skillBars.forEach(bar => {
            const level = bar.getAttribute('data-level');
            bar.style.width = '0';
            
            setTimeout(() => {
                bar.style.width = level + '%';
            }, 100);
        });
    }
    
    // Animate grid cells
    function animateGridCells() {
        const gridCells = document.querySelectorAll('.grid-cell');
        let delay = 0;
        
        gridCells.forEach(cell => {
            setTimeout(() => {
                cell.classList.add('active');
                setTimeout(() => {
                    cell.classList.remove('active');
                }, 1000);
            }, delay);
            
            delay += 100;
        });
        
        // Continuous animation
        setInterval(() => {
            const randomCell = Math.floor(Math.random() * gridCells.length);
            gridCells[randomCell].classList.add('active');
            
            setTimeout(() => {
                gridCells[randomCell].classList.remove('active');
            }, 1000);
        }, 300);
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('about-content')) {
                    animateSkillBars();
                }
                
                if (entry.target.classList.contains('tech-grid')) {
                    animateGridCells();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const sectionsToObserve = document.querySelectorAll('.about-content, .tech-grid');
    sectionsToObserve.forEach(section => {
        observer.observe(section);
    });
    
    // Form submission
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Here you would typically send the form data to a server
            // For demonstration, we'll just show an alert
            alert('Mensagem enviada com sucesso! Entrarei em contato em breve.');
            this.reset();
        });
    }
    
    // Handle unavailable buttons
    document.querySelectorAll('.unavailable').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.preventDefault();
            const networkName = this.getAttribute('data-network') || 'esta aplicação';
            alert(`Desculpe, ${networkName} ainda não está disponível. Estamos trabalhando nisso!`);
            
            // Shake effect for feedback
            this.style.animation = 'shake 0.5s';
            setTimeout(() => {
                this.style.animation = '';
            }, 500);
        });
    });
    
    // Touch feedback for buttons
    document.querySelectorAll('a, button').forEach(el => {
        el.addEventListener('touchstart', function() {
            this.classList.add('touch-active');
        }, { passive: true });
        
        el.addEventListener('touchend', function() {
            this.classList.remove('touch-active');
        }, { passive: true });
    });
    
    // Prevent zoom on input focus in mobile
    document.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            document.documentElement.style.zoom = '1.0';
        }
    }, { passive: true });
});
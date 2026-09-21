// Smooth scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
const navbar = document.querySelector('.navbar');
let navbarUpdateQueued = false;
let navbarIsScrolled = false;

const updateNavbar = () => {
    const isScrolled = window.scrollY > 50;
    navbarUpdateQueued = false;

    if (isScrolled === navbarIsScrolled) return;

    navbarIsScrolled = isScrolled;
    if (isScrolled) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)';
        navbar.style.background = 'rgba(255, 248, 240, 0.98)';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.background = 'rgba(255, 248, 240, 0.9)';
    }
};

window.addEventListener('scroll', () => {
    if (!navbarUpdateQueued) {
        navbarUpdateQueued = true;
        requestAnimationFrame(updateNavbar);
    }
}, { passive: true });

// Product Image Thumbnail Swapper
const thumbs = document.querySelectorAll('.thumb');
const mainImg = document.querySelector('.main-product-img');

thumbs.forEach(thumb => {
    thumb.addEventListener('click', function () {
        const nextSrc = this.dataset.full;
        if (!mainImg || !nextSrc) return;

        thumbs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        // Fade out, swap the source, fade back in.
        mainImg.style.opacity = '0';
        mainImg.style.transform = 'scale(0.97)';

        setTimeout(() => {
            mainImg.src = nextSrc;
            mainImg.alt = this.alt;
            mainImg.style.opacity = '1';
            mainImg.style.transform = 'scale(1)';
        }, 200);
    });
});

// Reviews show/hide toggle
const reviewsToggle = document.querySelector('.reviews-toggle');
const reviewsGrid = document.querySelector('.reviews-grid');

if (reviewsToggle && reviewsGrid) {
    reviewsToggle.addEventListener('click', () => {
        const isOpen = reviewsGrid.classList.toggle('is-open');
        reviewsToggle.textContent = isOpen ? 'Hide Reviews' : 'Show Reviews';
        reviewsToggle.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) {
            reviewsGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

// Scroll Reveal Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
            entry.target.style.opacity = 1;
            entry.target.classList.add('fade-in-up');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.pricing-card, .glass-panel, .section-header').forEach((el) => {
    el.style.opacity = 0;
    observer.observe(el);
});

// ==========================================
// GSAP Apple-like Framer Motion Animations
// ==========================================
const hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

if (hasGsap) {
    gsap.registerPlugin(ScrollTrigger);
}

// ==========================================
// IMAGE SEQUENCE ANIMATION
// ==========================================
const canvas = document.getElementById("sequence-canvas");
if (canvas && hasGsap) {
    const context = canvas.getContext("2d");

    const frameCount = 240;
    const currentFrame = index => (
      `7/an/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg`
    );

    const images = new Map();
    const imageSequence = {
      frame: 0
    };
    const preloadAhead = 24;
    const preloadBehind = 6;
    const maxCachedFrames = 48;

    const loadFrame = index => {
        if (index < 0 || index >= frameCount || images.has(index)) {
            return images.get(index);
        }

        const image = new Image();
        image.decoding = 'async';
        image.src = currentFrame(index);
        image.addEventListener('error', () => {
            if (images.get(index) === image) images.delete(index);
        }, { once: true });
        images.set(index, image);
        return image;
    };

    const trimFrameCache = currentFrameIndex => {
        if (images.size <= maxCachedFrames) return;

        [...images.keys()]
            .sort((a, b) => Math.abs(b - currentFrameIndex) - Math.abs(a - currentFrameIndex))
            .slice(0, images.size - maxCachedFrames)
            .forEach(index => images.delete(index));
    };

    const preloadNearbyFrames = currentFrameIndex => {
        const start = Math.max(0, currentFrameIndex - preloadBehind);
        const end = Math.min(frameCount - 1, currentFrameIndex + preloadAhead);

        for (let index = start; index <= end; index += 1) {
            loadFrame(index);
        }

        trimFrameCache(currentFrameIndex);
    };

    const render = () => {
        const frameIndex = Math.round(imageSequence.frame);
        const image = loadFrame(frameIndex);

        if (image && image.complete && image.naturalWidth) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0);
        }

        preloadNearbyFrames(frameIndex);
    }

    // Load only the first visible frame immediately. Remaining frames are
    // requested around the viewer's scroll position instead of all at once.
    const initialImage = loadFrame(0);
    initialImage.addEventListener('load', () => {
        canvas.width = initialImage.naturalWidth;
        canvas.height = initialImage.naturalHeight;
        render();
    }, { once: true });

    // Scroll animation for sequence frames
    gsap.to(imageSequence, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: "#features-sequence",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5
      },
      onUpdate: render
    });

}

// Parallax and fade effect for Hero text
if (hasGsap) {
gsap.to('.hero-content', {
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom center',
        scrub: 1 // smooth scrubbing like framer motion
    },
    y: 150,
    opacity: 0,
    scale: 0.95,
    ease: "none"
});

// Animate the hero photo for a subtle parallax depth effect on scroll
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const heroImg = document.querySelector('.hero-media img');

if (hasGsap && heroImg && !prefersReducedMotion) {
    gsap.to(heroImg, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
}
}

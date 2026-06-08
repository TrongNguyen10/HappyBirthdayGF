function initIndexPage() {
    const cursor = document.querySelector('.cursor');
    if (cursor) {
        if (window.__indexMouseMove) {
            document.removeEventListener('mousemove', window.__indexMouseMove);
        }
        window.__indexMouseMove = (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        };
        document.addEventListener('mousemove', window.__indexMouseMove);
    }

    const greetingText = "Chúc em không chỉ sinh nhật, mà suốt cuộc đời luôn vui vẻ và hạnh phúc 💖";
    const greetingElement = document.querySelector('.greeting');
    if (!greetingElement) return;

    let charIndex = 0;
    greetingElement.textContent = '';

    function typeGreeting() {
        if (charIndex < greetingText.length) {
            greetingElement.textContent += greetingText.charAt(charIndex);
            charIndex++;
            setTimeout(typeGreeting, 100);
        }
    }

    const floatingElements = ['💖', '✨', '🌸', '💫', '💕'];
    function createFloating() {
        const element = document.createElement('div');
        element.className = 'floating';
        element.textContent = floatingElements[Math.floor(Math.random() * floatingElements.length)];
        element.style.left = Math.random() * 100 + 'vw';
        element.style.top = Math.random() * 100 + 'vh';
        element.style.fontSize = (Math.random() * 20 + 20) + 'px';
        document.body.appendChild(element);

        gsap.to(element, {
            y: -500,
            x: Math.random() * 100 - 50,
            rotation: Math.random() * 360,
            duration: Math.random() * 5 + 5,
            opacity: 1,
            ease: "none",
            onComplete: () => element.remove()
        });
    }

    const ctaButton = document.querySelector('.cta-button');
    const freshButton = ctaButton ? ctaButton.cloneNode(true) : null;
    if (ctaButton && freshButton) {
        ctaButton.parentNode.replaceChild(freshButton, ctaButton);
    }

    gsap.to('h1', {
        opacity: 1,
        duration: 1,
        y: 20,
        ease: "bounce.out"
    });

    if (freshButton) {
        gsap.to(freshButton, {
            opacity: 1,
            duration: 1,
            y: -20,
            ease: "back.out"
        });
    }

    typeGreeting();
    if (window.__indexFloatingInterval) clearInterval(window.__indexFloatingInterval);
    window.__indexFloatingInterval = setInterval(createFloating, 1000);

    if (freshButton) {
        freshButton.addEventListener('mouseenter', () => {
            gsap.to(freshButton, { scale: 1.1, duration: 0.3 });
        });

        freshButton.addEventListener('mouseleave', () => {
            gsap.to(freshButton, { scale: 1, duration: 0.3 });
        });

        freshButton.addEventListener('click', () => {
            saveMusicState();
            gsap.to('body', {
                opacity: 0,
                duration: 1,
                onComplete: async () => {
                    try {
                        await navigateTo('cause.html');
                        gsap.set('body', { opacity: 0 });
                        gsap.to('body', { opacity: 1, duration: 0.6 });
                    } catch {
                        window.location.href = 'cause.html';
                    }
                }
            });
        });
    }
}

window.initIndexPage = initIndexPage;
initIndexPage();

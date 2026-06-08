const reasons = [
    {
        text: "Xem lại những hình ảnh cũ của em, anh cảm nhận em là 1 cô gái tích cực, hay cười và lạc quan. Nhưng có lẽ áp lực cuộc sống và trải qua những thăng trầm khiến em dần mất đi điều đó. 💖",
        emoji: "🌟",
        gif: "gif1.gif"
    },
    {
        text: "Quá khứ của em không có anh, anh không biết em đã trải qua những gì, những ai đã khiến em khó mở lòng và hoài nghi nhiều thứ. 🌸 ",
        emoji: "💗",
        gif: "gif2.gif"
    },
    {
        text: "Nhưng anh thì khác, anh mong muốn bù đắp phần nào những thiếu thốn trước đây của em và cố gắng đưa em trở về là Thu Nhi hay cười của ngày xưa. ✨ ",
        emoji: "💕",
        gif: "gif1.gif"
    },
    {
        text: "Anh mong muốn mỗi khi em cảm thấy cô đơn, thì vẫn nhớ ngoài gia đình, bạn bè, chị em đồng nghiệp ra, vẫn còn anh ở đây với em 😙 ( đừng đăng story suy tư bùn bùn nữa ).",
        emoji: "🌟",
        gif: "gif2.gif"
    }
];

let currentReasonIndex = 0;
let isTransitioning = false;
let floatingInterval = null;

function createReasonCard(reason) {
    const card = document.createElement('div');
    card.className = 'reason-card';

    const text = document.createElement('div');
    text.className = 'reason-text';
    text.innerHTML = `${reason.emoji} ${reason.text}`;

    const gifOverlay = document.createElement('div');
    gifOverlay.className = 'gif-overlay';
    gifOverlay.innerHTML = `<img src="${reason.gif}" alt="Friendship Memory">`;

    card.appendChild(text);
    card.appendChild(gifOverlay);

    gsap.from(card, {
        opacity: 0,
        y: 50,
        duration: 0.5,
        ease: "back.out"
    });

    return card;
}

function createFloatingElement() {
    const elements = ['🌸', '✨', '💖', '🦋', '⭐'];
    const element = document.createElement('div');
    element.className = 'floating';
    element.textContent = elements[Math.floor(Math.random() * elements.length)];
    element.style.left = Math.random() * window.innerWidth + 'px';
    element.style.top = Math.random() * window.innerHeight + 'px';
    element.style.fontSize = (Math.random() * 20 + 10) + 'px';
    document.body.appendChild(element);

    gsap.to(element, {
        y: -500,
        duration: Math.random() * 10 + 10,
        opacity: 0,
        onComplete: () => element.remove()
    });
}

function displayNewReason(reasonsContainer, shuffleButton, reasonCounter) {
    if (isTransitioning) return;
    isTransitioning = true;

    if (currentReasonIndex < reasons.length) {
        const card = createReasonCard(reasons[currentReasonIndex]);
        reasonsContainer.appendChild(card);
        reasonCounter.textContent = `Reason ${currentReasonIndex + 1} of ${reasons.length}`;
        currentReasonIndex++;

        if (currentReasonIndex === reasons.length) {
            gsap.to(shuffleButton, {
                scale: 1.1,
                duration: 0.5,
                ease: "elastic.out",
                onComplete: () => {
                    shuffleButton.textContent = "Tiếp thôi nào 💫";
                    shuffleButton.classList.add('story-mode');
                    shuffleButton.addEventListener('click', () => {
                        saveMusicState();
                        gsap.to('body', {
                            opacity: 0,
                            duration: 1,
                            onComplete: async () => {
                                try {
                                    await navigateTo('last.html');
                                    gsap.set('body', { opacity: 0 });
                                    gsap.to('body', { opacity: 1, duration: 0.6 });
                                } catch {
                                    window.location.href = 'last.html';
                                }
                            }
                        });
                    }, { once: true });
                }
            });
        }

        createFloatingElement();
        setTimeout(() => { isTransitioning = false; }, 500);
    } else {
        isTransitioning = false;
    }
}

function initCausePage() {
    if (floatingInterval) clearInterval(floatingInterval);

    currentReasonIndex = 0;
    isTransitioning = false;

    const reasonsContainer = document.getElementById('reasons-container');
    const shuffleButton = document.querySelector('.shuffle-button');
    const reasonCounter = document.querySelector('.reason-counter');
    const cursor = document.querySelector('.custom-cursor');

    if (!reasonsContainer || !shuffleButton || !reasonCounter) return;

    reasonsContainer.innerHTML = '';
    reasonCounter.textContent = '';
    shuffleButton.textContent = 'Bấm zô... 💕';
    shuffleButton.classList.remove('story-mode');

    if (cursor) {
        if (window.__causeMouseMove) {
            document.removeEventListener('mousemove', window.__causeMouseMove);
        }
        window.__causeMouseMove = (e) => {
            gsap.to(cursor, {
                x: e.clientX - 15,
                y: e.clientY - 15,
                duration: 0.2
            });
        };
        document.addEventListener('mousemove', window.__causeMouseMove);
    }

    const freshButton = shuffleButton.cloneNode(true);
    shuffleButton.parentNode.replaceChild(freshButton, shuffleButton);

    freshButton.addEventListener('click', () => {
        gsap.to(freshButton, {
            scale: 0.9,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
        displayNewReason(reasonsContainer, freshButton, reasonCounter);
    });

    floatingInterval = setInterval(createFloatingElement, 2000);
}

window.initCausePage = initCausePage;
initCausePage();

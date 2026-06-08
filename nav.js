function clearPageStyles() {
    document.querySelectorAll('[data-page-asset]').forEach((node) => node.remove());
    document.querySelectorAll('link[rel="stylesheet"]').forEach((node) => node.remove());
    document.querySelectorAll('head > style').forEach((node) => {
        if (node.textContent.includes('#musicToggle')) return;
        node.remove();
    });
}

const PAGE_SCRIPTS = {
    'index.html': 'script.js',
    'cause.html': 'cause.js',
    'last.html': null
};

async function navigateTo(url, options = {}) {
    const target = url.split('/').pop().split('?')[0] || 'index.html';

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load ${url}`);

    const html = await response.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');

    clearPageStyles();
    document.body.removeAttribute('style');

    doc.querySelectorAll('head link[rel="stylesheet"], head style').forEach((node) => {
        const el = document.importNode(node, true);
        el.setAttribute('data-page-asset', 'true');
        document.head.appendChild(el);
    });

    doc.querySelectorAll('head script[src]').forEach((node) => {
        const src = node.getAttribute('src');
        if (!src || document.querySelector(`script[src="${src}"]`)) return;
        const el = document.importNode(node, true);
        document.head.appendChild(el);
    });

    document.title = doc.title;

    const preserved = ['bgMusic', 'musicToggle']
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    document.querySelectorAll('script[data-page-script]').forEach((node) => node.remove());

    const fragment = document.createDocumentFragment();
    preserved.forEach((el) => fragment.appendChild(el));

    [...doc.body.children].forEach((child) => {
        if (child.tagName === 'SCRIPT') return;
        fragment.appendChild(document.importNode(child, true));
    });

    document.body.replaceChildren(fragment);

    const scriptSrc = PAGE_SCRIPTS[target];
    if (scriptSrc) {
        await loadPageScript(scriptSrc);
    }

    if (!options.skipHistory) {
        history.pushState({ page: url }, '', url);
    }

    return target;
}

function loadPageScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.dataset.pageScript = 'true';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

window.addEventListener('popstate', (event) => {
    if (event.state?.page) {
        navigateTo(event.state.page, { skipHistory: true });
    }
});

if (!history.state?.page) {
    history.replaceState({ page: location.pathname.split('/').pop() || 'index.html' }, '', location.href);
}

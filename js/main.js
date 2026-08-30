(function () {
    'use strict';

    function safeGet(key) {
        try { return localStorage.getItem(key); } catch (e) { return null; }
    }

    function safeSet(key, value) {
        try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    }

    var html = document.documentElement;

    // ---------- Theme toggle ----------
    function initTheme() {
        var savedTheme = safeGet('theme');
        if (savedTheme) { html.setAttribute('data-theme', savedTheme); }

        var toggle = document.getElementById('theme-toggle');
        if (!toggle) { return; }
        toggle.addEventListener('click', function () {
            var isDark = html.getAttribute('data-theme') === 'dark';
            var next = isDark ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            safeSet('theme', next);
        });
    }

    // ---------- Mobile nav ----------
    function initMobileNav() {
        var toggle = document.getElementById('nav-toggle');
        var nav = document.getElementById('site-nav');
        if (!toggle || !nav) { return; }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('nav-open');
        });
    }

    // ---------- Search ----------
    function initSearch() {
        var toggle = document.getElementById('search-toggle');
        var modal = document.getElementById('search-modal');
        var overlay = document.getElementById('search-overlay');
        var input = document.getElementById('search-input');
        var results = document.getElementById('search-results');
        if (!toggle || !modal) { return; }

        var postsCache = null;
        var postsPromise = null;

        function loadPosts() {
            if (postsCache) { return Promise.resolve(postsCache); }
            if (!postsPromise) {
                postsPromise = fetch('/api/search.json')
                    .then(function (r) { return r.ok ? r.json() : []; })
                    .then(function (data) {
                        postsCache = Array.isArray(data) ? data : [];
                        return postsCache;
                    })
                    .catch(function () { postsCache = []; return postsCache; });
            }
            return postsPromise;
        }

        function renderResults(list) {
            if (!results) { return; }
            results.innerHTML = '';
            if (!list.length) {
                var li = document.createElement('li');
                li.className = 'search-empty';
                li.textContent = '没有匹配的文章';
                results.appendChild(li);
                return;
            }
            list.forEach(function (post) {
                var li = document.createElement('li');
                var a = document.createElement('a');
                a.href = post.link || '/';
                var title = document.createElement('span');
                title.className = 'sr-title';
                title.textContent = post.title || '';
                var meta = document.createElement('span');
                meta.className = 'sr-meta';
                meta.textContent = (post.date || '').slice(0, 10);
                a.appendChild(title);
                a.appendChild(meta);
                li.appendChild(a);
                results.appendChild(li);
            });
        }

        function runSearch(query) {
            var q = query.trim().toLowerCase();
            if (!q) { renderResults([]); return; }
            loadPosts().then(function (posts) {
                var matched = posts.filter(function (post) {
                    var haystack = (
                        (post.title || '') + ' ' +
                        (post.tags || []).join(' ') + ' ' +
                        (post.content || '')
                    ).toLowerCase();
                    return haystack.indexOf(q) !== -1;
                }).slice(0, 20);
                renderResults(matched);
            });
        }

        function openSearch() {
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
            if (input) {
                input.value = '';
                setTimeout(function () { input.focus(); }, 40);
            }
        }

        function closeSearch() {
            modal.hidden = true;
            document.body.style.overflow = '';
        }

        toggle.addEventListener('click', openSearch);
        if (overlay) { overlay.addEventListener('click', closeSearch); }
        if (input) {
            var debounceTimer = null;
            input.addEventListener('input', function () {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(function () { runSearch(input.value); }, 200);
            });
        }
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeSearch(); }
        });
    }

    // ---------- Reading progress & back-to-top ----------
    function initProgress() {
        var progress = document.getElementById('reading-progress');
        var backToTop = document.getElementById('back-to-top');
        if (!progress && !backToTop) { return; }

        function updateProgress() {
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
            var scrollHeight = (document.documentElement.scrollHeight - window.innerHeight) || 1;
            var pct = Math.min(1, Math.max(0, scrollTop / scrollHeight));
            if (progress) { progress.style.width = (pct * 100) + '%'; }
            if (backToTop) { backToTop.classList.toggle('show', scrollTop > 400); }
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();

        if (backToTop) {
            backToTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    // ---------- Floating TOC scrollspy ----------
    function initToc() {
        var tocBody = document.querySelector('.toc-float-body');
        if (!tocBody) { return; }
        var links = tocBody.querySelectorAll('a[href^="#"]');
        if (!links.length) { return; }
        var ids = [];
        links.forEach(function (link) {
            var id = link.getAttribute('href').slice(1);
            if (id) { ids.push(id); }
        });
        if (!ids.length) { return; }

        function setActive() {
            var pos = window.pageYOffset + 80;
            var currentId = ids[0];
            ids.forEach(function (id) {
                var el = document.getElementById(id);
                if (el && el.offsetTop <= pos) { currentId = id; }
            });
            links.forEach(function (link) {
                var on = link.getAttribute('href') === '#' + currentId;
                if (on) { link.classList.add('active'); } else { link.classList.remove('active'); }
            });
        }

        window.addEventListener('scroll', setActive, { passive: true });
        setActive();
    }

    // ---------- Lightbox ----------
    function initLightbox() {
        var lightbox = document.getElementById('lightbox');
        var lightboxImg = document.getElementById('lightbox-img');
        var lightboxBackdrop = document.getElementById('lightbox-backdrop');
        var lightboxClose = document.getElementById('lightbox-close');
        if (!lightbox) { return; }

        function openLightbox(src, alt) {
            if (!lightboxImg || !src) { return; }
            lightboxImg.src = src;
            lightboxImg.alt = alt || '';
            lightbox.hidden = false;
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            lightbox.hidden = true;
            if (lightboxImg) { lightboxImg.src = ''; }
            document.body.style.overflow = '';
        }

        document.addEventListener('click', function (e) {
            var img = e.target.closest('.post-content img, .about-content img, .post-cover img');
            if (img) {
                e.preventDefault();
                openLightbox(img.getAttribute('src'), img.getAttribute('alt'));
            }
        });
        if (lightboxBackdrop) { lightboxBackdrop.addEventListener('click', closeLightbox); }
        if (lightboxClose) { lightboxClose.addEventListener('click', closeLightbox); }
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') { closeLightbox(); }
        });
    }

    function initAll() {
        var inits = [initTheme, initMobileNav, initSearch, initProgress, initToc, initLightbox];
        inits.forEach(function (fn) {
            try { fn(); } catch (e) {
                if (window.console && console.error) { console.error('schlen init error:', e); }
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();

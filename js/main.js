(function () {
    'use strict';

    var html = document.documentElement;

    // ---------- Theme toggle ----------
    function applyTheme(theme) {
        if (theme) {
            html.setAttribute('data-theme', theme);
        }
    }

    function currentTheme() {
        return html.getAttribute('data-theme') || 'light';
    }

    var savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    }

    var themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('theme', next);
        });
    }

    // ---------- Mobile nav ----------
    var navToggle = document.getElementById('nav-toggle');
    var siteNav = document.getElementById('site-nav');
    if (navToggle && siteNav) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('nav-open');
        });
    }

    // ---------- Search ----------
    var searchToggle = document.getElementById('search-toggle');
    var searchModal = document.getElementById('search-modal');
    var searchOverlay = document.getElementById('search-overlay');
    var searchInput = document.getElementById('search-input');
    var searchResults = document.getElementById('search-results');

    var postsCache = null;
    var postsPromise = null;

    function loadPosts() {
        if (postsCache) {
            return Promise.resolve(postsCache);
        }
        if (!postsPromise) {
            postsPromise = fetch('/api/search.json')
                .then(function (r) { return r.ok ? r.json() : []; })
                .then(function (data) {
                    postsCache = Array.isArray(data) ? data : [];
                    return postsCache;
                })
                .catch(function () {
                    postsCache = [];
                    return postsCache;
                });
        }
        return postsPromise;
    }

    function renderResults(list) {
        searchResults.innerHTML = '';
        if (!list.length) {
            var li = document.createElement('li');
            li.className = 'search-empty';
            li.textContent = '没有匹配的文章';
            searchResults.appendChild(li);
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
            searchResults.appendChild(li);
        });
    }

    function runSearch(query) {
        var q = query.trim().toLowerCase();
        if (!q) {
            renderResults([]);
            return;
        }
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
        if (!searchModal) { return; }
        searchModal.hidden = false;
        document.body.style.overflow = 'hidden';
        if (searchInput) {
            searchInput.value = '';
            setTimeout(function () { searchInput.focus(); }, 40);
        }
    }

    function closeSearch() {
        if (!searchModal) { return; }
        searchModal.hidden = true;
        document.body.style.overflow = '';
    }

    if (searchToggle && searchModal) {
        searchToggle.addEventListener('click', openSearch);
    }
    if (searchOverlay) {
        searchOverlay.addEventListener('click', closeSearch);
    }
    if (searchInput) {
        var debounceTimer = null;
        searchInput.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                runSearch(searchInput.value);
            }, 200);
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeSearch();
        }
    });
})();

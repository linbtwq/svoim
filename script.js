/* SVOIM ядро режим слабких пристроїв, пошук, бокова панель, фільтри, перегляд на телефоні */

// 1. режим для слабких пристроїв - одразу (скрипт в <head>), щоб не мигало
(function () {
    var conn = navigator.connection || {};
    var weak =
        (navigator.hardwareConcurrency || 4) < 4 ||
        (navigator.deviceMemory || 4) < 3 ||
        conn.saveData === true ||
        /2g$/.test(conn.effectiveType || '') ||
        matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (weak) document.documentElement.classList.add('low-end');
    try {
        if (JSON.parse(localStorage.getItem('sv-calm')) === true) document.documentElement.classList.add('reduce-motion');
    } catch (e) {}
})();

// 2. спільні помічники пошук по даних з data.js
var SV = window.SV = (function () {
    var D = window.SV_DATA || { services: [], places: [], offers: [], events: [] };
    var norm = function (s) { return String(s || '').toLowerCase().replace(/[’`ʼ]/g, "'"); };
    var esc = function (s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    };
    var byId = function (list, id) { return list.filter(function (x) { return x.id === id; })[0] || null; };
    var service = function (id) { return byId(D.services, id); };
    var place = function (id) { return byId(D.places, id); };

    function matcher(q) {
        var words = norm(q).split(/\s+/).filter(Boolean);
        return function (hay) { hay = norm(hay); return words.every(function (w) { return hay.indexOf(w) !== -1; }); };
    }
    function find(q) {
        var m = matcher(q);
        return {
            services: D.services.filter(function (s) { return m(s.label); }),
            places: D.places.filter(function (p) {
                var svc = (p.services || []).map(function (id) { return (service(id) || {}).label; }).join(' ');
                return m([p.name, p.category, p.description, p.address, svc].join(' '));
            }),
            offers: D.offers.filter(function (o) {
                return m([o.title, o.category, (place(o.place) || {}).name].join(' '));
            }),
            events: D.events.filter(function (e) { return m([e.title, e.place, e.category].join(' ')); })
        };
    }
    function byService(id) {
        var places = D.places.filter(function (p) { return (p.services || []).indexOf(id) !== -1; });
        var ids = places.map(function (p) { return p.id; });
        return {
            places: places,
            offers: D.offers.filter(function (o) { return ids.indexOf(o.place) !== -1; }),
            events: []
        };
    }
    return { data: D, esc: esc, norm: norm, find: find, byService: byService, service: service, place: place };
})();

// 3. легка вібрація при натисканні (де підтримується)
document.addEventListener('click', function (e) {
    if (navigator.vibrate && e.target.closest('.btn, .card, .tile, .row, .chip, .bottom-nav__item')) navigator.vibrate(10);
});

document.addEventListener('DOMContentLoaded', function () {
    var esc = SV.esc, D = SV.data;
    var emptyMsg = document.querySelector('[data-empty]');

    /* ---------- пошук по плитках ---------- */
    var search = document.querySelector('[data-search]');
    if (search) {
        var tiles = document.querySelectorAll('[data-tile]');
        search.addEventListener('input', function () {
            var q = SV.norm(search.value.trim());
            var shown = 0;
            tiles.forEach(function (li) {
                var ok = SV.norm(li.textContent).indexOf(q) !== -1;
                li.hidden = !ok;
                if (ok) shown++;
            });
            if (emptyMsg) emptyMsg.hidden = shown > 0;
        });
    }

    /* ---------- фільтри чіпси (групи: data-group="day" | "cat" | "type", типово "cat") ---------- */
    var chips = document.querySelectorAll('[data-filter]');
    if (chips.length) {
        var items = document.querySelectorAll('[data-cat], [data-day], [data-type]');
        var state = {};
        var apply = function () {
            var shown = 0;
            items.forEach(function (el) {
                var ok = Object.keys(state).every(function (g) {
                    return state[g] === 'all' || (el.dataset[g] || '').split(' ').indexOf(state[g]) !== -1;
                });
                el.hidden = !ok;
                if (ok) shown++;
            });
            if (emptyMsg) emptyMsg.hidden = shown > 0;
        };
        chips.forEach(function (chip) {
            var g = chip.dataset.group || 'cat';
            if (chip.classList.contains('is-active')) state[g] = chip.dataset.filter;
            chip.addEventListener('click', function () {
                state[g] = chip.dataset.filter;
                chips.forEach(function (c) {
                    if ((c.dataset.group || 'cat') !== g) return;
                    c.classList.toggle('is-active', c === chip);
                    c.setAttribute('aria-pressed', c === chip);
                });
                apply();
            });
        });
        apply();
    }

    /* ---------- кнопки перемикачі ---------- */
    document.querySelectorAll('[data-toggle]').forEach(function (b) {
        b.addEventListener('click', function () {
            b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
        });
    });

    /* ---------- поділитися ---------- */
    document.querySelectorAll('[data-share]').forEach(function (b) {
        b.addEventListener('click', function () {
            var data = { title: document.title, url: location.href };
            if (navigator.share) { navigator.share(data).catch(function () {}); }
            else if (navigator.clipboard) { navigator.clipboard.writeText(location.href); b.setAttribute('aria-label', 'Посилання скопійовано'); }
        });
    });

    /* ---------- блокування прокрутки під панелями ---------- */
    var openCount = 0;
    function lock(on) { openCount += on ? 1 : -1; document.body.style.overflow = openCount > 0 ? 'hidden' : ''; }

    /* ---------- бокова панель справа ---------- */
    var current = location.pathname.split('/').pop() || 'index.html';
    var links = [['index.html', 'home', 'Головна'], ['needs.html', 'build', 'Знайти потрібне'], ['map.html', 'location_on', 'Мапа'],
                 ['discounts.html', 'percent', 'Для своїх'], ['events.html', 'calendar_month', 'Що відбувається'], ['profile.html', 'person', 'Профіль']];
    var desktopNav = document.querySelector('.header__nav');
    if (desktopNav && !desktopNav.querySelector('a[href="map.html"]')) {
        var mapLink = document.createElement('a');
        mapLink.className = 'header__link' + (current === 'map.html' ? ' is-active' : '');
        mapLink.href = 'map.html';
        mapLink.textContent = 'Мапа';
        if (current === 'map.html') mapLink.setAttribute('aria-current', 'page');
        desktopNav.appendChild(mapLink);
    }
    var backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    var drawer = document.createElement('aside');
    drawer.className = 'drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Меню');
    drawer.innerHTML =
        '<div class="drawer__head"><span class="drawer__logo">SVOIM</span>' +
        '<button class="icon-btn" type="button" aria-label="Закрити меню" data-drawer-close><span class="material-symbols-outlined">close</span></button></div>' +
        '<nav class="menu-list" aria-label="Меню сайту">' +
        links.map(function (l) {
            return '<a class="menu-item' + (l[0] === current ? ' is-active' : '') + '" href="' + l[0] + '"' + (l[0] === current ? ' aria-current="page"' : '') + '>' +
                '<span class="material-symbols-outlined">' + l[1] + '</span>' + l[2] + '<span class="material-symbols-outlined">chevron_right</span></a>';
        }).join('') + '</nav>' +
        '<p class="drawer__foot">for students. by students.<br>' + esc(D.city || '') + '</p>';
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    var drawerOpener = null;
    function drawerToggle(open, opener) {
        if (open === drawer.classList.contains('is-open')) return;
        drawer.classList.toggle('is-open', open);
        backdrop.classList.toggle('is-open', open);
        lock(open);
        if (open) { drawerOpener = opener; drawer.querySelector('[data-drawer-close]').focus(); }
        else if (drawerOpener) drawerOpener.focus();
    }
    document.querySelectorAll('.header [aria-label="Меню"]').forEach(function (b) {
        b.addEventListener('click', function () { drawerToggle(true, b); });
    });
    backdrop.addEventListener('click', function () { drawerToggle(false); });
    drawer.querySelector('[data-drawer-close]').addEventListener('click', function () { drawerToggle(false); });

    /* ---------- пошук по всьому сайту ---------- */
    var sheet = null, sheetOpener = null;
    function link(href, icon, text, sub) {
        return '<a class="menu-item" href="' + href + '"><span class="material-symbols-outlined">' + icon + '</span>' +
            '<span>' + esc(text) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</span>' +
            '<span class="material-symbols-outlined">chevron_right</span></a>';
    }
    function group(title, arr) { return arr.length ? '<h2 class="sheet-title">' + title + '</h2>' + arr.join('') : ''; }
    function renderSheet(q) {
        var out = sheet.querySelector('[data-sheet-results]');
        q = q.trim();
        if (!q) {
            out.innerHTML = group('Часті запити', D.services.slice(0, 6).map(function (s) {
                return link('results.html?service=' + s.id, s.icon, s.label);
            }));
            return;
        }
        var r = SV.find(q);
        var html =
            group('Що можна зробити', r.services.slice(0, 5).map(function (s) { return link('results.html?service=' + s.id, s.icon, s.label); })) +
            group('Місця', r.places.slice(0, 5).map(function (p) {
                var returnTo = (location.pathname.split('/').pop() || 'index.html') + location.search;
                return link('place.html?id=' + encodeURIComponent(p.id) + '&return=' + encodeURIComponent(returnTo), 'location_on', p.name, p.category);
            })) +
            group('Знижки', r.offers.slice(0, 5).map(function (o) { return link('discounts.html', 'local_offer', o.title, o.category); })) +
            group('Події', r.events.slice(0, 5).map(function (e) { return link('events.html', 'calendar_month', e.title, e.place); }));
        out.innerHTML = html
            ? html + link('results.html?q=' + encodeURIComponent(q), 'search', 'Усі результати для «' + q + '»')
            : '<p class="empty">Нічого не знайшли. Спробуй інші слова — або зазирни пізніше, ми додаємо нові місця.</p>';
    }
    function sheetToggle(open, opener) {
        if (open && !sheet) {
            sheetOpener = opener;
            sheet = document.createElement('div');
            sheet.className = 'search-sheet';
            sheet.setAttribute('role', 'dialog');
            sheet.setAttribute('aria-modal', 'true');
            sheet.setAttribute('aria-label', 'Пошук');
            sheet.innerHTML =
                '<div class="search-sheet__inner"><form class="search" action="results.html">' +
                '<span class="material-symbols-outlined">search</span>' +
                '<input type="search" name="q" placeholder="Що тобі потрібно?" autocomplete="off" aria-label="Пошук">' +
                '<button class="icon-btn" type="button" aria-label="Закрити пошук" data-sheet-close><span class="material-symbols-outlined">close</span></button>' +
                '</form><div data-sheet-results></div></div>';
            document.body.appendChild(sheet);
            lock(true);
            var input = sheet.querySelector('input');
            input.addEventListener('input', function () { renderSheet(input.value); });
            sheet.querySelector('[data-sheet-close]').addEventListener('click', function () { sheetToggle(false); });
            renderSheet('');
            input.focus();
        } else if (!open && sheet) {
            sheet.remove();
            sheet = null;
            lock(false);
            if (sheetOpener) sheetOpener.focus();
        }
    }
    document.querySelectorAll('.header [aria-label="Пошук"]').forEach(function (b) {
        b.addEventListener('click', function (e) { e.preventDefault(); sheetToggle(true, b); });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (sheet) sheetToggle(false);
        else if (drawer.classList.contains('is-open')) drawerToggle(false);
        else if (overlay) btn.click();
    });

    /* ---------- перегляд на телефоні (тільки на десктопі, не всередині iframe) ---------- */
    if (window.self !== window.top) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preview-toggle';
    var overlay = null;
    function label(mobile) {
        btn.innerHTML = '<span class="material-symbols-outlined">' + (mobile ? 'desktop_windows' : 'smartphone') + '</span>' + (mobile ? 'Десктоп' : 'Телефон');
        btn.setAttribute('aria-pressed', mobile);
    }
    btn.addEventListener('click', function () {
        if (overlay) { overlay.remove(); overlay = null; }
        else {
            overlay = document.createElement('div');
            overlay.className = 'device-overlay';
            overlay.innerHTML = '<div class="device"><iframe src="' + esc(location.href) + '" title="Перегляд на телефоні"></iframe></div>';
            document.body.appendChild(overlay);
        }
        label(!!overlay);
    });
    label(false);
    document.body.appendChild(btn);
});
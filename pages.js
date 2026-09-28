/* SVOIM - малює сторінки з data.js. виконується до DOMContentLoaded тому фільтри з script.js бачать готові списки. */
(function () {
    'use strict';
    var D = SV.data, esc = SV.esc;
    var page = document.body.dataset.page;
    var qs = new URLSearchParams(location.search);
    var $ = function (s) { return document.querySelector(s); };
    var enc = encodeURIComponent;
    var GO = '<span class="row__go"><span class="material-symbols-outlined">arrow_forward</span></span>';
    var icon = function (n) { return '<span class="material-symbols-outlined">' + n + '</span>'; };
    var imgStyle = function (o) { return o.image ? ' style="--img:url(\'' + esc(o.image) + '\')"' : ''; };

    function thumb(o, ic) { return '<span class="row__img"' + imgStyle(o) + '>' + (o.image ? '' : icon(ic)) + '</span>'; }
    function rating(p) { return p.rating ? '<span class="rating">' + icon('star') + esc(p.rating) + (p.reviews ? ' (' + esc(p.reviews) + ')' : '') + '</span>' : ''; }
    function notFound(title, text) {
        return '<div class="empty-state">' + icon('search') + '<h1 class="page-head__title">' + title + '</h1><p>' + text + '</p>' +
            '<a class="btn" href="needs.html">Знайти потрібне' + icon('arrow_forward') + '</a></div>';
    }
    function list(html, msg) {
        $('[data-list]').innerHTML = html;
        var e = $('[data-empty]');
        if (e && msg) e.textContent = msg;
    }

    /* --- рядки списків --- */
    function rowPlace(p) {
        return '<li data-type="Місця"><a class="row" href="place.html?id=' + enc(p.id) + '">' + thumb(p, 'location_on') +
            '<span class="row__body"><span class="row__title">' + esc(p.name) + '</span><span class="row__meta">' +
            (p.rating ? rating(p) + '<br>' : '') + esc([p.category, p.walk].filter(Boolean).join(', ')) + '</span>' +
            (p.discount ? '<span class="badge badge--soft">' + esc(p.discount) + '</span>' : '') + '</span>' + GO + '</a></li>';
    }
    function rowOffer(o) {
        var p = SV.place(o.place);
        return '<li data-type="Пропозиції"><a class="row" href="' + (p ? 'place.html?id=' + enc(p.id) : 'discounts.html') + '">' + thumb(o, 'local_offer') +
            '<span class="row__body"><span class="row__title">' + esc(o.title) + '</span><span class="row__meta">' +
            esc([p ? p.name : '', o.category].filter(Boolean).join(', ')) + '</span></span>' + GO + '</a></li>';
    }
    function dayInfo(dateStr) {
        var d = new Date(dateStr + 'T00:00:00'), t = new Date();
        t.setHours(0, 0, 0, 0);
        var diff = Math.round((d - t) / 864e5), tok = [];
        if (diff === 0) tok.push('today');
        if (diff === 1) tok.push('tomorrow');
        if (diff >= 0 && diff <= 7) tok.push('week');
        var lbl = diff === 0 ? 'Сьогодні' : diff === 1 ? 'Завтра' : ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2);
        return { tokens: tok.join(' '), label: lbl };
    }
    function rowEvent(e) {
        var di = dayInfo(e.date);
        return '<li data-type="Події" data-day="' + di.tokens + '" data-cat="' + esc(e.category) + '"><a class="row" href="#">' + thumb(e, 'calendar_month') +
            '<span class="row__body"><span class="row__title">' + esc(e.title) + '</span><span class="row__meta">' +
            esc(e.place || '') + '<br>' + di.label + (e.time ? ', ' + esc(e.time) : '') + '</span></span>' + GO + '</a></li>';
    }
    function cardOffer(o) {
        var p = SV.place(o.place);
        return '<li class="offer" data-cat="' + esc(o.category) + '"><div class="offer__img"' + imgStyle(o) + '>' + (o.image ? '' : icon('local_offer')) + '</div>' +
            '<div class="offer__body"><h2 class="offer__title">' + esc(o.title) + '</h2><p class="offer__place">' + esc(p ? p.name : '') + '</p>' +
            '<div class="offer__foot">' + (o.verified ? '<span class="badge">Перевірено SVOIM</span>' : '<span></span>') +
            '<a class="offer__go" href="' + (p ? 'place.html?id=' + enc(p.id) : '#') + '" aria-label="Відкрити пропозицію">' + icon('arrow_forward') + '</a></div></div></li>';
    }
    var byDate = function (a, b) { return (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')); };

    /* --- сторінки --- */
    if (page === 'needs') {
        list(D.services.map(function (s) {
            return '<li data-tile><a class="tile" href="results.html?service=' + s.id + '">' + icon(s.icon) + esc(s.label) + '</a></li>';
        }).join(''));
    }

    if (page === 'discounts') {
        list(D.offers.map(cardOffer).join(''), 'Пропозицій не знайдено. Обери іншу категорію або зазирни пізніше.');
    }

    if (page === 'events') {
        list(D.events.slice().sort(byDate).map(rowEvent).join(''), 'Подій не знайдено. Спробуй інший день чи категорію — або зазирни пізніше.');
    }

    if (page === 'results') {
        var sid = qs.get('service'), q = qs.get('q') || '';
        var svc = sid ? SV.service(sid) : null;
        $('.search input').value = svc ? svc.label : q;
        var r = svc ? SV.byService(sid) : SV.find(q);
        list(r.places.map(rowPlace).join('') + r.offers.map(rowOffer).join('') + r.events.slice().sort(byDate).map(rowEvent).join(''),
            (svc || q) ? 'Нічого не знайшли за цим запитом. Спробуй інші слова — або зазирни пізніше, ми додаємо нові місця.'
                       : 'Тут з’являться місця, знижки та події.');
    }

    if (page === 'place') {
        var p = SV.place(qs.get('id')), root = $('[data-place]');
        if (!p) { root.innerHTML = notFound('Місце не знайдено', 'Можливо, його ще не додали або посилання застаріло.'); $('.page-bar .header__actions').hidden = true; return; }
        document.title = p.name + ' — SVOIM';
        var svcs = (p.services || []).map(SV.service).filter(Boolean);
        var hasGeo = p.lat && p.lng;
        root.innerHTML =
            '<div class="place"><div class="place__img"' + imgStyle(p) + '>' + (p.image ? '' : icon('photo_camera')) + '</div><div class="place__info">' +
            '<h1 class="place__title">' + esc(p.name) + '</h1>' +
            '<p class="place__meta">' + rating(p) + (p.category ? '<span class="tag">' + esc(p.category) + '</span>' : '') + (p.walk ? '<span class="tag">' + esc(p.walk) + '</span>' : '') + '</p>' +
            (p.hours ? '<p class="fact">' + icon('schedule') + esc(p.hours) + '</p>' : '') +
            (svcs.length ? '<ul class="services">' + svcs.map(function (s) { return '<li class="service">' + icon(s.icon) + esc(s.label) + '</li>'; }).join('') + '</ul>' : '') +
            (hasGeo ? '<a class="btn btn--block" href="map.html?id=' + enc(p.id) + '">Прокласти маршрут' + icon('arrow_forward') + '</a>' : '') +
            (p.address ? '<p class="fact fact--spaced">' + icon('location_on') + esc(p.address) + '</p>' : '') +
            (p.perk ? '<div class="perk"><h2 class="perk__title">Умови для студентів</h2><p>' + esc(p.perk) + '</p></div>' : '') +
            (p.description ? '<details class="accordion"><summary>Деталі' + icon('expand_more') + '</summary><p class="accordion__body">' + esc(p.description) + '</p></details>' : '') +
            '</div></div>';

        // запам’ятовується в браузері
        var fav = $('[data-toggle]'), key = 'sv-saved';
        var read = function () { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; } };
        if (read().indexOf(p.id) !== -1) fav.setAttribute('aria-pressed', 'true');
        fav.addEventListener('click', function () {
            var cur = read().filter(function (x) { return x !== p.id; });
            if (fav.getAttribute('aria-pressed') === 'true') cur.push(p.id);
            try { localStorage.setItem(key, JSON.stringify(cur)); } catch (e) {}
        });
    }

    if (page === 'map') {
        var sel = SV.place(qs.get('id')), card = $('[data-map-card]'), note = $('[data-map-note]');
        var title = $('[data-map-title]'), sub = $('[data-map-sub]');
        if (sel) {
            title.textContent = sel.name;
            sub.textContent = [sel.category, sel.walk].filter(Boolean).join(', ');
            $('.back').href = 'place.html?id=' + enc(sel.id);
        } else { title.textContent = 'Мапа'; sub.textContent = D.city; }

        if (typeof L === 'undefined') { note.textContent = 'Мапа не завантажилась. Перевір з’єднання з інтернетом.'; note.hidden = false; return; }
        var map = L.map('map', { attributionControl: false }).setView(sel && sel.lat ? [sel.lat, sel.lng] : D.center, sel ? 16 : 14);
        L.control.attribution({ position: 'topright', prefix: false }).addTo(map);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);

        function showCard(pl) {
            card.innerHTML = '<a class="row" href="place.html?id=' + enc(pl.id) + '">' + thumb(pl, 'location_on') +
                '<span class="row__body"><span class="row__title">' + esc(pl.name) + '</span><span class="row__meta">' + esc([pl.walk, pl.address].filter(Boolean).join(', ')) + '</span></span>' + GO + '</a>' +
                '<a class="btn btn--block" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' + pl.lat + ',' + pl.lng + '&travelmode=walking">Прокласти маршрут' + icon('arrow_forward') + '</a>';
            card.hidden = false;
        }
        var pts = D.places.filter(function (x) { return x.lat && x.lng; });
        pts.forEach(function (pl) {
            L.marker([pl.lat, pl.lng], {
                title: pl.name,
                icon: L.divIcon({ className: 'map-pin' + (sel && sel.id === pl.id ? ' is-active' : ''), html: icon('location_on'), iconSize: [36, 36], iconAnchor: [18, 34] })
            }).addTo(map).on('click', function () { showCard(pl); });
        });
        if (!pts.length) { note.textContent = 'Закладів на мапі поки немає — вони з’являться, щойно їх додадуть.'; note.hidden = false; }
        else if (sel && sel.lat) showCard(sel);
        else if (pts.length > 1) map.fitBounds(pts.map(function (x) { return [x.lat, x.lng]; }), { padding: [40, 40] });
    }
})();
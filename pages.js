/* SVOIM - малює сторінки з data.js. виконується до DOMContentLoaded тому фільтри з script.js бачать готові списки. */
(function () {
    'use strict';
    var D = SV.data, esc = SV.esc;
    var page = document.body.dataset.page;
    var qs = new URLSearchParams(location.search);
    var $ = function (s) { return document.querySelector(s); };
    var enc = encodeURIComponent;
    var returnTo = (location.pathname.split('/').pop() || 'index.html') + location.search;
    var placeHref = function (id) { return 'place.html?id=' + enc(id) + '&return=' + enc(returnTo); };
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
        if (e) {
            if (msg) e.textContent = msg;
            e.hidden = !!html;
        }
    }

    function saveAction(kind, item, iconName, labelOn, labelOff) {
        var active = SV.saved.has(kind, item.id);
        return '<button class="save-action" type="button" data-save="' + kind + ':' + enc(item.id) + '"' +
            ' data-save-label-on="' + esc(labelOn) + '" data-save-label-off="' + esc(labelOff) + '"' +
            ' aria-pressed="' + active + '" aria-label="' + (active ? esc(labelOn) : esc(labelOff)) + '">' +
            icon(iconName) + '<span data-save-label>' + (active ? esc(labelOn) : esc(labelOff)) + '</span></button>';
    }

    /* --- рядки списків --- */
    function rowPlace(p) {
        return '<li data-type="Місця"><a class="row" href="' + placeHref(p.id) + '">' + thumb(p, 'location_on') +
            '<span class="row__body"><span class="row__title">' + esc(p.name) + '</span><span class="row__meta">' +
            (p.rating ? rating(p) + '<br>' : '') + esc([p.category, p.walk].filter(Boolean).join(', ')) + '</span>' +
            (p.discount ? '<span class="badge badge--soft">' + esc(p.discount) + '</span>' : '') + '</span>' + GO + '</a></li>';
    }
    function savedPlaceRow(p) {
        return '<li data-type="Місця"><div class="row-wrap"><a class="row" href="' + placeHref(p.id) + '">' + thumb(p, 'location_on') +
            '<span class="row__body"><span class="row__title">' + esc(p.name) + '</span><span class="row__meta">' +
            esc([p.category, p.walk].filter(Boolean).join(', ')) + '</span></span>' + GO + '</a>' +
            saveAction('places', p, 'bookmark', 'Збережено', 'Зберегти') + '</div></li>';
    }
    function rowOffer(o) {
        var p = SV.place(o.place);
        return '<li data-type="Пропозиції"><div class="row-wrap"><a class="row" href="' + (p ? placeHref(p.id) : 'discounts.html') + '">' + thumb(o, 'local_offer') +
            '<span class="row__body"><span class="row__title">' + esc(o.title) + '</span><span class="row__meta">' +
            esc([p ? p.name : '', o.category].filter(Boolean).join(', ')) + '</span></span>' + GO + '</a>' +
            saveAction('offers', o, 'bookmark', 'Збережено', 'Зберегти') + '</div></li>';
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
        return '<li data-type="Події" data-day="' + di.tokens + '" data-cat="' + esc(e.category) + '"><div class="row">' + thumb(e, 'calendar_month') +
            '<span class="row__body"><span class="row__title">' + esc(e.title) + '</span><span class="row__meta">' +
            esc(e.place || '') + '<br>' + di.label + (e.time ? ', ' + esc(e.time) : '') + '</span></span>' +
            saveAction('events', e, 'event', 'Я піду', 'Піду') + '</div></li>';
    }
    function cardOffer(o) {
        var p = SV.place(o.place);
        return '<li class="offer" data-cat="' + esc(o.category) + '"><div class="offer__img"' + imgStyle(o) + '>' + (o.image ? '' : icon('local_offer')) + '</div>' +
            '<div class="offer__body"><h2 class="offer__title">' + esc(o.title) + '</h2><p class="offer__place">' + esc(p ? p.name : '') + '</p>' +
            '<div class="offer__foot">' + (o.verified ? '<span class="badge">Перевірено SVOIM</span>' : '<span></span>') +
            saveAction('offers', o, 'bookmark', 'Збережено', 'Зберегти') +
            (p ? '<a class="offer__go" href="' + placeHref(p.id) + '" aria-label="Відкрити пропозицію">' + icon('arrow_forward') + '</a>' : '') +
            '</div></div></li>';
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

    if (page === 'my-events') {
        var myEvents = D.events.filter(function (e) { return SV.saved.has('events', e.id); }).sort(byDate);
        list(myEvents.map(rowEvent).join(''), 'Тут з’являться події, на які ти плануєш піти. Познач їх у розділі «Що відбувається».');
    }

    if (page === 'my-discounts') {
        var myOffers = D.offers.filter(function (o) { return SV.saved.has('offers', o.id); });
        list(myOffers.map(cardOffer).join(''), 'Тут будуть збережені знижки. Додавай пропозиції в розділі «Для своїх».');
    }

    if (page === 'saved') {
        var savedPlaces = D.places.filter(function (p) { return SV.saved.has('places', p.id); });
        var savedEvents = D.events.filter(function (e) { return SV.saved.has('events', e.id); }).sort(byDate);
        var savedOffers = D.offers.filter(function (o) { return SV.saved.has('offers', o.id); });
        list(savedPlaces.map(savedPlaceRow).join('') + savedOffers.map(rowOffer).join('') + savedEvents.map(rowEvent).join(''),
            'Тут з’являться місця, події та пропозиції, які ти збережеш.');
    }

    if (page === 'settings') {
        var form = $('[data-settings]');
        var toast = $('[data-toast]');
        var calmInput = form.elements.namedItem('calm');
        var geoInput = form.elements.namedItem('geo');
        var profileData = SV.profile.get();
        form.elements.namedItem('name').value = profileData.name || '';
        form.elements.namedItem('school').value = profileData.school || '';
        calmInput.checked = SV.store.get('sv-calm', false) === true;
        geoInput.checked = SV.store.get('sv-geo', false) === true;
        document.documentElement.classList.toggle('reduce-motion', calmInput.checked);

        function showToast(message) {
            toast.textContent = message;
            toast.hidden = false;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var wasGeoEnabled = SV.store.get('sv-geo', false) === true;
            SV.profile.set({
                name: form.elements.namedItem('name').value.trim(),
                school: form.elements.namedItem('school').value.trim()
            });
            SV.store.set('sv-calm', calmInput.checked);
            document.documentElement.classList.toggle('reduce-motion', calmInput.checked);

            if (!geoInput.checked) {
                SV.store.set('sv-geo', false);
                try { sessionStorage.removeItem('sv-pos'); } catch (e) {}
                showToast('Зміни збережено на цьому пристрої.');
            } else if (!navigator.geolocation) {
                geoInput.checked = false;
                SV.store.set('sv-geo', false);
                showToast('Цей браузер не підтримує геолокацію.');
            } else {
                SV.store.set('sv-geo', true);
                if (wasGeoEnabled) showToast('Зміни збережено на цьому пристрої.');
                else {
                    showToast('Дозволь браузеру доступ до геопозиції.');
                    SV.geo.position(function (position) {
                        if (position) showToast('Зміни збережено на цьому пристрої.');
                        else {
                            geoInput.checked = false;
                            SV.store.set('sv-geo', false);
                            showToast('Не вдалося отримати геопозицію. Перевір дозвіл браузера.');
                        }
                    });
                }
            }
        });

        $('[data-clear]').addEventListener('click', function () {
            SV.store.clearAll();
            form.reset();
            document.documentElement.classList.remove('reduce-motion');
            showToast('Дані очищено з цього браузера.');
        });
    }

    if (page === 'profile') {
        var profileData = SV.profile.get();
        var name = $('[data-profile-name]');
        var school = $('[data-profile-school]');
        if (name && profileData.name) name.textContent = 'Привіт, ' + profileData.name + '!';
        if (school && profileData.school) school.textContent = profileData.school + ', ' + D.city;
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
        var returnTarget = qs.get('return');
        if (returnTarget && /^(?:index|needs|results|discounts|events|saved|my-events|my-discounts|map)\.html(?:\?[^#]*)?$/.test(returnTarget)) {
            $('.page-bar .back').href = returnTarget;
        }
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

        var fav = $('[data-toggle]');
        var isSaved = SV.saved.has('places', p.id);
        fav.dataset.save = 'places:' + p.id;
        fav.dataset.saveLabelOn = 'Збережено';
        fav.dataset.saveLabelOff = 'Зберегти';
        fav.setAttribute('aria-pressed', isSaved);
        fav.setAttribute('aria-label', isSaved ? 'Збережено' : 'Зберегти');
        fav.removeAttribute('data-toggle');
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

        function showCard(pl, distance) {
            var meta = [pl.walk, pl.address];
            if (typeof distance === 'number') meta.unshift(SV.geo.walk(distance) + ' від тебе');
            card.innerHTML = '<div class="map__card-head"><strong>' + esc(pl.name) + '</strong>' +
                '<button class="icon-btn map__card-toggle" type="button" data-map-card-toggle aria-expanded="true" aria-label="Згорнути картку місця">' + icon('expand_more') + '</button></div>' +
                '<div class="map__card-body" data-map-card-body><a class="row" aria-label="Відкрити місце: ' + esc(pl.name) + '" href="' + placeHref(pl.id) + '">' + thumb(pl, 'location_on') +
                '<span class="row__body"><span class="row__meta">' + esc([pl.category].concat(meta).filter(Boolean).join(', ')) + '</span></span>' + GO + '</a>' +
                '<a class="btn btn--block" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' + pl.lat + ',' + pl.lng + '&travelmode=walking">Прокласти маршрут' + icon('arrow_forward') + '</a></div>';
            card.hidden = false;
        }
        card.addEventListener('click', function (event) {
            var toggle = event.target.closest('[data-map-card-toggle]');
            if (!toggle) return;
            var expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !expanded);
            toggle.setAttribute('aria-label', expanded ? 'Розгорнути картку місця' : 'Згорнути картку місця');
            toggle.innerHTML = icon(expanded ? 'expand_less' : 'expand_more');
            card.querySelector('[data-map-card-body]').hidden = expanded;
        });
        var pts = D.places.filter(function (x) { return x.lat && x.lng; });
        pts.forEach(function (pl) {
            L.marker([pl.lat, pl.lng], {
                title: pl.name,
                icon: L.divIcon({ className: 'map-pin' + (sel && sel.id === pl.id ? ' is-active' : ''), html: icon('location_on'), iconSize: [36, 36], iconAnchor: [18, 34] })
            }).addTo(map).on('click', function () { showCard(pl); });
        });
        var nearbyButton = $('[data-map-nearby]');
        var userMarker = null;
        if (nearbyButton) nearbyButton.addEventListener('click', function () {
            if (!navigator.geolocation) {
                note.textContent = 'Цей браузер не підтримує геолокацію.';
                note.hidden = false;
                return;
            }
            nearbyButton.disabled = true;
            nearbyButton.textContent = 'Шукаю поруч…';
            SV.geo.position(function (position, error) {
                nearbyButton.disabled = false;
                nearbyButton.innerHTML = icon('location_on') + 'Знайти найближче';
                if (!position) {
                    note.textContent = !navigator.geolocation
                        ? 'Цей браузер не підтримує геолокацію.'
                        : error && error.code === 1
                            ? 'Доступ до геопозиції заборонено. Дозволь його для цієї сторінки в налаштуваннях браузера.'
                            : error && error.code === 3
                                ? 'Час очікування геопозиції минув. Спробуй ще раз.'
                                : 'Не вдалося визначити геопозицію. Перевір налаштування браузера та спробуй ще раз.';
                    note.hidden = false;
                    return;
                }
                if (userMarker) userMarker.setLatLng([position.lat, position.lng]);
                else userMarker = L.circleMarker([position.lat, position.lng], {
                    radius: 8, color: '#FFFFFF', weight: 3, fillColor: '#3B4733', fillOpacity: 1
                }).addTo(map);
                if (!pts.length) {
                    map.setView([position.lat, position.lng], 15);
                    note.textContent = 'Твоє місце показано на мапі, але поруч поки немає закладів.';
                    note.hidden = false;
                    return;
                }
                var nearest = pts[0], nearestDistance = SV.geo.dist(position, pts[0]);
                pts.slice(1).forEach(function (pl) {
                    var distance = SV.geo.dist(position, pl);
                    if (distance < nearestDistance) { nearest = pl; nearestDistance = distance; }
                });
                map.fitBounds([[position.lat, position.lng], [nearest.lat, nearest.lng]], { padding: [48, 48], maxZoom: 16 });
                note.textContent = 'Найближче місце: ' + nearest.name + ' · ' + SV.geo.walk(nearestDistance);
                note.hidden = false;
                showCard(nearest, nearestDistance);
            }, true);
        });
        if (!pts.length) { note.textContent = 'Закладів на мапі поки немає — вони з’являться, щойно їх додадуть.'; note.hidden = false; }
        else if (sel && sel.lat) showCard(sel);
        else if (pts.length > 1) map.fitBounds(pts.map(function (x) { return [x.lat, x.lng]; }), { padding: [40, 40] });
    }
})();
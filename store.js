/* SVOIM - дані користувача в браузерізбереження, профіль, геолокація.
   це localStorage дані живуть на цьому пристрої. для справжніх акаунтів потрібен бекенд (firebase / supabase). */
(function () {
    var SV = window.SV;

    var store = {
        get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
        set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
        clearAll: function () {
            try {
                Object.keys(localStorage).filter(function (k) { return k.indexOf('sv-') === 0; }).forEach(function (k) { localStorage.removeItem(k); });
                sessionStorage.clear();
            } catch (e) {}
        }
    };

    /* збережене { places: [id], events: [id], offers: [id] } */
    var KEY = 'sv-saved-v2';
    function all() {
        var d = store.get(KEY, null);
        if (!d) { d = { places: [], events: [], offers: [] }; var old = store.get('sv-saved', null); if (Array.isArray(old)) d.places = old; }
        return d;
    }
    var saved = {
        list: function (kind) { return all()[kind] || []; },
        has: function (kind, id) { return saved.list(kind).indexOf(id) !== -1; },
        count: function (kind) { return saved.list(kind).length; },
        toggle: function (kind, id) {
            var d = all(), l = d[kind] = d[kind] || [], i = l.indexOf(id);
            if (i === -1) l.push(id); else l.splice(i, 1);
            store.set(KEY, d);
            return i === -1;
        }
    };

    var profile = {
        get: function () { return store.get('sv-profile', {}); },
        set: function (o) { var p = profile.get(); for (var k in o) p[k] = o[k]; store.set('sv-profile', p); }
    };

    /* геолокація координати лише в sessionStorage, нікуди не відправляються */
    var geo = {
        enabled: function () { return store.get('sv-geo', false) === true && !!navigator.geolocation; },
        position: function (cb) {
            try { var c = JSON.parse(sessionStorage.getItem('sv-pos')); if (c) return cb(c); } catch (e) {}
            navigator.geolocation.getCurrentPosition(function (p) {
                var pos = { lat: p.coords.latitude, lng: p.coords.longitude };
                try { sessionStorage.setItem('sv-pos', JSON.stringify(pos)); } catch (e) {}
                cb(pos);
            }, function () { cb(null); }, { timeout: 8000, maximumAge: 300000 });
        },
        dist: function (a, b) {                                   // формула гаверсинуса, метри
            var r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
            var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
            return 12742000 * Math.asin(Math.sqrt(h));
        },
        walk: function (m) { return Math.max(1, Math.round(m / 80)) + ' хв пішки'; }   // ≈ 4,8 км/год
    };

    SV.store = store; SV.saved = saved; SV.profile = profile; SV.geo = geo;

    /* кнопки закладок <button data-save="places:ID"> */
    document.addEventListener('click', function (e) {
        var b = e.target.closest('[data-save]');
        if (!b) return;
        e.preventDefault();
        var i = b.dataset.save.indexOf(':');
        var on = saved.toggle(b.dataset.save.slice(0, i), b.dataset.save.slice(i + 1));
        b.setAttribute('aria-pressed', on);
        if (document.body.dataset.page === 'saved' && !on) {                 // на сторінці збережень елемент зникає
            var li = b.closest('li');
            if (li) li.remove();
            var ul = document.querySelector('[data-list]'), em = document.querySelector('[data-empty]');
            if (em && !ul.querySelector('li:not([hidden])')) em.hidden = false;
        }
    });
})();
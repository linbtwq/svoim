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
                sessionStorage.removeItem('sv-pos');
            } catch (e) {}
        }
    };

    /* збережене { places: [id], events: [id], offers: [id] } */
    var KEY = 'sv-saved-v2';
    function all() {
        var d = store.get(KEY, null);
        if (!d) d = { places: [], events: [], offers: [] };
        if (!Array.isArray(d.places)) d.places = [];
        var old = store.get('sv-saved', null);
        if (Array.isArray(old)) {
            old.forEach(function (id) { if (d.places.indexOf(id) === -1) d.places.push(id); });
            store.set(KEY, d);
            try { localStorage.removeItem('sv-saved'); } catch (e) {}
        }
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
        position: function (cb, fresh) {
            if (!fresh) {
                try { var c = JSON.parse(sessionStorage.getItem('sv-pos')); if (c) return cb(c, null); } catch (e) {}
            }
            if (!navigator.geolocation) return cb(null, { code: 0 });
            navigator.geolocation.getCurrentPosition(function (p) {
                var pos = { lat: p.coords.latitude, lng: p.coords.longitude };
                try { sessionStorage.setItem('sv-pos', JSON.stringify(pos)); } catch (e) {}
                cb(pos, null);
            }, function (error) { cb(null, error); }, fresh
                ? { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
                : { timeout: 8000, maximumAge: 300000 });
        },
        dist: function (a, b) {                                   // формула гаверсинуса, метри
            var r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
            var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
            return 12742000 * Math.asin(Math.sqrt(h));
        },
        walk: function (m) {
            return m >= 1000
                ? (m / 1000).toFixed(1).replace('.', ',') + ' км пішки'
                : Math.max(1, Math.round(m / 80)) + ' хв пішки';
        }
    };

    SV.store = store; SV.saved = saved; SV.profile = profile; SV.geo = geo;

    /* кнопки закладок <button data-save="places:ID"> */
    document.addEventListener('click', function (e) {
        var b = e.target.closest('[data-save]');
        if (!b) return;
        e.preventDefault();
        var i = b.dataset.save.indexOf(':');
        var kind = b.dataset.save.slice(0, i);
        var on = saved.toggle(kind, b.dataset.save.slice(i + 1));
        b.setAttribute('aria-pressed', on);
        b.setAttribute('aria-label', on ? b.dataset.saveLabelOn : b.dataset.saveLabelOff);
        var label = b.querySelector('[data-save-label]');
        if (label) label.textContent = on ? b.dataset.saveLabelOn : b.dataset.saveLabelOff;
        var page = document.body.dataset.page;
        var ownList = (page === 'my-events' && kind === 'events') || (page === 'my-discounts' && kind === 'offers');
        if ((ownList || page === 'saved') && !on) {
            var li = b.closest('li');
            if (li) li.remove();
            var ul = document.querySelector('[data-list]'), em = document.querySelector('[data-empty]');
            if (em && !ul.querySelector('li:not([hidden])')) em.hidden = false;
        }
    });
})();
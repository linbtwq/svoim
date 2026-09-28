/* =========================================================
   SVOIM - ВЕСЬ КОНТЕНТ САЙТУ ТУТ
   сторінки самі малюють списки з цього файлу.
   порожній масив = на сторінці покажеться повідомлення поки нічого немає.
   ========================================================= */
var demoDate = function (offset) {
   var date = new Date();
   date.setDate(date.getDate() + offset);
   return [date.getFullYear(), ('0' + (date.getMonth() + 1)).slice(-2), ('0' + date.getDate()).slice(-2)].join('-');
};

window.SV_DATA = {
    city: 'Луцьк',
    center: [50.7472, 25.3254],          // центр мапи [широта, довгота]

    /* що можна знайти (плитки на "знайти потрібне"). id використовується в places[].services */
    services: [
        { id: 'charge',   icon: 'battery_charging_full', label: 'Зарядити телефон' },
        { id: 'print',    icon: 'print',                 label: 'Роздрукувати документ' },
        { id: 'copy',     icon: 'content_copy',          label: 'Зробити ксерокс' },
        { id: 'scan',     icon: 'document_scanner',      label: 'Відсканувати документ' },
        { id: 'cash-out', icon: 'atm',                   label: 'Зняти гроші' },
        { id: 'cash-in',  icon: 'payments',              label: 'Покласти гроші' },
        { id: 'key',      icon: 'key',                   label: 'Зробити ключ' },
        { id: 'repair',   icon: 'handyman',              label: 'Полагодити щось' },
        { id: 'cowork',   icon: 'local_cafe',            label: 'Попрацювати / посидіти' },
        { id: 'parcel',   icon: 'local_shipping',        label: 'Відправити посилку' },
        { id: 'craft',    icon: 'palette',               label: 'Купити матеріали для творчості' },
        { id: 'photo',    icon: 'photo_camera',          label: 'Зробити фото / надрукувати фото' },
        { id: 'tailor',   icon: 'checkroom',             label: 'Пошити / підшити одяг' },
        { id: 'computer', icon: 'computer',              label: 'Знайти комп’ютер / принтер' },
        { id: 'other',    icon: 'more_horiz',            label: 'Інше' }
    ],

    /* заклади. шаблон одного запису (скопіюй, розкоментуй, заповни):
       {
         id: 'my-place',                 // унікальний, латиницею
         name: 'Назва',
         category: 'Друк / Копіювання',
         rating: 4.8, reviews: 124,      // необов’язково
         walk: '4 хв пішки',             // необов’язково
         address: 'вул. …, 1',
         hours: '08:00 — 20:00',
         services: ['print', 'copy'],    // id із services вище
         discount: '-15% для студента',  // короткий бейдж (необов’язково)
         perk: 'Умови знижки…',          // довгий опис знижки (необов’язково)
         description: 'Кілька речень про місце',
         lat: 50.7472, lng: 25.3254,     // координати для мапи й маршруту
         image: 'img/place.jpg'          // фото (необов’язково)
       }
    */
    places: [],

    /* знижки. шаблон:
       { id: 'o1', title: '-10% на каву', category: 'Кафе', place: 'my-place', verified: true, image: 'img/o1.jpg' }
       category: Кафе | Послуги | Навчання | Творчість | Розваги
    */
    offers: [
        {
            id: 'demo-offer-student',
            title: 'Знижка для студентів (демо)',
            category: 'Кафе',
            verified: false
        }
    ],

    /* події. шаблон:
       { id: 'e1', title: 'Назва', place: 'Де саме', date: '2026-10-01', time: '18:00', category: 'Вечірки', image: 'img/e1.jpg' }
       category: Вечірки | Майстер-класи | Концерти | Розваги
    */
    events: [
        {
            id: 'demo-event-student',
            title: 'Зустріч студентів (демо)',
            place: 'Луцьк, локацію буде уточнено',
            date: demoDate(0),
            time: '18:00',
            category: 'Розваги'
        }
    ]
};
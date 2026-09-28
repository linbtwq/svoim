// функция оценки производительности устройства
function checkDevicePerformance() {
    // получаем данные о железе (работает в chromium браузерах)
    const cores = navigator.hardwareConcurrency || 4; // по умолчанию предполагаем среднее устройство
    const memory = navigator.deviceMemory || 4; // озу в гб

    console.log(`System Check: ${cores} Cores, ~${memory}GB RAM`);

    // считаем слабым устройство если меньше 4 ядер или меньше 3 гб оперативной памяти
    const isLowEnd = cores < 4 || memory < 3;
    
    // также можно проверить включен ли у юзера режим экономии энергии/трафика
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (isLowEnd || prefersReducedMotion) {
        document.body.classList.add('low-end');
        console.log('Optimization applied: Heavy UI effects disabled for performance.');
    }
}

// запускаем проверку при загрузке
document.addEventListener('DOMContentLoaded', () => {
    checkDevicePerformance();

    // логика нижней навигации
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // вибрация при клике (Haptic Feedback), если поддерживается
            if (navigator.vibrate) navigator.vibrate(10);
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // логика главной кнопки
    const mainBtn = document.getElementById('mainActionBtn');
    if (mainBtn) {
        mainBtn.addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate(15);
            // анимация нажатия перед переходом
            mainBtn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                mainBtn.style.transform = '';
            }, 150);
        });
    }
});

function openCategory(categoryName) {
    if (navigator.vibrate) navigator.vibrate(10);
    console.log(`Открываем раздел: ${categoryName}`);
}
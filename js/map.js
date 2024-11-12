// Добавление новой метки в массив
function addMark(x, y) {
    var mark = {
        x: x,
        y: y,
    };
    Dop.marks.push(mark);
}
// Функция для создания матрицы расстояний
function createMatrixDistnce(coordinates) {
    const size = coordinates.length;
    const matrix = [];

    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            if (i === j) {
                row.push(0);
            } else {
                const distance = processingDistance(coordinates[i], coordinates[j]);
                row.push(distance);
            }
        }
        matrix.push(row);
    }

    return matrix;
}

// Функция для вычисления расстояния между двумя координатами
function processingDistance(coord1, coord2) {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371; // Радиус Земли в километрах
    const dLat = convertToRaddians(lat2 - lat1);
    const dLon = convertToRaddians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(convertToRaddians(lat1)) * Math.cos(convertToRaddians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
}

// Функция для преобразования градусов в радианы
function convertToRaddians(degrees) {
    return degrees * (Math.PI / 180);
}

// Функция для рассчета оптимального времени экскурсии
function evaluateOptiTime(distances, priorities, freeTime, HumanSpeed, routeDistance) {
    const numVertices = distances.length;
    const graph = distances.slice(); // Создаем копию матрицы расстояний

    for (let i = 0; i < numVertices; i++) {
        for (let j = 0; j < numVertices; j++) {
            if (graph[i][j] === 0) {
                graph[i][j] = Infinity; // Заменяем нулевые расстояния на бесконечность
            }
        }
    }
    const my_source = 0; // Начальная точка
    const shortestDistances = dijkstra(graph, my_source);
    // Выбираем достопримечательности согласно приоритетам
    const selectedLandmarks = [];
    for (let i = 0; i < priorities.length; i++) {
        const priority = priorities[i];
        const landmarkIndex = priority - 1;
        selectedLandmarks.push(landmarks[landmarkIndex]);
    }

    // Расчет общего времени посещения выбранных достопримечательностей
    let totalTime = 0;
    for (let i = 0; i < selectedLandmarks.length - 1; i++) {
        const currentLandmark = selectedLandmarks[i];
        const nextLandmark = selectedLandmarks[i + 1];
        const currentDistance = graph[currentLandmark.priority - 1][nextLandmark.priority - 1];
        totalTime += currentDistance;
    }

    //ВРЕМЯ ВРЕМЯ ВРЕМЯ ВРЕМЯ ВРЕМЯ 
    var excursion_average_time = 25; //25 минут среднее время экскурсии!
    var speedtime = routeDistance / HumanSpeed;
    totalTime = speedtime * 3600 + 25 * 60 * selectedLandmarks.length;//+время жкскурсии каждой дост в секундах

    // Проверка, достаточно ли времени для посещения всех достопримечательностей
    const canVisit = totalTime <= freeTime * 60 * 60;
    screenInfo(canVisit, totalTime, routeDistance);
    savingAlternativeroute(selectedAlternativeroute, totalTime, routeDistance); // Сохранение альтернативного маршрута
    // Отображение кнопок в зависимости от доступного времени
    const optimizeroutePlusBtn = document.getElementById('optimize-route-plus-btn');
    const optimizerouteMinusBtn = document.getElementById('optimize-route-minus-btn');

    if (canVisit) {
        optimizeroutePlusBtn.style.display = 'block';
        optimizerouteMinusBtn.style.display = 'none';
    } else {
        optimizeroutePlusBtn.style.display = 'none';
        optimizerouteMinusBtn.style.display = 'block';
    }
}


function savingAlternativeroute(route, totalTime, routeDistance) {
    const alternativeroute = {
        route: route,
        totalTime: totalTime,
        routeDistance: routeDistance,
        landmarks: landmarks,
        priorities: userPriorities
    };
    alternativeroutes.push(alternativeroute);
    nowMainAlternativeroute = route; // Сохраняем текущий альрнативный маршрут(координаты)
}


function formatingTime(hours, minutes, seconds) {
    const formHours = hours < 10 ? "0" + hours : hours;
    const formMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formSeconds = seconds < 10 ? "0" + seconds : seconds;

    return `${formHours}:${formMinutes}:${formSeconds}`;
}
function updateroute2() {
    // Очищаем предыдущий маршрут
    map.geoObjects.removeAll();

    // Создаем массив с координатами маршрута
    const routeCoordinates = landmarks2.map(landmarks2 => landmarks2.coordinates);

    // Создаем объект маршрута
    ymaps.route(routeCoordinates, {
        mapStateAutoApply: true, // Автоматическое изменение области видимости карты
        avoidTrafficJams: true, // Избегать пробок
        routingMode: 'pedestrian' // Режим построения пешеходного маршрута
    }).then(function (route) {
        // Настройки внешнего вида маршрута
        route.options.set({
            // Цвет линии маршрута
            strokeColor: '#00FF00',
            // Ширина линии маршрута
            strokeWidth: 5,
            // Цвет иконок меток начальной и конечной точек маршрута
            wayPointStartIconColor: '#000',
            wayPointFinishIconColor: '#000',
            // Цвет метки на карте
            pinIconFillColor: '#000',
            // Стиль линии активного пешеходного сегмента маршрута
            routeActivePedestrianSegmentStrokeStyle: 'solid',
            // Цвет активного пешеходного сегмента маршрута
            routeActivePedestrianSegmentStrokeColor: '#000'
        });

        // Добавляем маршрут на карту
        map.geoObjects.add(route);
    });
}
// Функция для вывода информации на экран
function screenInfo(canVisit, totalTime, routeDistance) {
    const outputElement = document.getElementById('output');
    if (canVisit) {
        const hours = Math.floor(totalTime / 3600);
        const minutes = Math.floor((totalTime % 3600) / 60);
        const seconds = Math.floor(totalTime % 60);
        const formattedTime = formatingTime(hours, minutes, seconds);
        const formattedDistance = toStringDistance(routeDistance);

        outputElement.innerText = `Вы можете посетить выбранные достопримечательности за свободное время. Оптимальное время экскурсии: ${formattedTime}. Дистанция маршрута: ${formattedDistance}.`;
    } else {
        const hours = Math.floor(totalTime / 3600);
        const minutes = Math.floor((totalTime % 3600) / 60);
        const seconds = Math.floor(totalTime % 60);
        const formattedTime = formatingTime(hours, minutes, seconds);
        const formattedDistance = toStringDistance(routeDistance);

        outputElement.innerText = `У вас недостаточно времени для посещения всех выбранных достопримечательностей. Оптимальное время экскурсии: ${formattedTime}. Дистанция маршрута: ${formattedDistance}.`;
    }
    // Создание кнопок для выбора сохраненных альтернативных маршрутов
    const alternativerouteContainer = document.createElement('div');
    alternativerouteContainer.id = 'alternative-route-container';

    const alternativerouteTitle = document.createElement('h2');
    alternativerouteTitle.innerText = 'Сохраненные альтернативные маршруты:';
    alternativerouteContainer.appendChild(alternativerouteTitle);

    for (let i = 0; i < alternativeroutes.length; i++) {
        const alternativeroute = alternativeroutes[i];
        const alternativerouteBtn = document.createElement('button');
        alternativerouteBtn.classList.add(`alternative-route-btn${i}`);
        const hours1 = Math.floor(alternativeroute.totalTime / 3600);
        const minutes1 = Math.floor((alternativeroute.totalTime % 3600) / 60);
        const seconds1 = Math.floor(alternativeroute.totalTime % 60);
        const formattedTime = formatingTime(hours1, minutes1, seconds1);
        alternativerouteBtn.innerText = `Время: ${formatingTime(hours1, minutes1, seconds1)}, Дистанция: ${toStringDistance(alternativeroute.routeDistance)}`;

        // Добавление атрибутов с координатами и приоритетом в кнопку
        alternativerouteBtn.setAttribute('data-latitude', alternativeroute.landmarks.map(landmark => landmark.coordinates[0]).join(','));
        alternativerouteBtn.setAttribute('data-longitude', alternativeroute.landmarks.map(landmark => landmark.coordinates[1]).join(','));
        alternativerouteBtn.setAttribute('data-priority', alternativeroute.priorities.join(','));

        alternativerouteContainer.appendChild(alternativerouteBtn);
    }

    // Перебираем все кнопки альтернативных маршрутов
    alternativerouteContainer.querySelectorAll('[class^="alternative-route-btn"]').forEach((button, i) => {
        button.addEventListener('click', () => {
            // Обработчик клика для каждой кнопки
            // Получение значений из атрибутов кнопки
            const latitude = button.getAttribute('data-latitude');
            const longitude = button.getAttribute('data-longitude');
            const priority = button.getAttribute('data-priority');

            // Преобразование значений в массивы
            const latitudeArray = latitude.split(',').map(parseFloat);
            const longitudeArray = longitude.split(',').map(parseFloat);
            const priorityArray = priority.split(',').map(parseFloat);

            // Формирование объектов с координатами и приоритетами
            const alternativeroute = {
                coordinates: [latitudeArray, longitudeArray],
                priority: priorityArray
            };

            // Формирование массива landmarks2
            landmarks2 = [];
            for (let j = 0; j < latitudeArray.length; j++) {
                const landmark2 = {
                    coordinates: [latitudeArray[j], longitudeArray[j]],
                    priority: priorityArray[j]
                };
                landmarks2.push(landmark2);
            }

            console.log(`Нажата кнопка альтернативного маршрута ${i}`);
            console.log(alternativeroute);
            console.log(landmarks2);

            // Обновление маршрута
            updateroute2();

        });
    });

    outputElement.appendChild(alternativerouteContainer);
}

function selectAlternativeroute(landmarks, priorities) {
    selectedAlternativeroute = { landmarks, priorities };
    nowMainAlternativeroute = landmarks; // Сохранение координат текущего альтернативного маршрута
    clearAlternativeroute(); // Очищение альтернативного маршрута
    updateroute(); // Построение маршрута
}
function clearAlternativeroute() {
    map.geoObjects.each(function (geoObject) {
        if (
            geoObject.options.get('preset') === 'islands#darkOrangeStretchyIcon' &&
            nowMainAlternativeroute.includes(geoObject.geometry.getCoordinates()) // Проверка наличия координат в текущем альтернативном маршруте
        ) {
            map.geoObjects.remove(geoObject);
        }
    });
}
// Функция для форматирования дистанции
function toStringDistance(distance) {
    return distance.toLocaleString(undefined, { minimumFractionDigits: 1 }) + " км";
}


function evaluateTotalDistance() {
    let totalDistance = 0;
    const selectedLandmarks = landmarks.filter(landmark => userPriorities.includes(landmark.priority));
    for (let i = 0; i < selectedLandmarks.length - 1; i++) {
        const currentLandmark = selectedLandmarks[i];
        const nextLandmark = selectedLandmarks[i + 1];
        const currentDistance = distanceMatrix[currentLandmark.priority - 1][nextLandmark.priority - 1];
        totalDistance += currentDistance;
    }
    return totalDistance;
}
function dijkstra(graph, source) {
    const numVertices = graph.length;
    const distances = new Array(numVertices).fill(Infinity);
    const visited = new Array(numVertices).fill(false);

    distances[source] = 0;

    for (let i = 0; i < numVertices - 1; i++) {
        const minDistanceVerIIIun = findMinDistanceVerIIIun(distances, visited);
        visited[minDistanceVerIIIun] = true;

        for (let j = 0; j < numVertices; j++) {
            if (!visited[j] && graph[minDistanceVerIIIun][j] !== Infinity && distances[minDistanceVerIIIun] + graph[minDistanceVerIIIun][j] < distances[j]) {
                distances[j] = distances[minDistanceVerIIIun] + graph[minDistanceVerIIIun][j];
            }
        }
    }

    return distances;
}

function findMinDistanceVerIIIun(distances, visited) {
    let minDistance = Infinity;
    let minDistanceVerIIIun = -1;

    for (let i = 0; i < distances.length; i++) {
        if (!visited[i] && distances[i] < minDistance) {
            minDistance = distances[i];
            minDistanceVerIIIun = i;
        }
    }

    return minDistanceVerIIIun;
}


//====================================================================
//====================================================================
//====================================================================
//====================================================================
//====================================================================
//====================================================================
//====================================================================
//====================================================================
//====================================================================
//====================================================================


// Ваши данные
let landmarks = []; // Массив выбранных пользователем достопримечательностей
let userPriorities = []; // Приоритеты посещений достопримечательностей
let userFreeTime = 0; // Свободное время пользователя
let HumanSpeed = 0; // Скорость пользователя (в км/ч)
let alternativeroutes = []; // Массив альтернативных маршрутов
let selectedAlternativeroute = null; // Выбранный альтернативный маршрут
let nowMainAlternativeroute = null; // Координаты текущего альтернативного маршрута
let coordinatesMatrix = [];
let distanceMatrix = createMatrixDistnce(coordinatesMatrix);
// Глобальная переменная для landmarks2
let landmarks2 = [];
let map;

// Создание массива Dop.marks
var Dop = {
    marks: []
};



//В этом блоке на карту добавляются дополнительные достопримечательности в радиусе 200 км от москвы, чтобы
//если у пользователя будет время с запасом, добавить ему в путеводитель достопримечательности
addMark(55.835053, 37.623397);
addMark(55.819721, 37.611704);
addMark(55.794746, 37.749450);
addMark(55.736941, 37.809130);
addMark(55.616409, 37.683216);
addMark(55.694693, 37.765505);
addMark(55.817173, 37.655321);
addMark(55.751367, 37.565339);
addMark(55.736786, 37.519997);
addMark(55.765631, 37.660432);
addMark(55.762826, 37.649162);
addMark(55.741175, 37.661465);
addMark(55.741754, 37.649256);
addMark(55.766646, 37.622608);
addMark(55.758240, 37.646471);
addMark(55.747083, 37.642787);
addMark(55.753960, 37.592224);
addMark(55.751844, 37.591901);
addMark(55.751087, 37.596616);
addMark(55.741556, 37.620028);
addMark(55.742770, 37.610162);
addMark(55.753933, 37.620735);
addMark(55.750784, 37.618495);
addMark(55.748931, 37.612583);
addMark(55.690797, 37.561547);
addMark(55.598629, 37.899923);
addMark(55.506846, 37.771457);
addMark(55.835053, 37.623397);
addMark(56.007398, 37.644551);
addMark(55.585266, 38.164297);
addMark(55.607786, 38.049129);
addMark(55.724169, 37.272001);
addMark(55.746349, 37.162067);
addMark(55.839418, 37.275280);
addMark(55.912899, 37.402925);
addMark(55.954355, 37.493685);
addMark(55.929572, 37.240980);
addMark(56.050787, 37.221503);
addMark(56.045590, 37.482284);
addMark(56.080504, 37.563418);
addMark(55.997608, 37.541689);
addMark(56.011578, 37.622071);
addMark(56.007398, 37.644551);
addMark(56.090554, 37.832349);
addMark(56.018654, 37.845238);
addMark(55.994186, 37.827651);
addMark(56.109749, 37.820684);
addMark(56.090554, 37.832349);
addMark(56.125253, 37.966528);
addMark(55.933988, 37.832054);
addMark(55.734451, 36.842593);
addMark(55.671026, 36.457675);
addMark(55.698282, 36.190808);
addMark(55.509753, 36.010863);
addMark(55.344118, 36.188851);
addMark(55.532583, 36.995922);
addMark(55.019322, 37.359023);
addMark(54.915325, 37.405279);
addMark(55.114467, 37.647104);
addMark(55.057112, 37.769670);
addMark(54.839537, 37.603550);
addMark(55.279513, 37.626900);
addMark(55.274069, 37.511601);
addMark(55.255223, 37.995075);
addMark(55.057112, 37.769670);
addMark(55.255223, 37.995075);
addMark(55.167087, 38.018290);
addMark(54.883510, 38.217735);
addMark(54.832895, 38.150272);
addMark(54.902250, 38.371792);
addMark(55.011314, 38.541417);
addMark(55.102112, 38.765100);
addMark(55.159493, 38.373840);
addMark(55.243087, 38.319191);
addMark(55.204639, 38.742229);
addMark(55.258518, 38.727440);
addMark(55.451958, 38.964234);
addMark(55.439165, 38.588240);
addMark(55.580666, 38.562750);
addMark(55.568422, 38.239833);
addMark(55.580666, 38.562750);
addMark(55.583182, 38.880862);
addMark(55.668780, 38.764573);
addMark(55.783205, 38.649374);
addMark(55.747177, 38.845731);
addMark(55.803533, 38.993514);
addMark(55.850989, 38.841175);
addMark(55.893497, 38.777598);
addMark(55.834142, 38.267800);
addMark(55.917260, 38.265519);
addMark(55.930151, 38.613362);
addMark(56.055810, 38.241386);
addMark(56.133789, 38.446012);
addMark(56.101796, 38.127587);
addMark(56.233195, 38.143612);
addMark(56.208566, 38.032951);
addMark(56.178288, 37.902758);
addMark(56.178628, 37.894010);
addMark(56.222768, 37.784793);
addMark(56.271180, 37.345301);
addMark(56.353342, 37.498306);
addMark(56.258879, 37.249047);
addMark(56.382197, 37.013738);
addMark(56.314571, 37.052317);
addMark(56.325220, 36.721884);
addMark(56.328343, 36.666684);
addMark(56.255334, 36.886327);
addMark(56.194484, 36.993405);
addMark(56.152777, 37.055538);
addMark(56.217412, 36.710770);
addMark(56.184380, 36.972791);
addMark(56.107188, 36.831182);
addMark(56.080265, 37.068869);
addMark(56.084341, 36.816556);
addMark(56.123139, 36.633836);
addMark(55.965222, 36.431928);
addMark(55.936479, 36.704084);
addMark(55.915226, 36.840736);
addMark(55.883776, 36.569702);
addMark(55.880714, 36.904758);
addMark(55.784258, 37.063689);
addMark(55.734451, 36.842593);
addMark(55.724169, 37.272001);
addMark(55.628536, 36.991577);
addMark(55.532583, 36.995922);
addMark(55.646801, 37.094693);
addMark(55.655938, 37.134436);
addMark(55.516544, 37.048716);
addMark(55.640245, 37.236815);
addMark(55.645232, 37.204703);
addMark(55.558461, 37.363676);
addMark(55.492571, 37.302281);
addMark(55.189136, 37.259640);
addMark(55.164575, 37.477051);
addMark(55.063792, 37.610521);
addMark(55.057112, 37.769670);
addMark(55.143939, 37.799993);
addMark(55.233343, 37.825114);
addMark(55.255223, 37.995075);
addMark(55.167087, 38.018290);
addMark(55.247397, 38.183418);
addMark(55.252555, 38.276818);
addMark(55.338317, 38.633589);
addMark(55.439165, 38.588240);
addMark(55.461586, 38.432281);
addMark(55.580666, 38.562750);
addMark(55.653148, 38.636628);
addMark(55.850989, 38.841175);
addMark(56.098603, 38.617198);
addMark(56.309724, 38.478302);
addMark(56.388395, 38.295085);
addMark(56.415080, 38.242852);
addMark(56.393511, 38.220172);
addMark(56.497008, 38.187203);
addMark(56.451232, 38.099625);
addMark(56.519413, 38.083263);
addMark(56.501733, 37.825493);
addMark(56.514719, 37.798557);
addMark(56.527841, 37.591140);
addMark(56.470383, 37.523374);
addMark(56.412177, 37.539902);
addMark(56.384643, 37.399478);
addMark(56.521328, 36.731726);
addMark(56.375860, 36.224904);
addMark(56.354616, 36.357057);
addMark(56.172025, 36.096762);
addMark(56.150334, 36.104802);
addMark(56.190812, 36.063655);
addMark(56.092917, 36.515678);
addMark(55.854205, 35.864110);
addMark(55.775585, 36.083642);
addMark(55.762152, 36.176003);
addMark(55.560753, 35.896350);
addMark(55.520900, 36.020879);
addMark(55.338584, 36.209915);
addMark(54.915325, 37.405279);
addMark(54.883510, 38.217735);
addMark(55.042367, 38.747853);
addMark(55.230578, 39.042955);
addMark(55.380369, 39.032349);
addMark(55.699199, 38.956550);
addMark(55.881506, 39.065043);
addMark(55.914339, 38.904090);
addMark(56.161202, 38.874871);
addMark(56.398052, 38.723750);
addMark(56.497008, 38.187203);
addMark(56.698228, 37.831821);
addMark(56.527841, 37.591140);
addMark(56.470383, 37.523374);
addMark(56.521328, 36.731726);
addMark(56.474614, 36.581080);
addMark(56.442809, 36.564679);
addMark(56.354616, 36.357057);
addMark(56.203802, 36.320481);
addMark(55.934584, 36.076761);
addMark(55.466277, 35.719192);
addMark(55.343708, 35.972548);
addMark(55.344118, 36.188851);
addMark(55.092100, 36.584947);

// Вывод содержимого массива Dop.marks
console.log(Dop.marks);



// Инициализация карты
ymaps.ready(function () {
    map = new ymaps.Map('map', {
        center: [55.751244, 37.618423], // Центр карты - координаты начальной точки
        zoom: 14 // Масштаб карты
    });
    let userFreeTime = 0; // Переменная для хранения свободного времени пользователя

    // Создание и размещение окна для ввода свободного времени
    const freeTimeInput = document.createElement('input');
    freeTimeInput.setAttribute('type', 'number');
    freeTimeInput.setAttribute('placeholder', 'Введите свободное время (в часах)');
    freeTimeInput.style.position = 'absolute';
    freeTimeInput.setAttribute('class', 'input');
    freeTimeInput.style.top = '40px';
    freeTimeInput.style.left = '50px';
    freeTimeInput.style.height = '50px';
    freeTimeInput.style.width = '420px';

    const calculateBtn = document.getElementById('calculate-route-btn');
    calculateBtn.parentNode.insertBefore(freeTimeInput, calculateBtn);

    // Обработчик изменения значения свободного времени
    freeTimeInput.addEventListener('input', function (event) {
        const value = parseInt(event.target.value);
        if (!isNaN(value) && value >= 0) {
            userFreeTime = value;
        } else {
            userFreeTime = 0;
        }
    });

    // Обработчик клика по карте
    map.events.add('click', function (e) {
        const coords = e.get('coords');
        const landmark = {
            coordinates: coords,
            priority: landmarks.length + 1
        };
        landmarks.push(landmark);
        addPlacemarkToMap(map, coords, landmark.priority);
    });

    //Удалялка меток позади основых
    function addRemoveBehindAndFrontmarks(placemark) {
        placemark.events.add('contextmenu', function (e) {
            e.preventDefault();
            removePlacemarkFromMap(placemark);
        });
    }


    // Добавление метки на карту
    function addPlacemarkToMap(map, coords, priority) {
        const placemark = new ymaps.Placemark(coords, {
            iconContent: priority.toString()
        }, {
            preset: 'islands#blueStretchyIcon'
        });
        addRemoveBehindAndFrontmarks(placemark); // Добавить контекстное меню для метки
        map.geoObjects.add(placemark);
    }


    // Удаление метки с карты
    function removePlacemarkFromMap(placemark) {
        map.geoObjects.remove(placemark);
        const index = landmarks.findIndex(l => l.coordinates[0] === placemark.geometry.getCoordinates()[0] && l.coordinates[1] === placemark.geometry.getCoordinates()[1]);
        if (index !== -1) {
            landmarks.splice(index, 1);
        }
        updateroute();
        updateCoordinatesMatrix();

    }

    // Создание массива точек маршрута
    function createroutePoints() {
        userPriorities = landmarks.map(landmark => landmark.priority);
        return landmarks.map(landmark => landmark.coordinates);
    }

    // Обновление маршрута и расчет оптимального времени
    function updateroute() {
        if (selectedAlternativeroute) {
            const routeLandmarks = selectedAlternativeroute.landmarks;
            const routePriorities = selectedAlternativeroute.priorities;

            for (let i = 0; i < routeLandmarks.length; i++) {
                const landmark = routeLandmarks[i];
                const priority = routePriorities[i];
                addPlacemarkToMap(map, landmark.coordinates, priority, 'islands#darkOrangeStretchyIcon');
            }
        }

        map.geoObjects.removeAll();
        const routePoints = createroutePoints();
        ymaps.route(routePoints).then(function (route) {
            map.geoObjects.add(route);
            const routeDistance = route.getHumanLength().replace("&#160;", " ").replace("км", " ");
            //document.getElementById('distance-output').innerText = "Дистанция маршрута: "+routeDistance;
            updateCoordinatesMatrix();
            evaluateOptiTime(distanceMatrix, userPriorities, userFreeTime, HumanSpeed, routeDistance);
        });
        // Добавить контекстное меню для каждой метки на маршруте
        for (let i = 0; i < landmarks.length; i++) {
            const placemark = new ymaps.Placemark(landmarks[i].coordinates, {
                iconContent: landmarks[i].priority.toString()
            }, {
                preset: 'islands#blueStretchyIcon'
            });
            addRemoveBehindAndFrontmarks(placemark);
            map.geoObjects.add(placemark);
        }
    }
    // Обработчик клика по кнопке "Показать маршрут Дейкстра"
    document.getElementById('dijkstra-route-btn').addEventListener('click', function () {
        // Очищаем карту перед отображением маршрута
        map.geoObjects.removeAll();
        const routePoints = createroutePoints();
        // Вычисляем маршрут с помощью функции dijkstra
        const dijkstraroute = dijkstra(distanceMatrix, 0);
        // Отображаем маршрут на карте с помощью функции updaterouteDijkstra
        updaterouteDijkstra(routePoints, dijkstraroute);
        const routeDistance = evaluateTotalDistance();
        evaluateOptiTime(distanceMatrix, userPriorities, userFreeTime, HumanSpeed, routeDistance);
    });

    // Функция для отображения маршрута Дейкстра на карте
    function updaterouteDijkstra(routePoints, dijkstraroute) {
        const numPoints = routePoints.length;
        const polylineCoordinates = [];

        for (let i = 0; i < numPoints; i++) {
            const priority = userPriorities[i];
            const index = priority - 1;
            const coordinate = routePoints[index];
            polylineCoordinates.push(coordinate);
            const placemark = new ymaps.Placemark(coordinate, {
                iconContent: priority.toString()
            }, {
                preset: 'islands#blueStretchyIcon'
            });
            map.geoObjects.add(placemark);
        }

        // Создаем полилинию для отображения маршрута
        const polyline = new ymaps.Polyline(polylineCoordinates, {}, {
            strokeWidth: 4,
            strokeColor: '#0000FF',
            opacity: 0.5
        });
        map.geoObjects.add(polyline);
    }


    // Создание и отображение альтернативного маршрута
    document.getElementById('show-alternative-route-btn').addEventListener('click', function () {
        const alternativeroutePoints = createAlternativeroutePoints();
        ymaps.route(alternativeroutePoints).then(function (alternativeroute) {
            map.geoObjects.add(alternativeroute);
            const alternativerouteDistance = alternativeroute.getHumanLength().replace("&#160;", " ").replace("км", " ");
            // Вывод информации о дистанции альтернативного маршрута
            document.getElementById('alternative-route-distance').innerText = "Дистанция альтернативного маршрута: " + alternativerouteDistance;
        });
    });
    //удаление маршрута
    function clearroute() {
        // Сброс значений связанных переменных или массивов
        route = [];
        totalTime = 0;
    }

    function updateCoordinatesMatrix() {
        const coordinates = landmarks.map(landmark => landmark.coordinates);
        distanceMatrix = createMatrixDistnce(coordinates);
    }

    // Создание массива точек альтернативного маршрута
    function createAlternativeroutePoints() {
        const alternativeroutes = [];

        // Очистка предыдущего маршрута
        clearroute();

        // Создание копии исходных данных
        const originalLandmarks = [...landmarks];
        const originalUserPriorities = [...userPriorities];

        // Перебор каждой достопримечательности
        for (let i = 0; i < landmarks.length; i++) {
            // Перемещение текущей достопримечательности в конец массивов
            const currentLandmark = landmarks.shift();
            const currentPriority = userPriorities.shift();
            landmarks.push(currentLandmark);
            userPriorities.push(currentPriority);

            // Вычисление новых точек маршрута
            const alternativePoints = createroutePoints();

            // Обновление маршрута
            updateroute();

            // Расчет оптимального времени для нового маршрута
            evaluateOptiTime(distanceMatrix, userPriorities, userFreeTime, HumanSpeed);

            // Сохранение оптимального времени и точек маршрута в альтернативный маршрут
            const alternativeroute = {
                points: alternativePoints,
                optimalTime: formatingTime(Math.floor(totalTime / 3600), Math.floor((totalTime % 3600) / 60), Math.floor(totalTime % 60))
            };
            alternativeroutes.push(alternativeroute);
        }

        // Восстановление исходных данных
        landmarks = originalLandmarks;
        userPriorities = originalUserPriorities;

        return alternativeroutes;
    }

    // Обработчик изменения значения скорости
    document.getElementById('human-speed-input').addEventListener('input', function () {
        const speedInput = document.getElementById('human-speed-input');
        const speedValue = parseInt(speedInput.value);
        if (!isNaN(speedValue) && speedValue >= 0) {
            HumanSpeed = speedValue;
            console.log('Скорость сохранена:', HumanSpeed);
        } else {
            console.error('Некорректное значение скорости');
        }
    });
    // Обработчик клика по кнопке "Рассчитать маршрут"
    document.getElementById('calculate-route-btn').addEventListener('click', function () {
        updateroute();
        console.log(landmarks);
        if (userFreeTime) {
            evaluateOptiTime(distanceMatrix, userPriorities, userFreeTime);
        } else {
            console.error('Не удалось получить информацию о свободном времени пользователя.');
        }
    });

    function optimizationroutePlus() {
        const currentroute = createroutePoints();
        const visitingmark = findVisitingMark(currentroute);

        if (visitingmark) {
            landmarks.push(visitingmark);
            addPlacemarkToMap(map, visitingmark.coordinates, visitingmark.priority);
            updateroute();
            updateCoordinatesMatrix();
        }
    }

    function findVisitingMark(currentroute) {
        let visitingmark = null;
        let closestDistance = Infinity;

        for (let i = 0; i < Dop.marks.length; i++) {
            const mark = Dop.marks[i];

            if (!currentroute.some(routePoint => routePoint[0] === mark.x && routePoint[1] === mark.y)) {
                const distance = processingDistance(currentroute[currentroute.length - 1], [mark.x, mark.y]);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    visitingmark = {
                        coordinates: [mark.x, mark.y],
                        priority: landmarks.length + 1
                    };
                }
            }
        }

        return visitingmark;
    }

    function optimizationrouteMinus() {
        if (userPriorities.length <= 1) {
            return; // Нельзя удалить больше меток
        }

        const removedLandmark = landmarks.pop(); // Удаляем последнюю метку
        const removedPriority = removedLandmark.priority;

        // Удаляем метку с карты
        map.geoObjects.each(function (geoObject) {
            const placemarkPriority = geoObject.properties.get('iconContent');
            if (placemarkPriority == removedPriority) {
                map.geoObjects.remove(geoObject);
            }
        });

        // Обновляем массив приоритетов пользовательских меток
        userPriorities = userPriorities.filter((priority) => priority !== removedPriority);

        // Обновляем матрицу расстояний
        updateroute();
        updateCoordinatesMatrix();

        // Рассчитываем оптимальное время маршрута
        const totalDistance = evaluateTotalDistance();
        evaluateOptiTime(distanceMatrix, userPriorities, userFreeTime, HumanSpeed, totalDistance);
    }


    //обработчик события для кнопки "Оптимизировать Время и Маршрут+"
    const optimizeroutePlusBtn = document.getElementById('optimize-route-plus-btn');
    optimizeroutePlusBtn.addEventListener('click', optimizationroutePlus);

    //обработчик события для кнопки "Оптимизировать Время и Маршрут-"
    const optimizerouteMinusBtn = document.getElementById('optimize-route-minus-btn');
    optimizerouteMinusBtn.addEventListener('click', optimizationrouteMinus);


});
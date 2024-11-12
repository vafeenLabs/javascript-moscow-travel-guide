document.addEventListener("DOMContentLoaded", function() {
    // Найти кнопку "Start Learning"
    var startLearningButton = document.querySelector(".button-start");

    // Добавить обработчик клика
    startLearningButton.addEventListener("click", function() {
        // Перенаправить на страницу map.html
        window.location.href = "map.html";
    });
});
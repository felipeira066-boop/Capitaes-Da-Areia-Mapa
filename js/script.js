const startButton = document.getElementById("startButton");
const transition = document.getElementById("transition");

startButton.addEventListener("click", () => {

    // Ativa a tela preta
    transition.classList.add("active");

    // Espera a animação terminar
    setTimeout(() => {

        window.location.href = "mapa.html";

    }, 800);

});
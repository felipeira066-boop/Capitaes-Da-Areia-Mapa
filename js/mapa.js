let map = null;

let markers = [];

let locais = [];

let localAtual = 0;

let animando = false;

let streetViewService = null;

let panorama = null;


// ========================================
// ELEMENTOS DA INTERFACE
// ========================================

let infoToggle;
let locationInfo;

let locationNumber;
let locationName;
let locationDescription;

let prevButton;
let nextButton;

let progress;


// ========================================
// DOM
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("DOM carregado");


    infoToggle =
        document.getElementById("infoToggle");

    locationInfo =
        document.getElementById("locationInfo");

    locationNumber =
        document.getElementById("locationNumber");

    locationName =
        document.getElementById("locationName");

    locationDescription =
        document.getElementById("locationDescription");

    prevButton =
        document.getElementById("prevButton");

    nextButton =
        document.getElementById("nextButton");

    progress =
        document.querySelector(".progress");


    // ========================================
    // PAINEL
    // ========================================

    if (infoToggle && locationInfo) {

        infoToggle.addEventListener("click", () => {

            locationInfo.classList.toggle("open");

            infoToggle.classList.toggle("open");

        });

    }


    // ========================================
    // PRÓXIMO
    // ========================================

    if (nextButton) {

        nextButton.addEventListener("click", () => {

            console.log("PRÓXIMO clicado");

            irParaLocal(localAtual + 1, true);

        });

    }


    // ========================================
    // VOLTAR
    // ========================================

    if (prevButton) {

        prevButton.addEventListener("click", () => {

            console.log("VOLTAR clicado");

            irParaLocal(localAtual - 1, true);

        });

    }

});


// ========================================
// CARREGAR LOCAIS DO SUPABASE
// ========================================

async function carregarLocais() {

    console.log("Buscando locais no Supabase...");


    const { data, error } =
        await supabaseClient
            .from("locais")
            .select("*")
            .order("ordem", {
                ascending: true
            });


    if (error) {

        console.error(
            "Erro ao carregar locais do Supabase:",
            error
        );

        return [];

    }


    if (!data || data.length === 0) {

        console.warn(
            "O Supabase respondeu, mas nenhum local foi encontrado."
        );

        return [];

    }


    console.log(
        `Foram carregados ${data.length} locais:`,
        data
    );


    return data;

}


// ========================================
// GOOGLE MAPS
// ========================================

async function initMap() {

    console.log("Inicializando mapa...");


    // ========================================
    // CARREGA LOCAIS
    // ========================================

    locais =
        await carregarLocais();


    if (locais.length === 0) {

        console.error(
            "Nenhum local foi encontrado no Supabase."
        );

        return;

    }


    // ========================================
    // BIBLIOTECAS DO GOOGLE
    // ========================================

    const { Map } =
        await google.maps.importLibrary("maps");


    const { AdvancedMarkerElement } =
        await google.maps.importLibrary("marker");


    const { StreetViewService } =
        await google.maps.importLibrary("streetView");


    // ========================================
    // STREET VIEW SERVICE
    // ========================================

    streetViewService =
        new StreetViewService();


    // ========================================
    // PRIMEIRO LOCAL
    // ========================================

    const primeiroLocal =
        locais[0];


    // ========================================
    // CRIA MAPA
    // ========================================

    map = new Map(
        document.getElementById("map"),
        {

            center: {
                lat: Number(primeiroLocal.latitude),
                lng: Number(primeiroLocal.longitude)
            },

            zoom: Number(primeiroLocal.zoom),

            mapTypeId: "roadmap",

            mapId: "DEMO_MAP_ID",

            zoomControl: true,

            streetViewControl: true,

            mapTypeControl: false,

            fullscreenControl: false

        }
    );


    // ========================================
    // STREET VIEW
    // ========================================

    panorama =
        map.getStreetView();


    panorama.setOptions({

        visible: false,

        enableCloseButton: true,

        addressControl: false,

        fullscreenControl: true,

        linksControl: true,

        panControl: true,

        zoomControl: true

    });


    // ========================================
    // MARCADORES
    // ========================================

    locais.forEach((local, index) => {

        const elemento =
            criarMarcador(local, index);


        const marker =
            new AdvancedMarkerElement({

                map: map,

                position: {
                    lat: Number(local.latitude),
                    lng: Number(local.longitude)
                },

                title: local.nome,

                content: elemento,

                gmpClickable: true

            });


        marker.addEventListener(
            "gmp-click",
            () => {

                console.log(
                    "Marcador clicado:",
                    index + 1
                );


                /*
                 * false = clique direto,
                 * portanto entra diretamente
                 * no Street View.
                 */

                irParaLocal(
                    index,
                    false
                );

            }
        );


        markers.push(marker);

    });


    // ========================================
    // INTERFACE INICIAL
    // ========================================

    atualizarInterface();

    destacarMarcador(0);


    console.log("Mapa pronto!");

}


// ========================================
// GOOGLE CALLBACK
// ========================================

window.initMap = initMap;


// ========================================
// CRIAR MARCADOR
// ========================================

function criarMarcador(local, index) {

    const elemento =
        document.createElement("div");


    elemento.className =
        "custom-marker";


    elemento.innerHTML = `

        <div class="marker-number">
            ${String(index + 1).padStart(2, "0")}
        </div>

        <div class="marker-dot"></div>

    `;


    return elemento;

}


// ========================================
// IR PARA LOCAL
// ========================================

async function irParaLocal(
    index,
    fazerAnimacao = true
) {

    if (!map) {

        console.error(
            "Mapa ainda não foi inicializado."
        );

        return;

    }


    if (
        index < 0 ||
        index >= locais.length
    ) {

        return;

    }


    if (animando) {

        return;

    }


    // ========================================
    // CLIQUE DIRETO NO MARCADOR
    // ========================================

    if (!fazerAnimacao) {

        localAtual = index;


        const local =
            locais[localAtual];


        atualizarInterface();

        destacarMarcador(index);

        fecharPainel();


        await esperar(150);


        await entrarNoStreetView(local);


        await esperar(300);


        abrirPainel();


        return;

    }


    // ========================================
    // COMEÇA ANIMAÇÃO
    // ========================================

    animando = true;


    const destino =
        locais[index];


    // ========================================
    // FECHA STREET VIEW
    // ========================================

    if (panorama) {

        panorama.setVisible(false);

    }


    // ========================================
    // FECHA PAINEL
    // ========================================

    fecharPainel();


    // ========================================
    // BLOQUEIA BOTÕES
    // ========================================

    atualizarBotoesAnimacao(true);


    // ========================================
    // CENTRO ATUAL
    // ========================================

    const centroAtual =
        map.getCenter();


    if (!centroAtual) {

        animando = false;

        atualizarBotoesAnimacao(false);

        return;

    }


    const inicio = {

        lat: centroAtual.lat(),

        lng: centroAtual.lng()

    };


    const fim = {

        lat: Number(destino.latitude),

        lng: Number(destino.longitude)

    };


    const zoomAtual =
        map.getZoom() ?? Number(destino.zoom);


    // ========================================
    // ZOOM DA VIAGEM
    // ========================================

    const zoomViagem =
        Math.max(
            12,
            Math.min(
                zoomAtual,
                Number(destino.zoom)
            ) - 3
        );


    // ========================================
    // ZOOM OUT
    // ========================================

    await animarZoom(
        zoomAtual,
        zoomViagem,
        700
    );


    // ========================================
    // VIAGEM
    // ========================================

    await animarCentro(
        inicio,
        fim,
        1400
    );


    // ========================================
    // ZOOM IN
    // ========================================

    await animarZoom(
        zoomViagem,
        Number(destino.zoom),
        900
    );


    // ========================================
    // ATUALIZA LOCAL
    // ========================================

    localAtual =
        index;


    atualizarInterface();

    destacarMarcador(index);


    // ========================================
    // STREET VIEW
    // ========================================

    await esperar(150);


    await entrarNoStreetView(destino);


    // ========================================
    // ABRE PAINEL
    // ========================================

    await esperar(300);


    abrirPainel();


    // ========================================
    // TERMINOU
    // ========================================

    animando = false;


    atualizarBotoesAnimacao(false);

}


// ========================================
// ENTRAR NO STREET VIEW
// ========================================

async function entrarNoStreetView(local) {

    if (
        !streetViewService ||
        !panorama
    ) {

        console.error(
            "Street View ainda não foi inicializado."
        );

        return false;

    }


    console.log(
        "Procurando Street View:",
        local.nome
    );


    try {

        const resultado =
            await streetViewService.getPanorama({

                location: {
                    lat: Number(local.latitude),
                    lng: Number(local.longitude)
                },

                radius: 80

            });


        if (
            !resultado ||
            !resultado.data
        ) {

            console.warn(
                "Nenhum Street View encontrado para:",
                local.nome
            );

            return false;

        }


        const dados =
            resultado.data;


        if (
            !dados.location ||
            !dados.location.pano
        ) {

            console.warn(
                "Panorama inválido:",
                local.nome
            );

            return false;

        }


        // ========================================
        // PANORAMA
        // ========================================

        panorama.setPano(
            dados.location.pano
        );


        // ========================================
        // DIREÇÃO
        // ========================================

        panorama.setPov({

            heading:
                Number(local.heading) || 0,

            pitch:
                Number(local.pitch) || 0

        });


        // ========================================
        // MOSTRA STREET VIEW
        // ========================================

        panorama.setVisible(true);


        console.log(
            "Street View aberto:",
            local.nome
        );


        return true;

    } catch (erro) {

        console.error(
            "Erro ao abrir Street View:",
            erro
        );

        return false;

    }

}


// ========================================
// ANIMAÇÃO DE ZOOM
// ========================================

function animarZoom(
    zoomInicial,
    zoomFinal,
    duracao
) {

    return new Promise((resolve) => {

        const inicioTempo =
            performance.now();


        function easeInOut(t) {

            return t < 0.5

                ? 4 * t * t * t

                : 1 -
                  Math.pow(
                      -2 * t + 2,
                      3
                  ) / 2;

        }


        function quadro(tempoAtual) {

            let progresso =
                (tempoAtual - inicioTempo) /
                duracao;


            if (progresso > 1) {

                progresso = 1;

            }


            const suavizado =
                easeInOut(progresso);


            const zoom =
                zoomInicial +
                (
                    zoomFinal -
                    zoomInicial
                ) *
                suavizado;


            map.moveCamera({

                zoom: zoom

            });


            if (progresso < 1) {

                requestAnimationFrame(quadro);

            } else {

                resolve();

            }

        }


        requestAnimationFrame(quadro);

    });

}


// ========================================
// ANIMAÇÃO DE CENTRO
// ========================================

function animarCentro(
    inicio,
    fim,
    duracao
) {

    return new Promise((resolve) => {

        const inicioTempo =
            performance.now();


        function easeInOut(t) {

            return t < 0.5

                ? 4 * t * t * t

                : 1 -
                  Math.pow(
                      -2 * t + 2,
                      3
                  ) / 2;

        }


        function quadro(tempoAtual) {

            let progresso =
                (tempoAtual - inicioTempo) /
                duracao;


            if (progresso > 1) {

                progresso = 1;

            }


            const suavizado =
                easeInOut(progresso);


            const lat =
                inicio.lat +
                (
                    fim.lat -
                    inicio.lat
                ) *
                suavizado;


            const lng =
                inicio.lng +
                (
                    fim.lng -
                    inicio.lng
                ) *
                suavizado;


            map.moveCamera({

                center: {

                    lat: lat,

                    lng: lng

                }

            });


            if (progresso < 1) {

                requestAnimationFrame(quadro);

            } else {

                resolve();

            }

        }


        requestAnimationFrame(quadro);

    });

}


// ========================================
// ESPERAR
// ========================================

function esperar(ms) {

    return new Promise((resolve) => {

        setTimeout(
            resolve,
            ms
        );

    });

}


// ========================================
// FECHAR PAINEL
// ========================================

function fecharPainel() {

    if (
        !locationInfo ||
        !infoToggle
    ) {

        return;

    }


    locationInfo.classList.remove("open");

    infoToggle.classList.remove("open");

}


// ========================================
// ABRIR PAINEL
// ========================================

function abrirPainel() {

    if (
        !locationInfo ||
        !infoToggle
    ) {

        return;

    }


    locationInfo.classList.add("open");

    infoToggle.classList.add("open");

}


// ========================================
// BOTÕES
// ========================================

function atualizarBotoesAnimacao(valor) {

    if (
        !prevButton ||
        !nextButton
    ) {

        return;

    }


    if (valor) {

        prevButton.disabled = true;

        nextButton.disabled = true;

        return;

    }


    prevButton.disabled =
        localAtual === 0;


    nextButton.disabled =
        localAtual === locais.length - 1;

}


// ========================================
// MARCADOR ATIVO
// ========================================

function destacarMarcador(index) {

    markers.forEach(
        (marker, i) => {

            const elemento =
                marker.content;


            if (!elemento) {

                return;

            }


            if (i === index) {

                elemento.classList.add(
                    "active"
                );

            } else {

                elemento.classList.remove(
                    "active"
                );

            }

        }
    );

}


// ========================================
// ATUALIZAR INTERFACE
// ========================================

function atualizarInterface() {

    if (!locais.length) {

        return;

    }


    const local =
        locais[localAtual];


    const numero =
        localAtual + 1;


    const total =
        locais.length;


    console.log(
        `Atualizando local ${numero}/${total}`
    );


    // ========================================
    // NÚMERO
    // ========================================

    locationNumber.textContent =
        String(numero).padStart(2, "0");


    // ========================================
    // NOME
    // ========================================

    locationName.textContent =
        local.nome;


    // ========================================
    // DESCRIÇÃO
    // ========================================

    locationDescription.textContent =
        local.descricao;


    // ========================================
    // CONTADOR
    // ========================================

    progress.textContent =
        `${numero} / ${total}`;


    // ========================================
    // BOTÕES
    // ========================================

    atualizarBotoesAnimacao(false);

}
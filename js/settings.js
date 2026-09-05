// ============================================================
// CAPITÃES DA AREIA
// SETTINGS
// ============================================================


// ============================================================
// ESTADO
// ============================================================

let locais = [];

let localSelecionado = null;

// Mapa do Settings
let settingsMap = null;

// Marcador usado para indicar o ponto escolhido
let selectedLocationMarker = null;

// Indica se estamos no modo "escolher local"
let pickingLocation = false;

let settingsPanorama = null;

let settingsStreetViewService = null;

// ============================================================
// ELEMENTOS DA INTERFACE
// ============================================================

const locationsList =
    document.getElementById("locationsList");

const locationForm =
    document.getElementById("locationForm");

const addLocationButton =
    document.getElementById("addLocationButton");

const deleteButton =
    document.getElementById("deleteButton");

const formMessage =
    document.getElementById("formMessage");

const editorTitle =
    document.getElementById("editorTitle");

const editorLabel =
    document.getElementById("editorLabel");

const pickLocationButton =
    document.getElementById("pickLocationButton");

const mapPickerMessage =
    document.getElementById("mapPickerMessage");

const testStreetViewButton =
    document.getElementById(
        "testStreetViewButton"
    );

const streetViewMessage =
    document.getElementById(
        "streetViewMessage"
    );

const headingValue =
    document.getElementById(
        "headingValue"
    );

const pitchValue =
    document.getElementById(
        "pitchValue"
    );

const zoomValue =
    document.getElementById(
        "zoomValue"
    );

// ============================================================
// VERIFICA ELEMENTOS
// ============================================================

function verificarElementos() {

    const elementos = {
        locationsList,
        locationForm,
        addLocationButton,
        deleteButton,
        formMessage,
        editorTitle,
        editorLabel,
        pickLocationButton,
        mapPickerMessage,
        testStreetViewButton,
        streetViewMessage,
        headingValue,
        pitchValue,
        zoomValue
    };


    for (const [nome, elemento] of Object.entries(elementos)) {

        if (!elemento) {

            console.error(
                `Elemento "${nome}" não encontrado no HTML.`
            );

        }

    }

}

// ============================================================
// CARREGAR GOOGLE MAPS
// ============================================================

function carregarGoogleMapsSettings() {

    return new Promise((resolve, reject) => {

        // Já carregado
        if (
            window.google &&
            window.google.maps &&
            window.google.maps.Map
        ) {

            console.log(
                "Google Maps já estava carregado."
            );

            resolve();

            return;
        }


        const script =
            document.createElement("script");


        script.src =
            "https://maps.googleapis.com/maps/api/js" +
            `?key=${encodeURIComponent(
                CONFIG.googleMapsApiKey
            )}` +
            "&libraries=marker";


        script.async = true;

        script.defer = true;


        script.onload = () => {

            console.log(
                "Google Maps carregado no Settings."
            );

            resolve();

        };


        script.onerror = () => {

            reject(
                new Error(
                    "Não foi possível carregar o Google Maps."
                )
            );

        };


        document.head.appendChild(script);

    });

}
// ============================================================
// INICIALIZAR MAPA
// ============================================================

async function inicializarMapaSettings() {

    try {

        console.log(
            "Inicializando mapa do Settings..."
        );


        // ========================================
        // GOOGLE MAPS
        // ========================================

        await carregarGoogleMapsSettings();


        console.log(
            "Google Maps disponível."
        );


        // ========================================
        // ELEMENTO
        // ========================================

        const mapElement =
            document.getElementById(
                "settingsMap"
            );


        if (!mapElement) {

            throw new Error(
                'Elemento "#settingsMap" não encontrado.'
            );

        }


        // ========================================
        // CRIAR MAPA
        // ========================================

        settingsMap =
            new google.maps.Map(
                mapElement,
                {

                    center: {
                        lat: -12.9714,
                        lng: -38.5014
                    },

                    zoom: 14,

                    mapTypeId: "roadmap",

                    mapId: "DEMO_MAP_ID",

                    zoomControl: true,

                    streetViewControl: true,

                    mapTypeControl: false,

                    fullscreenControl: false

                }
            );

        /* ========================================
        STREET VIEW
        ======================================== */

        settingsStreetViewService =
            new google.maps.StreetViewService();


        settingsPanorama =
            new google.maps.StreetViewPanorama(
                document.getElementById(
                    "settingsStreetView"
                ),
                {

                    visible: false,

                    addressControl: false,

                    fullscreenControl: true,

                    linksControl: true,

                    panControl: true,

                    zoomControl: true,

                    motionTracking: false

                }
            );

        // ========================================
        // CLIQUE NO MAPA
        // ========================================

        settingsMap.addListener(
            "click",
            (event) => {

                if (!pickingLocation) {

                    return;

                }


                if (!event.latLng) {

                    return;

                }


                selecionarPontoNoMapa(
                    event.latLng
                );

            }
        );


        console.log(
            "Mapa do Settings pronto!"
        );


        // ========================================
        // POSICIONAR LOCAL SELECIONADO
        // ========================================

        if (
            localSelecionado !== null
        ) {

            atualizarMapaComLocalSelecionado();

        }

    } catch (erro) {

        console.error(
            "ERRO NO MAPA DO SETTINGS:",
            erro
        );


        if (mapPickerMessage) {

            mapPickerMessage.textContent =
                "Erro ao carregar o mapa. Veja o console.";

        }

    }

}

// ============================================================
// ATUALIZAR MAPA COM LOCAL SELECIONADO
// ============================================================

function atualizarMapaComLocalSelecionado() {

    if (!settingsMap) {

        return;

    }


    const local =
        locais.find(
            item =>
                Number(item.id) ===
                Number(localSelecionado)
        );


    if (!local) {

        return;

    }


    const latitude =
        Number(local.latitude);

    const longitude =
        Number(local.longitude);


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        return;

    }


    const position = {

        lat: latitude,

        lng: longitude

    };


    settingsMap.panTo(position);


    settingsMap.setZoom(
        Number(local.zoom) || 18
    );


    criarOuMoverMarcadorSelecionado(
        position
    );

}


// ============================================================
// CRIAR / MOVER MARCADOR
// ============================================================

function criarOuMoverMarcadorSelecionado(
    position
) {

    if (!settingsMap) {

        return;

    }


    if (selectedLocationMarker) {

        selectedLocationMarker.setPosition(
            position
        );

        selectedLocationMarker.setMap(
            settingsMap
        );

        return;

    }


    selectedLocationMarker =
        new google.maps.Marker({

            position: position,

            map: settingsMap,

            title:
                "Local selecionado"

        });

}


// ============================================================
// SELECIONAR PONTO NO MAPA
// ============================================================

function selecionarPontoNoMapa(
    latLng
) {

    const latitude =
        latLng.lat();

    const longitude =
        latLng.lng();


    const position = {

        lat: latitude,

        lng: longitude

    };


    // Remove marcador anterior
    if (selectedLocationMarker) {

        selectedLocationMarker.setMap(
            null
        );

    }


    // Cria marcador clássico
    selectedLocationMarker =
        new google.maps.Marker({

            position: position,

            map: settingsMap,

            title: "Local selecionado"

        });


    // Latitude
    document.getElementById(
        "locationLatitude"
    ).value =
        latitude.toFixed(6);


    // Longitude
    document.getElementById(
        "locationLongitude"
    ).value =
        longitude.toFixed(6);


    // Sai do modo seleção
    pickingLocation =
        false;


    pickLocationButton.textContent =
        "📍 ESCOLHER LOCAL";


    pickLocationButton.classList.remove(
        "selecting"
    );


    // Mensagem
    mapPickerMessage.textContent =
        `Local selecionado: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;


    // Centraliza
    settingsMap.panTo(
        position
    );


    settingsMap.setZoom(
        18
    );

}


// ============================================================
// BOTÃO ESCOLHER LOCAL
// ============================================================

pickLocationButton.addEventListener(
    "click",
    () => {

        pickingLocation =
            !pickingLocation;


        if (pickingLocation) {

            pickLocationButton.textContent =
                "✓ CLIQUE NO MAPA";


            pickLocationButton.classList.add(
                "selecting"
            );


            mapPickerMessage.textContent =
                "Agora clique no ponto exato que deseja marcar.";

        } else {

            pickLocationButton.textContent =
                "📍 ESCOLHER LOCAL";


            pickLocationButton.classList.remove(
                "selecting"
            );


            mapPickerMessage.textContent =
                "Seleção cancelada.";

        }

    }
);


// ============================================================
// CARREGAR LOCAIS DO SUPABASE
// ============================================================

async function carregarLocais() {

    locationsList.innerHTML = `

        <p class="loading">
            Carregando locais...
        </p>

    `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("locais")
            .select("*")
            .order("ordem", {
                ascending: true
            });


    if (error) {

        console.error(
            "Erro ao carregar locais:",
            error
        );


        locationsList.innerHTML = `

            <p class="empty">
                Erro ao carregar os locais.
            </p>

        `;

        return;

    }


    locais =
        data || [];


    renderizarLista();


    // --------------------------------------------------------
    // Seleciona primeiro local
    // --------------------------------------------------------

    if (locais.length > 0) {

        selecionarLocal(
            locais[0].id
        );

    } else {

        novoLocal();

    }

}


// ============================================================
// RENDERIZAR LISTA
// ============================================================

function renderizarLista() {

    locationsList.innerHTML =
        "";


    if (locais.length === 0) {

        locationsList.innerHTML = `

            <p class="empty">
                Nenhum local cadastrado.
            </p>

        `;

        return;

    }


    locais.forEach(
        (local) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "location-card";


            if (
                Number(localSelecionado) ===
                Number(local.id)
            ) {

                card.classList.add(
                    "active"
                );

            }


            card.innerHTML = `

                <div class="location-order">

                    ${String(
                        local.ordem
                    ).padStart(2, "0")}

                </div>


                <div>

                    <h3>
                        ${escaparHTML(
                            local.nome
                        )}
                    </h3>


                    <p>
                        ${escaparHTML(
                            local.subtitulo || ""
                        )}
                    </p>

                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    selecionarLocal(
                        local.id
                    );

                }
            );


            locationsList.appendChild(
                card
            );

        }
    );

}


// ============================================================
// SELECIONAR LOCAL
// ============================================================

function selecionarLocal(id) {

    const local =
        locais.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!local) {

        return;

    }


    localSelecionado =
        local.id;


    editorLabel.textContent =
        "EDITANDO LOCAL";


    editorTitle.textContent =
        local.nome;


    preencherFormulario(
        local
    );


    deleteButton.style.display =
        "block";


    formMessage.textContent =
        "";


    renderizarLista();


    // --------------------------------------------------------
    // Move o mapa para o local selecionado
    // --------------------------------------------------------

    if (settingsMap) {

        atualizarMapaComLocalSelecionado();

    }

}


// ============================================================
// PREENCHER FORMULÁRIO
// ============================================================

function preencherFormulario(local) {

    document.getElementById(
        "locationId"
    ).value =
        local.id;


    document.getElementById(
        "locationOrder"
    ).value =
        local.ordem;


    document.getElementById(
        "locationName"
    ).value =
        local.nome || "";


    document.getElementById(
        "locationSubtitle"
    ).value =
        local.subtitulo || "";


    document.getElementById(
        "locationLatitude"
    ).value =
        local.latitude;


    document.getElementById(
        "locationLongitude"
    ).value =
        local.longitude;


    document.getElementById(
        "locationZoom"
    ).value =
        local.zoom;


    document.getElementById(
        "locationHeading"
    ).value =
        local.heading ?? 0;


    document.getElementById(
        "locationPitch"
    ).value =
        local.pitch ?? 0;


    document.getElementById(
        "locationDescription"
    ).value =
        local.descricao || "";

}

atualizarValoresControles();


// ============================================================
// NOVO LOCAL
// ============================================================

function novoLocal() {

    localSelecionado =
        null;


    locationForm.reset();


    editorLabel.textContent =
        "NOVO LOCAL";


    editorTitle.textContent =
        "Novo local";


    document.getElementById(
        "locationId"
    ).value =
        "";


    const proximaOrdem =
        locais.length > 0

            ? Math.max(
                ...locais.map(
                    local =>
                        Number(local.ordem)
                )
            ) + 1

            : 1;


    document.getElementById(
        "locationOrder"
    ).value =
        proximaOrdem;


    document.getElementById(
        "locationZoom"
    ).value =
        18;


    document.getElementById(
        "locationHeading"
    ).value =
        0;


    document.getElementById(
        "locationPitch"
    ).value =
        0;

    atualizarValoresControles();


    deleteButton.style.display =
        "none";


    formMessage.textContent =
        "";


    renderizarLista();


    // --------------------------------------------------------
    // Limpa marcador temporário
    // --------------------------------------------------------

    if (
        selectedLocationMarker
    ) {

        selectedLocationMarker.map =
            null;

        selectedLocationMarker =
            null;

    }


    if (settingsMap) {

        settingsMap.panTo({

            lat: -12.9714,

            lng: -38.5014

        });


        settingsMap.setZoom(14);

    }


    mapPickerMessage.textContent =
        'Clique em "Escolher local" e depois selecione um ponto no mapa.';

}

// ============================================================
// SALVAR
// ============================================================

locationForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        formMessage.textContent =
            "Salvando...";


        const id =
            document.getElementById(
                "locationId"
            ).value;


        const local = {

            ordem:
                Number(
                    document.getElementById(
                        "locationOrder"
                    ).value
                ),

            nome:
                document.getElementById(
                    "locationName"
                ).value.trim(),

            subtitulo:
                document.getElementById(
                    "locationSubtitle"
                ).value.trim(),

            latitude:
                Number(
                    document.getElementById(
                        "locationLatitude"
                    ).value
                ),

            longitude:
                Number(
                    document.getElementById(
                        "locationLongitude"
                    ).value
                ),

            zoom:
                Number(
                    document.getElementById(
                        "locationZoom"
                    ).value
                ),

            heading:
                Number(
                    document.getElementById(
                        "locationHeading"
                    ).value
                ) || 0,

            pitch:
                Number(
                    document.getElementById(
                        "locationPitch"
                    ).value
                ) || 0,

            descricao:
                document.getElementById(
                    "locationDescription"
                ).value.trim()

        };


        // ----------------------------------------------------
        // Validação
        // ----------------------------------------------------

        if (!local.nome) {

            formMessage.textContent =
                "Digite um nome para o local.";

            return;

        }


        if (
            !Number.isFinite(
                local.latitude
            ) ||
            !Number.isFinite(
                local.longitude
            )
        ) {

            formMessage.textContent =
                "Informe uma latitude e longitude válidas.";

            return;

        }


        // ----------------------------------------------------
        // NOVO LOCAL
        // ----------------------------------------------------

        if (!id) {

            const {
                data,
                error
            } =
                await supabaseClient
                    .from("locais")
                    .insert(local)
                    .select()
                    .single();


            if (error) {

                console.error(
                    "Erro ao criar local:",
                    error
                );


                formMessage.textContent =
                    error.message;

                return;

            }


            formMessage.textContent =
                "Local criado com sucesso!";


            await carregarLocais();


            selecionarLocal(
                data.id
            );


            return;

        }


        // ----------------------------------------------------
        // EDITAR LOCAL
        // ----------------------------------------------------

        const {
            error
        } =
            await supabaseClient
                .from("locais")
                .update(local)
                .eq(
                    "id",
                    Number(id)
                );


        if (error) {

            console.error(
                "Erro ao editar local:",
                error
            );


            formMessage.textContent =
                error.message;

            return;

        }


        formMessage.textContent =
            "Local atualizado com sucesso!";


        await carregarLocais();


        selecionarLocal(
            Number(id)
        );

    }
);


// ============================================================
// EXCLUIR
// ============================================================

deleteButton.addEventListener(
    "click",
    async () => {

        const id =
            document.getElementById(
                "locationId"
            ).value;


        if (!id) {

            return;

        }


        const local =
            locais.find(
                item =>
                    Number(item.id) ===
                    Number(id)
            );


        if (!local) {

            return;

        }


        const confirmar =
            confirm(
                `Deseja excluir "${local.nome}"?`
            );


        if (!confirmar) {

            return;

        }


        const {
            error
        } =
            await supabaseClient
                .from("locais")
                .delete()
                .eq(
                    "id",
                    Number(id)
                );


        if (error) {

            console.error(
                "Erro ao excluir local:",
                error
            );


            formMessage.textContent =
                error.message;

            return;

        }


        formMessage.textContent =
            "Local excluído.";


        localSelecionado =
            null;


        if (
            selectedLocationMarker
        ) {

            selectedLocationMarker.map =
                null;

            selectedLocationMarker =
                null;

        }


        await carregarLocais();

    }
);


// ============================================================
// NOVO LOCAL
// ============================================================

addLocationButton.addEventListener(
    "click",
    () => {

        novoLocal();

    }
);


// ============================================================
// ESCAPAR HTML
// ============================================================

function escaparHTML(texto) {

    return String(texto)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

async function iniciarSettings() {

    verificarElementos();


    await carregarLocais();


    await inicializarMapaSettings();

}


iniciarSettings();

/* ========================================
   TESTAR STREET VIEW
======================================== */

async function testarStreetView() {

    if (!settingsStreetViewService) {

        streetViewMessage.textContent =
            "O Street View ainda não foi inicializado.";

        return;

    }


    const latitude =
        Number(
            document.getElementById(
                "locationLatitude"
            ).value
        );


    const longitude =
        Number(
            document.getElementById(
                "locationLongitude"
            ).value
        );


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        streetViewMessage.textContent =
            "Escolha primeiro um local válido.";

        return;

    }


    streetViewMessage.textContent =
        "Procurando Street View...";


    try {

        const resultado =
            await new Promise(
                (resolve, reject) => {

                    settingsStreetViewService.getPanorama(
                        {
                            location: {
                                lat: latitude,
                                lng: longitude
                            },

                            radius: 80
                        },

                        (
                            data,
                            status
                        ) => {

                            if (
                                status ===
                                google.maps.StreetViewStatus.OK
                            ) {

                                resolve(data);

                            } else {

                                reject(
                                    new Error(
                                        "Nenhum Street View encontrado."
                                    )
                                );

                            }

                        }
                    );

                }
            );


        if (
            !resultado ||
            !resultado.location ||
            !resultado.location.pano
        ) {

            throw new Error(
                "Panorama inválido."
            );

        }


        const heading =
            Number(
                document.getElementById(
                    "locationHeading"
                ).value
            ) || 0;


        const pitch =
            Number(
                document.getElementById(
                    "locationPitch"
                ).value
            ) || 0;


        const zoom =
            Number(
                document.getElementById(
                    "locationZoom"
                ).value
            ) || 18;


        settingsPanorama.setPano(
            resultado.location.pano
        );


        settingsPanorama.setPov({

            heading: heading,

            pitch: pitch

        });


        settingsPanorama.setZoom(
            zoom
        );


        settingsPanorama.setVisible(
            true
        );


        streetViewMessage.textContent =
            `Street View encontrado para: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;


    } catch (erro) {

        console.error(
            "Erro no Street View:",
            erro
        );


        streetViewMessage.textContent =
            "Não existe Street View disponível próximo desse ponto.";

    }

}

testStreetViewButton.addEventListener(
    "click",
    testarStreetView
);



/* ========================================
   ATUALIZAR VALORES DOS CONTROLES
======================================== */

// ============================================================
// ATUALIZAR VALORES DOS CONTROLES
// ============================================================

function atualizarValoresControles() {

    const heading =
        Number(
            document.getElementById(
                "locationHeading"
            ).value
        );

    const pitch =
        Number(
            document.getElementById(
                "locationPitch"
            ).value
        );

    const zoom =
        Number(
            document.getElementById(
                "locationZoom"
            ).value
        );


    headingValue.textContent =
        `${heading}°`;

    pitchValue.textContent =
        `${pitch}°`;

    zoomValue.textContent =
        zoom.toFixed(1);

}


// ============================================================
// ATUALIZAR STREET VIEW
// ============================================================

function atualizarStreetViewComControles() {

    atualizarValoresControles();


    if (!settingsPanorama) {

        return;

    }


    if (!settingsPanorama.getVisible()) {

        return;

    }


    const heading =
        Number(
            document.getElementById(
                "locationHeading"
            ).value
        ) || 0;


    const pitch =
        Number(
            document.getElementById(
                "locationPitch"
            ).value
        ) || 0;


    const zoom =
        Number(
            document.getElementById(
                "locationZoom"
            ).value
        ) || 18;


    settingsPanorama.setPov({

        heading,
        pitch

    });


    settingsPanorama.setZoom(
        zoom
    );

}

[
    "locationHeading",
    "locationPitch",
    "locationZoom"
].forEach((id) => {

    document
        .getElementById(id)
        .addEventListener(
            "input",
            () => {

                atualizarValoresControles();

                atualizarStreetViewComControles();

            }
        );

});

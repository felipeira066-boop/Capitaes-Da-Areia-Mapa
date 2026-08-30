let locais = [];

let localSelecionado = null;


/* ========================================
   ELEMENTOS
======================================== */

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


/* ========================================
   CARREGAR LOCAIS
======================================== */

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


    /*
     * Se existir pelo menos um local,
     * selecionamos o primeiro.
     */

    if (locais.length > 0) {

        selecionarLocal(locais[0].id);

    } else {

        novoLocal();

    }

}


/* ========================================
   RENDERIZAR LISTA
======================================== */

function renderizarLista() {

    locationsList.innerHTML = "";


    if (locais.length === 0) {

        locationsList.innerHTML = `
            <p class="empty">
                Nenhum local cadastrado.
            </p>
        `;

        return;

    }


    locais.forEach((local) => {

        const card =
            document.createElement("article");


        card.className =
            "location-card";


        if (
            localSelecionado === local.id
        ) {

            card.classList.add("active");

        }


        card.innerHTML = `

            <div class="location-order">

                ${String(local.ordem).padStart(2, "0")}

            </div>


            <div>

                <h3>
                    ${escaparHTML(local.nome)}
                </h3>

                <p>
                    ${
                        escaparHTML(
                            local.subtitulo || ""
                        )
                    }
                </p>

            </div>

        `;


        card.addEventListener(
            "click",
            () => {

                selecionarLocal(local.id);

            }
        );


        locationsList.appendChild(card);

    });

}


/* ========================================
   SELECIONAR LOCAL
======================================== */

function selecionarLocal(id) {

    const local =
        locais.find(
            item => item.id === id
        );


    if (!local) {

        return;

    }


    localSelecionado =
        id;


    editorLabel.textContent =
        "EDITANDO LOCAL";


    editorTitle.textContent =
        local.nome;


    preencherFormulario(local);


    deleteButton.style.display =
        "block";


    formMessage.textContent =
        "";


    renderizarLista();

}


/* ========================================
   PREENCHER FORMULÁRIO
======================================== */

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
        local.heading;


    document.getElementById(
        "locationPitch"
    ).value =
        local.pitch;


    document.getElementById(
        "locationDescription"
    ).value =
        local.descricao || "";

}


/* ========================================
   NOVO LOCAL
======================================== */

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
    ).value = "";


    /*
     * Sugere a próxima ordem.
     */

    const proximaOrdem =
        locais.length > 0
            ? Math.max(
                ...locais.map(
                    local => Number(local.ordem)
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


    deleteButton.style.display =
        "none";


    formMessage.textContent =
        "";


    renderizarLista();

}


/* ========================================
   SALVAR
======================================== */

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

            ordem: Number(
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

            latitude: Number(
                document.getElementById(
                    "locationLatitude"
                ).value
            ),

            longitude: Number(
                document.getElementById(
                    "locationLongitude"
                ).value
            ),

            zoom: Number(
                document.getElementById(
                    "locationZoom"
                ).value
            ),

            heading: Number(
                document.getElementById(
                    "locationHeading"
                ).value
            ) || 0,

            pitch: Number(
                document.getElementById(
                    "locationPitch"
                ).value
            ) || 0,

            descricao:
                document.getElementById(
                    "locationDescription"
                ).value.trim()

        };


        /*
         * NOVO LOCAL
         */

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


            selecionarLocal(data.id);


            return;

        }


        /*
         * EDITAR LOCAL
         */

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


/* ========================================
   EXCLUIR
======================================== */

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
                    item.id === Number(id)
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


        await carregarLocais();

    }
);


/* ========================================
   NOVO LOCAL
======================================== */

addLocationButton.addEventListener(
    "click",
    () => {

        novoLocal();

    }
);


/* ========================================
   ESCAPAR HTML
======================================== */

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


async function inicializarMapaSettings() {

    const { Map } =
        await google.maps.importLibrary("maps");

    const { AdvancedMarkerElement } =
        await google.maps.importLibrary("marker");


    settingsMap =
        new Map(
            document.getElementById(
                "settingsMap"
            ),
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


    /*
     * Clique no mapa
     */

    settingsMap.addListener(
        "click",
        (event) => {

            if (!pickingLocation) {

                return;

            }


            if (!event.latLng) {

                return;

            }


            selecionarLocalNoMapa(
                event.latLng,
                AdvancedMarkerElement
            );

        }
    );

}

function selecionarLocalNoMapa(
    latLng,
    AdvancedMarkerElement
) {

    const latitude =
        latLng.lat();

    const longitude =
        latLng.lng();


    /*
     * Remove marcador anterior
     */

    if (selectedMarker) {

        selectedMarker.map = null;

    }


    /*
     * Cria marcador novo
     */

    const marcador =
        document.createElement("div");


    marcador.className =
        "custom-marker active";


    marcador.innerHTML = `

        <div class="marker-number">
            NOVO
        </div>

        <div class="marker-dot"></div>

    `;


    selectedMarker =
        new AdvancedMarkerElement({

            map: settingsMap,

            position: {
                lat: latitude,
                lng: longitude
            },

            title: "Local selecionado",

            content: marcador

        });


    /*
     * Preenche formulário
     */

    document.getElementById(
        "locationLatitude"
    ).value =
        latitude.toFixed(6);


    document.getElementById(
        "locationLongitude"
    ).value =
        longitude.toFixed(6);


    /*
     * Sai do modo de seleção
     */

    pickingLocation = false;


    const button =
        document.getElementById(
            "pickLocationButton"
        );


    button.textContent =
        "📍 ESCOLHER LOCAL";


    /*
     * Mensagem
     */

    document.getElementById(
        "mapPickerMessage"
    ).textContent =
        `Local selecionado: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;


    /*
     * Centraliza no ponto
     */

    settingsMap.panTo({

        lat: latitude,

        lng: longitude

    });


    settingsMap.setZoom(18);

}

document
    .getElementById("pickLocationButton")
    .addEventListener(
        "click",
        () => {

            pickingLocation =
                !pickingLocation;


            const button =
                document.getElementById(
                    "pickLocationButton"
                );


            const message =
                document.getElementById(
                    "mapPickerMessage"
                );


            if (pickingLocation) {

                button.textContent =
                    "✓ CLIQUE NO MAPA";

                message.textContent =
                    "Agora clique no ponto exato que deseja marcar.";

            } else {

                button.textContent =
                    "📍 ESCOLHER LOCAL";

                message.textContent =
                    "Modo de seleção cancelado.";

            }

        }
    );

/* ========================================
   INICIAR
======================================== */

carregarLocais();

/*
 * Inicializa o mapa do Settings
 * quando a API do Google estiver disponível.
 */

window.initSettingsMap =
    inicializarMapaSettings;
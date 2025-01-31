document.addEventListener("DOMContentLoaded", () => {
    // Função principal para buscar os dados da API
    async function fetchData() {
        try {
            console.log("Iniciando fetch de dados...");
            const response = await fetch('https://script.google.com/macros/s/AKfycbzmgmv-_SGh7g8_c3ZmicEsaScV6rqhQCYf8mSqIQTIcRTxbEIxDVa6Wjlfeac1p8xr/exec');
            const data = await response.json();

            console.log("Dados recebidos da API:", data);

            // Agrupando as demandas por tipo e status
            const demandasAgrupadas = agruparDemandas(data);

            // Atualizando o HTML com os dados agrupados
            updateUI(demandasAgrupadas, data);

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }

    function agruparDemandas(data) {
        const agrupado = {};

        data.forEach(item => {
            const tipoDemanda = item["Tipo da demanda"];
            const status = item["STATUS"] ? item["STATUS"].toLowerCase() : "pendente";

            if (!agrupado[tipoDemanda]) {
                agrupado[tipoDemanda] = { pendente: 0, resolvido: 0, naoResolvido: 0 };
            }

            if (status === "pendente") agrupado[tipoDemanda].pendente++;
            else if (status === "resolvido") agrupado[tipoDemanda].resolvido++;
            else if (status === "não solucionado" || status === "nao resolvido") agrupado[tipoDemanda].naoResolvido++;
        });

        console.log("Dados agrupados:", agrupado);
        return agrupado;
    }

    function updateUI(demandasAgrupadas, demandas) {
        console.log("Atualizando interface...");

        const tiposDemandas = [
            "Climatização", "Carro-pipa", "Poda", "Hidráulica", "Elétrica",
            "Almoxarifado", "Reparos", "Infraestrutura", "Capinação", 
            "Inservíveis", "Água-mineral", "Lixo-infectado"
        ];

        // Mapeamento de imagens por tipo de demanda
        const imagemPorTipo = {
            "Climatização": "img/tipo-demanda-climatizacao.png",
            "Carro-pipa": "img/tipo-demanda-carro-pipa.png",
            "Poda": "img/tipo-demanda-poda.png",
            "Hidráulica": "img/tipo-demanda-hidráulica.png",
            "Elétrica": "img/tipo-demanda-eletrica.png",
            "Almoxarifado": "img/tipo-demanda-almoxarifado.png",
            "Reparos": "img/tipo-demanda-reparos.png",
            "Infraestrutura": "img/tipo-demanda-infraestrutura.png",
            "Capinação": "img/tipo-demanda-capinacao.png",
            "Inservíveis": "img/tipo-demanda-inserviveis.png",
            "Água-mineral": "img/tipo-demanda-agua-minireal.png",
            "Lixo-infectado": "img/tipo-demanda-lixo-infectado.png"
        };

        tiposDemandas.forEach(tipo => {
            const pendenteElem = document.querySelector(`#api-pendente-${tipo.toLowerCase()}`);
            const resolvidoElem = document.querySelector(`#api-resolvido-${tipo.toLowerCase()}`);
            const naoResolvidoElem = document.querySelector(`#api-naoresolvido-${tipo.toLowerCase()}`);

            const contagem = demandasAgrupadas[tipo] || { pendente: 0, resolvido: 0, naoResolvido: 0 };

            if (pendenteElem) pendenteElem.textContent = contagem.pendente;
            if (resolvidoElem) resolvidoElem.textContent = contagem.resolvido;
            if (naoResolvidoElem) naoResolvidoElem.textContent = contagem.naoResolvido;
        });

        document.getElementById("andamento-recebido").innerHTML = "";
        document.getElementById("andamento-atendimento").innerHTML = "";
        document.getElementById("andamento-finalizado").innerHTML = "";

        demandas.forEach(demanda => {
            const andamento = demanda["Andamento"] ? demanda["Andamento"].toLowerCase() : "recebido";
            let containerId = "";
            let demandaClass = "";
            let botoes = "";

            if (andamento === "recebido") {
                containerId = "andamento-recebido";
                demandaClass = "drecebida";
                botoes = `<button>Detalhes</button><button>Atender</button>`;
            } else if (andamento === "em atendimento") {
                containerId = "andamento-atendimento";
                demandaClass = "dandamento";
                botoes = `<button>Finalizar</button>`;
            } else if (andamento === "finalizado") {
                containerId = "andamento-finalizado";
                demandaClass = "dfinalizada";
                botoes = `<button>Ver resultado</button>`;
            }

            if (containerId) {
                const unidadeSaude = demanda["Unidade de Saúde"] || "Unidade desconhecida";
                const tipoDemanda = demanda["Tipo da demanda"] || "Outros";
                const imagemSrc = imagemPorTipo[tipoDemanda] || "img/default.png";

                const demandaDiv = document.createElement("div");
                demandaDiv.classList.add("demanda", demandaClass);
                demandaDiv.innerHTML = `
                    <div class="demanda-img">
                        <img src="${imagemSrc}" alt="${tipoDemanda}">
                    </div>
                    <div class="demanda-info">
                        <div class="demanda-titulo-unidade">
                            <span>${unidadeSaude}</span>
                        </div>
                        <div class="${demandaClass}-botoes">
                            ${botoes}
                        </div>
                    </div>
                `;

                document.getElementById(containerId).prepend(demandaDiv);
            }
        });
    }

    fetchData();
});

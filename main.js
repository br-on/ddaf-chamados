document.addEventListener("DOMContentLoaded", () => {
    const API_URL = 'http://localhost:3000/ddaf-chamados';
    const USE_LOCAL_DATA = true; // utilizar dados locais para testes

    async function fetchData() {
        try {
            console.log("Iniciando fetch de dados...");
    
            let data;
            if (USE_LOCAL_DATA) {
                console.log("Usando dados locais...");
                data = window.demandas;
            } else {
                console.log("Buscando dados da API...");
                const response = await fetch(API_URL);
                data = await response.json();
            }
    
            console.log("Dados recebidos:", data);
    
            const demandasAgrupadas = agruparDemandasStatus(data);
            updateUI(demandasAgrupadas, data);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }
    

    function agruparDemandasStatus(data) {
        // Objeto que armazenará a contagem de status por tipo de demanda
        const agrupadoDemandaStatus = {};

        // percorre todas as demandas no DB (demanda -> item)
        data.forEach(item => {
            // Obtém o tipo da demanda; se não existir, define como "Outros"
            const tipoDemanda = item.tipo_demanda || "Outros";
            // Normaliza o status: se não existir, assume "pendente"
            const status = item.status ? item.status.toLowerCase() : "pendente";

            // Se o tipo de demanda ainda não foi registrado, inicializa os contadores
            if (!agrupadoDemandaStatus[tipoDemanda]) {
                agrupadoDemandaStatus[tipoDemanda] = { pendente: 0, resolvido: 0, naoResolvido: 0 };
            }

            // Incrementa o contador correspondente ao status da demanda
            if (status === "pendente") agrupadoDemandaStatus[tipoDemanda].pendente++;
            else if (status === "resolvido") agrupadoDemandaStatus[tipoDemanda].resolvido++;
            else if (["não solucionado", "nao resolvido"].includes(status)) agrupadoDemandaStatus[tipoDemanda].naoResolvido++;
        });

        // exibe no console os dados agrupados
        console.log("Dados agrupados:", agrupadoDemandaStatus);
        return agrupadoDemandaStatus;
    }

    function updateUI(demandasAgrupadas, demandas) {
        console.log("Atualizando interface...");

        // Lista de tipos de demanda que serão exibidos na UI
        const tiposDemandas = [
            "Climatização", "Carro-pipa", "Poda", "Hidráulica", "Elétrica",
            "Almoxarifado", "Reparos", "Infraestrutura", "Capinação",
            "Inservíveis", "Água-mineral", "Lixo-infectado"
        ];

        // Mapeamento de cada tipo de demanda para sua respectiva imagem
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
            "agua-mineral": "img/tipo-demanda-agua-mineral.png",
            "Lixo-infectado": "img/tipo-demanda-lixo-infectado.png"
        };

        // Define a prioridade das classes de cor
        const prioridadeCores = {
            "andamento-recebido": 3,   // 🔴 Vermelho (Maior prioridade)
            "andamento-ematendimento": 2, // 🟡 Amarelo (Média prioridade)
            "andamento-finalizado": 1  // 🔵 Azul (Menor prioridade)
        };

        // Objeto auxiliar para armazenar a cor prioritária de cada tipo de demanda
        const corPrioritariaPorDemanda = {};

        // Percorre todas as demandas para determinar a cor prioritária de cada tipo
        demandas.forEach(demanda => {
            const tipoDemanda = demanda.tipo_demanda || "Outros";
            const andamento = demanda.andamento ? demanda.andamento.toLowerCase() : "recebido";

            let classeAndamento = "";
            if (andamento === "recebido") {
                classeAndamento = "andamento-recebido";
            } else if (andamento === "em atendimento") {
                classeAndamento = "andamento-ematendimento";
            } else if (andamento === "finalizado") {
                classeAndamento = "andamento-finalizado";
            }

            // Verifica se já existe uma cor registrada para esse tipo de demanda
            if (!corPrioritariaPorDemanda[tipoDemanda] || prioridadeCores[classeAndamento] > prioridadeCores[corPrioritariaPorDemanda[tipoDemanda]]) {
                corPrioritariaPorDemanda[tipoDemanda] = classeAndamento;
            }
        });

        // Remove classes antigas antes de adicionar novas
        document.querySelectorAll(".img-tipo-demanda").forEach(div => {
            div.classList.remove("andamento-recebido", "andamento-ematendimento", "andamento-finalizado");
        });

        // Aplica a cor prioritária em cada div correspondente ao tipo de demanda
        Object.entries(corPrioritariaPorDemanda).forEach(([tipoDemanda, classePrioritaria]) => {
            const divImg = document.getElementById(`div-img-${tipoDemanda.toLowerCase()}`);
            if (divImg) {
                divImg.classList.add(classePrioritaria);
            }
        });

        // Atualiza os contadores de status (pendente, resolvido, não resolvido) para cada tipo de demanda
        tiposDemandas.forEach(tipo => {
            // Seleciona os elementos HTML que exibirão os contadores de cada status
            const pendenteElemento = document.querySelector(`#api-pendente-${tipo.toLowerCase()}`);
            const resolvidoElemento = document.querySelector(`#api-resolvido-${tipo.toLowerCase()}`);
            const naoResolvidoElemento = document.querySelector(`#api-naoresolvido-${tipo.toLowerCase()}`);

            // Obtém a contagem do tipo de demanda atual ou usa valores padrão (caso não tenha registro desse tipo)
            const contagem = demandasAgrupadas[tipo] || { pendente: 0, resolvido: 0, naoResolvido: 0 };

            // Atualiza o conteúdo dos elementos HTML com os valores obtidos
            if (pendenteElemento) pendenteElemento.textContent = contagem.pendente;
            if (resolvidoElemento) resolvidoElemento.textContent = contagem.resolvido;
            if (naoResolvidoElemento) naoResolvidoElemento.textContent = contagem.naoResolvido;
        });

        // Limpa as listas de demandas para evitar duplicação na interface
        document.getElementById("andamento-recebido").innerHTML = "";
        document.getElementById("andamento-atendimento").innerHTML = "";
        document.getElementById("andamento-finalizado").innerHTML = "";

        // Percorre todas as demandas e adiciona na UI conforme o status
        // Para cada demanda, será determinado onde ela será exibida na UI com base no seu status de andamento.
        demandas.forEach(demanda => {

            // verifica se tem o campo andamento preenchido, converte pra minúsculas, em caso de não ter o campo andamento, assume "recebido"
            const andamento = demanda.andamento ? demanda.andamento.toLowerCase() : "recebido";

            // define onde a demanda será adicionada
            let containerId = "";
            // define a estilização
            let demandaClass = "";
            // define os botões disponíveis
            let botoes = "";

            if (andamento === "recebido") {
                containerId = "andamento-recebido";
                demandaClass = "drecebida";
                botoes = `<button>Ver chamado</button>`;
            } else if (andamento === "em atendimento") {
                containerId = "andamento-atendimento";
                demandaClass = "dandamento";
                botoes = `<button>Finalizar</button>`;
            } else if (andamento === "finalizado") {
                containerId = "andamento-finalizado";
                demandaClass = "dfinalizada";
                botoes = `<button>Ver resultado</button>`;
            }

            // verifica se o container foi definido e coleta outras informações
            if (containerId) {
                // Obtém a unidade de saúde correspondente a demanda
                const unidadeSaude = demanda.us || "Unidade desconhecida";
                // Obtém o tipo da demanda correspondente a demanda
                const tipoDemanda = demanda.tipo_demanda || "Outros";
                // Busca a imagem associada ao tipo da demanda no objeto imagemPorTipo
                const imagemSrc = imagemPorTipo[tipoDemanda] || "img/default.png";

                // cria dinamicamente um elemento <div> para cada demanda
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

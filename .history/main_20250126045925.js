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
            updateUI(demandasAgrupadas);

        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }

    // Função para agrupar demandas por tipo e status
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

    function updateUI(demandasAgrupadas) {
        console.log("Atualizando interface...");

        const tiposDemandas = [
            "Climatização", "Carro-pipa", "Poda", "Hidráulica", "Elétrica",
            "Almoxarifado", "Reparos", "Infraestrutura", "Capinação", 
            "Inservíveis", "Água-mineral", "Lixo-infectado"
        ];

        tiposDemandas.forEach(tipo => {
            const pendenteElem = document.querySelector(`#api-pendente-${tipo.toLowerCase()}`);
            const resolvidoElem = document.querySelector(`#api-resolvido-${tipo.toLowerCase()}`);
            const naoResolvidoElem = document.querySelector(`#api-naoresolvido-${tipo.toLowerCase()}`);

            const contagem = demandasAgrupadas[tipo] || { pendente: 0, resolvido: 0, naoResolvido: 0 };

            console.log(`Tipo: ${tipo}`, contagem);

            if (pendenteElem) {
                pendenteElem.textContent = contagem.pendente;
                console.log(`Atualizado: #api-pendente-${tipo.toLowerCase()} -> ${contagem.pendente}`);
            } else {
                console.error(`Elemento não encontrado: #api-pendente-${tipo.toLowerCase()}`);
            }

            if (resolvidoElem) {
                resolvidoElem.textContent = contagem.resolvido;
                console.log(`Atualizado: #api-resolvido-${tipo.toLowerCase()} -> ${contagem.resolvido}`);
            } else {
                console.error(`Elemento não encontrado: #api-resolvido-${tipo.toLowerCase()}`);
            }

            if (naoResolvidoElem) {
                naoResolvidoElem.textContent = contagem.naoResolvido;
                console.log(`Atualizado: #api-naoresolvido-${tipo.toLowerCase()} -> ${contagem.naoResolvido}`);
            } else {
                console.error(`Elemento não encontrado: #api-naoresolvido-${tipo.toLowerCase()}`);
            }
        });
    }

    // Chamando a função fetchData para iniciar o processo
    fetchData();
});

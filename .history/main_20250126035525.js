// Função principal para buscar os dados da API
async function fetchData() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbzmgmv-_SGh7g8_c3ZmicEsaScV6rqhQCYf8mSqIQTIcRTxbEIxDVa6Wjlfeac1p8xr/exec');
        const data = await response.json();

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
        else if (status === "não resolvido" || status === "nao resolvido") agrupado[tipoDemanda].naoResolvido++;
    });

    return agrupado;
}

// Função para atualizar a interface do usuário
function updateUI(demandasAgrupadas) {
    // Lista de tipos de demandas para identificar os elementos no HTML
    const tiposDemandas = [
        "Climatização", "Carro pipa", "Poda", "Hidráulica", "Elétrica",
        "Almoxarifado", "Reparos", "Infraestrutura"
    ];

    tiposDemandas.forEach(tipo => {
        // Identificar elementos no HTML
        const pendenteElem = document.querySelector(`#api-pendente-${tipo.toLowerCase()}`);
        const resolvidoElem = document.querySelector(`#api-resolvido-${tipo.toLowerCase()}`);
        const naoResolvidoElem = document.querySelector(`#api-naoresolvido-${tipo.toLowerCase()}`);

        const contagem = demandasAgrupadas[tipo] || { pendente: 0, resolvido: 0, naoResolvido: 0 };

        // Atualizar valores no HTML
        if (pendenteElem) pendenteElem.textContent = contagem.pendente;
        if (resolvidoElem) resolvidoElem.textContent = contagem.resolvido;
        if (naoResolvidoElem) naoResolvidoElem.textContent = contagem.naoResolvido;
    });
}

// Chamando a função fetchData para iniciar o processo
fetchData();

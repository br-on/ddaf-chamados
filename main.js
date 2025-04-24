document.addEventListener("DOMContentLoaded", () => {

    const API_URL ="https://ddaf-chamados.vercel.app/api/chamados";

    const USE_LOCAL_DATA = false; // utilizar dados locais para testes

    async function fetchData() {
        try {
            console.log("Iniciando fetch de dados...");
    
            // Coleta os valores dos filtros
            const unidadeSaude = document.getElementById('unidade-saude').value;
            const tipoDemanda = document.getElementById('tipo-demanda').value;
            const inicio = document.getElementById('inicio').value;
            const fim = document.getElementById('fim').value;
    
            let queryString = "";
    
            // Construa a query string com os filtros, se houver
            if (unidadeSaude) queryString += `unidade_saude=${unidadeSaude}&`;
            if (tipoDemanda) queryString += `tipo_demanda=${tipoDemanda}&`;
            if (inicio) queryString += `inicio=${inicio}&`;
            if (fim) queryString += `fim=${fim}&`;
    
            // Remove o último '&' da string
            queryString = queryString.slice(0, -1);
    
            const url = `${API_URL}?${queryString}`;  // Adiciona os filtros à URL da API
    
            let data;
            if (USE_LOCAL_DATA) {
                console.log("Usando dados locais...");
                data = window.demandas;
            } else {
                console.log("Buscando dados da API...");
                const response = await fetch(url);  // Faz a requisição com os filtros
                data = await response.json();
            }
    
            console.log("Dados recebidos:", data);
    
            const demandasAgrupadas = agruparDemandasStatus(data);
            updateUI(demandasAgrupadas, data);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        }
    }

    // // Capturar as alterações nos filtros
    const filtroUnidadeSaude = document.getElementById('unidade-saude');
    const filtroTipoDemanda = document.getElementById('tipo-demanda');
    const filtroInicio = document.getElementById('inicio');
    const filtroFim = document.getElementById('fim');

    filtroUnidadeSaude.addEventListener('change', fetchData);
    filtroTipoDemanda.addEventListener('change', fetchData);
    filtroInicio.addEventListener('change', fetchData);
    filtroFim.addEventListener('change', fetchData);
    

    // atualizar o andamento - receber
    document.querySelector(".botão-atender-modal").addEventListener("click", async function() {
        const modalId = document.getElementById("modal-id").textContent.trim(); // Obtém o ID do chamado
        const url = `${API_URL}/${modalId}`; // URL do backend

        // Dados a serem enviados para o backend
        const data = {
            andamento: "em atendimento"
        };

        try {
            // Enviar a requisição PUT
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            // Verifica se a requisição foi bem-sucedida
            if (!response.ok) {
                throw new Error("Erro ao atualizar o andamento");
            }

            const result = await response.json();
            alert(result.message);  // Exibe a resposta do servidor

            // Fechar o modal
            document.getElementById("modal").style.display = "none";
        } catch (error) {
            console.error("Erro ao atender:", error);
            alert("Erro ao atender o chamado.");
        }

        fetchData();

    });

    // atualizar o andamento - finalizar
    document.querySelector("#btn-finalizar").addEventListener("click", async function() {
        const modalId = document.getElementById("modal-id").textContent.trim(); // Obtém o ID do chamado
        const statusSelecionado = document.getElementById("modal-status-finalizacao").value; // Pega o status selecionado
        const observacao = document.getElementById("modal-observacao").value.trim(); // Pega a observação digitada
    
        const url = `${API_URL}/${modalId}`;
    
        // Dados a serem enviados para o backend
        const data = {
            andamento: "finalizado",
            status: statusSelecionado,
            observacao: observacao.length > 0 ? observacao : "Sem observação"
        };
    
        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error("Erro ao atualizar chamado");
            }
    
            const result = await response.json();
            alert(result.message); // Exibe mensagem de sucesso
    
            // Fechar o modal
            document.getElementById("modal").style.display = "none";
        } catch (error) {
            console.error("Erro ao finalizar chamado:", error);
            alert("Erro ao finalizar o chamado.");
        }

        fetchData();
    });
    
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
            "climatizacao", "carro-pipa", "poda", "hidraulica", "eletrica",
            "almoxarifado", "reparos", "infraestrutura", "capinacao",
            "bens-inserviveis", "agua-mineral", "lixo-infectado"
        ];

        // Mapeamento de cada tipo de demanda para sua respectiva imagem
        const imagemPorTipo = {
            "climatizacao": "img/tipo-demanda-climatizacao.png",
            "carro-pipa": "img/tipo-demanda-carro-pipa.png",
            "poda": "img/tipo-demanda-poda.png",
            "hidraulica": "img/tipo-demanda-hidraulica.png",
            "eletrica": "img/tipo-demanda-eletrica.png",
            "almoxarifado": "img/tipo-demanda-almoxarifado.png",
            "reparos": "img/tipo-demanda-reparos.png",
            "infraestrutura": "img/tipo-demanda-infraestrutura.png",
            "capinacao": "img/tipo-demanda-capinacao.png",
            "bens-inserviveis": "img/tipo-demanda-bens-inserviveis.png",
            "agua-mineral": "img/tipo-demanda-agua-mineral.png",
            "lixo-infectado": "img/tipo-demanda-lixo-infectado.png"
        };

        // Obter os tipos de demanda presentes nos dados
        const tiposNosDados = new Set(demandas.map(d => d.tipo_demanda));

        // Verifica quais tipos de demanda não estão nos dados e aplica a classe "opaca"
        tiposDemandas.forEach(tipo => {
            const tipoFormatado = tipo.toLowerCase();
            const demandaDiv = document.getElementById(`demanda-${tipoFormatado}`);
            
            if (demandaDiv) {
                if (!tiposNosDados.has(tipo)) {
                    demandaDiv.classList.add("opaca"); // Aplica opacidade se não existir no banco
                } else {
                    demandaDiv.classList.remove("opaca"); // Remove opacidade caso agora exista
                }
            }
        });

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

        // Evento para abrir o modal
        document.addEventListener("click", function(event) {
            // Verificando se o botão clicado é 'Ver Chamado'
            if (event.target.matches(".ver-chamado")) {
                const demandaId = event.target.dataset.id;
                const demanda = demandas.find(d => d.id === parseInt(demandaId));

                if (demanda) {
                    abrirModal(demanda, "atender");  // Passa "atender" para mostrar o botão Atender
                }
            }

            // Verificando se o botão clicado é 'Finalizar Chamado'
            if (event.target.matches(".finalizar-chamado")) {
                const demandaId = event.target.dataset.id;
                const demanda = demandas.find(d => d.id === parseInt(demandaId));

                if (demanda) {
                    abrirModal(demanda, "finalizar");  // Passa "finalizar" para mostrar o botão Finalizar
                }
            }
        });

// MODAL =======================================================     
        // Função para abrir e exibir os dados da demanda no modal
        function abrirModal(demanda, tipoBotao) {
            // Exibindo os dados da demanda nas áreas correspondentes
            document.getElementById("modal-id").textContent = demanda.id;
            document.getElementById("modal-n-demanda").textContent = demanda.n_demanda;
            document.getElementById("modal-solicitante").textContent = demanda.solicitante;
            document.getElementById("modal-us").textContent = demanda.us;
            document.getElementById("modal-tipo-us").textContent = demanda.tipo_us;
            document.getElementById("modal-tipo-demanda").textContent = demanda.tipo_demanda;
            document.getElementById("modal-desc-demanda").textContent = demanda.desc_demanda;
            document.getElementById("modal-dt-demanda").textContent = demanda.dt_demanda;
            document.getElementById("modal-dt-registro").textContent = new Date(demanda.dt_registro).toLocaleString();

            // Exibindo o andamento e o status
            document.getElementById("modal-andamento").textContent = demanda.andamento;
            document.getElementById("modal-status").textContent = demanda.status;

            // Exibindo a modal
            const modal = document.getElementById("modal");
            modal.style.display = "block";  // Exibe o modal

            // Mostrar ou esconder a área de finalização dependendo do andamento do chamado
            const modalFinalizar = document.getElementById("modal-finalizar");
            const modalResultado = document.getElementById("modal-resultado");

            // Se o chamado estiver em andamento, mostra a área de finalização
            if (demanda.andamento.toLowerCase() !== "finalizado") {
                modalFinalizar.style.display = "block";
                modalResultado.style.display = "none";
            } else {
                // Se o chamado estiver finalizado, mostra o resultado da finalização
                modalFinalizar.style.display = "none";
                modalResultado.style.display = "block";

                // Preenche os detalhes da finalização
                document.getElementById("modal-status-final").textContent = demanda.status_final || "Não definido";
                document.getElementById("modal-observacao-final").textContent = demanda.observacao || "Nenhuma observação fornecida.";
            }

            // Mostrar o botão correto (Atender ou Finalizar Chamado) dependendo do tipoBotao
            const botaoAtender = document.querySelector(".botão-atender-modal");
            const botaoFinalizar = document.querySelector(".botão-finalizar-modal");

            if (tipoBotao === "finalizar") {
                // Exibe o botão Finalizar Chamado e esconde o botão Atender
                botaoAtender.style.display = "none";
                botaoFinalizar.style.display = "inline-block";  // Exibe o botão Finalizar Chamado
                document.getElementById("modal-finalizar").style.display = "block";  // Exibe a área de finalização
            } else {
                // Exibe o botão Atender e esconde o botão Finalizar Chamado
                botaoAtender.style.display = "inline-block";
                botaoFinalizar.style.display = "none";
                document.getElementById("modal-finalizar").style.display = "none";  // Esconde a área de finalização
            }            

            // Evento para fechar o modal
            document.querySelector(".botão-fechar-modal").addEventListener("click", function() {
                modal.style.display = "none";  // Esconde o modal
            });

            

        }


      
//======================================================

        // Percorre todas as demandas e adiciona na UI conforme o status
        // Para cada demanda, será determinado onde ela será exibida na UI com base no seu status de andamento.
        demandas.forEach(demanda => {

            // Verifica o andamento da demanda
            const andamento = demanda.andamento ? demanda.andamento.toLowerCase() : "recebido";
        
            // Define onde a demanda será adicionada e outros detalhes
            let containerId = "";
            let demandaClass = "";
            let botoes = "";
        
            if (andamento === "recebido") {
                containerId = "andamento-recebido";
                demandaClass = "drecebida";
                botoes = `<button class="ver-chamado" data-id="${demanda.id}">Ver chamado</button>`;
            } else if (andamento === "em atendimento") {
                containerId = "andamento-atendimento";
                demandaClass = "dandamento";
                botoes = `<button class="finalizar-chamado" data-id="${demanda.id}">Finalizar</button>`;
            } else if (andamento === "finalizado") {
                containerId = "andamento-finalizado";
                demandaClass = "dfinalizada";
                botoes = `<button class="resultado-chamado" data-id="${demanda.id}">Ver resultado</button>`;
            }
        
            // Verifica se o container foi definido
            if (containerId) {
                // Obtém a unidade de saúde e tipo de demanda
                const unidadeSaude = demanda.us || "Unidade desconhecida";
                const tipoDemanda = demanda.tipo_demanda || "Outros";
                const imagemSrc = imagemPorTipo[tipoDemanda] || "img/default.png";
        
                // Cria o elemento <div> para cada demanda
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
        
                // Adiciona a nova demanda ao container
                document.getElementById(containerId).prepend(demandaDiv);
        
                // Adiciona evento de clique para o botão "Finalizar"
                const finalizarButton = demandaDiv.querySelector(".finalizar-chamado");
                if (finalizarButton) {
                    finalizarButton.addEventListener("click", function() {
                        // Exibe o modal de finalização
                        abrirModal(demanda);
        
                        // Exibe a seção de finalização no modal e esconde a de resultado
                        const modalFinalizar = document.getElementById("modal-finalizar");
                        const modalResultado = document.getElementById("modal-resultado");
        
                        modalFinalizar.style.display = "block";  // Mostrar a parte de finalização
                        modalResultado.style.display = "none";  // Esconder a parte de resultado
        
                        // Limpar os campos de status final e observação
                        document.getElementById("modal-status-finalizacao").value = "";  // Limpar o campo de status final
                        document.getElementById("modal-observacao").value = "";  // Limpar o campo de observação
                    });
                }

/////////////////// TRABALHANDO AQUI /////////////////////////////////////////////////////////////////////////////////
                // Adiciona evento de clique para o botão "Ver resultado"
                const resultadoButton = demandaDiv.querySelector(".resultado-chamado");
                if (resultadoButton) {
                    resultadoButton.addEventListener("click", function() {
                        // Exibe o modal de finalização
                        abrirModal(demanda);
        
                        // Exibe a seção de finalização no modal e esconde a de resultado
                        const modalFinalizar = document.getElementById("modal-finalizar");
                        const modalResultado = document.getElementById("modal-resultado");
                        const botaoAtender = document.querySelector(".botão-atender-modal");
                        const statusFinal = document.getElementById("status-final");
        
                        modalFinalizar.style.display = "none";  
                        modalResultado.style.display = "block"; 
                        botaoAtender.style.display = "none"; 
                        statusFinal.style.display = "none";
                    });
                }
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            }
        });     

    }

    fetchData();
});

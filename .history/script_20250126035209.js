// Função para buscar os dados da API
async function fetchData() {
    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbzmgmv-_SGh7g8_c3ZmicEsaScV6rqhQCYf8mSqIQTIcRTxbEIxDVa6Wjlfeac1p8xr/exec'); 
      const data = await response.json();
  
      // Inicializando um objeto para contar as demandas por tipo
      const demandCount = {
        "Elétrica": 0,
        "Hidráulica": 0,
        "Infraestrutura": 0,
        "Climatização": 0,
        "Capinação": 0,
        "Reparos": 0,
        "Bens inservíveis": 0,
        "Almoxarifado": 0,
        "Água mineral": 0,
        "Carro pipa": 0,
        "Lixo infectado": 0,
        "Poda": 0
      };
  
      // Contando as demandas por tipo
      data.forEach(demanda => {
        if (demanda["Tipo da demanda"]) {
          const tipo = demanda["Tipo da demanda"];
          if (demandCount[tipo] !== undefined) {
            demandCount[tipo]++;
          }
        }
      });
  
      // Atualizando o HTML com os totais de cada tipo de demanda
      updateUI(demandCount);
  
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    }
  }
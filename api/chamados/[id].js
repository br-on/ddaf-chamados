import { supabase } from "../supabase"; 

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { id } = req.query;
  const { andamento, status, observacao } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID do chamado não fornecido" });
  }
  
  // campos que serão realmente atualizados
  const updateFields = {
    dt_atualizacao: new Date().toISOString(),
  };

  if (andamento !== undefined) updateFields.andamento = andamento;
  if (status !== undefined) updateFields.status = status;
  if (observacao !== undefined) updateFields.observacao = observacao;

  try {
    const { data, error } = await supabase
      .from("ddaf-chamados")
      .update(updateFields)
      .eq("id", id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json({ message: "Chamado atualizado com sucesso", data });
  } catch (error) {
    console.error("Erro ao atualizar chamado:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}

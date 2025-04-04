import { supabase } from "./supabase";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { id } = req.query;
  const { andamento, status, observacao } = req.body;

  try {
    const { data, error } = await supabase
      .from("ddaf-chamados")
      .update({ andamento, status, observacao })
      .eq("id", id);

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json({ message: "Chamado atualizado", data });
  } catch (error) {
    console.error("Erro ao atualizar chamado:", error);
    res.status(500).json({ error: "Erro interno" });
  }
}

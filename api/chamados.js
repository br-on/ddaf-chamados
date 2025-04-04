import { supabase } from "./supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { unidade_saude, tipo_demanda, inicio, fim } = req.query;

    let query = supabase.from("ddaf-chamados").select("*");

    if (unidade_saude) query = query.eq("us", unidade_saude);
    if (tipo_demanda) query = query.eq("tipo_demanda", tipo_demanda);
    if (inicio) query = query.gte("dt_registro", inicio);
    if (fim) query = query.lte("dt_registro", fim);

    const { data, error } = await query;

    if (error) return res.status(400).json({ error: error.message });

    res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar chamados:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
}

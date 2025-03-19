require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// Conectando ao Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Buscar todos os chamados
app.get("/ddaf-chamados", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("ddaf-chamados")
            .select("*");

        if (error) return res.status(400).json({ error: error.message });

        res.json(data);
    } catch (error) {
        console.error("Erro ao buscar chamados:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});

// Atualizar o andamento recebimento
app.put("/ddaf-chamados/:id", async (req, res) => {
    const { id } = req.params;
    const { andamento, status, observacao } = req.body; // Agora recebe os três campos

    try {
        const { data, error } = await supabase
            .from("ddaf-chamados")
            .update({
                andamento,
                status,
                observacao
            })
            .eq("id", id); // Filtra pelo ID do chamado

        if (error) {
            console.error("Erro no Supabase:", error.message);
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: "Chamado atualizado com sucesso", data });
    } catch (error) {
        console.error("Erro interno no servidor:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});


// Atualizar o andamento finalização
/* app.put("/ddaf-chamados/:id", async (req, res) => {
    const { id } = req.params;
    const { andamento, status, observacao } = req.body;

    console.log("Dados recebidos no backend:", req.body); // Verifica o que o backend está recebendo

    try {
        const { data, error } = await supabase
            .from("ddaf-chamados")
            .update({
                andamento,
                status,
                observacao: observacao || null
            })
            .eq("id", id);

        if (error) {
            console.error("Erro no Supabase:", error.message);
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: "Chamado finalizado com sucesso", data });
    } catch (error) {
        console.error("Erro ao finalizar chamado:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
}); */


// Autenticação de usuário
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) return res.status(400).json({ error: error.message });

        if (data && data.session && data.session.access_token) {
            return res.json({
                token: data.session.access_token,
                user: data.user,
            });
        } else {
            return res.status(500).json({ error: "Erro ao obter o token" });
        }
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
});

// Iniciando o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

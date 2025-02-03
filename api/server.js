require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

// Conectando ao Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

app.get("/", (req, res) => {
    res.send("API rodando com Supabase!");
});

app.get("/ddaf-chamados", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('ddaf-chamados')
            .select('*');

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        console.error("Erro ao buscar chamados:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Autenticando o usuário no Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        // Verificando se houve erro
        if (error) {
            console.error("Erro ao autenticar:", error.message);
            return res.status(400).json({ error: error.message });
        }

        // Verificando se o token está presente na resposta
        if (data && data.session && data.session.access_token) {
            return res.json({
                token: data.session.access_token,
                user: data.user,
            });
        } else {
            console.error("Erro: Token não encontrado na resposta.");
            return res.status(500).json({ error: "Erro ao obter o token" });
        }

    } catch (error) {
        console.error("Erro ao fazer login:", error);
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
});


// Rota protegida (exemplo)
app.get("/dashboard", async (req, res) => {
    const token = req.headers["authorization"];

    if (!token) {
        return res.status(401).json({ error: "Token não fornecido" });
    }

    try {
        // Validando o token JWT (caso necessário, usando a API de autenticação do Supabase)
        const { user, error } = await supabase.auth.api.getUser(token.replace("Bearer ", ""));

        if (error) {
            return res.status(401).json({ error: "Token inválido" });
        }

        res.json({
            message: "Bem-vindo ao seu painel!",
            user,
        });

    } catch (error) {
        console.error("Erro ao validar o token:", error);
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
});

app.listen(3000, () => {
    console.log("Servidor rodando na porta 3000");
});

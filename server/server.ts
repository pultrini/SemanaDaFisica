import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
      ca: fs.readFileSync(__dirname + '/ca.pem')
  }
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao DB:", err);
    return;
  }
  console.log("Conectado.");
});

//Função de registro.

app.post("/register", (req, res) => {
  console.log("Requisição recebida no /register:", req.body); // Log da requisição

  const { id_pessoa, nome, departamento } = req.body;

  const sql =
    "INSERT INTO pessoas (id_pessoa, nome, departamento) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nome=?, departamento=?";
  db.query(
    sql,
    [id_pessoa, nome, departamento, nome, departamento],
    (err, result) => {
      if (err) {
        console.error("Erro ao registrar uma pessoa:", err); // Log do erro no banco
        return res
          .status(500)
          .json({ message: "Erro ao registrar uma pessoa", error: err });
      }
      console.log("Pessoa cadastrada com sucesso:", result); // Log de sucesso
      res.status(200).json({ message: `${nome} cadastrado com sucesso!` });
    }
  );
});

app.post("/attendance", (req, res) => {
  console.log("Requisição recebida no /attendance:", req.body); // Log da requisição

  const { id_pessoa } = req.body;
  const data = new Date();

  const sqlCheck = "SELECT nome, departamento FROM pessoas WHERE id_pessoa = ?";
  db.query(sqlCheck, [id_pessoa], (err, result) => {
    if (err) {
      console.error("Erro de verificação de pessoa:", err); // Log do erro no banco
      return res
        .status(500)
        .json({ message: "Erro de verificação de pessoa", error: err });
    }

    if (result) {
      const { nome, departamento } = result[0];
      const sqlInsert =
        "INSERT INTO presencas (id_pessoa, nome, data, departamento) VALUES (?, ?, ?, ?)";
      db.query(
        sqlInsert,
        [id_pessoa, nome, data, departamento],
        (err, result) => {
          if (err) {
            console.error("Erro ao registrar presença:", err); // Log do erro no banco
            return res
              .status(500)
              .json({ message: "Erro ao registrar presença", error: err });
          }
          console.log("Presença registrada com sucesso:", result); // Log de sucesso
          res
            .status(200)
            .json({ message: `Presença de ${nome} registrada com sucesso!` });
        }
      );
    } else {
      res.status(404).json({ message: "Pessoa não cadastrada." });
    }
  });
});

app.listen(3000, () => {
  console.log("SERVIDOR RODANDO NA PORTA 3000");
});

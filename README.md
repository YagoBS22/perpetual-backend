# Perpetual API Backend

API Node.js com Express e MongoDB para o sistema Perpetual. Gerencia usuários, autenticação, um CRUD de filmes próprios do usuário e uma lista de filmes/séries favoritos baseados no TMDb ID.

## Funcionalidades Principais

* **Autenticação de Usuários**:
    * Registro de novos usuários (nome, e-mail, senha com hashing).
    * Login de usuários existentes (e-mail, senha).
    * Proteção de rotas usando JSON Web Tokens (JWT).
* **Gerenciamento de Filmes Próprios (CRUD)**:
    * Permite que usuários autenticados criem, listem, atualizem e deletem seus próprios registros de filmes (título, gênero, ano, avaliação).
* **Lista de Favoritos/Avaliações do Usuário (TMDb)**:
    * Permite que usuários autenticados adicionem filmes ou séries (identificados pelo `tmdbId` e `media_type`) à sua lista pessoal.
    * Possibilidade de marcar como favorito e adicionar uma avaliação pessoal.
    * Listagem e remoção de itens da lista.
* **Perfil do Usuário**:
    * Endpoint para retornar informações do usuário logado (nome, e-mail, data de criação da conta, contagem de favoritos).
* **Documentação da API**:
    * Interface Swagger/OpenAPI disponível em `/api-docs` para visualização e teste dos endpoints.

## Tecnologias Utilizadas

* **Node.js**: Ambiente de execução JavaScript.
* **Express.js**: Framework web para Node.js.
* **MongoDB**: Banco de dados NoSQL.
* **Mongoose**: ODM (Object Data Modeling) para MongoDB.
* **jsonwebtoken (JWT)**: Para geração e verificação de tokens de autenticação.
* **bcrypt**: Para hashing de senhas.
* **cors**: Para habilitar Cross-Origin Resource Sharing.
* **dotenv**: Para gerenciamento de variáveis de ambiente.
* **Jest** & **Supertest**: Para testes unitários e de integração.

## Estrutura do Projeto (Principais Pastas em `src/`)

* **`controllers/`**: Lógica de manipulação das requisições e respostas HTTP.
* **`middlewares/`**: Middlewares customizados (ex: autenticação).
* **`models/`**: Definições de schema do Mongoose para os dados (User, Movie).
* **`routes/`**: Definição dos endpoints da API.
* **`services/`**: Lógica de negócios e interações com o banco de dados.
* **`index.js`**: Configuração principal do app Express.
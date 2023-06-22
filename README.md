# Divisor de Salário

O Divisor de Salário é uma aplicação web que permite aos usuários dividir seu salário de acordo com divisões totalmente personalizáveis, além de analisar diferentes distribuições. A aplicação também faz o login do usuário para que ele possa salvar todas as diferentes divisões feitas.

## Funcionalidades

* Registro de conta de usuário.
* Configuração personalizada da divisão.
* Análise e visualização da divisão em gráficos.
* Modo claro e escuro para melhor experiência visual.
* Recursos de login e logout.

## Tecnologias Utilizadas

* React para o desenvolvimento do front-end.
* Node.js e express para o desenvolvimento do back-end.
* Mongo db como banco de dados para armazenar as informações do usuário.
* SVG para criação do gráfico.

## Como Executar

1. Clone este repositório e o [repositório front-end](https://github.com/RGMenezes/divisor-de-salario) em seu computador.
2. Substitua as chaves *process.env.DATABASE*, *process.env.PORT* e *process.env.SESSION* pelo *link do banco de dados*, *porta onde o express atuara* e *chave para a session* respectivamente no arquivo app do back-end.
3. Substitua o link do *baseURL* pelo *link do express*, definido no app do back-end, no arquivo db.js na pasta api do front-end.
4. Abra o terminal do back-end e inicialize o arquivo *app.js* com o node.
5. Abra o terminal do front-end utiliza o comando *npm start* para abrir o projeto React.

### Contribuição

Se você deseja contribuir para o desenvolvimento do Divisor de Salário, sinta-se à vontade para enviar pull requests ou relatar problemas nas [issues](https://github.com/RGMenezes/db-divisor-de-salario/issues). Toda contribuição é bem-vinda!

### Contato
Em caso de dúvidas ou sugestões, entre em contato comigo pelo email [faelgmp@gmail.com].

##### Visite o site [divisordesalario.netlify.app](divisordesalario.netlify.app).
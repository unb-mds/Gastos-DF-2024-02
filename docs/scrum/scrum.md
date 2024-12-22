# O que é Scrum?

O Scrum, criado por Ken Schwaber e Jeff Sutherland, é um método ágil e prático fundamentado em sprints, garantindo revisão e aperfeiçoamentos constantes para que o resultado seja sempre o melhor possível.
Essa metodologia traz consigo diversos benefícios para quem o implementa, como a organização e o desempenho. A organizacao é feita por meio de Daily Scrum, que facilitam a identificação e resolução de problemas, ajudando as equipes a se adaptarem rapidamente às mudanças, resolvendo problemas de forma colaborativa e entregando resultados de alta qualidade de maneira eficiente.

Para estruturar um trabalho com Scrum, é preciso definir papéis, criar o backlog de requisitos (ou product backlog), planejar sprints e definir as cerimônias para acompanhar o progresso do projeto.

# Estrutura do Scrum 🗂️

Product Owner (PO): Define e prioriza os requisitos e garante que o time entenda o objetivo.
Scrum Master: Facilita as reuniões, garante que o time siga os princípios do Scrum e remove impedimentos.

Time de Desenvolvimento: Demais participantes do grupo que implementarão as funcionalidades.

Backlog do Produto (Product Backlog): O product backlog lista todas as funcionalidades e requisitos do site que precisam ser desenvolvidos para atender aos objetivos do trabalho. Esses itens geralmente são chamados de user stories e são ordenados por prioridade.

# Sprints 📄

Divisão do desenvolvimento em sprints, de acordo com o prazo do trabalho.
Cada sprint deve ter um objetivo claro e um conjunto de tarefas do backlog a serem concluídas.

Daily Scrum (Reunião Diária): Realizar reuniões rápidas (10-15 minutos) para que cada membro compartilhe:

- O que foi feito desde a última reunião.
- O que pretende fazer até a próxima reunião.
- Se há algum bloqueio ou dificuldade.

Sprint Planning: Planejamento da sprint com a definição dos itens que o time irá concluir.

Daily Scrum: Reuniões diárias curtas para acompanhar o progresso, identificar bloqueios e alinhar o trabalho do dia.

Sprint Review: Realizada ao final de cada sprint, onde o time apresenta o que foi concluído.

Retrospectiva da Sprint: discussão sobre que funcionou bem e o que pode ser melhorado para a próxima sprint.

## Primeira parte da primeira entrega : Documentação e Arquitetura Básica do Projeto

### Objetivo:

Entregar a documentação inicial do projeto, definindo os requisitos e os principais elementos da arquitetura.
Iniciar a configuração básica do ambiente de desenvolvimento, explorando as tecnologias que serão usadas (Flask, HTML, CSS).

### Requisitos:

Os requisitos são orientados a criar uma base sólida para o desenvolvimento, onde a documentação e os aspectos fundamentais do sistema são o foco.

| ID 🏷️ | Requisito 📌                                       | Descrição 📝                                                                                 | Prioridade 🚨 |
| :---- | :------------------------------------------------- | :------------------------------------------------------------------------------------------- | :------------ |
| R1    | Documentar o Escopo do Projeto                     | Descrever os objetivos, funcionalidades e escopo do sistema na documentação                  | Alta 🔴       |
| R2    | Definir e Priorizar Requisitos                     | Listar requisitos funcionais e não funcionais, priorizando com base na relevância            | Alta 🔴       |
| R3    | Especificar a Arquitetura Básica do Sistema        | Documentar a arquitetura do sistema, incluindo estrutura de front-end, back-end e integração | Alta 🔴       |
| R4    | Configurar o Repositório                           | Git Configurar o repositório com estrutura de pastas e arquivos necessários (ex.: README.md) | Alta 🔴       |
| R5    | Configurar Ambiente para o Back-end com Flask      | Instalar e configurar Flask para rodar o back-end básico da aplicação                        | Média 🟡      |
| R6    | Criar Estrutura Básica de Front-end com HTML e CSS | Iniciar uma estrutura básica para as páginas web usando HTML e CSS                           | Média 🟡      |
| R7    | Explorar Integração Front-end e Back-end           | Realizar uma integração inicial entre Flask e o front-end HTML                               | Alta 🔴       |
| R8    | Implementar Rota Básica no Flask                   | Criar rota simples que retorna uma página HTML para visualização                             | Alta 🔴       |
| R9    | Criar Páginas de Visualização no Front-end         | Desenvolver páginas básicas com HTML e CSS para exibir dados                                 | Alta 🔴       |
| R10   | Conectar Front-end ao Back-end                     | Configurar Flask para servir páginas HTML e iniciar a comunicação entre camadas              | Alta 🔴       |
| R11   | Implementar Design Responsivo Básico               | Ajustar o front-end para ser acessível em dispositivos móveis e desktops                     | Alta 🔴       |
| R12   | Adicionar Gráficos Simples com Dados Estáticos     | Implementar gráficos de amostra usando bibliotecas                                           | Média 🟡      |
| R13   | Documentar Instruções de Desenvolvimento           | Completar o README com informações de desenvolvimento e instruções para contribuir           | Alta 🔴       |
| R14   | Publicar no GitHub Pages                           | Configurar deploy final no GitHub Pages deployment                                           | Alta 🔴       |


## Arquitetura Inicial do Sistema

### Back-end:

Usaremos o Flask para gerenciar as rotas e processar as solicitações do servidor. Ele será responsável pela lógica de negócio e comunicação com o front-end.
A arquitetura será monolítica.

### Front-end:

A interface será construída com HTML e CSS, seguindo uma estrutura simples para possibilitar a visualização dos dados.
Estrutura básica de layout com HTML e CSS será criada para definir a aparência e o estilo das páginas.

### Integração:

Configuração inicial de rotas Flask para comunicação com o front-end. Por exemplo, uma rota /index que retorna uma página HTML.
Será utilizada uma API do governo para obter dados que serão exibidos em um gráfico na interface, diretamente pelo front-end.

### Prioridade dos Requisitos da Entrega 1


| Prioridade🚨 | Descrição📝                                                                                              |
| :----------- | :------------------------------------------------------------------------------------------------------- |
| Alta 🔴      | Foco em documentar o escopo, os requisitos, a arquitetura e iniciar a estrutura do repositório           |
| Média 🟡     | Configuração básica do ambiente para permitir testes iniciais com Flask, HTML e CSS                      |
| Baixa 🟢     | Integração mais avançada entre front e back-end pode ser explorada, mas é prioritária na segunda entrega |

## Segunda parte da primeira entrega : Prévia de Aplicações e Demonstração Técnica

### Arquitetura Flask:

Expansão das rotas para incluir uma página de visualização básica e, se possível, uma rota de API para servir dados de gastos públicos.
Front-end com HTML e CSS

#### HTML e CSS:

Construção de páginas mais detalhadas para exibir dados e layout responsivo.

#### Python:

Adicionar gráficos interativos (como de barras ou de pizza) para exibir dados simulados, o que dará uma ideia de como serão as visualizações futuras.

#### Integração e Comunicação:

Estabelecer a conexão entre front-end e back-end para exibir dados da API na interface, com uma rota específica para visualização de dados.

### Prioridade dos Requisitos

| Prioridade🚨 | Descrição📝                                                                                             |
| :----------- | :------------------------------------------------------------------------------------------------------ |
| Alta🔴       | Foco na implementação das rotas Flask, exibição de dados no front-end e documentação de desenvolvimento |
| Média🟡      | Ajuste de responsividade nas páginas HTML                                                               |
| Baixa🟢      | Uso de gráficos para visualização de dados estáticos; funcionalidades de front-end mais avançadas       |

### Organização das Sprints no Quadro de Tarefas

Para gerenciar o progresso, pode-se utilizar as Issues no GitHub, organizando as tarefas em colunas.

## Divisão das Sprints: Entrega 1

A primeira entrega do projeto será dividida em 6 sprints, todas com seus respectivos requisitos e data de ínicio e término.

| Ordem | Requisitos a comprir 🎯 | Data da sprint ⏰         |
| :---- | :---------------------- | :------------------------ |
| 1     | 📌 R1 e R2              | 28/10/2024 até 03/11/2024 |
| 2     | 📌 R3 e R4              | 04/11/2024 até 10/11/2024 |
| 3     | 📌 R5, R6 e R7          | 11/11/2024 até 17/11/2024 |
| 4     | 📌 R8 e R9              | 18/11/2024 até 24/11/2024 |
| 5     | 📌 R10, R11 e R12       | 25/11/2024 até 01/12/2024 |
| 6     | 📌 R13 e R14            | 02/12/2024 até 08/12/2024 |

## Entrega 2

| Coluna       | Tarefas                                                                                               |
| :----------- | :---------------------------------------------------------------------------------------------------- |
| Backlog      | Todas as tarefas da segunda entrega (implementação final, testes, publicação).                        |
| Em Progresso | Tarefas que estão sendo implementadas (ex.: exibição de dados, gráficos interativos, responsividade). |
| Revisão      | tarefas concluídas, aguardando revisão ou testes finais.                                              |
| Concluído    | Tarefas terminadas e verificadas, incluindo a publicação no GitHub Pages e documentação.              |

Exemplo de Organização de Issues

| Issue📌                                                                                                                 | Descrição📝                                                               | Prioridade🚨 |
| :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ | :----------- |
| Implementar Filtro Completo                                                                                             | Filtros de dados por data e categoria com Flask e integração no front-end | Alta 🔴      |
| Criar Gráficos Interativos                                                                                              | Gráficos de barras e pizza com para exibir dados filtrados                | Alta 🔴      |
| Finalizar Responsividade                                                                                                | Garantir design responsivo e adaptável a diferentes dispositivos          | Alta 🔴      |
| Adicionar Exportação de Dados                                                                                           | Função para exportação de dados para CSV e Excel                          | Média 🟡     |
| Realizar Testes de Funcionalidade Testar rotas, filtros e gráficos para garantir a usabilidade e experiência do usuário | test, quality                                                             | Alta 🔴      |


Após completar a entrega 2, o projeto estará pronto e publicado no GitHub Pages, com todos os requisitos implementados e documentados. A aplicação final incluirá uma interface completa e responsiva, filtros para análise de dados de gastos públicos, visualizações interativas e uma opção para exportação de dados.

| Versão  |    Data    | Descrição                                                  | Autor                                             | Revisão                                        |
| :-----: | :--------: | ---------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| `0.1.0` | 02/11/2024 | Estruturacão do documento                                  | [Lucas Mendonça](https://github.com/lucasarruda9) | [Julia Gabriela](https://github.com/JuliaGabP) |
| `0.2.0` | 03/11/2024 | atualização do resumo sobre scrum, requisitos da release 1 | [Lucas Mendonça](https://github.com/lucasarruda9) | [Julia Gabriela](https://github.com/JuliaGabP) |

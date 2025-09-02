# Home Nexus - Painel de Controle de Casa Inteligente

HomeNexus é uma aplicação web que simula um ambiente de casa inteligente, permitindo aos usuários gerenciar dispositivos, cômodos e cenas automatizadas. Este projeto foi desenvolvido como um trabalho prático para a disciplina de Programação para Internet 2.

## Visão Geral

O projeto consiste em um front-end dinâmico que se comunica com uma API back-end para gerenciar entidades de uma casa inteligente, como casas, cômodos e dispositivos. A interface foi projetada para ser intuitiva, com uma barra lateral para navegação entre as casas e uma área de conteúdo principal que exibe os detalhes da casa selecionada.

## Funcionalidades

- **Gerenciamento de Casas**:
  - Adicionar e remover casas.
  - Visualizar a lista de casas em uma barra lateral dedicada.
- **Gerenciamento de Cômodos**:
  - Adicionar e remover cômodos dentro da casa selecionada.
  - Cada cômodo é exibido como um card individual.
- **Gerenciamento de Dispositivos**:
  - Adicionar e remover dispositivos dentro de cada cômodo.
  - Ligar e desligar dispositivos com um clique.
- **Gerenciamento de Cenas**:
  - Criar e deletar cenas de automação globais.
- **Interface Reativa**:
  - A interface é atualizada dinamicamente sem a necessidade de recarregar a página.
  - Design responsivo e moderno com tema escuro.

## Tecnologias Utilizadas

- **Front-End**:
  - HTML5
  - CSS3 (com Variáveis, Flexbox para layout)
  - JavaScript (ES6 Modules)
- **Back-End**:
  - Node.js 
  - Express.js para a API RESTful
  - Banco de dados PostgreSQL

## Estrutura do Projeto

O código-fonte está organizado da seguinte forma:

```Bash
/
├── src/
│   ├── assets/
│   │   └── favicon.ico
│   └── components/
│       ├── scripts/
│       │   ├── house.js        # Lógica da sidebar e casas
│       │   ├── room.js         # Lógica dos cards de cômodos
│       │   ├── device.js       # Lógica dos dispositivos
│       │   └── scene.js        # Lógica da aba de cenas
│       └── styles/
│           ├── global.css      # Estilos globais e variáveis
│           ├── sidebar.css     # Estilos da barra lateral
│           └── main_content.css# Estilos da área principal
├── index.html                  # Estrutura principal da página
└── script.js                   # Ponto de entrada dos módulos JS
```

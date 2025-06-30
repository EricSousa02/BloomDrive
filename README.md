# 🌸 BloomDrive

> **Sua solução moderna para gerenciamento colaborativo de arquivos na nuvem**

![BloomDrive Banner](public/assets/images/bloomdrive.png)

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-BaaS-ff69b4?style=for-the-badge&logo=appwrite)](https://appwrite.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

---

## 📋 Sobre o Projeto

**BloomDrive** é uma plataforma moderna de gerenciamento e compartilhamento de arquivos na nuvem, desenvolvida com tecnologias de ponta para oferecer uma experiência de usuário excepcional tanto em desktop quanto em dispositivos móveis.

### 🎯 Principais Características

- **🔐 Autenticação Segura**: Sistema de login com OTP via email
- **📤 Upload Inteligente**: Progress bar realista com feedback visual
- **🤝 Compartilhamento Granular**: Controle fino de permissões por arquivo
- **📱 Design Responsivo**: Interface adaptável para todos os dispositivos
- **⚡ Performance Otimizada**: SSR/SSG com Next.js 14 App Router
- **🎨 UI/UX Moderna**: Componentes elegantes com Radix UI + Tailwind CSS

---

## 🚀 Demo

![BloomDrive Demo](docs/demo.gif)

### 🌐 Links Úteis

- **🔗 Demo Online**: [bloomdrive.vercel.app](https://bloom-drive-delta.vercel.app/)
- **🐛 Reportar Bug**: [Issues do GitHub](https://github.com/EricSousa02/BloomDrive/issues)

---

## 🛠️ Stack Tecnológica

### **Frontend**
- **[Next.js 14](https://nextjs.org/)** - Framework React com App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Tipagem estática
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling utilitário
- **[Radix UI](https://www.radix-ui.com/)** - Componentes acessíveis
- **[Recharts](https://recharts.org/)** - Gráficos interativos

### **Backend & Infraestrutura**
- **[Appwrite](https://appwrite.io/)** - Backend-as-a-Service
  - Autenticação
  - Banco de dados
  - Storage de arquivos
  - APIs REST
- **[Vercel](https://vercel.com/)** - Deploy e hosting

### **Ferramentas de Desenvolvimento**
- **[ESLint](https://eslint.org/)** - Linting
- **[Prettier](https://prettier.io/)** - Formatação de código
- **[Husky](https://typicode.github.io/husky/)** - Git hooks

---

## 📦 Instalação

### Pré-requisitos

- **Node.js** 18.17 ou superior
- **npm** ou **yarn**
- **Conta Appwrite** (Cloud ou self-hosted)

### 1. Clone o repositório

```bash
git clone https://github.com/EricSousa02/BloomDrive.git
cd bloomdrive
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE=your_database_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION=your_users_collection_id
NEXT_PUBLIC_APPWRITE_FILES_COLLECTION=your_files_collection_id
NEXT_PUBLIC_APPWRITE_BUCKET=your_bucket_id
NEXT_APPWRITE_KEY=your_server_api_key

# Opcional: Email personalizado
RESEND_API_KEY=your_resend_api_key
SMTP_FROM_EMAIL=noreply@bloomdrive.com
```

### 4. Configure o Appwrite

#### 4.1 Crie um novo projeto no [Appwrite Console](https://cloud.appwrite.io)

#### 4.2 Configure a autenticação
- Habilite **Email/Password**
- Configure **Magic URL** para OTP

#### 4.3 Crie o banco de dados e coleções

**Coleção `users`:**
```json
{
  "attributes": [
    {"key": "fullName", "type": "string", "size": 255, "required": true},
    {"key": "email", "type": "string", "size": 255, "required": true},
    {"key": "avatar", "type": "string", "size": 2048, "required": false},
    {"key": "accountId", "type": "string", "size": 255, "required": true}
  ],
  "permissions": ["read", "write"]
}
```

**Coleção `files`:**
```json
{
  "attributes": [
    {"key": "name", "type": "string", "size": 255, "required": true},
    {"key": "type", "type": "string", "size": 50, "required": true},
    {"key": "size", "type": "integer", "required": true},
    {"key": "extension", "type": "string", "size": 20, "required": true},
    {"key": "url", "type": "string", "size": 2048, "required": true},
    {"key": "owner", "type": "string", "size": 255, "required": true},
    {"key": "accountId", "type": "string", "size": 255, "required": true},
    {"key": "users", "type": "string", "array": true, "required": false},
    {"key": "bucketFileId", "type": "string", "size": 255, "required": true}
  ],
  "permissions": ["read", "write"]
}
```

#### 4.4 Crie um bucket de storage
- Nome: `files`
- Tamanho máximo: `50MB`
- Tipos permitidos: `*/*`

### 5. Execute o projeto

```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) 🎉

---

## 🏗️ Estrutura do Projeto

```
bloomdrive/
├── 📁 app/                    # App Router (Next.js 14)
│   ├── 📁 (auth)/            # Grupo de rotas de autenticação
│   │   ├── 📁 sign-in/       # Página de login
│   │   └── 📁 sign-up/       # Página de registro
│   ├── 📁 (root)/            # Grupo de rotas principais
│   │   ├── 📁 [type]/        # Página dinâmica por tipo de arquivo
│   │   └── page.tsx          # Dashboard principal
│   ├── 📁 api/               # API Routes
│   │   └── 📁 check-auth/    # Verificação de autenticação
│   ├── globals.css           # Estilos globais
│   └── layout.tsx            # Layout raiz
├── 📁 components/            # Componentes React
│   ├── 📁 ui/               # Componentes base (Radix UI)
│   ├── ActionDropdown.tsx   # Menu de ações dos arquivos
│   ├── AuthForm.tsx         # Formulário de autenticação
│   ├── FileUploader.tsx     # Upload de arquivos
│   ├── Chart.tsx            # Gráfico de uso de storage
│   └── ...
├── 📁 lib/                   # Utilitários e configurações
│   ├── 📁 actions/          # Server Actions
│   ├── 📁 appwrite/         # Configuração Appwrite
│   └── utils.ts             # Funções utilitárias
├── 📁 constants/            # Constantes da aplicação
├── 📁 types/                # Definições TypeScript
├── 📁 public/               # Assets estáticos
└── 📁 hooks/                # Custom hooks
```

---

## 🎨 Principais Funcionalidades

### 🔐 **Sistema de Autenticação**

- **Login/Registro** com email
- **OTP via email** para segurança
- **Redirecionamento inteligente** baseado no estado de auth
- **Validação robusta** com Zod schemas
- **Feedback visual** para erros e sucessos

```typescript
// Exemplo de uso
const result = await signInUser({ email: "user@example.com" });
if (result.accountId) {
  // Redireciona para verificação OTP
}
```

### 📤 **Upload de Arquivos**

- **Drag & Drop** intuitivo
- **Progress bar realista** com simulação
- **Validação de tamanho** (máx. 50MB)
- **Preview de thumbnails**
- **Múltiplos arquivos** simultâneos

```typescript
// Configuração do upload
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = ["image/*", "document/*", "video/*", "audio/*"];
```

### 🤝 **Sistema de Compartilhamento**

- **Compartilhamento granular** por email
- **Múltiplos usuários** por arquivo
- **Permissões baseadas em proprietário**
- **Feedback visual** para ações
- **Opção de sair** do compartilhamento

```typescript
// Compartilhar arquivo
await updateFileUsers({
  fileId: "file123",
  emails: ["user1@example.com", "user2@example.com"],
  path: "/dashboard"
});
```

### 📊 **Dashboard Analítico**

- **Gráfico de uso** em tempo real
- **Categorização** por tipo de arquivo
- **Estatísticas detalhadas**
- **Arquivos recentes**
- **Overview de storage**

---

## 🎯 Recursos Avançados

### ⚡ **Performance**

- **Server-Side Rendering** com Next.js 14
- **Code Splitting** automático
- **Image Optimization** para thumbnails
- **Lazy Loading** de componentes
- **Caching inteligente** com revalidação

### 🔒 **Segurança**

- **Validação client/server-side**
- **Sanitização de inputs**
- **Proteção CSRF** com tokens
- **Rate limiting** para APIs
- **Permissões granulares**

### 📱 **Responsividade**

- **Mobile-first design**
- **Touch gestures** otimizados
- **Progressive Web App** ready
- **Offline capabilities** planejadas
- **Cross-browser compatibility**

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! 

### Como contribuir

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### Diretrizes

- ✅ Siga o [Conventional Commits](https://www.conventionalcommits.org/)
- ✅ Adicione testes para novas funcionalidades
- ✅ Mantenha o código documentado
- ✅ Respeite as configurações do ESLint/Prettier

---

## 📝 Changelog

### v1.2.0 (2025-06-30)
- ✨ **Nova funcionalidade**: Sair do compartilhamento
- 🐛 **Correção**: Erro de hidratação SSR
- 📱 **Melhoria**: Responsividade mobile do uploader
- 🎨 **UI**: Dropdown posicionamento mobile

### v1.1.0 (2025-06-29)
- ✨ **Nova funcionalidade**: Sistema de compartilhamento
- 🔧 **Melhoria**: Progress bar de upload
- 🐛 **Correção**: Validação de autenticação
- 📚 **Docs**: README detalhado

### v1.0.0 (2025-06-28)
- 🎉 **Lançamento inicial**
- 🔐 Autenticação com OTP
- 📤 Upload de arquivos
- 📊 Dashboard com gráficos
- 📱 Design responsivo

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

### 🧑‍💻 Desenvolvedor Principal
- **GitHub**: [@EricSousa](https://github.com/EricSousa02)
- **LinkedIn**: [linkedin.com/in/EricSousa](www.linkedin.com/in/eric-sousa-de-andrade-171803240)

## 🙏 Agradecimentos

- **[Appwrite Team](https://appwrite.io/)** - Pelo excelente BaaS
- **[Vercel Team](https://vercel.com/)** - Pela plataforma de deploy
- **[Radix UI](https://www.radix-ui.com/)** - Pelos componentes acessíveis
- **[Tailwind CSS](https://tailwindcss.com/)** - Pelo framework CSS incrível
- **[Next.js Team](https://nextjs.org/)** - Pelo framework React robusto

---

<div align="center">

### ⭐ Se este projeto te ajudou, considere dar uma estrela!

**Feito com 💜 e Next.js**

[🔝 Voltar ao topo](#-bloomdrive)

</div>

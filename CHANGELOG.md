# 📝 Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [2.1.0] - 2025-06-30

### 🔒 Adicionado - Segurança de URLs
- **Sistema de Proxy Seguro**: Implementado endpoints `/api/files/[fileId]/view` e `/api/files/[fileId]/download`
- **Ocultação de IDs Sensíveis**: URLs agora usam IDs internos em vez de expor bucket/projeto do Appwrite
- **Verificação de Permissões**: Validação de acesso em cada requisição de arquivo
- **URLs Amigáveis**: Substituição de URLs diretas do Appwrite por endpoints seguros

### ✨ Melhorado
- **Componente Card**: Agora usa URLs seguras para visualização
- **ActionDropdown**: Download via endpoint seguro com verificação de permissões
- **Thumbnail**: Carregamento de imagens via proxy interno
- **Utilitários**: Novas funções `constructSecureViewUrl()` e `constructSecureDownloadUrl()`

### 🐛 Corrigido
- **Bug de Renomeação**: Extensão não é mais duplicada ao renomear arquivos múltiplas vezes
- **Estado do Modal**: Nome do arquivo é atualizado automaticamente após renomeação
- **Validação de Entrada**: Proteção contra nomes de arquivo vazios

### 📚 Documentação
- Atualizado README.md com seção de segurança expandida
- Funções antigas marcadas como depreciadas com comentários de aviso

### 🔧 Técnico
- Criado `FileViewerModal.tsx` para visualização melhorada de arquivos
- Adicionadas funções de utilidade para verificação de tipos visualizáveis
- Implementada validação robusta de permissões nos endpoints de API

---

## [2.0.0] - 2025-06-29

### 🎨 Adicionado - Interface e UX
- Sistema completo de gerenciamento de arquivos
- Upload com barra de progresso realista
- Compartilhamento granular de arquivos
- Interface responsiva mobile-first
- Componentes acessíveis com Radix UI

### 🔐 Adicionado - Autenticação
- Sistema OTP via email
- Validação com Zod schemas
- Redirecionamento automático baseado em autenticação
- Proteção de rotas client/server-side

### 📊 Adicionado - Dashboard
- Gráficos de uso de espaço
- Estatísticas por tipo de arquivo
- Visualização de arquivos recentes
- Cards de navegação por categoria

### 🚀 Adicionado - Performance
- Server-Side Rendering com Next.js 14
- Code splitting automático
- Otimização de imagens
- Caching inteligente

### 📱 Adicionado - Responsividade
- Design mobile-first
- Bottom sheets para mobile
- Dropdowns com posicionamento inteligente
- Gestos touch otimizados

---

## [1.0.0] - 2025-06-28

### 🎉 Lançamento Inicial
- Estrutura básica do projeto
- Integração com Appwrite
- Sistema de autenticação fundamental
- Upload básico de arquivos
- Interface inicial com Tailwind CSS

---

## 📋 Tipos de Mudanças

- `✨ Adicionado` para novas funcionalidades
- `🔄 Modificado` para mudanças em funcionalidades existentes  
- `🐛 Corrigido` para correções de bugs
- `🔒 Segurança` para correções de vulnerabilidades
- `📚 Documentação` para mudanças na documentação
- `🔧 Técnico` para mudanças técnicas internas
- `🎨 Interface` para mudanças de UI/UX
- `⚡ Performance` para melhorias de performance

---

## 🔗 Links

- [Repositório GitHub](https://github.com/EricSousa02/BloomDrive)
- [Demo Online](https://bloom-drive-delta.vercel.app/)
- [Documentação](./README.md)
- [Guia de Contribuição](./CONTRIBUTING.md)

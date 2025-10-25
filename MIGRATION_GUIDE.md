# 🚀 Guia de Migração - Sistema de Rotas com React Router

## 📊 Resumo da Refatoração

Migramos de um sistema de rotas baseado em **estado local** para o **React Router v6**.

---

## ✅ O que foi Implementado

### 1. **Estrutura de Rotas** (`src/routes/index.tsx`)
- ✅ Rotas públicas (Landing Page, Login)
- ✅ Rotas protegidas (requerem autenticação)
- ✅ Componente `<ProtectedRoute>` 
- ✅ Componente `<PublicRoute>`
- ✅ Rota 404 personalizada

### 2. **Layout** (`src/layouts/DashboardLayout.tsx`)
- ✅ Layout compartilhado para páginas autenticadas
- ✅ Sidebar e Header integrados
- ✅ Detecção automática da rota ativa
- ✅ Navegação com `useNavigate()`

### 3. **App.tsx Simplificado**
- ✅ Reduzido de 280 linhas para 45 linhas
- ✅ Sem estado local de páginas
- ✅ Sem renderização condicional manual
- ✅ React Router gerencia tudo

### 4. **Páginas Atualizadas**
- ✅ `LandingPage` - usa `useNavigate()`
- ✅ `LoginPage` - usa `useNavigate()` e `useAuth()`

---

## 🔄 Como Migrar Outras Páginas

### Antes (Sistema Antigo):
```tsx
interface MinhaPageProps {
  onNavigate?: (page: string) => void
}

export default function MinhaPage({ onNavigate }: MinhaPageProps) {
  const handleClick = () => {
    onNavigate?.('outra-pagina')
  }
  
  return <button onClick={handleClick}>Ir</button>
}
```

### Depois (React Router):
```tsx
import { useNavigate } from 'react-router-dom'

export default function MinhaPage() {
  const navigate = useNavigate()
  
  const handleClick = () => {
    navigate('/outra-pagina')
  }
  
  return <button onClick={handleClick}>Ir</button>
}
```

---

## 📋 Checklist de Migração

### Páginas que precisam ser atualizadas:

- [x] LandingPage.tsx
- [x] LoginPage.tsx
- [ ] DashboardPage.tsx
- [ ] GerenciarUsuariosPage.tsx
- [ ] CriarUsuarioPage.tsx
- [ ] GerenciarTiposUsuarioPage.tsx
- [ ] SelecionarProfessorPage.tsx
- [ ] DetalhesAulaPage.tsx
- [ ] LancarNotasPage.tsx

---

## 🗺️ Mapeamento de Rotas

| Rota Antiga | Nova Rota | Descrição |
|-------------|-----------|-----------|
| `'landing'` | `/` | Página inicial pública |
| `'login'` | `/login` | Página de login |
| `'dashboard'` | `/dashboard` | Dashboard principal |
| `'ficha-cadastro'` | `/ficha-cadastro` | Cadastro de alunos |
| `'criar-usuario'` | `/usuarios/criar` | Criar usuário |
| `'gerenciar-usuarios'` | `/usuarios/gerenciar` | Gerenciar usuários |
| `'gerenciar-tipos-usuario'` | `/usuarios/tipos` | Tipos de usuário |
| `'alocacao-professor'` | `/alocacao-professor` | Alocação |
| `'gestao-escolar'` | `/gestao-escolar` | Gestão escolar |
| `'diario-escolar'` | `/diario-escolar` | Diário escolar |
| `'detalhes-aula'` | `/diario-escolar/aula/:aulaId` | Detalhes da aula |
| `'lancar-notas'` | `/diario-escolar/notas/:atividadeId` | Lançar notas |

---

## 🎯 Benefícios da Nova Abordagem

### ✅ URLs Reais
```
Antes: http://localhost:5173/
Depois: http://localhost:5173/dashboard
```

### ✅ Navegação do Navegador
- Botão voltar funciona ✅
- Botão avançar funciona ✅
- Histórico de navegação ✅

### ✅ Links Compartilháveis
```tsx
// Pode compartilhar links diretos
http://localhost:5173/usuarios/gerenciar
http://localhost:5173/ficha-cadastro
```

### ✅ Código Mais Limpo
- Sem prop drilling de `onNavigate`
- Sem estados locais de página
- Sem condicionais gigantes
- Componentes mais independentes

### ✅ Rotas Protegidas Centralizadas
```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### ✅ Parâmetros de Rota
```tsx
// Na rota
<Route path="/aula/:aulaId" element={<DetalhesAulaPage />} />

// No componente
const { aulaId } = useParams()
```

---

## 🔧 Hooks do React Router

### `useNavigate()`
```tsx
const navigate = useNavigate()

// Navegar para uma rota
navigate('/dashboard')

// Navegar com substituição (não adiciona ao histórico)
navigate('/login', { replace: true })

// Navegar para trás
navigate(-1)
```

### `useParams()`
```tsx
// Rota: /aula/:aulaId
const { aulaId } = useParams()
console.log(aulaId) // "123"
```

### `useLocation()`
```tsx
const location = useLocation()
console.log(location.pathname) // "/dashboard"
console.log(location.search) // "?tab=notas"
console.log(location.state) // dados passados via navigate
```

### `useSearchParams()`
```tsx
const [searchParams, setSearchParams] = useSearchParams()

// Ler: ?page=2&sort=name
const page = searchParams.get('page') // "2"

// Escrever
setSearchParams({ page: '3', sort: 'date' })
```

---

## 🚀 Próximos Passos

1. ✅ Atualizar páginas restantes
2. ✅ Testar navegação
3. ✅ Verificar proteção de rotas
4. ✅ Atualizar testes (quando houver)
5. ✅ Documentar para o time

---

## 📚 Recursos

- [React Router v6 Docs](https://reactrouter.com/)
- [Guia de Migração v5 → v6](https://reactrouter.com/en/main/upgrading/v5)

---

**Data da Migração**: 24 de Outubro de 2025  
**Versão do React Router**: 7.8.2


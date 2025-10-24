# 🗺️ SISTEMA DE ROTAS - Explicação Completa

## 📊 Como Funcionava ANTES (Sistema Antigo)

### ❌ Problemas do Sistema Anterior

```tsx
// App.tsx - 280 linhas de código complexo
const [currentPage, setCurrentPage] = useState('landing')
const [aulaData, setAulaData] = useState(null)
const [atividadeData, setAtividadeData] = useState(null)

// Navegação via callback
const handlePageNavigation = (page: string, data?: any) => {
  setCurrentPage(page)
  if (data) setAulaData(data)
}

// Renderização condicional gigante
{currentPage === 'dashboard' && <DashboardPage onNavigate={handlePageNavigation} />}
{currentPage === 'ficha-cadastro' && <FichaCadastroPage />}
{currentPage === 'gerenciar-usuarios' && <GerenciarUsuariosPage onNavigate={handlePageNavigation} />}
// ... +10 condições
```

### 🔴 Consequências:

1. **URL sempre igual**: `http://localhost:5173/` (nunca muda!)
2. **Botão voltar não funciona**
3. **Não pode compartilhar links específicos**
4. **Prop Drilling**: `onNavigate` passado por todos os níveis
5. **Dados perdidos**: Ao recarregar, perde `aulaData` e `atividadeData`
6. **Código difícil de manter**: Adicionar página = editar 5 lugares diferentes
7. **Sem proteção centralizada de rotas**

---

## ✅ Como Funciona AGORA (React Router v6)

### 🎯 Nova Estrutura

```
src/
├── App.tsx (45 linhas - SIMPLIFICADO!)
├── routes/
│   └── index.tsx (definições de rotas)
├── layouts/
│   └── DashboardLayout.tsx (layout compartilhado)
└── pages/
    ├── LandingPage.tsx
    ├── auth/
    │   └── LoginPage.tsx
    ├── dashboard/
    │   └── DashboardPage.tsx
    └── ... (outras páginas)
```

---

## 📝 Arquivos Principais

### 1️⃣ **App.tsx** - Simples e Elegante

```tsx
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AppRoutes from './routes';
import DashboardLayout from './layouts/DashboardLayout';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/" element={<AppRoutes />} />
      <Route path="/login" element={<AppRoutes />} />

      {/* Rotas com layout */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<AppRoutes />} />
        <Route path="/usuarios/*" element={<AppRoutes />} />
        {/* ... outras rotas */}
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

**✨ Resultado**: 45 linhas vs 280 linhas anteriores!

---

### 2️⃣ **routes/index.tsx** - Definição Centralizada

```tsx
import { Routes, Route, Navigate } from 'react-router-dom';

// 🔐 Componente de Rota Protegida
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

// 🗺️ Todas as rotas em um só lugar
export default function AppRoutes() {
  return (
    <Routes>
      {/* 🏠 PÚBLICAS */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      {/* 🔐 PROTEGIDAS */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/ficha-cadastro" element={<ProtectedRoute><FichaCadastroPage /></ProtectedRoute>} />
      <Route path="/usuarios/criar" element={<ProtectedRoute><CriarUsuarioPage /></ProtectedRoute>} />
      
      {/* 🚫 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

---

### 3️⃣ **layouts/DashboardLayout.tsx** - Layout Compartilhado

```tsx
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  // Detecta a rota ativa automaticamente
  const currentRoute = findRouteConfig(location.pathname);

  return (
    <div>
      <Sidebar activeItem={location.pathname} onItemClick={navigate} />
      
      <Header 
        title={currentRoute.title}
        description={currentRoute.description}
        usuario={usuario}
      />

      <main>
        {/* Renderiza a página filha aqui */}
        <Outlet />
      </main>
    </div>
  );
}
```

**✨ Magia do `<Outlet />`**: Renderiza automaticamente a página filha!

---

## 🔧 Como Usar nas Páginas

### Exemplo 1: Navegação Simples

```tsx
import { useNavigate } from 'react-router-dom';

export default function MinhaPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Navegar para outra página */}
      <button onClick={() => navigate('/dashboard')}>
        Ir para Dashboard
      </button>

      {/* Voltar */}
      <button onClick={() => navigate(-1)}>
        Voltar
      </button>

      {/* Navegar e substituir no histórico */}
      <button onClick={() => navigate('/login', { replace: true })}>
        Ir para Login (sem histórico)
      </button>
    </div>
  );
}
```

---

### Exemplo 2: Páginas com Parâmetros (ID na URL)

#### Definir a Rota:
```tsx
<Route path="/diario-escolar/aula/:aulaId" element={<DetalhesAulaPage />} />
```

#### Navegar para a Rota:
```tsx
const handleVerAula = (aulaId: string) => {
  navigate(`/diario-escolar/aula/${aulaId}`);
};
```

#### Ler o Parâmetro na Página:
```tsx
import { useParams } from 'react-router-dom';

export default function DetalhesAulaPage() {
  const { aulaId } = useParams();

  useEffect(() => {
    // Buscar dados da aula
    fetchAulaData(aulaId);
  }, [aulaId]);

  return <div>Aula ID: {aulaId}</div>;
}
```

---

### Exemplo 3: Passando Dados Entre Páginas

#### Opção A: **Via State** (dados temporários)
```tsx
// Navegar
navigate('/editar-aluno', { 
  state: { aluno: { id: 1, nome: 'João' } } 
});

// Receber
const location = useLocation();
const aluno = location.state?.aluno;
```

#### Opção B: **Via URL Params** (dados permanentes, melhor!)
```tsx
// Rota: /editar-aluno/:alunoId
navigate(`/editar-aluno/${aluno.id}`);

// Na página
const { alunoId } = useParams();
// Buscar aluno da API com o ID
```

---

### Exemplo 4: Query Params (Filtros, Busca)

```tsx
import { useSearchParams } from 'react-router-dom';

export default function ListaAlunosPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Ler: ?page=2&busca=João
  const page = searchParams.get('page') || '1';
  const busca = searchParams.get('busca') || '';

  // Atualizar: /alunos?page=3&busca=Maria
  const handleBuscar = (termo: string) => {
    setSearchParams({ page: '1', busca: termo });
  };

  return (
    <div>
      <input 
        value={busca}
        onChange={(e) => handleBuscar(e.target.value)}
      />
      <p>Página: {page}</p>
      <p>Busca: {busca}</p>
    </div>
  );
}
```

---

## 🎯 Benefícios do Novo Sistema

### 1. ✅ **URLs Reais e Amigáveis**
```
Antes: http://localhost:5173/
Depois: http://localhost:5173/dashboard
        http://localhost:5173/usuarios/gerenciar
        http://localhost:5173/diario-escolar/aula/123
```

### 2. ✅ **Navegação do Navegador Funciona**
- Botão **Voltar** ← funciona!
- Botão **Avançar** → funciona!
- **Histórico** completo

### 3. ✅ **Links Compartilháveis**
```tsx
// Pode copiar e colar
http://localhost:5173/diario-escolar/aula/456
```

### 4. ✅ **Sem Prop Drilling**
```tsx
// ANTES ❌
<Dashboard onNavigate={handleNav}>
  <Component1 onNavigate={handleNav}>
    <Component2 onNavigate={handleNav}>
      <Component3 onNavigate={handleNav} />
    </Component2>
  </Component1>
</Dashboard>

// DEPOIS ✅
<Dashboard>
  <Component1>
    <Component2>
      <Component3 />
    </Component2>
  </Component1>
</Dashboard>

// Em qualquer nível, só chamar:
const navigate = useNavigate()
navigate('/onde-quiser')
```

### 5. ✅ **Proteção Centralizada**
```tsx
// Todas as rotas protegidas em UM lugar
<Route path="/dashboard" element={
  <ProtectedRoute>
    <DashboardPage />
  </ProtectedRoute>
} />
```

### 6. ✅ **Código Mais Limpo**
- Sem `if (currentPage === 'x')`
- Sem estados locais de página
- Sem condicionais gigantes
- Cada componente é independente

### 7. ✅ **SEO e Analytics**
```tsx
// Pode rastrear cada página
useEffect(() => {
  analytics.pageView(location.pathname);
}, [location]);
```

---

## 🚀 Hooks Disponíveis

### `useNavigate()`
```tsx
const navigate = useNavigate()
navigate('/dashboard')               // Navegar
navigate(-1)                          // Voltar
navigate(1)                           // Avançar
navigate('/login', { replace: true }) // Substituir
navigate('/perfil', { state: data }) // Com dados
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
location.pathname  // "/dashboard"
location.search    // "?tab=notas"
location.hash      // "#section"
location.state     // dados passados
```

### `useSearchParams()`
```tsx
const [params, setParams] = useSearchParams()
params.get('page')              // Ler
setParams({ page: '2' })        // Escrever
setParams(prev => {             // Atualizar
  prev.set('page', '2')
  return prev
})
```

---

## 📚 Exemplos Práticos

### Exemplo Completo: Lista com Filtros e Detalhes

```tsx
// 1. LISTA DE ALUNOS
export default function ListaAlunosPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [alunos, setAlunos] = useState([])

  const busca = searchParams.get('busca') || ''
  const page = searchParams.get('page') || '1'

  useEffect(() => {
    // Carregar alunos com filtros da URL
    fetchAlunos({ busca, page }).then(setAlunos)
  }, [busca, page])

  return (
    <div>
      {alunos.map(aluno => (
        <button onClick={() => navigate(`/alunos/${aluno.id}`)}>
          {aluno.nome}
        </button>
      ))}
    </div>
  )
}

// 2. DETALHES DO ALUNO
export default function DetalhesAlunoPage() {
  const { alunoId } = useParams()
  const navigate = useNavigate()
  const [aluno, setAluno] = useState(null)

  useEffect(() => {
    fetchAluno(alunoId).then(setAluno)
  }, [alunoId])

  return (
    <div>
      <button onClick={() => navigate('/alunos')}>← Voltar</button>
      <h1>{aluno?.nome}</h1>
      <button onClick={() => navigate(`/alunos/${alunoId}/editar`)}>
        Editar
      </button>
    </div>
  )
}
```

---

## 🎓 Conclusão

### O que mudou:
- ❌ Estado local `currentPage`
- ❌ Prop `onNavigate`
- ❌ Renderização condicional manual
- ❌ Dados perdidos ao recarregar

### O que ganhou:
- ✅ URLs reais
- ✅ Navegação do navegador
- ✅ Links compartilháveis
- ✅ Código mais limpo
- ✅ Componentes independentes
- ✅ Proteção centralizada
- ✅ Melhor UX

---

**🚀 Agora você tem um sistema de rotas profissional e escalável!**

**Dúvidas?** Consulte: https://reactrouter.com/


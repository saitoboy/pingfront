import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import EsqueciSenhaPage from '../pages/auth/EsqueciSenhaPage';
import ConfirmarCodigoPage from '../pages/auth/ConfirmarCodigoPage';
import RedefinirSenhaPage from '../pages/auth/RedefinirSenhaPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import DashboardProfessorPage from '../pages/dashboard/DashboardProfessorPage';
import FichaCadastroPage from '../pages/cadastro/FichaCadastroPage';
import ListarFichasPage from '../pages/cadastro/ListarFichasPage';
import CriarUsuarioPage from '../pages/usuarios/CriarUsuarioPage';
import GerenciarUsuariosPage from '../pages/usuarios/GerenciarUsuariosPage';
import GerenciarTiposUsuarioPage from '../pages/usuarios/GerenciarTiposUsuarioPage';
import AlocacaoProfessorPage from '../pages/alocacao/AlocacaoProfessorPage';
import GestaoEscolarPage from '../pages/gestao/GestaoEscolarPage';
import SelecionarProfessorPage from '../pages/diario/SelecionarProfessorPage';
import DiarioProfessorPage from '../pages/diario/DiarioProfessorPage';
import DiarioMateriaPage from '../pages/diario/DiarioMateriaPage';
import DiarioDiaPage from '../pages/diario/DiarioDiaPage';
import CalendarioGradePage from '../pages/diario/CalendarioGradePage';
import DetalhesAulaPage from '../pages/diario/DetalhesAulaPage';
import LancarNotasPage from '../pages/diario/LancarNotasPage';
import MeuDiarioPage from '../pages/diario/MeuDiarioPage';
import AdminDiariosPage from '../pages/diario/AdminDiariosPage';

// 🔐 Componente de Rota Protegida
interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Se ainda está carregando, mostra loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😊</span>
          </div>
          <div className="text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se está autenticado, renderiza o conteúdo
  return <>{children}</>;
}

// 🌐 Componente de Rota Pública (só acessível quando NÃO está logado)
function PublicRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😊</span>
          </div>
          <div className="text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  // Se já está autenticado, redireciona para dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// 🎯 Componente para escolher o dashboard correto baseado no tipo de usuário
function DashboardRouter() {
  const { usuario } = useAuth();
  
  // Professores veem o dashboard específico deles
  if (usuario?.tipo_usuario_id === 'professor') {
    return <DashboardProfessorPage />;
  }
  
  // Admin e Secretário veem o dashboard padrão
  return <DashboardPage />;
}

// 🗺️ DEFINIÇÃO DAS ROTAS
export default function AppRoutes() {
  return (
    <Routes>
      {/* 🏠 ROTAS PÚBLICAS (sem layout) */}
      <Route path="/" element={<LandingPage />} />
      
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* 🔐 ROTAS DE REDEFINIÇÃO DE SENHA (públicas) */}
      <Route
        path="/auth/esqueci-senha"
        element={
          <PublicRoute>
            <EsqueciSenhaPage />
          </PublicRoute>
        }
      />

      <Route
        path="/auth/confirmar-codigo"
        element={
          <PublicRoute>
            <ConfirmarCodigoPage />
          </PublicRoute>
        }
      />

      <Route
        path="/auth/redefinir-senha"
        element={
          <PublicRoute>
            <RedefinirSenhaPage />
          </PublicRoute>
        }
      />

      {/* 🔐 ROTAS PROTEGIDAS (com DashboardLayout) */}
      <Route element={<DashboardLayout />}>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ficha-cadastro"
          element={
            <ProtectedRoute>
              <FichaCadastroPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/fichas-cadastro"
          element={
            <ProtectedRoute>
              <ListarFichasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios/criar"
          element={
            <ProtectedRoute>
              <CriarUsuarioPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios/gerenciar"
          element={
            <ProtectedRoute>
              <GerenciarUsuariosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios/tipos"
          element={
            <ProtectedRoute>
              <GerenciarTiposUsuarioPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/alocacao-professor"
          element={
            <ProtectedRoute>
              <AlocacaoProfessorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gestao-escolar"
          element={
            <ProtectedRoute>
              <GestaoEscolarPage />
            </ProtectedRoute>
          }
        />

        {/* 📚 ROTA DO MEU DIÁRIO (para professores) */}
        <Route
          path="/meu-diario"
          element={
            <ProtectedRoute>
              <MeuDiarioPage />
            </ProtectedRoute>
          }
        />

        {/* 📚 ROTAS DO DIÁRIO ESCOLAR */}
        <Route
          path="/diario-escolar"
          element={<Navigate to="/diario" replace />}
        />
        
        <Route
          path="/diario"
          element={
            <ProtectedRoute>
              <SelecionarProfessorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diario/professor/:professorId"
          element={
            <ProtectedRoute>
              <DiarioProfessorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diario/admin/:professorId"
          element={
            <ProtectedRoute>
              <AdminDiariosPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diario/materia/:turmaDisciplinaProfessorId"
          element={
            <ProtectedRoute>
              <DiarioMateriaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diario/dia/:data"
          element={
            <ProtectedRoute>
              <DiarioDiaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diario/calendario/:professorId/:diaSemana?"
          element={
            <ProtectedRoute>
              <CalendarioGradePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diario/aula/:aulaId"
          element={
            <ProtectedRoute>
              <DetalhesAulaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/diario/notas/:atividadeId"
          element={
            <ProtectedRoute>
              <LancarNotasPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 🚫 ROTA 404 - Página não encontrada */}
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
              <a
                href="/"
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Voltar para Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}


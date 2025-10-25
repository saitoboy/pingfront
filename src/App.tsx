import AppRoutes from './routes';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isLoading } = useAuth();

  // Se ainda está carregando a autenticação, mostra tela de loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="text-2xl">😊</span>
          </div>
          <div className="text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;

import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import { logger } from '../../lib/logger'

// Importando a animação Lottie que você forneceu
import schoolCharacterAnimation from '../../assets/animations/Trilo-3.json'

interface LoadingScreenProps {
  onLoadingComplete: () => void
  userName: string
}

const loadingMessages = [
  { text: '📚 Organizando os diários...', duration: 600 },
  { text: '📖 Guardando os livros...', duration: 600 },
  { text: '🏫 Arrumando as salas...', duration: 600 },
  { text: '✏️ Preparando o material...', duration: 500 },
  { text: '🎒 Organizando as mochilas...', duration: 500 },
  { text: '🎨 Arrumando os desenhos...', duration: 500 },
  { text: '🏆 Tudo pronto para começar!', duration: 400 }
]

export default function LoadingScreen({ onLoadingComplete, userName }: LoadingScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    logger.info('🎬 Iniciando tela de loading...')
    
    let currentTime = 0

    // Calcular duração total
    const totalTime = loadingMessages.reduce((acc, msg) => acc + msg.duration, 0)

    const updateProgress = () => {
      const interval = setInterval(() => {
        currentTime += 50
        const newProgress = Math.min((currentTime / totalTime) * 100, 100)
        setProgress(newProgress)

        // Atualizar mensagem baseada no progresso
        let accumulatedTime = 0
        for (let i = 0; i < loadingMessages.length; i++) {
          accumulatedTime += loadingMessages[i].duration
          if (currentTime <= accumulatedTime) {
            setCurrentMessageIndex(i)
            break
          }
        }

        // Quando chegar ao final
        if (newProgress >= 100) {
          clearInterval(interval)
          setShowWelcome(true)
          
          setTimeout(() => {
            logger.success('✅ Loading completo! Entrando na escola...')
            onLoadingComplete()
          }, 800)
        }
      }, 50)

      return interval
    }

    const interval = updateProgress()
    return () => clearInterval(interval)
  }, [onLoadingComplete])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 flex flex-col items-center justify-center p-8">
      {/* Personagem Lottie */}
      <div className="w-64 h-64 mb-8">
        <Lottie 
          animationData={schoolCharacterAnimation} 
          loop={true}
          autoplay={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Mensagem de Loading ou Boas-vindas */}
      <div className="text-center mb-8 min-h-[60px] flex items-center justify-center">
        {!showWelcome ? (
          <div className="animate-fade-in">
            <p className="text-lg font-medium text-gray-700 mb-2">
              {loadingMessages[currentMessageIndex]?.text}
            </p>
            <p className="text-sm text-gray-500">
              Preparando sua experiência escolar...
            </p>
          </div>
        ) : (
          <div className="animate-slide-in-up">
            <h3 className="text-2xl font-bold text-green-600 mb-2">
              🎉 Bem-vindo, {userName}!
            </h3>
            <p className="text-lg text-gray-700">
              Sua sala de aula está pronta!
            </p>
          </div>
        )}
      </div>

      {/* Barra de Progress */}
      <div className="w-full max-w-md">
        <div className="bg-gray-200 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 h-full rounded-full transition-all duration-300 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Efeito de brilho na barra */}
            <div className="absolute inset-0 bg-white bg-opacity-20 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Percentual */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Carregando...</span>
          <span className="font-mono">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Elementos decorativos animados */}
      <div className="absolute top-10 left-10 animate-bounce delay-100">
        <div className="w-8 h-8 bg-blue-200 rounded-full opacity-60"></div>
      </div>
      <div className="absolute top-20 right-16 animate-bounce delay-300">
        <div className="w-6 h-6 bg-yellow-200 rounded-full opacity-60"></div>
      </div>
      <div className="absolute bottom-16 left-20 animate-bounce delay-500">
        <div className="w-4 h-4 bg-green-200 rounded-full opacity-60"></div>
      </div>
      <div className="absolute bottom-32 right-12 animate-bounce delay-700">
        <div className="w-5 h-5 bg-pink-200 rounded-full opacity-60"></div>
      </div>

      {/* Rodapé com copyright */}
      <div className="absolute bottom-4 text-center">
        <p className="text-xs text-gray-400">
          © 2024 Escola Pinguinho de Gente • Sistema Escolar
        </p>
      </div>
    </div>
  )
}

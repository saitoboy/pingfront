import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  Play,
  Award,
  Shield,
  Lightbulb,
  Globe,
  Calendar,
  UserCheck,
  School,
  Target,
  Zap
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header Fixo */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isScrolled ? 'bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent' : 'text-white'} `}>
                  Escola Pinguinho
                </h1>
                <p className="text-sm text-gray-600 font-medium">Educação de Qualidade</p>
              </div>
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a 
                href="#inicio" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group"
              >
                Início
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a 
                href="#sobre" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group"
              >
                Sobre
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a 
                href="#servicos" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group"
              >
                Serviços
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a 
                href="#contato" 
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 font-medium relative group"
              >
                Contato
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </a>
            </nav>

            {/* Botões de Ação */}
            <div className="flex items-center space-x-4">
              {/* Botão Portal - Desktop */}
              <button 
                onClick={() => navigate('/login')}
                className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <School className="w-5 h-5" />
                <span>Portal da Escola</span>
              </button>

              {/* Botão Portal - Mobile */}
              <button 
                onClick={() => navigate('/login')}
                className="md:hidden bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                title="Acessar Portal"
              >
                <School className="w-5 h-5" />
              </button>

              {/* Menu Mobile */}
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-yellow-400 opacity-0 transition-opacity duration-300"></div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="min-h-[80vh] flex items-center justify-center pt-24 pb-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Título Principal */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8">
              Educação que
              <span className="block text-yellow-300 mt-2">Transforma Vidas</span>
            </h1>

            {/* Subtítulo */}
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-12 max-w-3xl mx-auto">
              Na Escola Pinguinho, cada criança é única e merece uma educação 
              <span className="text-yellow-300 font-semibold"> personalizada</span>, 
              <span className="text-yellow-300 font-semibold"> inclusiva</span> e de 
              <span className="text-yellow-300 font-semibold"> qualidade</span>.
            </p>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-300 transition-all duration-300 flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Visita
              </button>
              <button className="bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 flex items-center justify-center border border-white/30">
                <Play className="w-5 h-5 mr-2" />
                Ver Vídeo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre a Escola */}
      <section id="sobre" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header da Seção */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sobre a Escola Pinguinho
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Há mais de <span className="text-blue-600 font-semibold">15 anos</span> formando cidadãos conscientes, 
              críticos e preparados para os desafios do futuro
            </p>
          </div>

          {/* Conteúdo Principal */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Lado Esquerdo - Missão */}
            <div className="space-y-8">
              <div className="bg-blue-50 p-8 rounded-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Nossa Missão</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Proporcionar uma educação de qualidade, inclusiva e transformadora, 
                  desenvolvendo o potencial de cada aluno através de metodologias inovadoras 
                  e um ambiente acolhedor e estimulante.
                </p>
              </div>

              {/* Pilares da Educação */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Excelência Acadêmica</h4>
                  <p className="text-gray-600 text-sm">Resultados comprovados em avaliações nacionais</p>
                </div>

                <div className="bg-yellow-50 p-6 rounded-xl">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center mb-4">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Cuidado Individual</h4>
                  <p className="text-gray-600 text-sm">Acompanhamento personalizado de cada aluno</p>
                </div>

                <div className="bg-green-50 p-6 rounded-xl">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Ambiente Seguro</h4>
                  <p className="text-gray-600 text-sm">Estrutura física e emocional protegida</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Inovação Constante</h4>
                  <p className="text-gray-600 text-sm">Tecnologia e metodologias atualizadas</p>
                </div>
              </div>
            </div>

            {/* Lado Direito - Valores */}
            <div className="space-y-8">
              <div className="bg-blue-600 rounded-2xl p-8 text-white">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-yellow-400 rounded-xl flex items-center justify-center mr-4">
                    <Heart className="w-6 h-6 text-gray-900" />
                  </div>
                  <h3 className="text-2xl font-bold">Nossos Valores</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium">Respeito à diversidade e inclusão</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium">Desenvolvimento integral do aluno</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium">Parceria família-escola</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium">Formação cidadã e ética</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-yellow-400" />
                    <span className="font-medium">Preparação para o futuro</span>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="bg-gray-50 rounded-2xl p-8">
                <h4 className="text-xl font-bold text-gray-900 mb-6 text-center">Números que Falam</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                    <div className="text-gray-600 text-sm">Alunos Ativos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
                    <div className="text-gray-600 text-sm">Anos de Experiência</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                    <div className="text-gray-600 text-sm">Satisfação</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                    <div className="text-gray-600 text-sm">Inclusão</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Educacionais */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nossos Serviços
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma educação completa que vai além da sala de aula
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Educação Infantil</h3>
              <p className="text-gray-600 text-sm mb-4">
                Desenvolvimento integral através de atividades lúdicas e pedagógicas, 
                preparando para a alfabetização.
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Idade: 3 a 5 anos
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Período integral
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Atividades extracurriculares
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <School className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ensino Fundamental</h3>
              <p className="text-gray-600 text-sm mb-4">
                Base sólida de conhecimentos com foco no desenvolvimento 
                de competências e habilidades essenciais.
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  1º ao 9º ano
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Material didático atualizado
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Acompanhamento pedagógico
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Atendimento Especializado</h3>
              <p className="text-gray-600 text-sm mb-4">
                Suporte especializado para alunos com necessidades educacionais 
                especiais, garantindo inclusão e desenvolvimento.
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Equipe multidisciplinar
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Acompanhamento individual
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Adaptações curriculares
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Atividades Extracurriculares</h3>
              <p className="text-gray-600 text-sm mb-4">
                Desenvolvimento de talentos e habilidades através de atividades 
                esportivas, artísticas e culturais.
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Esportes e educação física
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Artes e música
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Robótica e tecnologia
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Orientação Educacional</h3>
              <p className="text-gray-600 text-sm mb-4">
                Acompanhamento psicopedagógico para o desenvolvimento 
                integral e orientação vocacional.
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Orientação vocacional
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Apoio psicopedagógico
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Parceria família-escola
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tecnologia Educacional</h3>
              <p className="text-gray-600 text-sm mb-4">
                Uso de tecnologias modernas para enriquecer o processo 
                de ensino e aprendizagem.
              </p>
              <ul className="space-y-1 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Laboratório de informática
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Plataforma digital
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Recursos multimídia
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Por que escolher a Escola Pinguinho?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Diferenciais que fazem a diferença na educação do seu filho
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Segurança Total</h3>
              <p className="text-gray-600 text-sm">
                Ambiente seguro com monitoramento 24h e protocolos de segurança rigorosos
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Cuidado Individual</h3>
              <p className="text-gray-600 text-sm">
                Acompanhamento personalizado respeitando o ritmo e necessidades de cada aluno
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Inovação Pedagógica</h3>
              <p className="text-gray-600 text-sm">
                Metodologias modernas e tecnologia educacional para preparar para o futuro
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Comunidade Acolhedora</h3>
              <p className="text-gray-600 text-sm">
                Família escolar unida, promovendo valores humanos e cidadania
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Entre em Contato
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Estamos aqui para esclarecer suas dúvidas e apresentar nossa proposta educacional
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Informações de Contato</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Telefone</p>
                      <p className="text-blue-100 text-sm">(11) 99999-9999</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-400 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">E-mail</p>
                      <p className="text-blue-100 text-sm">contato@escolapinguinho.com.br</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Endereço</p>
                      <p className="text-blue-100 text-sm">Rua da Educação, 123<br />Centro - São Paulo/SP</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Horário de Funcionamento</p>
                      <p className="text-blue-100 text-sm">Segunda a Sexta: 7h às 18h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold mb-4">Agende uma Visita</h3>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone</label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">E-mail</label>
                  <input 
                    type="email" 
                    className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Mensagem</label>
                  <textarea 
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Conte-nos sobre seu interesse na escola..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-yellow-400 text-gray-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-300 flex items-center justify-center"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Visita
                </button>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-center text-blue-100 mb-3 text-sm">Acesso ao Portal</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full bg-yellow-400 text-gray-900 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-300 flex items-center justify-center text-sm"
                    >
                      <School className="w-4 h-4 mr-2" />
                      Portal da Escola
                    </button>
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full bg-white/20 text-white py-2 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center border border-white/30 text-sm"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Portal do Aluno
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Botão Flutuante para Acesso Rápido */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 group"
          title="Acessar Portal da Escola"
        >
          <School className="w-6 h-6" />
        </button>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-gray-900">!</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Escola Pinguinho</h3>
                  <p className="text-sm text-gray-400">Educação de Qualidade</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Transformando vidas através da educação há mais de 15 anos.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#inicio" className="hover:text-white transition-colors">Início</a></li>
                <li><a href="#sobre" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#servicos" className="hover:text-white transition-colors">Serviços</a></li>
                <li><a href="#contato" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Educação</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Educação Infantil</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ensino Fundamental</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Atividades Extras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Orientação</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>📞 (11) 99999-9999</p>
                <p>✉️ contato@escolapinguinho.com.br</p>
                <p>📍 Rua da Educação, 123 - Centro</p>
                <p>🕒 Seg-Sex: 7h às 18h</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Escola Pinguinho. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { contatoService } from '../services/contatoService'
import imgAlunos from '../assets/images/alunos.png'
import imgAluno from '../assets/images/aluno.png'
import bgLp from '../assets/images/bg-lp3.png'
import logo from '../assets/images/logo.png'
import { 
  Users, 
  BookOpen, 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  // Play, // Comentado temporariamente
  Shield,
  Calendar,
  School,
  Target,
  Zap,
  Instagram
} from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false)
  
  // Estados do formulário de contato
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    mensagem: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handler para envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      await contatoService.enviarMensagem(formData)
      setSubmitStatus('success')
      setSubmitMessage('Mensagem enviada com sucesso! Entraremos em contato em breve.')
      // Limpa o formulário
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        mensagem: ''
      })
      // Remove a mensagem de sucesso após 5 segundos
      setTimeout(() => {
        setSubmitStatus('idle')
        setSubmitMessage('')
      }, 5000)
    } catch (error: any) {
      setSubmitStatus('error')
      setSubmitMessage(
        error.response?.data?.mensagem || 
        'Erro ao enviar mensagem. Por favor, tente novamente ou entre em contato pelo telefone.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler para mudanças nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Structured Data (JSON-LD) para SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Escola Pinguinho",
    "description": "Há mais de 50 anos formando cidadãos conscientes através de uma educação de qualidade, inclusiva e transformadora. Educação Infantil e Ensino Fundamental em Muriaé/MG.",
    "url": "https://escolapinguinho.com.br",
    "logo": "https://escolapinguinho.com.br/logo.png",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Avenida Dr. Passos, 41",
      "addressLocality": "Muriaé",
      "addressRegion": "MG",
      "addressCountry": "BR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+55-32-3721-2755",
      "contactType": "customer service",
      "email": "escolapinguinhodegentec@gmail.com",
      "availableLanguage": "Portuguese"
    },
    "openingHours": "Mo-Fr 07:00-18:00",
    "areaServed": {
      "@type": "City",
      "name": "Muriaé"
    },
    "educationalCredentialAwarded": ["Educação Infantil", "Ensino Fundamental"],
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "500+"
    },
    "foundingDate": "2009"
  };

  return (
    <>
      {/* Structured Data para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
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
              <img 
                src={logo} 
                alt="Escola Pinguinho" 
                className={`${isScrolled ? 'w-32' : 'w-44'} transition-all duration-300 hover:scale-105`}
              />
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a 
                href="#inicio" 
                className={`${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-yellow-400'} transition-colors duration-300 font-medium relative group`}
              >
                Início
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${isScrolled ? 'bg-blue-600' : 'bg-yellow-400'} transition-all duration-300 group-hover:w-full`}></span>
              </a>
              <a 
                href="#sobre" 
                className={`${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-yellow-400'} transition-colors duration-300 font-medium relative group`}
              >
                Sobre
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${isScrolled ? 'bg-blue-600' : 'bg-yellow-400'} transition-all duration-300 group-hover:w-full`}></span>
              </a>
              <a 
                href="#servicos" 
                className={`${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-yellow-400'} transition-colors duration-300 font-medium relative group`}
              >
                Serviços
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${isScrolled ? 'bg-blue-600' : 'bg-yellow-400'} transition-all duration-300 group-hover:w-full`}></span>
              </a>
              <a 
                href="#contato" 
                className={`${isScrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white hover:text-yellow-400'} transition-colors duration-300 font-medium relative group`}
              >
                Contato
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 ${isScrolled ? 'bg-blue-600' : 'bg-yellow-400'} transition-all duration-300 group-hover:w-full`}></span>
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
              <button className={`lg:hidden p-2 rounded-lg ${isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/20'} transition-colors duration-300`}>
                <svg className={`w-6 h-6 ${isScrolled ? 'text-gray-700' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section 
        id="inicio" 
        className="flex items-center justify-center pt-24 text-blue-500 relative"
        style={{
          backgroundImage: `url(${bgLp})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-7xl mx-auto pt-4 sm:pt-6 lg:pt-8 flex flex-col lg:flex-row gap-8 lg:gap-0 items-center justify-center">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="">
              {/* Título Principal */}
              <h1 className="text-5xl lg:text-6xl text-white text-center lg:text-start leading-tight mb-8">
                Educação que
                <span className="block font-bold mt-2">Transforma Vidas</span>
              </h1>

              {/* Subtítulo */}
              <p className="text-xl text-white text-center lg:text-start leading-relaxed mb-12 max-w-3xl mx-auto">
                Na Escola Pinguinho, cada criança é única e merece uma educação 
                <span className="text-yellow-400 font-semibold"> personalizada</span>, 
                <span className="text-yellow-400 font-semibold"> inclusiva</span> e de 
                <span className="text-yellow-400 font-semibold"> qualidade</span>.
              </p>

              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href="https://wa.me/5532988574727?text=Olá!%20Gostaria%20de%20agendar%20uma%20visita%20à%20escola."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-yellow-300 transition-all duration-300 flex items-center justify-center"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Agendar Visita
                </a>
                {/* Botão Ver Vídeo comentado temporariamente */}
                {/* <button className="bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/30 transition-all duration-300 flex items-center justify-center border border-white/30">
                  <Play className="w-5 h-5 mr-2" />
                  Ver Vídeo
                </button> */}
              </div>
            </div>
          </div>
          <img 
            src={imgAlunos} 
            alt="Alunos da Escola Pinguinho - Educação Infantil e Ensino Fundamental" 
            className="w-full lg:w-1/2" 
          />
        </div>
      </section>

      {/* Sobre a Escola */}
      <section id="sobre" className="bg-white">
        <div className="max-w-7xl mx-auto bg-white p-4 sm:p-16 -mt-12 rounded-3xl shadow-md relative z-10">
          {/* Header da Seção */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sobre a Escola Pinguinho
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Há mais de <span className="text-blue-600 font-semibold">50 anos</span> formando cidadãos conscientes, 
              críticos e preparados para os desafios do futuro
            </p>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Lado Esquerdo - Missão */}
            <div className="space-y-8">
              <div className="rounded-2xl overflow-hidden">
                <img 
                  src={imgAluno} 
                  alt="Aluno da Escola Pinguinho em ambiente de aprendizado" 
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Estatísticas */}
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-blue-600">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-2">Milhares</div>
                      <div className="text-gray-700 text-sm font-medium leading-relaxed">
                        de crianças se formaram por aqui
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600 mb-2">50+</div>
                      <div className="text-gray-700 text-sm font-medium leading-relaxed">
                        Anos de Experiência
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            

            {/* Lado Direito - Valores */}
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
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Impacto Cultural</h4>
                  <p className="text-gray-600 text-sm">Promovendo experiências culturais que marcam gerações</p>
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
                  <p className="text-gray-600 text-sm">Estrutura física e emocional protegida com salas monitoradas por câmeras</p>
                </div>

                <div className="bg-purple-50 p-6 rounded-xl">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Tempo Integral</h4>
                  <p className="text-gray-600 text-sm">Atendemos alunos em dois turnos com oficinas diversificadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Educacionais */}
      <section id="servicos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nossos Serviços
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma educação completa que vai além da sala de aula
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Educação Infantil */}
            <div className="bg-yellow-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Educação Infantil</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Desenvolvimento integral através de atividades lúdicas e pedagógicas, 
                preparando para a alfabetização de forma divertida e envolvente.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Idade: 1 ano e 7 meses a 5 anos</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Período integral</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Atividades extracurriculares</span>
                </div>
              </div>
            </div>

            {/* Ensino Fundamental */}
            <div className="bg-yellow-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="flex items-center mb-6">
                <div className="w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <School className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Ensino Fundamental</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Base sólida de conhecimentos com foco no desenvolvimento 
                de competências e habilidades essenciais para o futuro.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">1º ao 5º ano</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Material didático atualizado</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">Acompanhamento pedagógico</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Contato */}
      <section id="contato" className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="text-center lg:text-start mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Entre em Contato
                </h2>
                <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                  Estamos aqui para esclarecer suas dúvidas e apresentar nossa proposta educacional
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-xl font-bold mb-4">Informações de Contato</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <Phone className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Telefone</p>
                      <p className="text-blue-100 text-sm">(32) 3721-2755 | (32) 98857-4727 (WhatsApp)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">E-mail</p>
                      <p className="text-blue-100 text-sm">escolapinguinhodegentec@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-gray-900" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Endereço</p>
                      <p className="text-blue-100 text-sm">Avenida Dr. Passos, 41 - Muriaé/MG</p>
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome</label>
                    <input 
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Telefone</label>
                    <input 
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      placeholder="(32) 98857-4727"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">E-mail</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Mensagem</label>
                  <textarea 
                    name="mensagem"
                    value={formData.mensagem}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Conte-nos sobre seu interesse na escola..."
                  ></textarea>
                </div>

                {/* Mensagem de feedback */}
                {submitStatus !== 'idle' && (
                  <div className={`p-3 rounded-lg ${
                    submitStatus === 'success' 
                      ? 'bg-green-500/20 border border-green-500/50 text-green-100' 
                      : 'bg-red-500/20 border border-red-500/50 text-red-100'
                  }`}>
                    {submitMessage}
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-yellow-400 text-blue-900 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar Visita
                    </>
                  )}
                </button>
                
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-center text-blue-100 mb-3 text-sm">Acesso ao Portal</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => navigate('/login')}
                      className="w-full bg-white/20 text-white py-2 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center border border-white/30 text-sm"
                    >
                      <School className="w-4 h-4 mr-2" />
                      Portal da Escola
                    </button>
                    {/* Botão Portal do Aluno comentado temporariamente */}
                    {/* <button 
                      onClick={() => navigate('/login')}
                      className="w-full bg-white/20 text-white py-2 rounded-lg font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center border border-white/30 text-sm"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Portal do Aluno
                    </button> */}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Botões Flutuantes para Acesso Rápido */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
        {/* Botão WhatsApp */}
        <a
          href="https://wa.me/5532988574727"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all duration-300 transform hover:scale-110 group relative"
          title="Fale conosco no WhatsApp"
        >
          <svg 
            className="w-6 h-6" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </a>

        {/* Botão Portal */}
        <button 
          onClick={() => navigate('/login')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 group relative"
          title="Acessar Portal da Escola"
        >
          <School className="w-6 h-6" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-900">!</span>
          </div>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center md:text-left">
            {/* Logo e Descrição */}
            <div className="space-y-4">
              <div className="flex flex-col items-center md:items-start space-y-4">
                <img 
                  src={logo} 
                  alt="Escola Pinguinho" 
                  className="w-40 h-auto mb-2"
                />
                <p className="text-blue-100 text-sm leading-relaxed">
                  Transformando vidas através da educação há mais de 50 anos.
                </p>
              </div>
            </div>
            
            {/* Links Rápidos */}
            <div>
              <h4 className="font-bold text-lg mb-4 flex items-center justify-center md:justify-start">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-2">
                  <Heart className="w-4 h-4 text-gray-900" />
                </div>
                Links Rápidos
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#inicio" className="text-blue-100 hover:text-yellow-400 transition-colors flex items-center justify-center md:justify-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-yellow-400" />
                    Início
                  </a>
                </li>
                <li>
                  <a href="#sobre" className="text-blue-100 hover:text-yellow-400 transition-colors flex items-center justify-center md:justify-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-yellow-400" />
                    Sobre
                  </a>
                </li>
                <li>
                  <a href="#servicos" className="text-blue-100 hover:text-yellow-400 transition-colors flex items-center justify-center md:justify-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-yellow-400" />
                    Serviços
                  </a>
                </li>
                <li>
                  <a href="#contato" className="text-blue-100 hover:text-yellow-400 transition-colors flex items-center justify-center md:justify-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-yellow-400" />
                    Contato
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Educação */}
            <div>
              <h4 className="font-bold text-lg mb-4 flex items-center justify-center md:justify-start">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-2">
                  <BookOpen className="w-4 h-4 text-gray-900" />
                </div>
                Educação
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#servicos" className="text-blue-100 hover:text-yellow-400 transition-colors flex items-center justify-center md:justify-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-yellow-400" />
                    Educação Infantil
                  </a>
                </li>
                <li>
                  <a href="#servicos" className="text-blue-100 hover:text-yellow-400 transition-colors flex items-center justify-center md:justify-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-yellow-400" />
                    Ensino Fundamental
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Contato */}
            <div>
              <h4 className="font-bold text-lg mb-4 flex items-center justify-center md:justify-start">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center mr-2">
                  <Phone className="w-4 h-4 text-gray-900" />
                </div>
                Contato
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Phone className="w-4 h-4 text-yellow-400" />
                  <p className="text-blue-100">(32) 3721-2755 | (32) 98857-4727 (WhatsApp)</p>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Mail className="w-4 h-4 text-yellow-400" />
                  <p className="text-blue-100">escolapinguinhodegentec@gmail.com</p>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <MapPin className="w-4 h-4 text-yellow-400" />
                  <p className="text-blue-100">Avenida Dr. Passos, 41 - Muriaé/MG</p>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Clock className="w-4 h-4 text-yellow-400" />
                  <p className="text-blue-100">Seg-Sex: 7h às 18h</p>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Instagram className="w-4 h-4 text-yellow-400" />
                  <a 
                    href="https://www.instagram.com/escolapinguinhodegente" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-100 hover:text-yellow-400 transition-colors"
                  >
                    @escolapinguinhodegente
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-blue-400/30 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-blue-100 text-sm text-center md:text-left">
                &copy; 2025 Escola Pinguinho. Todos os direitos reservados.
              </p>
              <div className="flex items-center space-x-2">
                <p className="text-blue-100 text-sm">Desenvolvido com </p>
                <Heart className="w-4 h-4 text-yellow-400" />
                <p className="text-blue-100 text-sm">por </p>
                <a 
                  href="https://sgr.dev.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
                >
                  SGR Desenvolvimento
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}

import type { FichaCadastroResposta } from '../../../types/api';

/**
 * Funções utilitárias para formatação de dados
 */
const formatarData = (data: string | Date | null | undefined): string => {
  if (!data) return 'N/A';
  try {
    const dataObj = typeof data === 'string' ? new Date(data) : data;
    return dataObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return 'N/A';
  }
};

const formatarCPF = (cpf: string | null | undefined): string => {
  if (!cpf) return 'N/A';
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return cpf;
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

const formatarTelefone = (telefone: string | null | undefined): string => {
  if (!telefone) return 'N/A';
  const telLimpo = telefone.replace(/\D/g, '');
  if (telLimpo.length === 11) {
    return telLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (telLimpo.length === 10) {
    return telLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
};

/**
 * Gera o HTML completo para impressão da ficha de cadastro
 */
export const gerarHTMLImpressao = (ficha: FichaCadastroResposta): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Ficha de Cadastro - ${ficha.aluno.nome_aluno} ${ficha.aluno.sobrenome_aluno}</title>
        <style>
          @page {
            margin: 2cm;
            size: A4;
          }
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Arial', sans-serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 24pt;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .header p {
            font-size: 14pt;
            color: #666;
          }
          .section {
            margin-bottom: 25px;
            page-break-inside: avoid;
          }
          .section-title {
            background: linear-gradient(to right, #2563eb, #1e40af);
            color: white;
            padding: 10px 15px;
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 15px;
            border-radius: 5px;
          }
          .section-content {
            background: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e5e7eb;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 15px;
          }
          .field {
            background: white;
            padding: 10px;
            border-radius: 5px;
            border: 1px solid #e5e7eb;
          }
          .field-label {
            font-size: 9pt;
            color: #6b7280;
            text-transform: uppercase;
            font-weight: bold;
            margin-bottom: 5px;
            letter-spacing: 0.5px;
          }
          .field-value {
            font-size: 11pt;
            color: #111827;
            font-weight: 600;
          }
          .full-width {
            grid-column: 1 / -1;
          }
          .responsavel-card {
            background: white;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e5e7eb;
            margin-bottom: 15px;
          }
          .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 10pt;
            font-weight: bold;
          }
          .badge-ativo {
            background: #10b981;
            color: white;
          }
          .badge-transferido {
            background: #f59e0b;
            color: white;
          }
          .badge-outro {
            background: #6b7280;
            color: white;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            font-size: 10pt;
            color: #6b7280;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FICHA DE CADASTRO</h1>
          <p>Sistema Escolar Pinguinho de Gente</p>
        </div>

        <!-- Dados do Aluno -->
        <div class="section">
          <div class="section-title">👤 DADOS DO ALUNO</div>
          <div class="section-content">
            <div class="grid">
              <div class="field">
                <div class="field-label">Nome Completo</div>
                <div class="field-value">${ficha.aluno.nome_aluno} ${ficha.aluno.sobrenome_aluno}</div>
              </div>
              <div class="field">
                <div class="field-label">RA (Registro Acadêmico)</div>
                <div class="field-value">${ficha.matricula.ra || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Data de Nascimento</div>
                <div class="field-value">${formatarData(ficha.aluno.data_nascimento_aluno)}</div>
              </div>
              <div class="field">
                <div class="field-label">CPF</div>
                <div class="field-value">${formatarCPF(ficha.aluno.cpf_aluno)}</div>
              </div>
              <div class="field">
                <div class="field-label">RG</div>
                <div class="field-value">${ficha.aluno.rg_aluno || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Naturalidade</div>
                <div class="field-value">${ficha.aluno.naturalidade_aluno || 'N/A'}</div>
              </div>
              <div class="field full-width">
                <div class="field-label">Endereço</div>
                <div class="field-value">${ficha.aluno.endereco_aluno || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Bairro</div>
                <div class="field-value">${ficha.aluno.bairro_aluno || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">CEP</div>
                <div class="field-value">${ficha.aluno.cep_aluno || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Certidão de Nascimento -->
        <div class="section">
          <div class="section-title">📄 CERTIDÃO DE NASCIMENTO</div>
          <div class="section-content">
            <div class="grid">
              <div class="field">
                <div class="field-label">Livro</div>
                <div class="field-value">${ficha.certidao.livro_certidao || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Matrícula</div>
                <div class="field-value">${ficha.certidao.matricula_certidao || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Termo</div>
                <div class="field-value">${ficha.certidao.termo_certidao || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Folha</div>
                <div class="field-value">${ficha.certidao.folha_certidao || 'N/A'}</div>
              </div>
              <div class="field">
                <div class="field-label">Data de Expedição</div>
                <div class="field-value">${formatarData(ficha.certidao.data_expedicao_certidao)}</div>
              </div>
              <div class="field">
                <div class="field-label">Cartório</div>
                <div class="field-value">${ficha.certidao.nome_cartorio_certidao || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Responsáveis -->
        ${ficha.responsaveis && ficha.responsaveis.length > 0 ? `
        <div class="section">
          <div class="section-title">👥 RESPONSÁVEIS (${ficha.responsaveis.length})</div>
          <div class="section-content">
            ${ficha.responsaveis.map((responsavel) => `
              <div class="responsavel-card">
                <div class="grid">
                  <div class="field">
                    <div class="field-label">Nome</div>
                    <div class="field-value">${responsavel.nome_responsavel} ${responsavel.sobrenome_responsavel}</div>
                  </div>
                  <div class="field">
                    <div class="field-label">CPF</div>
                    <div class="field-value">${formatarCPF(responsavel.cpf_responsavel)}</div>
                  </div>
                  <div class="field">
                    <div class="field-label">RG</div>
                    <div class="field-value">${responsavel.rg_responsavel || 'N/A'}</div>
                  </div>
                  <div class="field">
                    <div class="field-label">Telefone</div>
                    <div class="field-value">${formatarTelefone(responsavel.telefone_responsavel)}</div>
                  </div>
                  <div class="field">
                    <div class="field-label">Email</div>
                    <div class="field-value">${responsavel.email_responsavel || 'N/A'}</div>
                  </div>
                  <div class="field">
                    <div class="field-label">Grau de Instrução</div>
                    <div class="field-value">${responsavel.grau_instrucao_responsavel || 'N/A'}</div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <!-- Dados de Saúde -->
        ${ficha.dados_saude ? `
        <div class="section">
          <div class="section-title">🏥 DADOS DE SAÚDE</div>
          <div class="section-content">
            <div class="grid">
              <div class="field">
                <div class="field-label">Vacinas em Dia</div>
                <div class="field-value">
                  <span class="badge ${ficha.dados_saude.vacinas_em_dia ? 'badge-ativo' : 'badge-outro'}">
                    ${ficha.dados_saude.vacinas_em_dia ? 'Sim' : 'Não'}
                  </span>
                </div>
              </div>
              ${ficha.dados_saude.alergias ? `
              <div class="field full-width">
                <div class="field-label">Alergias</div>
                <div class="field-value">${ficha.dados_saude.alergias}</div>
              </div>
              ` : ''}
              ${ficha.dados_saude.observacoes ? `
              <div class="field full-width">
                <div class="field-label">Observações</div>
                <div class="field-value">${ficha.dados_saude.observacoes}</div>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Matrícula -->
        <div class="section">
          <div class="section-title">📋 MATRÍCULA</div>
          <div class="section-content">
            <div class="grid">
              <div class="field">
                <div class="field-label">Data de Matrícula</div>
                <div class="field-value">${formatarData(ficha.matricula.data_matricula)}</div>
              </div>
              <div class="field">
                <div class="field-label">Status</div>
                <div class="field-value">
                  <span class="badge ${
                    ficha.matricula.status === 'ativo' ? 'badge-ativo' :
                    ficha.matricula.status === 'transferido' ? 'badge-transferido' :
                    'badge-outro'
                  }">
                    ${ficha.matricula.status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
          <p>Sistema Escolar Pinguinho de Gente - Todos os direitos reservados</p>
        </div>
      </body>
    </html>
  `;
};

/**
 * Abre uma nova janela e imprime a ficha de cadastro
 */
export const imprimirFicha = (ficha: FichaCadastroResposta): void => {
  // Criar uma nova janela para impressão
  const janelaImpressao = window.open('', '_blank');
  if (!janelaImpressao) {
    alert('Por favor, permita pop-ups para imprimir a ficha.');
    return;
  }

  // Gerar o HTML de impressão
  const conteudoImpressao = gerarHTMLImpressao(ficha);

  janelaImpressao.document.write(conteudoImpressao);
  janelaImpressao.document.close();

  // Aguardar o conteúdo carregar antes de imprimir
  setTimeout(() => {
    janelaImpressao.print();
  }, 250);
};


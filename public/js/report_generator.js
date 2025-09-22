// Configuração inicial
document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const templateSource = document.getElementById('templateSource');
    const predefinedSection = document.getElementById('predefinedTemplateSection');
    const customSection = document.getElementById('customTemplateSection');
    
    // Configuração inicial
    initReportGenerator();
    
    // Event listeners
    templateSource.addEventListener('change', toggleTemplateSource);
    document.getElementById('addFieldBtn').addEventListener('click', addCustomField);
    document.getElementById('generateBtn').addEventListener('click', generateDocument);
    document.getElementById('previewBtn').addEventListener('click', updatePreview);
    document.getElementById('downloadPreview').addEventListener('click', downloadModifiedDocx);
    document.getElementById('downloadPdf').addEventListener('click', downloadPdf);
});

// Inicializa o gerador de relatórios
function initReportGenerator() {
    // Configura data padrão para hoje
    document.getElementById('documentDate').valueAsDate = new Date();
    
    // Inicializa máscara de CPF
    if (typeof IMask !== 'undefined') {
        IMask(document.getElementById('clientCpf'), {
            mask: '000.000.000-00'
        });
    }
    
    // Configura botões de gênero
    const genderBtns = document.querySelectorAll('.gender-btn');
    genderBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            genderBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.getElementById('gender').value = this.dataset.value;
        });
    });

    // Configura o template source para "custom" por padrão
    document.getElementById('templateSource').value = 'custom';
    toggleTemplateSource.call(document.getElementById('templateSource'));
}

// Alterna entre templates pré-definidos e customizados
function toggleTemplateSource() {
    const source = this.value;
    predefinedSection.style.display = source === 'predefined' ? 'block' : 'none';
    customSection.style.display = source === 'custom' ? 'block' : 'none';
    
    // Limpa campos quando muda a fonte
    document.getElementById('templateSelect').value = '';
    document.getElementById('templateUpload').value = '';
    document.getElementById('placeholdersList').value = '';
}

// Adiciona campo personalizado
function addCustomField() {
    const fieldId = 'custom_' + Date.now();
    const fieldHTML = `
        <div class="custom-field" data-id="${fieldId}">
            <div class="custom-field-header">
                <input type="text" name="customFields[${fieldId}][name]" 
                       placeholder="Nome do campo (ex: ENDEREÇO)" class="form-control field-name">
                <button type="button" class="remove-field-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <input type="text" name="customFields[${fieldId}][value]" 
                   placeholder="Valor do campo" class="form-control field-value">
        </div>
    `;
    document.getElementById('dynamicFields').insertAdjacentHTML('beforeend', fieldHTML);
    
    // Adiciona evento para remover campo
    document.querySelector(`[data-id="${fieldId}"] .remove-field-btn`).addEventListener('click', function() {
        this.closest('.custom-field').remove();
    });
}

// Valida o formulário
function validateForm() {
    // Campos obrigatórios básicos
    const requiredFields = [
        'clientName', 'clientEmail', 'clientCpf', 'documentDate'
    ];
    
    // Verifica campos obrigatórios
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            alert(`Por favor, preencha o campo: ${field.labels[0].textContent}`);
            field.focus();
            return false;
        }
    }
    
    // Verifica gênero selecionado
    if (!document.getElementById('gender').value) {
        alert('Por favor, selecione o gênero.');
        return false;
    }
    
    // Verifica template upload
    const templateSource = document.getElementById('templateSource').value;
    if (templateSource === 'custom') {
        if (!document.getElementById('templateUpload').files.length) {
            alert('Por favor, selecione um arquivo DOCX para usar como template.');
            return false;
        }
    }
    
    return true;
}

// Coleta os dados do formulário
function collectFormData() {
    const formData = {
        templateSource: document.getElementById('templateSource').value,
        clientName: document.getElementById('clientName').value,
        gender: document.getElementById('gender').value,
        clientEmail: document.getElementById('clientEmail').value,
        clientCpf: document.getElementById('clientCpf').value,
        documentDate: document.getElementById('documentDate').value,
        customFields: {}
    };
    
    // Adiciona o template carregado
    if (formData.templateSource === 'custom') {
        formData.uploadedTemplate = document.getElementById('templateUpload').files[0];
    }
    
    // Coleta campos personalizados
    document.querySelectorAll('.custom-field').forEach(field => {
        const name = field.querySelector('.field-name').value;
        const value = field.querySelector('.field-value').value;
        if (name && value) {
            formData.customFields[name.toUpperCase().replace(/ /g, '_')] = value;
        }
    });
    
    return formData;
}

// Atualiza a pré-visualização
function updatePreview() {
    if (!validateForm()) return;
    
    const formData = collectFormData();
    const previewContent = document.getElementById('previewContent');
    
    let previewHTML = `
        <div class="document-preview-content">
            <h4>Pré-visualização das substituições</h4>
            <p><strong>Nome do Cliente:</strong> ${formData.clientName}</p>
            <p><strong>CPF:</strong> ${formData.clientCpf}</p>
            <p><strong>E-mail:</strong> ${formData.clientEmail}</p>
            <p><strong>Data do documento:</strong> ${new Date(formData.documentDate).toLocaleDateString('pt-BR')}</p>
            <p><strong>Gênero:</strong> ${formData.gender === 'masculino' ? 'Masculino' : 'Feminino'}</p>
            <hr>
            <p><strong>Template selecionado:</strong> ${formData.uploadedTemplate ? formData.uploadedTemplate.name : 'Modelo pré-definido'}</p>
    `;
    
    // Adiciona campos personalizados
    if (Object.keys(formData.customFields).length > 0) {
        previewHTML += '<h5>Campos Personalizados:</h5><ul class="preview-fields">';
        for (const [key, value] of Object.entries(formData.customFields)) {
            previewHTML += `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${value}</li>`;
        }
        previewHTML += '</ul>';
    }
    
    previewHTML += `
        <div class="preview-note">
            <i class="fas fa-info-circle"></i> Agora você pode baixar este documento como DOCX ou PDF!
        </div>
    </div>`;
    
    previewContent.innerHTML = previewHTML;
    
    // Mostra os botões de download
    document.getElementById('downloadPreview').style.display = 'inline-block';
    document.getElementById('downloadPdf').style.display = 'inline-block';
}

// Gera o documento final (DOCX) com substituição
async function generateDocument() {
    if (!validateForm()) return;
    
    showLoading();
    
    const formData = collectFormData();
    const templateFile = formData.uploadedTemplate;
    
    if (!templateFile) {
        hideLoading();
        alert('Por favor, selecione um arquivo DOCX para usar como template.');
        return;
    }
    
    try {
        // Substitui os placeholders no documento
        const modifiedDocx = await replacePlaceholders(templateFile, formData);
        
        // Armazena o documento modificado para download posterior
        window.modifiedDocx = modifiedDocx;
        
        // Atualiza a pré-visualização
        updatePreview();
        alert('Documento processado com sucesso! Clique em "Baixar DOCX" ou "Baixar PDF" para obter o arquivo.');
    } catch (error) {
        console.error('Erro ao processar documento:', error);
        alert('Ocorreu um erro ao processar o documento: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Substitui os placeholders no documento
async function replacePlaceholders(templateFile, formData) {
    // Carrega a biblioteca docx-templates
    const { createReport } = docxTemplates;
    
    // Configura os dados para substituição
    const replacements = {
        // Substitui [DENOMINAÇÃO/NOME] pelo nome do cliente
        '[DENOMINAÇÃO/NOME]': formData.clientName,
        '[NOME]': formData.clientName,
        '[CPF]': formData.clientCpf,
        '[EMAIL]': formData.clientEmail,
        '[DATA]': new Date(formData.documentDate).toLocaleDateString('pt-BR'),
        '[GÊNERO]': formData.gender
    };
    
    // Adiciona campos personalizados
    Object.entries(formData.customFields).forEach(([key, value]) => {
        replacements[`[${key}]`] = value;
    });
    
    // Lê o arquivo como ArrayBuffer
    const arrayBuffer = await readFileAsArrayBuffer(templateFile);
    
    // Cria o relatório com as substituições
    const report = await createReport({
        template: arrayBuffer,
        data: replacements,
        cmdDelimiter: ['{', '}'],
    });
    
    return new Blob([report], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

// Lê um arquivo como ArrayBuffer
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo'));
        reader.readAsArrayBuffer(file);
    });
}

// Baixa o DOCX modificado
function downloadModifiedDocx() {
    if (!window.modifiedDocx) {
        alert('Por favor, gere o documento primeiro.');
        return;
    }
    
    const url = URL.createObjectURL(window.modifiedDocx);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Documento_${document.getElementById('clientName').value.replace(/\s+/g, '_')}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Baixa o PDF usando jsPDF
function downloadPdf() {
    if (!validateForm()) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const formData = collectFormData();

    // Configuração do documento
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Documento de Cliente", 105, 20, { align: 'center' });

    // Linha divisória
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 30, 190, 30);

    // Informações básicas
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    let yPosition = 40;
    const addField = (label, value) => {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, 20, yPosition);
        doc.setFont("helvetica", "normal");
        doc.text(value, 60, yPosition);
        yPosition += 8;
    };

    addField("Nome do Cliente", formData.clientName);
    addField("CPF", formData.clientCpf);
    addField("E-mail", formData.clientEmail);
    addField("Data do Documento", new Date(formData.documentDate).toLocaleDateString('pt-BR'));
    addField("Gênero", formData.gender === 'masculino' ? 'Masculino' : 'Feminino');

    // Campos personalizados
    if (Object.keys(formData.customFields).length > 0) {
        yPosition += 10;
        doc.setFont("helvetica", "bold");
        doc.text("Campos Personalizados:", 20, yPosition);
        yPosition += 8;
        
        doc.setFont("helvetica", "normal");
        for (const [key, value] of Object.entries(formData.customFields)) {
            addField(key.replace(/_/g, ' '), value);
        }
    }

    // Rodapé
    yPosition += 15;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Gerado por LODS Works em ${new Date().toLocaleDateString('pt-BR')}`, 105, 280, { align: 'center' });

    // Salva o PDF
    doc.save(`Documento_${formData.clientName.replace(/\s+/g, "_")}.pdf`);
}

// Mostra o indicador de carregamento
function showLoading() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
}

// Esconde o indicador de carregamento
function hideLoading() {
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<i class="fas fa-file-word"></i> Gerar Documento';
}
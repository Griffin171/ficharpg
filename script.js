// Character Sheet Application
class CharacterSheet {
    constructor() {
        this.character = {
            name: '',
            class: '',
            origin: '',
            age: '',
            vida: { atual: 10, max: 10 },
            sanidade: { atual: 10, max: 10 },
            esforco: { atual: 10, max: 10 },
            attributes: {
                for: 1,
                agi: 1,
                int: 1,
                pre: 1,
                vig: 1
            },
            nex: 5,
            skills: {},
            items: [],
            rituals: [],
            abilities: []
        };
        
        this.init();
    }
    
    init() {
        this.loadCharacter();
        this.setupEventListeners();
        this.updateAllCalculations();
        this.updateNexDisplay();
    }
    
    setupEventListeners() {
        // Character info
        document.getElementById('character-name').addEventListener('input', (e) => {
            this.character.name = e.target.value;
            this.autoSave();
        });
        
        document.getElementById('character-class').addEventListener('change', (e) => {
            this.character.class = e.target.value;
            this.autoSave();
        });
        
        document.getElementById('character-origin').addEventListener('change', (e) => {
            this.character.origin = e.target.value;
            this.autoSave();
        });
        
        document.getElementById('character-age').addEventListener('input', (e) => {
            this.character.age = e.target.value;
            this.autoSave();
        });
        
        // Status bars
        this.setupStatusBarListeners();
        
        // Attributes
        this.setupAttributeListeners();
        
        // NEX slider
        document.getElementById('nex-slider').addEventListener('input', (e) => {
            this.character.nex = parseInt(e.target.value);
            this.updateNexDisplay();
            this.autoSave();
        });
        
        // Skills
        this.setupSkillListeners();
        
        // Tabs
        this.setupTabListeners();
        
        // Auto-save every 30 seconds
        setInterval(() => this.autoSave(), 30000);
    }
    
    setupStatusBarListeners() {
        const statusTypes = ['vida', 'sanidade', 'esforco'];
        
        statusTypes.forEach(type => {
            const atualInput = document.getElementById(`${type}-atual`);
            const maxInput = document.getElementById(`${type}-max`);
            
            atualInput.addEventListener('input', (e) => {
                this.character[type].atual = parseInt(e.target.value) || 0;
                this.updateStatusBar(type);
                this.autoSave();
            });
            
            maxInput.addEventListener('input', (e) => {
                this.character[type].max = parseInt(e.target.value) || 0;
                this.updateStatusBar(type);
                this.autoSave();
            });
        });
    }
    
    setupAttributeListeners() {
        const attributes = ['for', 'agi', 'int', 'pre', 'vig'];
        
        attributes.forEach(attr => {
            const input = document.getElementById(`attr-${attr}`);
            input.addEventListener('input', (e) => {
                this.character.attributes[attr] = parseInt(e.target.value) || 1;
                this.updateSkillCalculations();
                this.autoSave();
            });
        });
    }
    
    setupSkillListeners() {
        const skillItems = document.querySelectorAll('.pericia-item');
        
        skillItems.forEach(item => {
            const skillName = item.querySelector('.pericia-name').textContent;
            const nivelSelect = item.querySelector('.pericia-nivel');
            
            if (nivelSelect) {
                nivelSelect.addEventListener('change', (e) => {
                    const nivel = parseInt(e.target.value) || 0;
                    this.character.skills[skillName] = nivel;
                    this.updateSkillTotal(item);
                    this.autoSave();
                });
            }
        });
    }
    
    setupTabListeners() {
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }
    
    switchTab(tabName) {
        // Remove active class from all tabs and buttons
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        // Add active class to selected tab and button
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }
    
    updateStatusBar(type) {
        const fill = document.getElementById(`${type}-fill`);
        const atual = this.character[type].atual;
        const max = this.character[type].max;
        
        if (max > 0) {
            const percentage = Math.min((atual / max) * 100, 100);
            fill.style.width = `${percentage}%`;
        } else {
            fill.style.width = '0%';
        }
    }
    
    updateNexDisplay() {
        const nexValue = document.getElementById('nex-value');
        const nexFill = document.getElementById('nex-fill');
        
        nexValue.textContent = `${this.character.nex}%`;
        nexFill.style.width = `${this.character.nex}%`;
    }
    
    updateSkillCalculations() {
        const skillItems = document.querySelectorAll('.pericia-item');
        
        skillItems.forEach(item => {
            this.updateSkillTotal(item);
        });
    }
    
    updateSkillTotal(item) {
        const attrType = item.dataset.attr;
        const nivelSelect = item.querySelector('.pericia-nivel');
        const totalSpan = item.querySelector('.pericia-total');
        
        const attrValue = this.character.attributes[attrType];
        const nivel = parseInt(nivelSelect.value) || 0;
        const total =  nivel;
        
        totalSpan.textContent = total >= 0 ? `+${total}` : `${total}`;
    }
    
    updateAllCalculations() {
        this.updateStatusBar('vida');
        this.updateStatusBar('sanidade');
        this.updateStatusBar('esforco');
        this.updateSkillCalculations();
    }
    
    // Item Management
    addItem() {
        const nome = document.getElementById('item-nome').value.trim();
        const peso = document.getElementById('item-peso').value.trim();
        const descricao = document.getElementById('item-descricao').value.trim();
        const dano = document.getElementById('item-dano').value.trim();
        const critico = document.getElementById('item-critico').value.trim();
        const multiplicador = document.getElementById('item-multiplicador').value.trim();
        
        if (!nome) {
            this.showError('item-nome', 'Nome do item é obrigatório');
            return;
        }
        
        const item = {
            id: Date.now(),
            nome,
            peso,
            descricao,
            dano,
            critico,
            multiplicador
        };
        
        this.character.items.push(item);
        this.renderItems();
        this.clearItemForm();
        this.autoSave();
    }
    
    renderItems() {
        const itemsList = document.getElementById('items-list');
        itemsList.innerHTML = '';
        
        this.character.items.forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item-card fade-in';
            itemCard.innerHTML = `
                <button class="delete-btn" onclick="characterSheet.removeItem(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
                <h4>${item.nome}</h4>
                ${item.descricao ? `<p><strong>Descrição:</strong> ${item.descricao}</p>` : ''}
                <div class="item-stats">
                    ${item.peso ? `<span><strong>Peso:</strong> ${item.peso}</span>` : ''}
                    ${item.dano ? `<span><strong>Dano:</strong> ${item.dano}</span>` : ''}
                    ${item.critico ? `<span><strong>Crítico:</strong> ${item.critico}</span>` : ''}
                    ${item.multiplicador ? `<span><strong>Multiplicador:</strong> ${item.multiplicador}</span>` : ''}
                </div>
            `;
            itemsList.appendChild(itemCard);
        });
    }
    
    removeItem(id) {
        this.character.items = this.character.items.filter(item => item.id !== id);
        this.renderItems();
        this.autoSave();
    }
    
    clearItemForm() {
        document.getElementById('item-nome').value = '';
        document.getElementById('item-peso').value = '';
        document.getElementById('item-descricao').value = '';
        document.getElementById('item-dano').value = '';
        document.getElementById('item-critico').value = '';
        document.getElementById('item-multiplicador').value = '';
    }
    
    // Ritual Management
    addRitual() {
        const nome = document.getElementById('ritual-nome').value.trim();
        const elemento = document.getElementById('ritual-elemento').value;
        const esforco = document.getElementById('ritual-esforco').value;
        const alcance = document.getElementById('ritual-alcance').value.trim();
        const efeito = document.getElementById('ritual-efeito').value.trim();
        const descricao = document.getElementById('ritual-descricao').value.trim();
        
        if (!nome) {
            this.showError('ritual-nome', 'Nome do ritual é obrigatório');
            return;
        }
        
        const ritual = {
            id: Date.now(),
            nome,
            elemento,
            esforco: parseInt(esforco) || 0,
            alcance,
            efeito,
            descricao
        };
        
        this.character.rituals.push(ritual);
        this.renderRituals();
        this.clearRitualForm();
        this.autoSave();
    }
    
    renderRituals() {
        const ritualsList = document.getElementById('rituals-list');
        ritualsList.innerHTML = '';
        
        this.character.rituals.forEach(ritual => {
            const ritualCard = document.createElement('div');
            ritualCard.className = 'ritual-card fade-in';
            ritualCard.innerHTML = `
                <button class="delete-btn" onclick="characterSheet.removeRitual(${ritual.id})">
                    <i class="fas fa-times"></i>
                </button>
                <h4>${ritual.nome}</h4>
                ${ritual.efeito ? `<p><strong>Efeito:</strong> ${ritual.efeito}</p>` : ''}
                ${ritual.descricao ? `<p><strong>Descrição:</strong> ${ritual.descricao}</p>` : ''}
                <div class="ritual-stats">
                    <span><strong>Elemento:</strong> ${ritual.elemento}</span>
                    <span><strong>Esforço:</strong> ${ritual.esforco}</span>
                    ${ritual.alcance ? `<span><strong>Alcance:</strong> ${ritual.alcance}</span>` : ''}
                </div>
            `;
            ritualsList.appendChild(ritualCard);
        });
    }
    
    removeRitual(id) {
        this.character.rituals = this.character.rituals.filter(ritual => ritual.id !== id);
        this.renderRituals();
        this.autoSave();
    }
    
    clearRitualForm() {
        document.getElementById('ritual-nome').value = '';
        document.getElementById('ritual-elemento').value = 'medo';
        document.getElementById('ritual-esforco').value = '';
        document.getElementById('ritual-alcance').value = '';
        document.getElementById('ritual-efeito').value = '';
        document.getElementById('ritual-descricao').value = '';
    }
    
    // Ability Management
    addHabilidade() {
        const nome = document.getElementById('habilidade-nome').value.trim();
        const descricao = document.getElementById('habilidade-descricao').value.trim();
        const afinidade = document.getElementById('habilidade-afinidade').value.trim();
        
        if (!nome) {
            this.showError('habilidade-nome', 'Nome da habilidade é obrigatório');
            return;
        }
        
        const habilidade = {
            id: Date.now(),
            nome,
            descricao,
            afinidade
        };
        
        this.character.abilities.push(habilidade);
        this.renderAbilities();
        this.clearAbilityForm();
        this.autoSave();
    }
    
    renderAbilities() {
        const abilitiesList = document.getElementById('abilities-list');
        abilitiesList.innerHTML = '';
        
        this.character.abilities.forEach(ability => {
            const abilityCard = document.createElement('div');
            abilityCard.className = 'ability-card fade-in';
            abilityCard.innerHTML = `
                <button class="delete-btn" onclick="characterSheet.removeAbility(${ability.id})">
                    <i class="fas fa-times"></i>
                </button>
                <h4>${ability.nome}</h4>
                ${ability.descricao ? `<p><strong>Descrição:</strong> ${ability.descricao}</p>` : ''}
                ${ability.afinidade ? `<p><strong>Com Afinidade:</strong> ${ability.afinidade}</p>` : ''}
            `;
            abilitiesList.appendChild(abilityCard);
        });
    }
    
    removeAbility(id) {
        this.character.abilities = this.character.abilities.filter(ability => ability.id !== id);
        this.renderAbilities();
        this.autoSave();
    }
    
    clearAbilityForm() {
        document.getElementById('habilidade-nome').value = '';
        document.getElementById('habilidade-descricao').value = '';
        document.getElementById('habilidade-afinidade').value = '';
    }
    
    // Error handling
    showError(elementId, message) {
        const element = document.getElementById(elementId);
        element.classList.add('invalid');
        
        // Remove error after 3 seconds
        setTimeout(() => {
            element.classList.remove('invalid');
        }, 3000);
        
        // Show toast notification
        this.showToast(message, 'error');
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff6666' : '#6a4c93'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // Data Management
    saveCharacter() {
        try {
            const dataStr = JSON.stringify(this.character, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${this.character.name || 'personagem'}_ficha.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            this.showToast('Personagem salvo com sucesso!', 'success');
        } catch (error) {
            this.showToast('Erro ao salvar personagem', 'error');
        }
    }
    
    loadCharacter() {
        try {
            const savedData = localStorage.getItem('ordemParanormalCharacter');
            if (savedData) {
                this.character = { ...this.character, ...JSON.parse(savedData) };
                this.populateForm();
            }
        } catch (error) {
            console.log('Erro ao carregar personagem:', error);
        }
    }
    
    populateForm() {
        // Character info
        document.getElementById('character-name').value = this.character.name || '';
        document.getElementById('character-class').value = this.character.class || '';
        document.getElementById('character-origin').value = this.character.origin || '';
        document.getElementById('character-age').value = this.character.age || '';
        
        // Status bars
        document.getElementById('vida-atual').value = this.character.vida.atual;
        document.getElementById('vida-max').value = this.character.vida.max;
        document.getElementById('sanidade-atual').value = this.character.sanidade.atual;
        document.getElementById('sanidade-max').value = this.character.sanidade.max;
        document.getElementById('esforco-atual').value = this.character.esforco.atual;
        document.getElementById('esforco-max').value = this.character.esforco.max;
        
        // Attributes
        Object.keys(this.character.attributes).forEach(attr => {
            document.getElementById(`attr-${attr}`).value = this.character.attributes[attr];
        });
        
        // NEX
        document.getElementById('nex-slider').value = this.character.nex;
        
        // Skills
        const skillItems = document.querySelectorAll('.pericia-item');
        skillItems.forEach(item => {
            const skillName = item.querySelector('.pericia-name').textContent;
            const nivelSelect = item.querySelector('.pericia-nivel');
            if (this.character.skills[skillName] !== undefined) {
                nivelSelect.value = this.character.skills[skillName];
            }
        });
        
        // Render items, rituals, and abilities
        this.renderItems();
        this.renderRituals();
        this.renderAbilities();
    }
    
    autoSave() {
        try {
            localStorage.setItem('ordemParanormalCharacter', JSON.stringify(this.character));
        } catch (error) {
            console.log('Erro ao salvar automaticamente:', error);
        }
    }
    
    resetCharacter() {
        if (confirm('Tem certeza que deseja resetar a ficha? Todos os dados serão perdidos.')) {
            localStorage.removeItem('ordemParanormalCharacter');
            location.reload();
        }
    }
}

// Global functions for HTML onclick events
function addItem() {
    characterSheet.addItem();
}

function addRitual() {
    characterSheet.addRitual();
}

function addHabilidade() {
    characterSheet.addHabilidade();
}

function saveCharacter() {
    characterSheet.saveCharacter();
}

function loadCharacter() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    characterSheet.character = { ...characterSheet.character, ...data };
                    characterSheet.populateForm();
                    characterSheet.updateAllCalculations();
                    characterSheet.updateNexDisplay();
                    characterSheet.autoSave();
                    characterSheet.showToast('Personagem carregado com sucesso!', 'success');
                } catch (error) {
                    characterSheet.showToast('Erro ao carregar arquivo', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function resetCharacter() {
    characterSheet.resetCharacter();
}

// Initialize the application
const characterSheet = new CharacterSheet();
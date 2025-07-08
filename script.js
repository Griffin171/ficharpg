// Character Sheet Application
class CharacterSheet {
    constructor() {
        this.character = {
            name: '',
            class: '',
            origin: '',
            age: '',
            def: 0,
            esquiva: 0,
            dtr: 10,
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
        document.getElementById('character-name').addEventListener('input', (e) => {
            this.character.name = e.target.value;
            this.autoSave();
        });

        document.getElementById('def').addEventListener('input', (e) => {
            this.character.def = parseInt(e.target.value) || 0;
            this.autoSave();
        });

        document.getElementById('esquiva').addEventListener('input', (e) => {
            this.character.esquiva = parseInt(e.target.value) || 0;
            this.autoSave();
        });

        document.getElementById('dtr').addEventListener('input', (e) => {
            this.character.dtr = parseInt(e.target.value) || 10;
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

        this.setupStatusBarListeners();
        this.setupAttributeListeners();
        this.setupSkillListeners();
        this.setupTabListeners();

        document.getElementById('nex-slider').addEventListener('input', (e) => {
            this.character.nex = parseInt(e.target.value);
            this.updateNexDisplay();
            this.autoSave();
        });

        setInterval(() => this.autoSave(), 30000);
    }

    setupStatusBarListeners() {
        ['vida', 'sanidade', 'esforco'].forEach(type => {
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
        ['for', 'agi', 'int', 'pre', 'vig'].forEach(attr => {
            const input = document.getElementById(`attr-${attr}`);
            input.addEventListener('input', (e) => {
                this.character.attributes[attr] = parseInt(e.target.value) || 1;
                this.updateSkillCalculations();
                this.autoSave();
            });
        });
    }

    setupSkillListeners() {
        document.querySelectorAll('.pericia-item').forEach(item => {
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
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));

        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    }

    updateStatusBar(type) {
        const fill = document.getElementById(`${type}-fill`);
        const { atual, max } = this.character[type];
        const percentage = max > 0 ? Math.min((atual / max) * 100, 100) : 0;
        fill.style.width = `${percentage}%`;
    }

    updateNexDisplay() {
        document.getElementById('nex-value').textContent = `${this.character.nex}%`;
        document.getElementById('nex-fill').style.width = `${this.character.nex}%`;
    }

    updateSkillCalculations() {
        document.querySelectorAll('.pericia-item').forEach(item => this.updateSkillTotal(item));
    }

    updateSkillTotal(item) {
        const attrType = item.dataset.attr;
        const nivel = parseInt(item.querySelector('.pericia-nivel').value) || 0;
        item.querySelector('.pericia-total').textContent = nivel >= 0 ? `+${nivel}` : `${nivel}`;
    }

    updateAllCalculations() {
        ['vida', 'sanidade', 'esforco'].forEach(type => this.updateStatusBar(type));
        this.updateSkillCalculations();
    }

    addItem() {
        const nome = document.getElementById('item-nome').value.trim();
        if (!nome) return this.showError('item-nome', 'Nome do item é obrigatório');

        const item = {
            id: Date.now(),
            nome,
            peso: document.getElementById('item-peso').value.trim(),
            descricao: document.getElementById('item-descricao').value.trim(),
            dano: document.getElementById('item-dano').value.trim(),
            critico: document.getElementById('item-critico').value.trim(),
            multiplicador: document.getElementById('item-multiplicador').value.trim()
        };

        this.character.items.push(item);
        this.renderItems();
        this.clearItemForm();
        this.autoSave();
    }

    renderItems() {
        const list = document.getElementById('items-list');
        list.innerHTML = '';
        this.character.items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'item-card fade-in';
            div.innerHTML = `
                <button class="delete-btn" onclick="characterSheet.removeItem(${item.id})"><i class="fas fa-times"></i></button>
                <h4>${item.nome}</h4>
                ${item.descricao ? `<p><strong>Descrição:</strong> ${item.descricao}</p>` : ''}
                <div class="item-stats">
                    ${item.peso ? `<span><strong>Peso:</strong> ${item.peso}</span>` : ''}
                    ${item.dano ? `<span><strong>Dano:</strong> ${item.dano}</span>` : ''}
                    ${item.critico ? `<span><strong>Crítico:</strong> ${item.critico}</span>` : ''}
                    ${item.multiplicador ? `<span><strong>Multiplicador:</strong> ${item.multiplicador}</span>` : ''}
                </div>
            `;
            list.appendChild(div);
        });
    }

    removeItem(id) {
        this.character.items = this.character.items.filter(i => i.id !== id);
        this.renderItems();
        this.autoSave();
    }

    clearItemForm() {
        ['item-nome', 'item-peso', 'item-descricao', 'item-dano', 'item-critico', 'item-multiplicador'].forEach(id => {
            document.getElementById(id).value = '';
        });
    }

    addRitual() {
        const nome = document.getElementById('ritual-nome').value.trim();
        if (!nome) return this.showError('ritual-nome', 'Nome do ritual é obrigatório');

        const ritual = {
            id: Date.now(),
            nome,
            elemento: document.getElementById('ritual-elemento').value,
            esforco: parseInt(document.getElementById('ritual-esforco').value) || 0,
            alcance: document.getElementById('ritual-alcance').value.trim(),
            efeito: document.getElementById('ritual-efeito').value.trim(),
            descricao: document.getElementById('ritual-descricao').value.trim()
        };

        this.character.rituals.push(ritual);
        this.renderRituals();
        this.clearRitualForm();
        this.autoSave();
    }

    renderRituals() {
        const list = document.getElementById('rituals-list');
        list.innerHTML = '';
        this.character.rituals.forEach(r => {
            const div = document.createElement('div');
            div.className = 'ritual-card fade-in';
            div.innerHTML = `
                <button class="delete-btn" onclick="characterSheet.removeRitual(${r.id})"><i class="fas fa-times"></i></button>
                <h4>${r.nome}</h4>
                ${r.efeito ? `<p><strong>Efeito:</strong> ${r.efeito}</p>` : ''}
                ${r.descricao ? `<p><strong>Descrição:</strong> ${r.descricao}</p>` : ''}
                <div class="ritual-stats">
                    <span><strong>Elemento:</strong> ${r.elemento}</span>
                    <span><strong>Esforço:</strong> ${r.esforco}</span>
                    ${r.alcance ? `<span><strong>Alcance:</strong> ${r.alcance}</span>` : ''}
                </div>
            `;
            list.appendChild(div);
        });
    }

    removeRitual(id) {
        this.character.rituals = this.character.rituals.filter(r => r.id !== id);
        this.renderRituals();
        this.autoSave();
    }

    clearRitualForm() {
        ['ritual-nome', 'ritual-esforco', 'ritual-alcance', 'ritual-efeito', 'ritual-descricao'].forEach(id => {
            document.getElementById(id).value = '';
        });
        document.getElementById('ritual-elemento').value = 'medo';
    }

    addHabilidade() {
        const nome = document.getElementById('habilidade-nome').value.trim();
        if (!nome) return this.showError('habilidade-nome', 'Nome da habilidade é obrigatório');

        const habilidade = {
            id: Date.now(),
            nome,
            descricao: document.getElementById('habilidade-descricao').value.trim(),
            afinidade: document.getElementById('habilidade-afinidade').value.trim()
        };

        this.character.abilities.push(habilidade);
        this.renderAbilities();
        this.clearAbilityForm();
        this.autoSave();
    }

    renderAbilities() {
        const list = document.getElementById('abilities-list');
        list.innerHTML = '';
        this.character.abilities.forEach(h => {
            const div = document.createElement('div');
            div.className = 'ability-card fade-in';
            div.innerHTML = `
                <button class="delete-btn" onclick="characterSheet.removeAbility(${h.id})"><i class="fas fa-times"></i></button>
                <h4>${h.nome}</h4>
                ${h.descricao ? `<p><strong>Descrição:</strong> ${h.descricao}</p>` : ''}
                ${h.afinidade ? `<p><strong>Com Afinidade:</strong> ${h.afinidade}</p>` : ''}
            `;
            list.appendChild(div);
        });
    }

    removeAbility(id) {
        this.character.abilities = this.character.abilities.filter(h => h.id !== id);
        this.renderAbilities();
        this.autoSave();
    }

    clearAbilityForm() {
        ['habilidade-nome', 'habilidade-descricao', 'habilidade-afinidade'].forEach(id => {
            document.getElementById(id).value = '';
        });
    }

    showError(id, msg) {
        const el = document.getElementById(id);
        el.classList.add('invalid');
        setTimeout(() => el.classList.remove('invalid'), 3000);
        this.showToast(msg, 'error');
    }

    showToast(msg, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = msg;
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
        setTimeout(() => toast.remove(), 3000);
    }

    saveCharacter() {
        try {
            const blob = new Blob([JSON.stringify(this.character, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.character.name || 'personagem'}_ficha.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showToast('Personagem salvo com sucesso!', 'success');
        } catch {
            this.showToast('Erro ao salvar personagem', 'error');
        }
    }

    loadCharacter() {
        try {
            const data = localStorage.getItem('ordemParanormalCharacter');
            if (data) {
                this.character = { ...this.character, ...JSON.parse(data) };
                this.populateForm();
            }
        } catch (err) {
            console.error('Erro ao carregar personagem:', err);
        }
    }

    populateForm() {
        document.getElementById('character-name').value = this.character.name || '';
        document.getElementById('character-class').value = this.character.class || '';
        document.getElementById('character-origin').value = this.character.origin || '';
        document.getElementById('character-age').value = this.character.age || '';
        document.getElementById('def').value = this.character.def || 0;
        document.getElementById('esquiva').value = this.character.esquiva || 0;
        document.getElementById('dtr').value = this.character.dtr || 10;

        document.getElementById('vida-atual').value = this.character.vida.atual;
        document.getElementById('vida-max').value = this.character.vida.max;
        document.getElementById('sanidade-atual').value = this.character.sanidade.atual;
        document.getElementById('sanidade-max').value = this.character.sanidade.max;
        document.getElementById('esforco-atual').value = this.character.esforco.atual;
        document.getElementById('esforco-max').value = this.character.esforco.max;

        Object.entries(this.character.attributes).forEach(([key, val]) => {
            document.getElementById(`attr-${key}`).value = val;
        });

        document.getElementById('nex-slider').value = this.character.nex;

        document.querySelectorAll('.pericia-item').forEach(item => {
            const name = item.querySelector('.pericia-name').textContent;
            if (this.character.skills[name] !== undefined) {
                item.querySelector('.pericia-nivel').value = this.character.skills[name];
            }
        });

        this.renderItems();
        this.renderRituals();
        this.renderAbilities();
    }

    autoSave() {
        try {
            localStorage.setItem('ordemParanormalCharacter', JSON.stringify(this.character));
        } catch {}
    }

    resetCharacter() {
        if (confirm('Tem certeza que deseja resetar a ficha?')) {
            localStorage.removeItem('ordemParanormalCharacter');
            location.reload();
        }
    }
}

// Global Functions
function addItem() { characterSheet.addItem(); }
function addRitual() { characterSheet.addRitual(); }
function addHabilidade() { characterSheet.addHabilidade(); }
function saveCharacter() { characterSheet.saveCharacter(); }
function resetCharacter() { characterSheet.resetCharacter(); }

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
                } catch {
                    characterSheet.showToast('Erro ao carregar arquivo', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Start App
const characterSheet = new CharacterSheet();

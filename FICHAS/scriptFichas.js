// Character Sheet Application
class CharacterSheet {
    constructor() {
        // Definir chave de storage dinâmica com base no nome do arquivo
        const id = window.location.pathname.split("/").pop().replace(".html", "");
        this.storageKey = `ordemParanormalCharacter_${id}`;

        // Estado inicial do personagem
        this.character = {
            name: '',
            class: '',
            origin: '',
            age: '',
            def: 0,
            esquiva: 0,
            dtr: 10,
            imageBase64: '',
            vida: { atual: 10, max: 10 },
            sanidade: { atual: 10, max: 10 },
            esforco: { atual: 10, max: 10 },
            attributes: { for: 1, agi: 1, int: 1, pre: 1, vig: 1 },
            nex: 5,
            skills: {},
            items: [],
            rituals: [],
            abilities: []
        };
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.populateForm();
        this.setupEventListeners();
        this.updateAllCalculations();
        this.updateNexDisplay();
        this.setupImageListener();
    }

    // Salva no localStorage usando chave dinâmica
    autoSave() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.character));
        } catch (e) {
            console.error('Erro ao salvar no storage:', e);
        }
    }

    // Carrega do localStorage
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                this.character = { ...this.character, ...JSON.parse(data) };
            }
        } catch (e) {
            console.error('Erro ao carregar do storage:', e);
        }
    }

    // Popula campos do formulário
    populateForm() {
        // Campos básicos
        document.getElementById('character-name').value = this.character.name;
        document.getElementById('character-class').value = this.character.class;
        document.getElementById('character-origin').value = this.character.origin;
        document.getElementById('character-age').value = this.character.age;
        document.getElementById('def').value = this.character.def;
        document.getElementById('esquiva').value = this.character.esquiva;
        document.getElementById('dtr').value = this.character.dtr;

        // Barras de status
        ['vida', 'sanidade', 'esforco'].forEach(type => {
            const atual = this.character[type].atual;
            const max = this.character[type].max;
            document.getElementById(`${type}-atual`).value = atual;
            document.getElementById(`${type}-max`).value = max;
        });

        // Atributos
        Object.entries(this.character.attributes).forEach(([key, val]) => {
            document.getElementById(`attr-${key}`).value = val;
        });

        // NEX
        document.getElementById('nex-slider').value = this.character.nex;

        // Imagem
        if (this.character.imageBase64) {
            document.getElementById('character-preview').src = this.character.imageBase64;
        }

        // Perícias
        document.querySelectorAll('.pericia-item').forEach(item => {
            const name = item.querySelector('.pericia-name').textContent;
            const sel = item.querySelector('.pericia-nivel');
            if (this.character.skills[name] != null) {
                sel.value = this.character.skills[name];
            }
            this.updateSkillTotal(item);
        });

        // Itens, rituais e habilidades
        this.renderItems();
        this.renderRituals();
        this.renderAbilities();
    }

    setupImageListener() {
        const input = document.getElementById('character-image');
        const preview = document.getElementById('character-preview');
        input.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                this.character.imageBase64 = reader.result;
                preview.src = reader.result;
                this.autoSave();
            };
            reader.readAsDataURL(file);
        });
    }

    setupEventListeners() {
        // Inputs básicos
        ['character-name','class','origin','age','def','esquiva','dtr'].forEach(id => {
            const el = document.getElementById(`character-${id}`) || document.getElementById(id);
            if (el) {
                el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', e => {
                    const key = id === 'class' ? 'class' : id;
                    this.character[key] = el.value;
                    this.autoSave();
                });
            }
        });

        // NEX slider
        const nex = document.getElementById('nex-slider');
        nex.addEventListener('input', e => {
            this.character.nex = parseInt(e.target.value);
            this.updateNexDisplay();
            this.autoSave();
        });

        // Barras de status
        ['vida','sanidade','esforco'].forEach(type => {
            ['atual','max'].forEach(prop => {
                const el = document.getElementById(`${type}-${prop}`);
                el.addEventListener('input', e => {
                    this.character[type][prop] = parseInt(e.target.value) || this.character[type][prop];
                    this.updateStatusBar(type);
                    this.autoSave();
                });
            });
        });

        // Atributos
        ['for','agi','int','pre','vig'].forEach(attr => {
            const el = document.getElementById(`attr-${attr}`);
            el.addEventListener('input', e => {
                this.character.attributes[attr] = parseInt(el.value) || 1;
                this.updateSkillCalculations();
                this.autoSave();
            });
        });

        // Perícias
        document.querySelectorAll('.pericia-item').forEach(item => {
            const name = item.querySelector('.pericia-name').textContent;
            const sel = item.querySelector('.pericia-nivel');
            sel.addEventListener('change', e => {
                this.character.skills[name] = parseInt(sel.value);
                this.updateSkillTotal(item);
                this.autoSave();
            });
        });

        // Tabs
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', e => this.switchTab(btn.dataset.tab));
        });

        // Auto save periódico
        setInterval(() => this.autoSave(), 30000);
    }

    // Alternar abas
    switchTab(tab) {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.getElementById(tab).classList.add('active');
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    }

    updateStatusBar(type) {
        const fill = document.getElementById(`${type}-fill`);
        const { atual, max } = this.character[type];
        const pct = max>0?Math.min((atual/max)*100,100):0;
        fill.style.width = `${pct}%`;
    }

    updateNexDisplay() {
        document.getElementById('nex-value').textContent = `${this.character.nex}%`;
        document.getElementById('nex-fill').style.width = `${this.character.nex}%`;
    }

    updateSkillCalculations() {
        document.querySelectorAll('.pericia-item').forEach(item => this.updateSkillTotal(item));
    }

    updateSkillTotal(item) {
        const nivel = parseInt(item.querySelector('.pericia-nivel').value) || 0;
        item.querySelector('.pericia-total').textContent = nivel >= 0 ? `+${nivel}` : `${nivel}`;
    }

    updateAllCalculations() {
        ['vida','sanidade','esforco'].forEach(type => this.updateStatusBar(type));
        this.updateSkillCalculations();
    }

    // Itens
    addItem() {
        const nome = document.getElementById('item-nome').value.trim();
        if (!nome) return this.showError('item-nome','Nome do item é obrigatório');
        const item = {
            id: Date.now(), nome,
            peso: document.getElementById('item-peso').value.trim(),
            descricao: document.getElementById('item-descricao').value.trim(),
            dano: document.getElementById('item-dano').value.trim(),
            critico: document.getElementById('item-critico').value.trim(),
            multiplicador: document.getElementById('item-multiplicador').value.trim()
        };
        this.character.items.push(item); this.renderItems(); this.clearItemForm(); this.autoSave();
    }
    renderItems() {
        const list = document.getElementById('items-list'); list.innerHTML = '';
        this.character.items.forEach(i=>{
            const div=document.createElement('div'); div.className='item-card fade-in';
            div.innerHTML=`<button class="delete-btn" onclick="characterSheet.removeItem(${i.id})"><i class="fas fa-times"></i></button>
                <h4>${i.nome}</h4>
                ${i.descricao?`<p><strong>Descrição:</strong> ${i.descricao}</p>`:''}
                <div class="item-stats">
                  ${i.peso?`<span><strong>Peso:</strong> ${i.peso}</span>`:''}
                  ${i.dano?`<span><strong>Dano:</strong> ${i.dano}</span>`:''}
                  ${i.critico?`<span><strong>Crítico:</strong> ${i.critico}</span>`:''}
                  ${i.multiplicador?`<span><strong>Multiplicador:</strong> ${i.multiplicador}</span>`:''}
                </div>
            `;
            list.appendChild(div);
        });
    }
    removeItem(id) { this.character.items=this.character.items.filter(i=>i.id!==id); this.renderItems(); this.autoSave(); }
    clearItemForm(){['item-nome','item-peso','item-descricao','item-dano','item-critico','item-multiplicador']
        .forEach(id=>document.getElementById(id).value=''); }

    // Rituais
    addRitual() {
        const nome=document.getElementById('ritual-nome').value.trim();
        if(!nome) return this.showError('ritual-nome','Nome do ritual é obrigatório');
        const r={ id:Date.now(), nome,
            elemento:document.getElementById('ritual-elemento').value,
            esforco:parseInt(document.getElementById('ritual-esforco').value)||0,
            alcance:document.getElementById('ritual-alcance').value.trim(),
            efeito:document.getElementById('ritual-efeito').value.trim(),
            descricao:document.getElementById('ritual-descricao').value.trim()
        };
        this.character.rituals.push(r); this.renderRituals(); this.clearRitualForm(); this.autoSave();
    }
    renderRituals(){ const list=document.getElementById('rituals-list'); list.innerHTML='';
        this.character.rituals.forEach(r=>{
            const div=document.createElement('div'); div.className='ritual-card fade-in';
            div.innerHTML=`<button class="delete-btn" onclick="characterSheet.removeRitual(${r.id})"><i class="fas fa-times"></i></button>
                <h4>${r.nome}</h4>
                ${r.efeito?`<p><strong>Efeito:</strong> ${r.efeito}</p>`:''}
                ${r.descricao?`<p><strong>Descrição:</strong> ${r.descricao}</p>`:''}
                <div class="ritual-stats">
                  <span><strong>Elemento:</strong> ${r.elemento}</span>
                  <span><strong>Esforço:</strong> ${r.esforco}</span>
                  ${r.alcance?`<span><strong>Alcance:</strong> ${r.alcance}</span>`:''}
                </div>
            `; list.appendChild(div);
        }); }
    removeRitual(id){ this.character.rituals=this.character.rituals.filter(r=>r.id!==id);
        this.renderRituals(); this.autoSave(); }
    clearRitualForm(){['ritual-nome','ritual-esforco','ritual-alcance','ritual-efeito','ritual-descricao']
        .forEach(id=>document.getElementById(id).value='');
        document.getElementById('ritual-elemento').value='medo'; }

    // Habilidades
    addAbility(){ const nome=document.getElementById('habilidade-nome').value.trim();
        if(!nome) return this.showError('habilidade-nome','Nome da habilidade é obrigatório');
        const h={ id:Date.now(), nome,
            descricao:document.getElementById('habilidade-descricao').value.trim(),
            afinidade:document.getElementById('habilidade-afinidade').value.trim() };
        this.character.abilities.push(h); this.renderAbilities(); this.clearAbilityForm(); this.autoSave(); }
    renderAbilities(){ const list=document.getElementById('abilities-list'); list.innerHTML='';
        this.character.abilities.forEach(h=>{
            const div=document.createElement('div'); div.className='ability-card fade-in';
            div.innerHTML=`<button class="delete-btn" onclick="characterSheet.removeAbility(${h.id})"><i class="fas fa-times"></i></button>
                <h4>${h.nome}</h4>
                ${h.descricao?`<p><strong>Descrição:</strong> ${h.descricao}</p>`:''}
                ${h.afinidade?`<p><strong>Afinidade:</strong> ${h.afinidade}</p>`:''}
            `; list.appendChild(div);
        }); }
    removeAbility(id){ this.character.abilities=this.character.abilities.filter(h=>h.id!==id);
        this.renderAbilities(); this.autoSave(); }
    clearAbilityForm(){['habilidade-nome','habilidade-descricao','habilidade-afinidade']
        .forEach(id=>document.getElementById(id).value=''); }

    // Mensagens e toasts
    showError(id,msg){ const el=document.getElementById(id);
        el.classList.add('invalid'); setTimeout(()=>el.classList.remove('invalid'),3000);
        this.showToast(msg,'error'); }
    showToast(msg,type='info'){ const toast=document.createElement('div');
        toast.className=`toast ${type}`; toast.textContent=msg;
        toast.style.cssText=`position:fixed;top:20px;right:20px;background:${type==='error'?'#ff6666':'#6a4c93'};color:#fff;padding:15px 20px;border-radius:8px;z-index:1000;animation:slideIn 0.3s ease;`;
        document.body.appendChild(toast); setTimeout(()=>toast.remove(),3000); }

    // Exportar JSON
    saveCharacter(){
        try {
            const blob = new Blob([JSON.stringify(this.character,null,2)],{type:'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.character.name||'personagem'}_ficha.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.showToast('Personagem salvo!', 'success');
        } catch {
            this.showToast('Erro ao salvar', 'error');
        }
    }

    // Resetar ficha (storage dinâmico)
    resetCharacter(){
        if(confirm('Tem certeza que deseja resetar a ficha?')){
            localStorage.removeItem(this.storageKey);
            location.reload();
        }
    }
}

// Funções globais para HTML
function addItem() { characterSheet.addItem(); }
function addRitual() { characterSheet.addRitual(); }
function addHabilidade() { characterSheet.addAbility(); }
function saveCharacter() { characterSheet.saveCharacter(); }
function resetCharacter() { characterSheet.resetCharacter(); }

// Carregar via arquivo JSON
function loadCharacter() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = evt => {
                try {
                    const data = JSON.parse(evt.target.result);
                    characterSheet.character = { ...characterSheet.character, ...data};
                    characterSheet.populateForm();
                    characterSheet.updateAllCalculations();
                    characterSheet.updateNexDisplay();
                    characterSheet.autoSave();
                    characterSheet.showToast('Ficha carregada!', 'success');
                } catch {
                    characterSheet.showToast('Erro ao carregar arquivo', 'error');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Inicializa aplicação
const characterSheet = new CharacterSheet();

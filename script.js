const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
  button.addEventListener('click', () => {
    // Remove active das abas
    tabButtons.forEach(btn => btn.classList.remove('active'));
    // Adiciona active na aba clicada
    button.classList.add('active');

    // Mostra conteúdo relacionado e esconde os outros
    const tab = button.getAttribute('data-tab');
    tabContents.forEach(content => {
      if(content.id === tab) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }

      // Esconde flores se a aba for Artes
      const flor = document.getElementById('flor');
      const flor2 = document.getElementById('flor2');
      const flor3 = document.getElementById('flor3');
      const flor4 = document.getElementById('flor4');
      if (tab === 'artes') {
        flor3.style.display = 'none';
        flor4.style.display = 'none';
      } else {
        flor3.style.display = 'flex';
        flor4.style.display = 'flex';
      }

    });
  });
});


// Função para simular digitação com erro proposital
function digitarTextoComErro(elementId, textoCorreto, tempoCursor = 5000) {
  const el = document.getElementById("typewriter");
  const erroSimulado = "RPG de Mierda"; // erro proposital
  const velocidade = 100; // ms por caractere
  const delayErro = 800;  // ms antes de apagar erro
  const textoFinal = textoCorreto;

  let index = 0;
  el.textContent = "";
  el.classList.add("blink");

  function digitar(texto, callback) {
    if (index < texto.length) {
      el.textContent += texto.charAt(index);
      index++;
      setTimeout(() => digitar(texto, callback), velocidade);
    } else {
      if (callback) callback();
    }
  }

  function corrigirErro() {
    setTimeout(() => {
      const apagar = () => {
        if (index > 8) { // "RPG de M" (até o erro "i")
          el.textContent = el.textContent.slice(0, -1);
          index--;
          setTimeout(apagar, 60);
        } else {
          const textoCorretoRestante = textoFinal.slice(index);
          let novaIndex = 0;

        function digitarCorrecao() {
          if (novaIndex < textoCorretoRestante.length) {
            el.textContent += textoCorretoRestante.charAt(novaIndex);
            novaIndex++;
            setTimeout(digitarCorrecao, velocidade);
          }
        }

digitarCorrecao();
        }
      };
      apagar();
    }, delayErro);
  }

  digitar(erroSimulado, corrigirErro);

  // Parar cursor após tempo determinado
  setTimeout(() => {
    el.classList.remove("blink");
    el.style.borderRight = "none";
  }, tempoCursor);
}

// Chamar quando o site carregar
window.onload = function () {
  digitarTextoComErro("typewriter", "RPG de Merda");
};

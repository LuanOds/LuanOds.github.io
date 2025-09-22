  function calcular() {
    const G = parseFloat(document.getElementById("G").value) || 0;
    const F = parseFloat(document.getElementById("F").value) || 0;
    const I = parseFloat(document.getElementById("I").value) || 0;
    const T = parseFloat(document.getElementById("T").value) || 0;
    const D_percent = parseFloat(document.getElementById("D").value) || 0;

    // Converter % para decimal
    const D = D_percent / 100;

    // Cálculos
    const E = D * T * I;               // Economia
    const Z = (1 - D) * T * I;         // Repasse (sobra do desconto)
    const EBT = (G * I) / F;           // Economia Base Tarifária
    const NE = E + EBT;                // Nova Economia
    const BT = 100 * (NE / (Z + NE));  // Percentual BT

    // Exibir resultados
    document.getElementById("resE").innerText = `Economia (E): R$ ${E.toFixed(2)}`;
    document.getElementById("resZ").innerText = `Repasse (Z): R$ ${Z.toFixed(2)}`;
    document.getElementById("resEBT").innerText = `Economia Base Tarifária (E.BT): R$ ${EBT.toFixed(2)}`;
    document.getElementById("resNE").innerText = `Nova Economia (NE): R$ ${NE.toFixed(2)}`;
    document.getElementById("resBT").innerText = `%BT: ${BT.toFixed(2)}%`;

    document.getElementById("resultado").style.display = 'block';
  }
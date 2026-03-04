function showResult(elementId, text, isError = false) {
  const el = document.getElementById(elementId);
  el.textContent = text;
  el.classList.toggle('error', isError);
}

function getVal(id) {
  const v = parseFloat(document.getElementById(id).value);
  return isNaN(v) ? null : v;
}

// Update slider displays when they change
document.addEventListener('DOMContentLoaded', function() {
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    const displayId = slider.id + '-display';
    const displayEl = document.getElementById(displayId);
    if (displayEl) {
      slider.addEventListener('input', function() {
        const val = parseFloat(this.value);
        displayEl.textContent = val % 1 === 0 ? val : val.toFixed(2);
      });
    }
  });
});

// Torque: T = P * 9549 / N
window.calculateTorque = function () {
  const P = getVal('torque-power');
  const N = getVal('torque-speed');
  if (P == null || N == null) return showResult('torque-result', 'Please fill in all fields.', true);
  if (N === 0) return showResult('torque-result', 'Speed cannot be zero.', true);
  const T = (P * 9549) / N;
  showResult('torque-result', `Torque = ${T.toFixed(2)} Nm`);
};

// Power: P = T * N / 9549
window.calculatePower = function () {
  const T = getVal('power-torque');
  const N = getVal('power-speed');
  if (T == null || N == null) return showResult('power-result', 'Please fill in all fields.', true);
  const P = (T * N) / 9549;
  showResult('power-result', `Power = ${P.toFixed(2)} kW`);
};

// Synchronous Speed: Ns = 120 * f / P
window.calculateSpeed = function () {
  const f = getVal('speed-freq');
  const poles = getVal('speed-poles');
  if (f == null || poles == null) return showResult('speed-result', 'Please fill in all fields.', true);
  if (poles === 0) return showResult('speed-result', 'Poles cannot be zero.', true);
  const Ns = (120 * f) / poles;
  showResult('speed-result', `Synchronous Speed = ${Ns.toFixed(0)} RPM`);
};

// Efficiency: η = (Pout / Pin) * 100
window.calculateEfficiency = function () {
  const Pout = getVal('eff-output');
  const Pin = getVal('eff-input');
  if (Pout == null || Pin == null) return showResult('efficiency-result', 'Please fill in all fields.', true);
  if (Pin === 0) return showResult('efficiency-result', 'Input power cannot be zero.', true);
  const eff = (Pout / Pin) * 100;
  showResult('efficiency-result', `Efficiency = ${eff.toFixed(1)}%`);
};

// Full-load current (3-phase): I = P * 1000 / (√3 * V * η * pf)
window.calculateCurrent = function () {
  const P = getVal('current-power');
  const V = getVal('current-voltage');
  const eff = getVal('current-eff');
  const pf = getVal('current-pf');
  if (P == null || V == null || eff == null || pf == null) return showResult('current-result', 'Please fill in all fields.', true);
  const denom = Math.sqrt(3) * V * eff * pf;
  if (denom === 0) return showResult('current-result', 'Divisor values cannot be zero.', true);
  const I = (P * 1000) / denom;
  showResult('current-result', `Current = ${I.toFixed(2)} A`);
};

// Slip: s = (Ns - Nr) / Ns * 100
window.calculateSlip = function () {
  const Ns = getVal('slip-sync');
  const Nr = getVal('slip-rotor');
  if (Ns == null || Nr == null) return showResult('slip-result', 'Please fill in all fields.', true);
  if (Ns === 0) return showResult('slip-result', 'Synchronous speed cannot be zero.', true);
  const slip = ((Ns - Nr) / Ns) * 100;
  showResult('slip-result', `Slip = ${slip.toFixed(2)}%`);
};

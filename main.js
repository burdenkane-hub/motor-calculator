// Motor frame sizes (IEC standard) with weight estimates
const motorFrames = [
  { power: 0, frame: 'IEC 56', weight: 5 },
  { power: 0.18, frame: 'IEC 63', weight: 8 },
  { power: 0.37, frame: 'IEC 71', weight: 14 },
  { power: 0.75, frame: 'IEC 80', weight: 22 },
  { power: 1.5, frame: 'IEC 90', weight: 35 },
  { power: 3, frame: 'IEC 100', weight: 55 },
  { power: 5.5, frame: 'IEC 112', weight: 80 },
  { power: 11, frame: 'IEC 132', weight: 130 },
  { power: 15, frame: 'IEC 160', weight: 190 },
  { power: 22, frame: 'IEC 180', weight: 260 },
  { power: 30, frame: 'IEC 200', weight: 350 },
  { power: 37, frame: 'IEC 225', weight: 450 },
  { power: 45, frame: 'IEC 250', weight: 550 },
  { power: 55, frame: 'IEC 280', weight: 680 },
  { power: 75, frame: 'IEC 315', weight: 870 },
  { power: 90, frame: 'IEC 355', weight: 1100 },
  { power: 110, frame: 'IEC 400', weight: 1450 },
  { power: 132, frame: 'IEC 450', weight: 1750 }
];

function getMotorFrame(power) {
  for (let i = motorFrames.length - 1; i >= 0; i--) {
    if (power >= motorFrames[i].power) {
      return motorFrames[i];
    }
  }
  return motorFrames[0];
}

function updateDisplays() {
  const currentMode = document.querySelector('.mode-content.active').id;
  
  if (currentMode === 'mode-power-speed') {
    updateDisplay('power', 'display-power', 1);
    updateDisplay('speed', 'display-speed', 0);
    updateDisplay('eff-ps', 'display-eff-ps', 2);
  } else if (currentMode === 'mode-torque-speed') {
    updateDisplay('torque', 'display-torque', 1);
    updateDisplay('speed-ts', 'display-speed-ts', 0);
    updateDisplay('eff-ts', 'display-eff-ts', 2);
  } else if (currentMode === 'mode-custom') {
    updateDisplay('power-custom', 'display-power-custom', 1);
    updateDisplay('torque-custom', 'display-torque-custom', 1);
    updateDisplay('speed-custom', 'display-speed-custom', 0);
    updateDisplay('voltage-custom', 'display-voltage-custom', 0);
    updateDisplay('pf-custom', 'display-pf-custom', 2);
    updateDisplay('eff-custom', 'display-eff-custom', 2);
  }
}

function updateDisplay(inputId, displayId, decimals) {
  const input = document.getElementById(`input-${inputId}`);
  const display = document.getElementById(displayId);
  if (input && display) {
    const val = parseFloat(input.value);
    display.textContent = val.toFixed(decimals);
  }
}

function calculateResults() {
  const currentMode = document.querySelector('.mode-content.active').id;
  let power, torque, speed, voltage, pf, efficiency;

  if (currentMode === 'mode-power-speed') {
    power = parseFloat(document.getElementById('input-power').value);
    speed = parseFloat(document.getElementById('input-speed').value);
    efficiency = parseFloat(document.getElementById('input-eff-ps').value);
    voltage = 400; // Default voltage
    pf = 0.85; // Default power factor
    
    if (speed === 0) speed = 1500;
    torque = (power * 9549) / speed;
  } else if (currentMode === 'mode-torque-speed') {
    torque = parseFloat(document.getElementById('input-torque').value);
    speed = parseFloat(document.getElementById('input-speed').value);
    efficiency = parseFloat(document.getElementById('input-eff-ts').value);
    voltage = 400;
    pf = 0.85;
    
    if (speed === 0) speed = 1500;
    power = (torque * speed) / 9549;
  } else if (currentMode === 'mode-custom') {
    power = parseFloat(document.getElementById('input-power-custom').value);
    torque = parseFloat(document.getElementById('input-torque-custom').value);
    speed = parseFloat(document.getElementById('input-speed-custom').value);
    voltage = parseFloat(document.getElementById('input-voltage-custom').value);
    pf = parseFloat(document.getElementById('input-pf-custom').value);
    efficiency = parseFloat(document.getElementById('input-eff-custom').value);
  }

  // Calculate additional parameters
  const current = (power * 1000) / (Math.sqrt(3) * voltage * efficiency * pf);
  
  // Motor poles based on standard speeds (assuming 50 Hz)
  const syncSpeeds = [3000, 1500, 1000, 750, 600];
  let poleCount = 2;
  let syncSpeed = 1500;
  
  for (let sync of syncSpeeds) {
    if (Math.abs(speed - sync) < Math.abs(speed - syncSpeed)) {
      syncSpeed = sync;
      poleCount = Math.round((120 * 50) / syncSpeed);
    }
  }
  
  const slip = syncSpeed > 0 ? ((syncSpeed - speed) / syncSpeed) * 100 : 0;
  
  // Get motor frame sizing
  const frame = getMotorFrame(power);

  // Update results
  document.getElementById('result-power').textContent = `${power.toFixed(2)} kW`;
  document.getElementById('result-torque').textContent = `${torque.toFixed(2)} Nm`;
  document.getElementById('result-speed').textContent = `${Math.round(speed)} RPM`;
  document.getElementById('result-current').textContent = `${current.toFixed(2)} A`;
  document.getElementById('result-efficiency').textContent = `${(efficiency * 100).toFixed(1)}%`;
  document.getElementById('result-pf').textContent = `${pf.toFixed(2)}`;
  document.getElementById('result-frame').textContent = frame.frame;
  document.getElementById('result-weight').textContent = `${frame.weight} kg`;
  document.getElementById('result-sync-speed').textContent = `${syncSpeed} RPM`;
  document.getElementById('result-slip').textContent = `${slip.toFixed(2)}%`;
  document.getElementById('result-poles').textContent = `${poleCount / 2}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Mode switching
  const modeBtns = document.querySelectorAll('.mode-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active from all buttons and content
      modeBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.mode-content').forEach(c => c.classList.remove('active'));
      
      // Add active to clicked button and corresponding content
      this.classList.add('active');
      const mode = this.getAttribute('data-mode');
      document.getElementById(`mode-${mode}`).classList.add('active');
      
      // Calculate with new mode
      updateDisplays();
      calculateResults();
    });
  });

  // Slider input listeners
  const sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(slider => {
    slider.addEventListener('input', function() {
      updateDisplays();
      calculateResults();
    });
  });

  // Initial calculation
  updateDisplays();
  calculateResults();
});


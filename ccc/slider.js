const speedMapping = new Map();
speedMapping.set(-2, 'Slower');
speedMapping.set(-1, 'Slow');
speedMapping.set(0, 'Normal');
speedMapping.set(1, 'Fast');
speedMapping.set(2, 'Faster');

['totalPatients', 'sickPatients', 'healthyPatients', 'timeSteps', 'immunePatients', 'probability', 'speed'].forEach((slider) => {
  const input = document.getElementById(slider);
  const output = document.getElementById(`${slider}-value`);
  if (slider === 'speed') {
    output.innerHTML = speedMapping.get(parseInt(input.value, 10));
  } else {
    output.innerHTML = input.value; // Display the default slider value
  }

  // Update the current slider value (each time you drag the slider handle)
  input.oninput = () => {
    if (!['totalPatients', 'speed'].includes(slider)) {
      output.innerHTML = input.value;
    }

    if (slider === 'speed') {
      output.innerHTML = speedMapping.get(parseInt(input.value, 10));
    }

    if (slider) {
      if (['sickPatients', 'healthyPatients', 'immunePatients'].includes(slider)) {
        let sum = 0;

        ['sickPatients', 'healthyPatients', 'immunePatients'].forEach((patientSlider) => {
          sum += parseInt(document.getElementById(patientSlider).value, 10);
        });
        document.getElementById('totalPatients').value = sum;
        document.getElementById('totalPatients-value').innerHTML = sum;
      }
    }
  };
});



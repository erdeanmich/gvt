window.onload = () => {
  const orange = document.getElementById('orange');
  let orangeDegree = 0;
  let rotatingInterval;

  const getOrangePath = (id) => (id || id === 0 ? `images/orange${id}.png` : 'images/orange.png');

  const rotateImage = (inReverse) => {
    const turnAmount = inReverse ? -36 : 36;
    const degree = orangeDegree || 360;
    orangeDegree = (degree + turnAmount) % 360;
    orange.src = getOrangePath(orangeDegree);
  };

  const clearContinuousRotation = () => {
    clearInterval(rotatingInterval);
    rotatingInterval = undefined;
    orange.src = getOrangePath(orangeDegree);
  };

  const rotateContinuously = () => {
    rotatingInterval = setInterval(() => {
      rotateImage();
    }, 100);
  };

  window.onkeydown = ((event) => {
    if (event.key === 'r') {
      clearContinuousRotation();
      rotateImage(false);
      return;
    }

    if (event.key === 'l') {
      clearContinuousRotation();
      rotateImage(true);
      return;
    }

    if (event.key === 'a') {
      if (!rotatingInterval) {
        rotateContinuously();
        return;
      }

      clearContinuousRotation();
    }
  });
};

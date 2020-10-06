window.onload = () => {
    window.onkeydown = (event => {
        if (event.key === 'r') {
            rotateImage(false);
        }

        if(event.key === 'l') {
            rotateImage(true);
        }
    })


    const orange = document.getElementById('orange');
    let orangeDegree = 0;

    const rotateImage = (inReverse) => {
        const turnAmount = inReverse ? -36 : 36 ;
        const degree = orangeDegree || 360;
        orangeDegree = (degree + turnAmount) % 360;
        orange.src = 'images/orange' + orangeDegree + '.png';
    };
};


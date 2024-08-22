document.getElementById('calculateButton').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent form submission
    calculateCriticalSpeed();
});

function calculateCriticalSpeed() {
    console.log("Calculate button clicked");

    // Get the input values
    const shaftLength = parseFloat(document.getElementById('shaftLength').value);
    const shaftDiameter = parseFloat(document.getElementById('shaftDiameter').value);
    let shaftMass = parseFloat(document.getElementById('shaftMass').value);
    const modulusElasticity = parseFloat(document.getElementById('material').value) * 1e9; // Convert GPa to Pa

    console.log("Input values - Length:", shaftLength, "Diameter:", shaftDiameter, "Mass:", shaftMass, "Elasticity:", modulusElasticity);

    // Check if the external mass is included
    const includeExternalMass = document.getElementById('externalMass').checked;
    if (includeExternalMass) {
        shaftMass += 0.32; // Add 320g (0.32kg) to the shaft mass
    }

    console.log("Total Shaft Mass after external mass check:", shaftMass);

    // Calculate the Moment of Inertia (I) of the shaft
    const momentOfInertia = (Math.PI * Math.pow(shaftDiameter, 4)) / 64;

    // Calculate Static Deflection (δs)
    const staticDeflection = (5 * shaftMass * 9.81 * Math.pow(shaftLength, 3)) / (384 * modulusElasticity * momentOfInertia);

    console.log("Calculated Static Deflection:", staticDeflection);

    // Calculate Critical Whirling Speed (ωc) in rev/s
    const criticalWhirlingSpeedRevS = 1 / Math.sqrt((2 * staticDeflection) / 1.27);

    console.log("Critical Whirling Speed (rev/s):", criticalWhirlingSpeedRevS);

    // Convert to RPM
    const criticalWhirlingSpeedRPM = criticalWhirlingSpeedRevS * 60;

    console.log("Critical Whirling Speed (RPM):", criticalWhirlingSpeedRPM);

    // Display the results
    document.getElementById('results').textContent = `Critical Whirling Speed: ${criticalWhirlingSpeedRPM.toFixed(2)} RPM`;

    // Plot the graph
    plotGraph(shaftLength, staticDeflection, criticalWhirlingSpeedRevS);

    // Start animating the shaft deflection
    animateShaftDeflection(staticDeflection);
}

function plotGraph(shaftLength, staticDeflection, criticalWhirlingSpeedRevS) {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');

    console.log("Plotting graph...");

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Start drawing the graph
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);

    for (let omega = 0; omega <= 2 * criticalWhirlingSpeedRevS; omega += 0.1) {
        const deflection = Math.pow(omega, 2) / (Math.pow(criticalWhirlingSpeedRevS, 2) - Math.pow(omega, 2)) * staticDeflection;
        const x = (omega / (2 * criticalWhirlingSpeedRevS)) * canvas.width;
        const y = (canvas.height / 2) - (deflection * 100); // Scale factor for visualization

        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = '#333';
    ctx.stroke();
}

function animateShaftDeflection(staticDeflection) {
    const canvas = document.getElementById('shaftCanvas');
    const ctx = canvas.getContext('2d');
    const numberOfPoints = 100;
    const shaftLength = canvas.width;
    const shaftHeight = canvas.height / 2;
    let angle = 0;

    // Calculate the maximum deflection for a fixed display
    let maxDeflection = staticDeflection; // The max deflection is when sin(θ) = 1
    let maxDeflectionMM = (maxDeflection * 1000).toFixed(2); // Convert to mm for display

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.moveTo(0, shaftHeight);

        for (let i = 0; i <= numberOfPoints; i++) {
            const x = (i / numberOfPoints) * shaftLength;
            const deflection = staticDeflection * Math.sin((Math.PI * i) / numberOfPoints + angle);
            const y = shaftHeight + deflection * 5000; // Scale factor for visualization

            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw the shaft ends
        ctx.beginPath();
        ctx.arc(0, shaftHeight, 5, 0, Math.PI * 2);
        ctx.arc(shaftLength, shaftHeight, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();

        // Display the maximum deflection in a fixed position with units
        ctx.font = '16px Arial';
        ctx.fillStyle = '#000';
        ctx.fillText(`Max Deflection: ${maxDeflectionMM} mm`, shaftLength - 150, shaftHeight - 20);

        angle += 0.05; // Adjust speed of animation

        requestAnimationFrame(draw);
    }

    draw();
}

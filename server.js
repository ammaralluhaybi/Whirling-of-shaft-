document.getElementById('calculateButton').addEventListener('click', calculateCriticalSpeed);

function calculateCriticalSpeed() {
    console.log("Calculate button clicked");
    
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

    // Moment of Inertia (I) of the shaft
    const momentOfInertia = (Math.PI * Math.pow(shaftDiameter, 4)) / 64;

    // Static Deflection (δs)
    const staticDeflection = (5 * shaftMass * 9.81 * Math.pow(shaftLength, 3)) / (384 * modulusElasticity * momentOfInertia);

    console.log("Calculated Static Deflection:", staticDeflection);

    // Critical Whirling Speed (ωc) in rev/s
    const criticalWhirlingSpeedRevS = 1 / Math.sqrt((2 * staticDeflection) / 1.27);

    console.log("Critical Whirling Speed (rev/s):", criticalWhirlingSpeedRevS);

    // Convert to RPM
    const criticalWhirlingSpeedRPM = criticalWhirlingSpeedRevS * 60;

    console.log("Critical Whirling Speed (RPM):", criticalWhirlingSpeedRPM);

    // Display results
    document.getElementById('results').textContent = `Critical Whirling Speed: ${criticalWhirlingSpeedRPM.toFixed(2)} RPM`;

    // Plotting the graph
    plotGraph(shaftLength, staticDeflection, criticalWhirlingSpeedRevS);
}

function plotGraph(shaftLength, staticDeflection, criticalWhirlingSpeedRevS) {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');

    console.log("Plotting graph...");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

const backendURL = "https://control-ingreso.onrender.com";
// Point to relative path now that we are served from the same origin
const codeArchitectURL = "/api/external";

const container = document.querySelector('.container');

// LOAD DROPDOWNS ON START
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load Projects
    const resProj = await fetch(`${codeArchitectURL}/projects`);
    const projects = await resProj.json();
    const projSelect = document.getElementById("loginProject");
    projSelect.innerHTML = '<option value="" disabled selected>Seleccione Proyecto</option>';
    projects.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.jobNumber} - ${p.name}`;
      projSelect.appendChild(opt);
    });

    // Load Phases
    const resPhase = await fetch(`${codeArchitectURL}/phases`);
    const phases = await resPhase.json();
    const phaseSelect = document.getElementById("loginPhase");
    phaseSelect.innerHTML = '<option value="" disabled selected>Seleccione Fase</option>';
    phases.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.code} - ${p.name}`;
      phaseSelect.appendChild(opt);
    });

  } catch (err) {
    console.error("Error loading dropdowns:", err);
    alert("Error: " + err.message + "\n\nPosible causa: Firewall de Windows bloqueando la conexión.");
  }
});

// REPORT FORM SUBMISSION
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const workerName = document.getElementById("username").value;
  const projectId = document.getElementById("loginProject").value;
  const phaseId = document.getElementById("loginPhase").value;
  const hours = document.getElementById("loginHours").value; // NEW
  const notes = document.getElementById("loginNotes").value;

  if (!projectId || !phaseId) {
    alert("Por favor seleccione Proyecto y Fase");
    return;
  }

  const error = document.getElementById("error");
  error.textContent = "Enviando reporte...";

  try {
    // Manual date formatting to ensure YYYY-MM-DD on all devices
    const now = new Date();
    const dateStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');

    console.log("Sending Report:", { dateStr, workerName, projectId, phaseId, hours, notes });

    const response = await fetch(`${codeArchitectURL}/timesheets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: dateStr,
        worker: workerName,
        project: projectId,
        phase: phaseId,
        hours: hours, // Send manual hours
        notes: notes
      })
    });

    const respData = await response.json();

    if (respData.ok) {
      alert("✅ Reporte guardado con éxito!\nID: " + respData.id);
      // Reset form
      document.getElementById("loginForm").reset();
      error.textContent = "";
    } else {
      alert("❌ Error del servidor: " + respData.msg);
      error.textContent = respData.msg;
    }

  } catch (err) {
    console.error("Error sending report:", err);
    alert("Error de conexión: " + err.message);
    error.textContent = "Error de conexión";
  }
});

// Remove unused functions (registrarSalida etc) to avoid confusion
function registrarIngreso() { }
function registrarSalida() { }
function logout() { }

// DESCARGAR PDF
function descargarPDF() {
  window.open(`${backendURL}/generar-pdf`, "_blank");
}

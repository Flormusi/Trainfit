console.log("=== VERIFICACIÓN DE ESTADO ===");
console.log("Estado de clientes en localStorage:", localStorage.getItem("clients"));
console.log("Token en localStorage:", localStorage.getItem("token"));
console.log("Usuario en localStorage:", JSON.parse(localStorage.getItem("user") || "{}"));

// Hacer una llamada directa a la API para verificar
fetch("http://localhost:5002/api/trainer/clients", {
  headers: {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  }
})
.then(response => response.json())
.then(data => {
  console.log("=== RESPUESTA DIRECTA DE LA API ===");
  console.log("Respuesta completa:", data);
  console.log("Estructura de datos:", JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error("Error en la llamada directa:", error);
});

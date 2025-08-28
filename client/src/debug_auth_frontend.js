// Script para depurar autenticación en el frontend
console.log("=== DEPURACIÓN DE AUTENTICACIÓN ===");

// 1. Verificar estado actual del localStorage
console.log("1. Estado actual del localStorage:");
console.log("- Token:", localStorage.getItem("token"));
console.log("- Usuario:", localStorage.getItem("user"));

// 2. Limpiar localStorage
console.log("\n2. Limpiando localStorage...");
localStorage.removeItem("token");
localStorage.removeItem("user");
console.log("- Token después de limpiar:", localStorage.getItem("token"));
console.log("- Usuario después de limpiar:", localStorage.getItem("user"));

// 3. Hacer login con las credenciales de prueba
console.log("\n3. Haciendo login con credenciales de prueba...");

const loginCredentials = {
  email: "test.trainer@trainfit.com",
  password: "test123"
};

fetch("http://localhost:5002/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(loginCredentials)
})
.then(response => response.json())
.then(data => {
  console.log("✅ Respuesta del login:", data);
  
  if (data.success && data.token) {
    // Guardar en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    
    console.log("✅ Token y usuario guardados en localStorage");
    console.log("- Token guardado:", localStorage.getItem("token"));
    console.log("- Usuario guardado:", localStorage.getItem("user"));
    
    // 4. Probar API de clientes
    console.log("\n4. Probando API de clientes con el token...");
    
    return fetch("http://localhost:5002/api/trainer/clients", {
      headers: {
        "Authorization": `Bearer ${data.token}`,
        "Content-Type": "application/json"
      }
    });
  } else {
    throw new Error("Login falló: " + (data.message || "Error desconocido"));
  }
})
.then(response => response.json())
.then(clientsData => {
  console.log("✅ Respuesta de la API de clientes:", clientsData);
  
  // 5. Recargar la página para que el frontend detecte el token
  console.log("\n5. Recargando la página para aplicar cambios...");
  setTimeout(() => {
    window.location.reload();
  }, 2000);
})
.catch(error => {
  console.error("❌ Error:", error);
});

console.log("Script de depuración ejecutado. Revisa la consola para ver los resultados.");
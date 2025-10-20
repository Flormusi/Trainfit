// Script para simular login en el navegador
// Ejecutar en la consola del navegador

async function simulateLogin() {
  try {
    // Hacer login
    const response = await fetch('http://localhost:5003/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'trainer.test@example.com',
        password: 'test123'
      })
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.success && data.token) {
      // Guardar en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('Token guardado:', data.token);
      console.log('Usuario guardado:', data.user);
      
      // Recargar la página
      window.location.reload();
    } else {
      console.error('Login failed:', data);
    }
  } catch (error) {
    console.error('Error during login:', error);
  }
}

// Ejecutar el login
simulateLogin();

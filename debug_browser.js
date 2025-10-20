// Script para ejecutar en la consola del navegador
// Verificar si hay token
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user') || '{}'));

// Hacer la llamada directa a la API
fetch('http://localhost:5002/api/trainer/clients', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  },
  credentials: 'include'
})
.then(response => {
  console.log('Response status:', response.status);
  console.log('Response headers:', response.headers);
  return response.json();
})
.then(data => {
  console.log('Response data:', data);
  console.log('Clients found:', data.length);
  if (data.length > 0) {
    console.log('First client:', data[0]);
    const florencia = data.find(client => client.email === 'florenciamusitani@gmail.com');
    console.log('Florencia found:', florencia);
  }
})
.catch(error => {
  console.error('Error:', error);
});

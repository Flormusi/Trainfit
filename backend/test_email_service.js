const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar el transportador
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'florenciamusitani@gmail.com',
    pass: process.env.EMAIL_PASS || 'pjjxujablkwedflf'
  }
});

// Datos de prueba
const testData = {
  clientName: 'María Florencia',
  trainerName: 'Entrenador de Prueba',
  routineName: 'Rutina de Prueba - Logo Real TrainFit',
  routineDescription: 'Esta rutina incluye el logo real de TrainFit con gradiente rojo y icono de pesa.'
};

// HTML del email con el logo real de TrainFit
const emailHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nueva Rutina Asignada - TrainFit</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
    
    <!-- Header con logo real TrainFit -->
    <div style="background-color: #000000; padding: 20px; text-align: center;">
      <svg width="250" height="60" viewBox="0 0 250 60" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
        <defs>
          <linearGradient id="redGradientHeader" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#ff3b30;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff6b60;stop-opacity:1" />
          </linearGradient>
          <filter id="glowHeader">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- TRAINFIT text -->
        <text x="125" y="38" 
              font-family="'Segoe UI', Arial, sans-serif" 
              font-size="28" 
              font-weight="900" 
              fill="url(#redGradientHeader)"
              filter="url(#glowHeader)"
              text-anchor="middle"
              letter-spacing="1px">TRAINFIT</text>
        
        <!-- Icono de pesa -->
        <g transform="translate(200, 18)">
          <circle cx="5" cy="12" r="4" fill="url(#redGradientHeader)"/>
          <rect x="9" y="11" width="10" height="2" fill="url(#redGradientHeader)"/>
          <circle cx="19" cy="12" r="4" fill="url(#redGradientHeader)"/>
        </g>
      </svg>
      <h2 style="margin: 20px 0 0 0; font-size: 24px; font-weight: 600; letter-spacing: -0.3px; color: #ff3b30;">Nueva Rutina Asignada</h2>
    </div>
    
    <!-- Contenido del email -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; line-height: 1.6; color: #333; margin-bottom: 20px;">
        Hola <strong style="color: #ff3b30;">${testData.clientName}</strong>,
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #666; margin-bottom: 30px;">
        ¡Excelentes noticias! Tu entrenador <strong style="color: #ff3b30;">${testData.trainerName}</strong> te ha asignado una nueva rutina personalizada.
      </p>
      
      <!-- Tarjeta de rutina -->
      <div style="background: linear-gradient(135deg, #ff3b30 0%, #ff6b60 100%); border-radius: 12px; padding: 2px; margin: 30px 0;">
        <div style="background: white; border-radius: 10px; padding: 25px; text-align: center;">
          <div style="background: #ff3b30; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px;">
            NUEVA RUTINA
          </div>
          <h3 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #333;">
            ${testData.routineName}
          </h3>
          <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
            ${testData.routineDescription}
          </p>
        </div>
      </div>
      
      <!-- Botón de acción -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: linear-gradient(135deg, #ff3b30 0%, #ff6b60 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 25px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(255, 59, 48, 0.3); transition: all 0.3s ease;">
          🏋️ Ver Mi Rutina
        </a>
      </div>
      
      <p style="font-size: 14px; line-height: 1.6; color: #888; text-align: center; margin-top: 30px;">
        También puedes acceder desde tu dashboard
      </p>
      <p style="text-align: center; margin: 10px 0;">
        <a href="#" style="color: #ff3b30; text-decoration: none; font-weight: 600; font-size: 14px;">
          Mi Dashboard Personal →
        </a>
      </p>
      
      <!-- Mensaje motivacional -->
      <div style="background: linear-gradient(135deg, #fff5f4 0%, #ffe8e6 100%); border-left: 4px solid #ff3b30; padding: 20px; margin: 30px 0; border-radius: 8px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 24px; margin-right: 10px;">💪</span>
          <h4 style="margin: 0; color: #ff3b30; font-size: 16px; font-weight: 700;">
            ¡Es hora de alcanzar tus objetivos!
          </h4>
        </div>
        <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
          Sigue las indicaciones de tu entrenador y mantén la constancia. ¡Tú puedes lograrlo!
        </p>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333; text-align: center; margin-top: 40px;">
        ¡Que tengas un excelente entrenamiento! 🔥
      </p>
    </div>
    
    <!-- Footer con logo real TrainFit -->
    <div style="background: #000000; color: #888; padding: 30px; text-align: center; border-top: 1px solid #eee;">
      <div style="margin-bottom: 20px;">
        <svg width="200" height="50" viewBox="0 0 200 50" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
          <defs>
            <linearGradient id="redGradientFooter" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:#ff3b30;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#ff6b60;stop-opacity:1" />
            </linearGradient>
            <filter id="glowFooter">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <!-- TRAINFIT text -->
          <text x="100" y="32" 
                font-family="'Segoe UI', Arial, sans-serif" 
                font-size="20" 
                font-weight="900" 
                fill="url(#redGradientFooter)"
                filter="url(#glowFooter)"
                text-anchor="middle"
                letter-spacing="1px">TRAINFIT</text>
          
          <!-- Icono de pesa -->
          <g transform="translate(150, 15)">
            <circle cx="5" cy="10" r="3" fill="url(#redGradientFooter)"/>
            <rect x="8" y="9" width="8" height="2" fill="url(#redGradientFooter)"/>
            <circle cx="16" cy="10" r="3" fill="url(#redGradientFooter)"/>
          </g>
        </svg>
      </div>
      
      <p style="margin: 0 0 10px 0; font-size: 14px; color: #ccc;">
        Tu plataforma de entrenamiento personal
      </p>
      <p style="margin: 0; font-size: 12px; color: #888;">
        Si tienes alguna pregunta, contacta a tu entrenador directamente.
      </p>
    </div>
  </div>
</body>
</html>
`;

// Configuración del email
const mailOptions = {
  from: process.env.EMAIL_USER || 'florenciamusitani@gmail.com',
  to: 'florenciamusitani@gmail.com',
  subject: '🎉 ¡Nueva Rutina Asignada! - TrainFit (Logo Real Verificado)',
  html: emailHTML
};

// Enviar el email
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('❌ Error al enviar email:', error);
  } else {
    console.log('✅ Email enviado exitosamente!');
    console.log('📧 Message ID:', info.messageId);
    console.log('🎨 Logo: TrainFit real con gradiente rojo y icono de pesa');
    console.log('📬 Revisa tu bandeja de entrada para verificar el logo');
  }
});
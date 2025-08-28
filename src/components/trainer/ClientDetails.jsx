// ... existing code ...
            <div 
              style={{
                backgroundColor: '#ff3b30',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-block',
                marginTop: '10px',
                fontWeight: 'bold',
                textAlign: 'center'
              }}
              onMouseDown={() => {
                console.log('🎯 NAVEGANDO A PROGRESO...');
                window.location.href = `/trainer/clients/${clientId}`;
              }}
            >
              Ver progreso
            </div>
// ... existing code ...
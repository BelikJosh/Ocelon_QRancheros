import AWS from 'aws-sdk';

// Configurar AWS con opciones específicas
const config = {
  region: 'us-east-1',
  accessKeyId: '',
  secretAccessKey: '',
  correctClockSkew: true, // ← Esto ayuda con diferencias de hora
  systemClockOffset: 0    // ← Ajusta manualmente si es necesario
};

AWS.config.update(config);

// Crear el cliente con configuración adicional
const dynamoDB = new AWS.DynamoDB.DocumentClient({
  correctClockSkew: true, // ← IMPORTANTE
  httpOptions: {
    timeout: 30000,
    connectTimeout: 5000
  }
});

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  wallet: string;
  fechaRegistro: string;
  ultimaActualizacion: string;
  estancias: any[];
}

export class DynamoDBService {
  static async crearUsuario(usuarioData: {
    nombre: string;
    email: string;
    password: string;
    telefono?: string;
  }): Promise<Usuario> {
    return new Promise((resolve, reject) => {
      try {
        // Generar ID único
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const userId = `USER#${timestamp}_${random}`;
        
        const wallet = `wallet_${timestamp}_${random}`;

        const usuarioCompleto: Usuario = {
          id: userId,
          nombre: usuarioData.nombre,
          email: usuarioData.email,
          password: usuarioData.password,
          telefono: usuarioData.telefono,
          wallet: wallet,
          fechaRegistro: new Date().toISOString(),
          ultimaActualizacion: new Date().toISOString(),
          estancias: []
        };

        const params = {
          TableName: 'Usuarios',
          Item: usuarioCompleto
        };

        console.log('📦 Insertando usuario en DynamoDB...');

        dynamoDB.put(params, (err, data) => {
          if (err) {
            console.error('❌ Error DynamoDB:', err);
            
            // Intentar reconectar con nueva configuración
            if (err.code === 'InvalidSignatureException' || err.code === 'RequestTimeTooSkewed') {
              console.log('🔄 Reintentando con nueva configuración...');
              AWS.config.update({
                ...config,
                systemClockOffset: new Date().getTime() - Date.now()
              });
              
              // Reintentar
              const retryDynamoDB = new AWS.DynamoDB.DocumentClient({
                correctClockSkew: true,
                systemClockOffset: new Date().getTime() - Date.now()
              });
              
              retryDynamoDB.put(params, (retryErr, retryData) => {
                if (retryErr) {
                  reject(new Error(`Error de firma: ${retryErr.message}. Verifica la hora de tu dispositivo.`));
                } else {
                  resolve(usuarioCompleto);
                }
              });
            } else {
              reject(new Error(`Error de DynamoDB: ${err.message}`));
            }
          } else {
            console.log('✅ Usuario creado exitosamente');
            resolve(usuarioCompleto);
          }
        });

      } catch (error) {
        console.error('❌ Error inesperado:', error);
        reject(error);
      }
    });
  }
}
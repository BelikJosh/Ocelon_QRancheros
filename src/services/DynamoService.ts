import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

// Configuración específica para React Native
const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: '',
    secretAccessKey: ''
  },
  // Configuración adicional para React Native
  requestHandler: new (require('@aws-sdk/fetch-http-handler').FetchHttpHandler)({
    // Timeout configurado para React Native
    requestTimeout: 30000,
  })
});

const docClient = DynamoDBDocumentClient.from(client);

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
  static async crearUsuario(usuario: Omit<Usuario, 'fechaRegistro' | 'ultimaActualizacion' | 'estancias'>): Promise<Usuario> {
    try {
      // Generar ID único sin usar uuid (para evitar el error crypto)
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 10000);
      const userId = usuario.id || `USER#${timestamp}_${randomSuffix}`;
      
      const usuarioCompleto: Usuario = {
        ...usuario,
        id: userId,
        fechaRegistro: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString(),
        estancias: []
      };

      console.log('Intentando crear usuario:', usuarioCompleto);

      const command = new PutCommand({
        TableName: 'Usuarios',
        Item: usuarioCompleto
      });

      const result = await docClient.send(command);
      console.log('Usuario creado exitosamente en DynamoDB');
      return usuarioCompleto;
      
    } catch (error: any) {
      console.error('Error detallado en DynamoDB:', {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      throw new Error(`Error al crear usuario: ${error.message}`);
    }
  }
}
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'TU_ACCESS_KEY_ID', // Reemplaza con tus credenciales
    secretAccessKey: 'TU_SECRET_ACCESS_KEY' // Reemplaza con tus credenciales
  }
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
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    const userId = usuario.id || `USER#${timestamp}_${random}`;
    
    const usuarioCompleto: Usuario = {
      ...usuario,
      id: userId,
      fechaRegistro: new Date().toISOString(),
      ultimaActualizacion: new Date().toISOString(),
      estancias: []
    };

    const command = new PutCommand({
      TableName: 'Usuarios',
      Item: usuarioCompleto
    });

    try {
      await docClient.send(command);
      return usuarioCompleto;
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw new Error('Error al crear usuario en DynamoDB');
    }
  }
}
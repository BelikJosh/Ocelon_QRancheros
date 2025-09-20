// services/api.ts
import { DynamoDBService } from './DynamoService';

export async function saveScannedQrByUserId(userId: string, qr: string) {
  await DynamoDBService.actualizarQRUsuario(userId, qr);
}

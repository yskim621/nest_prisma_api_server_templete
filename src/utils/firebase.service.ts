import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Firestore } from '@google-cloud/firestore';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firestore: Firestore;
  private readonly serviceAccountPath = path.join(__dirname, '../../', 'firebase.json');

  onModuleInit() {
    try {
      if (!fs.existsSync(this.serviceAccountPath)) {
        this.logger.warn('firebase.json 파일을 찾을 수 없습니다.');
        return;
      }

      const serviceAccount = JSON.parse(fs.readFileSync(this.serviceAccountPath, 'utf8')) as admin.ServiceAccount;

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      }

      this.firestore = admin.firestore();
    } catch {
      this.logger.warn('firebase.json 파일을 찾을 수 없거나 잘못된 형식입니다.');
    }
  }

  getFirestore(): Firestore {
    return this.firestore;
  }
}

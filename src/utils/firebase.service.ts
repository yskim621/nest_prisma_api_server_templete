import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Firestore } from '@google-cloud/firestore';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firestore: Firestore;
  // firebase.json 파일 경로 설정
  serviceAccountPath = path.join(__dirname, '../../', 'firebase.json');
  serviceAccount: string = JSON.parse(fs.readFileSync(this.serviceAccountPath, 'utf8')) as string;

  onModuleInit() {
    try {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(this.serviceAccount),
        });
      }

      this.firestore = admin.firestore();
    } catch {
      this.logger.log('firebase.json 파일을 찾을 수 없거나 잘못된 형식입니다.');
    }
  }

  getFirestore(): Firestore {
    return this.firestore;
  }
}

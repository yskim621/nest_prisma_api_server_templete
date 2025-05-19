import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Firestore } from '@google-cloud/firestore';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FirebaseService implements OnModuleInit {
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
      console.log('firebase.json 파일을 찾을 수 없거나 잘못된 형식입니다.');
    }
  }

  getFirestore(): Firestore {
    return this.firestore;
  }

  // 사용자 데이터를 Firestore에 저장하는 메서드
  // async saveUserData(userSeq: number, ecSeq: number, userLevel: string): Promise<string> {
  //   // Firestore의 컬렉션과 문서 참조
  //   const docRef = this.firestore.collection('users').doc(String(userSeq));

  //   // 저장할 데이터 생성
  //   const data = {
  //     user_seq: userSeq,
  //     user_level: userLevel,
  //     ec_seq: ecSeq,
  //   };

  //   console.log('data:', data);

  //   try {
  //     // Firestore에 데이터 쓰기 (존재하면 업데이트, 존재하지 않으면 생성)
  //     const writeResult = await docRef.set(data);
  //     return `Document saved/updated at: ${writeResult.writeTime.toDate()}`;
  //   } catch (error) {
  //     console.error('Error saving document:', error);
  //     throw error;
  //   }
  // }
}

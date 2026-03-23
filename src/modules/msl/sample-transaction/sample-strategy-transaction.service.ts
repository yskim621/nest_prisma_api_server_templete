import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TransactionClient } from '../../../common/base/transaction.types';

/**
 * Strategy 패턴 + 트랜잭션 주입 패턴 샘플
 *
 * 이 서비스는 switch-case 중복을 Strategy 패턴으로 제거하는 방법을 보여줍니다.
 * ProveEvaluationResultService와 같이 여러 스케일/타입을 처리하는 경우에 유용합니다.
 */

// ============================================
// 타입 정의
// ============================================

/**
 * 평가 스케일 타입
 */
export enum EvaluationScaleType {
  STRESS = 'STRESS',
  ANXIETY = 'ANXIETY',
  DEPRESSION = 'DEPRESSION',
  SLEEP = 'SLEEP',
}

/**
 * 평가 결과 인터페이스 (공통)
 */
export interface IEvaluationResult {
  resultCode: string;
  resultText: string;
  summedScore: number;
}

/**
 * 스케일별 설정 인터페이스
 */
interface ScaleConfig<TResult extends IEvaluationResult> {
  /** Prisma 모델 이름 */
  modelName: string;
  /** 결과 코드 필드명 (proveEvaluationResult 테이블) */
  resultCodeField: string;
  /** 결과 처리 함수 */
  processResult: (selectedItems: number[]) => TResult;
  /** 업데이트 데이터 생성 함수 */
  buildUpdateData: (result: TResult, selectedItems: number[]) => Record<string, unknown>;
}

// ============================================
// 개별 결과 타입 정의
// ============================================

interface StressResult extends IEvaluationResult {
  stressLevel: string;
}

interface AnxietyResult extends IEvaluationResult {
  anxietyLevel: string;
  panicScore: number;
}

interface DepressionResult extends IEvaluationResult {
  depressionLevel: string;
  hopelessnessScore: number;
}

interface SleepResult extends IEvaluationResult {
  sleepQuality: string;
  insomniaScore: number;
}

// ============================================
// 서비스 구현
// ============================================

@Injectable()
export class SampleStrategyTransactionService {
  private readonly logger = new Logger(SampleStrategyTransactionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * 스케일별 설정 맵
   *
   * 새로운 스케일 추가 시 이 맵에만 설정을 추가하면 됨
   * switch-case 50줄 → 설정 객체 10줄
   */
  private readonly scaleConfigMap: Record<EvaluationScaleType, ScaleConfig<IEvaluationResult>> = {
    [EvaluationScaleType.STRESS]: {
      modelName: 'stressResult',
      resultCodeField: 'stressResultCode',
      processResult: (items) => this.processStressResult(items),
      buildUpdateData: (result: StressResult, selectedItems) => ({
        selectedItems: selectedItems.toString(),
        resultCode: result.resultCode,
        resultText: result.resultText,
        summedScore: result.summedScore,
        stressLevel: result.stressLevel,
        finishedAt: new Date(),
        updatedAt: new Date(),
      }),
    },

    [EvaluationScaleType.ANXIETY]: {
      modelName: 'anxietyResult',
      resultCodeField: 'anxietyResultCode',
      processResult: (items) => this.processAnxietyResult(items),
      buildUpdateData: (result: AnxietyResult, selectedItems) => ({
        selectedItems: selectedItems.toString(),
        resultCode: result.resultCode,
        resultText: result.resultText,
        summedScore: result.summedScore,
        anxietyLevel: result.anxietyLevel,
        panicScore: result.panicScore,
        finishedAt: new Date(),
        updatedAt: new Date(),
      }),
    },

    [EvaluationScaleType.DEPRESSION]: {
      modelName: 'depressionResult',
      resultCodeField: 'depressionResultCode',
      processResult: (items) => this.processDepressionResult(items),
      buildUpdateData: (result: DepressionResult, selectedItems) => ({
        selectedItems: selectedItems.toString(),
        resultCode: result.resultCode,
        resultText: result.resultText,
        summedScore: result.summedScore,
        depressionLevel: result.depressionLevel,
        hopelessnessScore: result.hopelessnessScore,
        finishedAt: new Date(),
        updatedAt: new Date(),
      }),
    },

    [EvaluationScaleType.SLEEP]: {
      modelName: 'sleepResult',
      resultCodeField: 'sleepResultCode',
      processResult: (items) => this.processSleepResult(items),
      buildUpdateData: (result: SleepResult, selectedItems) => ({
        selectedItems: selectedItems.toString(),
        resultCode: result.resultCode,
        resultText: result.resultText,
        summedScore: result.summedScore,
        sleepQuality: result.sleepQuality,
        insomniaScore: result.insomniaScore,
        finishedAt: new Date(),
        updatedAt: new Date(),
      }),
    },
  };

  // ============================================
  // 메인 트랜잭션 메서드 (리팩토링된 버전)
  // ============================================

  /**
   * 평가 결과 업데이트 (트랜잭션 주입 버전)
   *
   * 기존 400줄의 switch-case가 50줄로 감소
   *
   * @param tx - 트랜잭션 클라이언트 (외부에서 주입)
   * @param evaluationId - 평가 ID
   * @param scale - 평가 스케일 타입
   * @param selectedItems - 선택된 항목들
   */
  async updateEvalScaleResultData(
    tx: TransactionClient,
    evaluationId: string,
    scale: EvaluationScaleType,
    selectedItems: number[],
  ): Promise<Record<string, unknown>> {
    // 1. 스케일 설정 조회
    const config = this.scaleConfigMap[scale];
    if (!config) {
      throw new Error(`지원하지 않는 스케일 타입: ${scale}`);
    }

    try {
      // 2. 기존 결과 데이터 조회
      const foundResultData = await this.findResultData(tx, config.modelName, evaluationId);
      if (!foundResultData) {
        throw new Error(`결과 데이터를 찾을 수 없습니다: ${evaluationId}`);
      }

      // 3. 결과 처리
      const result = config.processResult(selectedItems);
      if (!result) {
        throw new Error('결과 처리 실패');
      }

      // 4. 메인 평가 결과 테이블 업데이트
      await this.updateMainEvaluationResult(tx, evaluationId, config.resultCodeField, result.resultCode);

      // 5. 스케일별 결과 테이블 업데이트
      const updateData = config.buildUpdateData(result, selectedItems);
      const updatedResult = await this.updateScaleResult(tx, config.modelName, evaluationId, updateData);

      this.logger.log(`평가 결과 업데이트 완료: ${scale} - ${evaluationId}`);
      return updatedResult;
    } catch (error) {
      this.logger.error(`평가 결과 업데이트 실패: ${scale} - ${evaluationId}`, error);
      throw error;
    }
  }

  /**
   * 여러 스케일을 한 번에 처리하는 트랜잭션
   */
  async updateMultipleScales(evaluationId: string, scaleDataList: Array<{ scale: EvaluationScaleType; selectedItems: number[] }>): Promise<void> {
    await this.prisma.$transaction(async (tx: TransactionClient) => {
      this.logger.log(`다중 스케일 업데이트 시작: ${evaluationId}`);

      for (const { scale, selectedItems } of scaleDataList) {
        await this.updateEvalScaleResultData(tx, evaluationId, scale, selectedItems);
      }

      this.logger.log(`다중 스케일 업데이트 완료: ${evaluationId}`);
    });
  }

  // ============================================
  // 트랜잭션 주입을 받는 헬퍼 메서드들
  // ============================================

  /**
   * 결과 데이터 조회 (트랜잭션 주입)
   */
  private findResultData(_tx: TransactionClient, modelName: string, evaluationId: string): Promise<Record<string, unknown>> {
    // 실제 구현:
    // return (_tx as Record<string, unknown>)[modelName].findFirst({
    //   where: { proveEvaluationUuid: evaluationId },
    // });

    // 샘플 데이터 반환
    return Promise.resolve({ id: 1, evaluationId });
  }

  /**
   * 메인 평가 결과 업데이트 (트랜잭션 주입)
   */
  private updateMainEvaluationResult(
    _tx: TransactionClient,
    evaluationId: string,
    resultCodeField: string,
    resultCode: string,
  ): Promise<Record<string, unknown>> {
    // 실제 구현:
    // return _tx.proveEvaluationResult.update({
    //   where: { proveEvaluationUuid: evaluationId },
    //   data: {
    //     [resultCodeField]: resultCode,
    //     updatedAt: new Date(),
    //   },
    // });

    this.logger.debug(`메인 평가 결과 업데이트: ${resultCodeField} = ${resultCode}`);
    return Promise.resolve({ evaluationId, [resultCodeField]: resultCode });
  }

  /**
   * 스케일별 결과 업데이트 (트랜잭션 주입)
   */
  private updateScaleResult(
    _tx: TransactionClient,
    modelName: string,
    evaluationId: string,
    updateData: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    // 실제 구현:
    // return (_tx as Record<string, unknown>)[modelName].update({
    //   where: { proveEvaluationUuid: evaluationId },
    //   data: updateData,
    // });

    this.logger.debug(`스케일 결과 업데이트: ${modelName}`);
    return Promise.resolve({ modelName, evaluationId, ...updateData });
  }

  // ============================================
  // 결과 처리 메서드들 (비즈니스 로직)
  // ============================================

  private processStressResult(selectedItems: number[]): StressResult {
    const summedScore = selectedItems.reduce((a, b) => a + b, 0);
    const stressLevel = summedScore < 10 ? 'LOW' : summedScore < 20 ? 'MODERATE' : 'HIGH';

    return {
      resultCode: `STRESS_${stressLevel}`,
      resultText: `스트레스 수준: ${stressLevel}`,
      summedScore,
      stressLevel,
    };
  }

  private processAnxietyResult(selectedItems: number[]): AnxietyResult {
    const summedScore = selectedItems.reduce((a, b) => a + b, 0);
    const anxietyLevel = summedScore < 8 ? 'MINIMAL' : summedScore < 15 ? 'MILD' : 'SEVERE';
    const panicScore = Math.floor(summedScore * 0.3);

    return {
      resultCode: `ANXIETY_${anxietyLevel}`,
      resultText: `불안 수준: ${anxietyLevel}`,
      summedScore,
      anxietyLevel,
      panicScore,
    };
  }

  private processDepressionResult(selectedItems: number[]): DepressionResult {
    const summedScore = selectedItems.reduce((a, b) => a + b, 0);
    const depressionLevel = summedScore < 5 ? 'NONE' : summedScore < 10 ? 'MILD' : 'MODERATE';
    const hopelessnessScore = Math.floor(summedScore * 0.2);

    return {
      resultCode: `DEPRESSION_${depressionLevel}`,
      resultText: `우울 수준: ${depressionLevel}`,
      summedScore,
      depressionLevel,
      hopelessnessScore,
    };
  }

  private processSleepResult(selectedItems: number[]): SleepResult {
    const summedScore = selectedItems.reduce((a, b) => a + b, 0);
    const sleepQuality = summedScore < 5 ? 'GOOD' : summedScore < 10 ? 'FAIR' : 'POOR';
    const insomniaScore = Math.floor(summedScore * 0.4);

    return {
      resultCode: `SLEEP_${sleepQuality}`,
      resultText: `수면 품질: ${sleepQuality}`,
      summedScore,
      sleepQuality,
      insomniaScore,
    };
  }
}

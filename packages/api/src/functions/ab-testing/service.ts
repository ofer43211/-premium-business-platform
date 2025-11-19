/**
 * A/B Testing Service
 * Handles experiment assignment, tracking, and statistical analysis
 */
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

export interface Experiment {
  id: string;
  name: string;
  variants: Variant[];
  startDate: number;
  endDate?: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  targetingRules?: TargetingRule[];
  createdAt: number;
  updatedAt: number;
}

export interface Variant {
  id: string;
  name: string;
  weight: number; // 0-100 percentage
  config?: Record<string, any>;
}

export interface TargetingRule {
  type: 'language' | 'subscription' | 'country' | 'custom';
  operator: 'equals' | 'not_equals' | 'in' | 'not_in';
  value: any;
}

export interface Assignment {
  experimentId: string;
  userId: string;
  variantId: string;
  assignedAt: number;
}

export interface ConversionEvent {
  experimentId: string;
  userId: string;
  variantId: string;
  eventName: string;
  value?: number;
  timestamp: number;
}

export interface ExperimentResults {
  experimentId: string;
  variants: VariantMetrics[];
  winner?: string;
  confidenceLevel?: number;
}

export interface VariantMetrics {
  variantId: string;
  variantName: string;
  totalUsers: number;
  conversions: number;
  conversionRate: number;
  averageValue?: number;
}

export class ABTestingService {
  private db: admin.firestore.Firestore;

  constructor(db?: admin.firestore.Firestore) {
    this.db = db || admin.firestore();
  }

  /**
   * Create hash for consistent user bucketing
   */
  private hashUserId(userId: string, experimentId: string): number {
    const hash = crypto
      .createHash('md5')
      .update(`${userId}:${experimentId}`)
      .digest('hex');
    return parseInt(hash.substring(0, 8), 16);
  }

  /**
   * Assign user to variant using consistent hashing
   */
  private selectVariant(userId: string, experiment: Experiment): Variant {
    const hash = this.hashUserId(userId, experiment.id);
    const bucket = hash % 100;

    let cumulativeWeight = 0;
    for (const variant of experiment.variants) {
      cumulativeWeight += variant.weight;
      if (bucket < cumulativeWeight) {
        return variant;
      }
    }

    // Fallback to first variant
    return experiment.variants[0];
  }

  /**
   * Check if user meets targeting criteria
   */
  private meetsTargetingRules(
    userContext: Record<string, any>,
    rules?: TargetingRule[]
  ): boolean {
    if (!rules || rules.length === 0) {
      return true;
    }

    return rules.every(rule => {
      const userValue = userContext[rule.type];

      switch (rule.operator) {
        case 'equals':
          return userValue === rule.value;
        case 'not_equals':
          return userValue !== rule.value;
        case 'in':
          return Array.isArray(rule.value) && rule.value.includes(userValue);
        case 'not_in':
          return Array.isArray(rule.value) && !rule.value.includes(userValue);
        default:
          return false;
      }
    });
  }

  /**
   * Get or assign user to experiment variant
   */
  async assignUserToExperiment(
    userId: string,
    experimentId: string,
    userContext: Record<string, any> = {}
  ): Promise<Assignment> {
    // Check for existing assignment
    const assignmentRef = this.db
      .collection('abTests')
      .doc(experimentId)
      .collection('assignments')
      .doc(userId);

    const existingAssignment = await assignmentRef.get();
    if (existingAssignment.exists) {
      return existingAssignment.data() as Assignment;
    }

    // Get experiment
    const experimentDoc = await this.db
      .collection('abTests')
      .doc(experimentId)
      .get();

    if (!experimentDoc.exists) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const experiment = experimentDoc.data() as Experiment;

    // Check experiment status
    if (experiment.status !== 'active') {
      throw new Error(`Experiment ${experimentId} is not active`);
    }

    // Check targeting rules
    if (!this.meetsTargetingRules(userContext, experiment.targetingRules)) {
      throw new Error('User does not meet targeting criteria');
    }

    // Assign variant
    const variant = this.selectVariant(userId, experiment);
    const assignment: Assignment = {
      experimentId,
      userId,
      variantId: variant.id,
      assignedAt: Date.now(),
    };

    // Save assignment
    await assignmentRef.set(assignment);

    return assignment;
  }

  /**
   * Track conversion event
   */
  async trackConversion(
    userId: string,
    experimentId: string,
    eventName: string,
    value?: number
  ): Promise<void> {
    // Get user's assignment
    const assignmentDoc = await this.db
      .collection('abTests')
      .doc(experimentId)
      .collection('assignments')
      .doc(userId)
      .get();

    if (!assignmentDoc.exists) {
      throw new Error('User not assigned to experiment');
    }

    const assignment = assignmentDoc.data() as Assignment;

    const event: ConversionEvent = {
      experimentId,
      userId,
      variantId: assignment.variantId,
      eventName,
      value,
      timestamp: Date.now(),
    };

    // Save conversion event
    await this.db
      .collection('abTests')
      .doc(experimentId)
      .collection('conversions')
      .add(event);
  }

  /**
   * Get experiment results with statistical analysis
   */
  async getExperimentResults(experimentId: string): Promise<ExperimentResults> {
    const experimentDoc = await this.db
      .collection('abTests')
      .doc(experimentId)
      .get();

    if (!experimentDoc.exists) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const experiment = experimentDoc.data() as Experiment;

    // Get all assignments
    const assignmentsSnapshot = await this.db
      .collection('abTests')
      .doc(experimentId)
      .collection('assignments')
      .get();

    // Get all conversions
    const conversionsSnapshot = await this.db
      .collection('abTests')
      .doc(experimentId)
      .collection('conversions')
      .get();

    // Calculate metrics per variant
    const variantMetricsMap = new Map<string, VariantMetrics>();

    // Initialize metrics
    experiment.variants.forEach(variant => {
      variantMetricsMap.set(variant.id, {
        variantId: variant.id,
        variantName: variant.name,
        totalUsers: 0,
        conversions: 0,
        conversionRate: 0,
        averageValue: 0,
      });
    });

    // Count assignments
    assignmentsSnapshot.forEach(doc => {
      const assignment = doc.data() as Assignment;
      const metrics = variantMetricsMap.get(assignment.variantId);
      if (metrics) {
        metrics.totalUsers++;
      }
    });

    // Count conversions
    const conversionsByVariant = new Map<string, number[]>();
    conversionsSnapshot.forEach(doc => {
      const conversion = doc.data() as ConversionEvent;
      const metrics = variantMetricsMap.get(conversion.variantId);
      if (metrics) {
        metrics.conversions++;
        if (conversion.value !== undefined) {
          if (!conversionsByVariant.has(conversion.variantId)) {
            conversionsByVariant.set(conversion.variantId, []);
          }
          conversionsByVariant.get(conversion.variantId)!.push(conversion.value);
        }
      }
    });

    // Calculate rates and averages
    const variantMetrics: VariantMetrics[] = [];
    variantMetricsMap.forEach(metrics => {
      if (metrics.totalUsers > 0) {
        metrics.conversionRate = (metrics.conversions / metrics.totalUsers) * 100;

        const values = conversionsByVariant.get(metrics.variantId);
        if (values && values.length > 0) {
          metrics.averageValue =
            values.reduce((sum, val) => sum + val, 0) / values.length;
        }
      }
      variantMetrics.push(metrics);
    });

    // Determine winner (simple: highest conversion rate with min users)
    const minUsersForSignificance = 30;
    const significantVariants = variantMetrics.filter(
      v => v.totalUsers >= minUsersForSignificance
    );

    let winner: string | undefined;
    let confidenceLevel: number | undefined;

    if (significantVariants.length >= 2) {
      significantVariants.sort((a, b) => b.conversionRate - a.conversionRate);
      winner = significantVariants[0].variantId;

      // Simple confidence calculation (placeholder for real statistical test)
      const topRate = significantVariants[0].conversionRate;
      const secondRate = significantVariants[1].conversionRate;
      const relativeDiff = topRate > 0 ? ((topRate - secondRate) / topRate) * 100 : 0;
      confidenceLevel = Math.min(95, 50 + relativeDiff);
    }

    return {
      experimentId,
      variants: variantMetrics,
      winner,
      confidenceLevel,
    };
  }

  /**
   * Create new experiment
   */
  async createExperiment(experiment: Omit<Experiment, 'createdAt' | 'updatedAt'>): Promise<string> {
    // Validate variant weights sum to 100
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    if (totalWeight !== 100) {
      throw new Error('Variant weights must sum to 100');
    }

    const now = Date.now();
    const experimentData: Experiment = {
      ...experiment,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await this.db.collection('abTests').add(experimentData);
    return docRef.id;
  }

  /**
   * Update experiment status
   */
  async updateExperimentStatus(
    experimentId: string,
    status: Experiment['status']
  ): Promise<void> {
    await this.db
      .collection('abTests')
      .doc(experimentId)
      .update({
        status,
        updatedAt: Date.now(),
      });
  }

  /**
   * List user's active experiments
   */
  async getUserExperiments(userId: string): Promise<Assignment[]> {
    const snapshot = await this.db
      .collectionGroup('assignments')
      .where('userId', '==', userId)
      .get();

    return snapshot.docs.map(doc => doc.data() as Assignment);
  }
}

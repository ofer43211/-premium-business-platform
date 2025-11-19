/**
 * Tests for A/B Testing Service
 * Coverage: Variant assignment, conversions, statistical analysis
 */
import { ABTestingService, Experiment, Assignment, Variant } from '../service';

describe('ABTestingService', () => {
  let service: ABTestingService;
  let mockDb: any;
  let mockCollection: jest.Mock;
  let mockCollectionGroup: jest.Mock;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockAdd: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockWhere: jest.Mock;

  beforeEach(() => {
    mockGet = jest.fn();
    mockSet = jest.fn().mockResolvedValue({});
    mockAdd = jest.fn().mockResolvedValue({ id: 'doc_123' });
    mockUpdate = jest.fn().mockResolvedValue({});
    mockWhere = jest.fn();

    mockDoc = jest.fn().mockReturnValue({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: mockGet,
          set: mockSet,
        }),
        add: mockAdd,
        get: mockGet,
      }),
    });

    mockWhere.mockReturnValue({ get: mockGet });
    mockCollectionGroup = jest.fn().mockReturnValue({ where: mockWhere });

    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      add: mockAdd,
      get: mockGet,
    });

    mockDb = {
      collection: mockCollection,
      collectionGroup: mockCollectionGroup,
    };

    service = new ABTestingService(mockDb);
  });

  describe('Experiment Creation', () => {
    it('should create new experiment', async () => {
      const experiment = {
        id: 'exp_123',
        name: 'Button Color Test',
        variants: [
          { id: 'var_a', name: 'Blue', weight: 50 },
          { id: 'var_b', name: 'Green', weight: 50 },
        ],
        startDate: Date.now(),
        status: 'draft' as const,
      };

      const experimentId = await service.createExperiment(experiment);

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Button Color Test',
          variants: expect.any(Array),
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        })
      );
      expect(experimentId).toBe('doc_123');
    });

    it('should reject experiments with invalid weight sum', async () => {
      const experiment = {
        id: 'exp_123',
        name: 'Invalid Test',
        variants: [
          { id: 'var_a', name: 'A', weight: 30 },
          { id: 'var_b', name: 'B', weight: 50 },
        ],
        startDate: Date.now(),
        status: 'draft' as const,
      };

      await expect(service.createExperiment(experiment)).rejects.toThrow(
        'Variant weights must sum to 100'
      );
    });

    it('should handle three-way split', async () => {
      const experiment = {
        id: 'exp_123',
        name: 'Three Way Test',
        variants: [
          { id: 'var_a', name: 'A', weight: 33 },
          { id: 'var_b', name: 'B', weight: 33 },
          { id: 'var_c', name: 'C', weight: 34 },
        ],
        startDate: Date.now(),
        status: 'draft' as const,
      };

      await service.createExperiment(experiment);

      expect(mockAdd).toHaveBeenCalled();
    });
  });

  describe('User Assignment', () => {
    const mockExperiment: Experiment = {
      id: 'exp_123',
      name: 'Test Experiment',
      variants: [
        { id: 'var_a', name: 'Control', weight: 50 },
        { id: 'var_b', name: 'Treatment', weight: 50 },
      ],
      startDate: Date.now(),
      status: 'active',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    it('should assign user to variant on first visit', async () => {
      // No existing assignment
      mockGet.mockResolvedValueOnce({ exists: false });
      // Get experiment
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => mockExperiment,
      });

      const assignment = await service.assignUserToExperiment(
        'user_123',
        'exp_123'
      );

      expect(assignment.userId).toBe('user_123');
      expect(assignment.experimentId).toBe('exp_123');
      expect(['var_a', 'var_b']).toContain(assignment.variantId);
      expect(mockSet).toHaveBeenCalled();
    });

    it('should return existing assignment', async () => {
      const existingAssignment: Assignment = {
        experimentId: 'exp_123',
        userId: 'user_123',
        variantId: 'var_a',
        assignedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingAssignment,
      });

      const assignment = await service.assignUserToExperiment(
        'user_123',
        'exp_123'
      );

      expect(assignment).toEqual(existingAssignment);
      expect(mockSet).not.toHaveBeenCalled();
    });

    it('should consistently assign same user to same variant', async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => mockExperiment,
      });

      const assignment1 = await service.assignUserToExperiment(
        'user_456',
        'exp_123'
      );

      // Reset mocks and assign again
      mockGet.mockReset();
      mockGet.mockResolvedValueOnce({ exists: false });
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => mockExperiment,
      });

      const assignment2 = await service.assignUserToExperiment(
        'user_456',
        'exp_123'
      );

      // Should be same variant (consistent hashing)
      expect(assignment1.variantId).toBe(assignment2.variantId);
    });

    it('should reject assignment to non-active experiment', async () => {
      const inactiveExperiment = {
        ...mockExperiment,
        status: 'paused' as const,
      };

      mockGet.mockResolvedValueOnce({ exists: false });
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => inactiveExperiment,
      });

      await expect(
        service.assignUserToExperiment('user_123', 'exp_123')
      ).rejects.toThrow('not active');
    });

    it('should reject assignment to non-existent experiment', async () => {
      mockGet.mockResolvedValueOnce({ exists: false });
      mockGet.mockResolvedValueOnce({ exists: false });

      await expect(
        service.assignUserToExperiment('user_123', 'exp_999')
      ).rejects.toThrow('not found');
    });

    it('should respect targeting rules', async () => {
      const targetedExperiment: Experiment = {
        ...mockExperiment,
        targetingRules: [
          { type: 'language', operator: 'equals', value: 'he' },
        ],
      };

      mockGet.mockResolvedValueOnce({ exists: false });
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => targetedExperiment,
      });

      // User with wrong language
      await expect(
        service.assignUserToExperiment('user_123', 'exp_123', { language: 'en' })
      ).rejects.toThrow('does not meet targeting criteria');
    });

    it('should allow assignment when targeting rules match', async () => {
      const targetedExperiment: Experiment = {
        ...mockExperiment,
        targetingRules: [
          { type: 'language', operator: 'equals', value: 'he' },
        ],
      };

      mockGet.mockResolvedValueOnce({ exists: false });
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => targetedExperiment,
      });

      const assignment = await service.assignUserToExperiment(
        'user_123',
        'exp_123',
        { language: 'he' }
      );

      expect(assignment.userId).toBe('user_123');
    });

    it('should handle "in" operator for targeting', async () => {
      const targetedExperiment: Experiment = {
        ...mockExperiment,
        targetingRules: [
          { type: 'country', operator: 'in', value: ['US', 'CA', 'UK'] },
        ],
      };

      mockGet.mockResolvedValueOnce({ exists: false });
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => targetedExperiment,
      });

      const assignment = await service.assignUserToExperiment(
        'user_123',
        'exp_123',
        { country: 'US' }
      );

      expect(assignment.userId).toBe('user_123');
    });
  });

  describe('Conversion Tracking', () => {
    it('should track conversion event', async () => {
      const assignment: Assignment = {
        experimentId: 'exp_123',
        userId: 'user_123',
        variantId: 'var_a',
        assignedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => assignment,
      });

      await service.trackConversion('user_123', 'exp_123', 'purchase', 99.99);

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          experimentId: 'exp_123',
          userId: 'user_123',
          variantId: 'var_a',
          eventName: 'purchase',
          value: 99.99,
          timestamp: expect.any(Number),
        })
      );
    });

    it('should track conversion without value', async () => {
      const assignment: Assignment = {
        experimentId: 'exp_123',
        userId: 'user_123',
        variantId: 'var_a',
        assignedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => assignment,
      });

      await service.trackConversion('user_123', 'exp_123', 'click');

      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          eventName: 'click',
          value: undefined,
        })
      );
    });

    it('should reject conversion for unassigned user', async () => {
      mockGet.mockResolvedValue({ exists: false });

      await expect(
        service.trackConversion('user_999', 'exp_123', 'purchase')
      ).rejects.toThrow('not assigned');
    });
  });

  describe('Results Analysis', () => {
    it('should calculate experiment results', async () => {
      const experiment: Experiment = {
        id: 'exp_123',
        name: 'Test',
        variants: [
          { id: 'var_a', name: 'Control', weight: 50 },
          { id: 'var_b', name: 'Treatment', weight: 50 },
        ],
        startDate: Date.now(),
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // Mock experiment
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => experiment,
      });

      // Mock assignments (100 users, 50 each variant)
      const assignments = [
        ...Array(50)
          .fill(null)
          .map((_, i) => ({
            data: () => ({
              userId: `user_${i}`,
              variantId: 'var_a',
              experimentId: 'exp_123',
              assignedAt: Date.now(),
            }),
          })),
        ...Array(50)
          .fill(null)
          .map((_, i) => ({
            data: () => ({
              userId: `user_${i + 50}`,
              variantId: 'var_b',
              experimentId: 'exp_123',
              assignedAt: Date.now(),
            }),
          })),
      ];

      mockGet.mockResolvedValueOnce({
        forEach: (cb: any) => assignments.forEach(cb),
      });

      // Mock conversions (10 for var_a, 20 for var_b)
      const conversions = [
        ...Array(10)
          .fill(null)
          .map(() => ({
            data: () => ({
              variantId: 'var_a',
              eventName: 'purchase',
              value: 100,
              timestamp: Date.now(),
            }),
          })),
        ...Array(20)
          .fill(null)
          .map(() => ({
            data: () => ({
              variantId: 'var_b',
              eventName: 'purchase',
              value: 100,
              timestamp: Date.now(),
            }),
          })),
      ];

      mockGet.mockResolvedValueOnce({
        forEach: (cb: any) => conversions.forEach(cb),
      });

      const results = await service.getExperimentResults('exp_123');

      expect(results.experimentId).toBe('exp_123');
      expect(results.variants).toHaveLength(2);

      const controlMetrics = results.variants.find(v => v.variantId === 'var_a');
      const treatmentMetrics = results.variants.find(v => v.variantId === 'var_b');

      expect(controlMetrics?.totalUsers).toBe(50);
      expect(controlMetrics?.conversions).toBe(10);
      expect(controlMetrics?.conversionRate).toBe(20);

      expect(treatmentMetrics?.totalUsers).toBe(50);
      expect(treatmentMetrics?.conversions).toBe(20);
      expect(treatmentMetrics?.conversionRate).toBe(40);

      // Treatment should be winner
      expect(results.winner).toBe('var_b');
      expect(results.confidenceLevel).toBeGreaterThan(0);
    });

    it('should handle experiments with no conversions', async () => {
      const experiment: Experiment = {
        id: 'exp_123',
        name: 'Test',
        variants: [
          { id: 'var_a', name: 'Control', weight: 50 },
          { id: 'var_b', name: 'Treatment', weight: 50 },
        ],
        startDate: Date.now(),
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => experiment,
      });

      mockGet.mockResolvedValueOnce({
        forEach: (cb: any) => {},
      });

      mockGet.mockResolvedValueOnce({
        forEach: (cb: any) => {},
      });

      const results = await service.getExperimentResults('exp_123');

      expect(results.variants.every(v => v.conversions === 0)).toBe(true);
      expect(results.winner).toBeUndefined();
    });

    it('should not declare winner with insufficient data', async () => {
      const experiment: Experiment = {
        id: 'exp_123',
        name: 'Test',
        variants: [
          { id: 'var_a', name: 'Control', weight: 50 },
          { id: 'var_b', name: 'Treatment', weight: 50 },
        ],
        startDate: Date.now(),
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => experiment,
      });

      // Only 10 users per variant (below 30 minimum)
      const assignments = [
        ...Array(10)
          .fill(null)
          .map((_, i) => ({
            data: () => ({
              userId: `user_${i}`,
              variantId: 'var_a',
              experimentId: 'exp_123',
              assignedAt: Date.now(),
            }),
          })),
        ...Array(10)
          .fill(null)
          .map((_, i) => ({
            data: () => ({
              userId: `user_${i + 10}`,
              variantId: 'var_b',
              experimentId: 'exp_123',
              assignedAt: Date.now(),
            }),
          })),
      ];

      mockGet.mockResolvedValueOnce({
        forEach: (cb: any) => assignments.forEach(cb),
      });

      mockGet.mockResolvedValueOnce({
        forEach: (cb: any) => {},
      });

      const results = await service.getExperimentResults('exp_123');

      expect(results.winner).toBeUndefined();
    });
  });

  describe('Experiment Management', () => {
    it('should update experiment status', async () => {
      await service.updateExperimentStatus('exp_123', 'paused');

      expect(mockUpdate).toHaveBeenCalledWith({
        status: 'paused',
        updatedAt: expect.any(Number),
      });
    });

    it('should list user experiments', async () => {
      const assignments = [
        {
          data: () => ({
            userId: 'user_123',
            experimentId: 'exp_1',
            variantId: 'var_a',
            assignedAt: Date.now(),
          }),
        },
        {
          data: () => ({
            userId: 'user_123',
            experimentId: 'exp_2',
            variantId: 'var_b',
            assignedAt: Date.now(),
          }),
        },
      ];

      mockGet.mockResolvedValue({
        docs: assignments,
      });

      const userExperiments = await service.getUserExperiments('user_123');

      expect(userExperiments).toHaveLength(2);
      expect(userExperiments[0].experimentId).toBe('exp_1');
      expect(userExperiments[1].experimentId).toBe('exp_2');
    });
  });
});

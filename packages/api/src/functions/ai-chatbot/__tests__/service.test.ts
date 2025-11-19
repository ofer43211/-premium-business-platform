/**
 * Tests for AI Chatbot Service
 * Coverage: Conversation management, OpenAI integration, error handling
 */
import { AIChatbotService, Conversation, Message } from '../service';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  }));
});

describe('AIChatbotService', () => {
  let service: AIChatbotService;
  let mockDb: any;
  let mockOpenAI: any;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;

  beforeEach(() => {
    // Setup Firestore mocks
    mockGet = jest.fn();
    mockSet = jest.fn().mockResolvedValue({});
    mockUpdate = jest.fn().mockResolvedValue({});
    mockDelete = jest.fn().mockResolvedValue({});
    mockLimit = jest.fn();
    mockOrderBy = jest.fn();
    mockWhere = jest.fn();

    mockDoc = jest.fn().mockReturnValue({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
      delete: mockDelete,
      id: 'conv_123',
    });

    mockLimit.mockReturnValue({ get: mockGet });
    mockOrderBy.mockReturnValue({ limit: mockLimit });
    mockWhere.mockReturnValue({ orderBy: mockOrderBy });

    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
    });

    mockDb = {
      collection: mockCollection,
    };

    // Setup OpenAI mock
    const OpenAIMock = OpenAI as jest.MockedClass<typeof OpenAI>;
    mockOpenAI = new OpenAIMock({ apiKey: 'test-key' });

    service = new AIChatbotService('test-api-key', mockDb);
  });

  describe('Conversation Creation', () => {
    it('should create new conversation', async () => {
      const conversationId = await service.createConversation('user_123', 'en');

      expect(mockCollection).toHaveBeenCalledWith('conversations');
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user_123',
          language: 'en',
          messages: [],
        })
      );
      expect(conversationId).toBe('conv_123');
    });

    it('should create conversation with Hebrew language', async () => {
      await service.createConversation('user_123', 'he');

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'he',
        })
      );
    });

    it('should default to English if no language specified', async () => {
      await service.createConversation('user_123');

      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'en',
        })
      );
    });
  });

  describe('Load Conversation', () => {
    it('should load existing conversation', async () => {
      const mockConversation: Conversation = {
        id: 'conv_123',
        userId: 'user_123',
        messages: [],
        language: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      const result = await service.loadConversation('conv_123');

      expect(result).toEqual(mockConversation);
      expect(mockDoc).toHaveBeenCalledWith('conv_123');
    });

    it('should return null for non-existent conversation', async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      const result = await service.loadConversation('conv_999');

      expect(result).toBeNull();
    });
  });

  describe('Send Message', () => {
    it('should send message and get response', async () => {
      const mockConversation: Conversation = {
        id: 'conv_123',
        userId: 'user_123',
        messages: [],
        language: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Hello! How can I help you?',
            },
          },
        ],
        usage: {
          total_tokens: 50,
        },
      });

      const response = await service.sendMessage(
        'conv_123',
        'user_123',
        'Hello'
      );

      expect(response.message).toBe('Hello! How can I help you?');
      expect(response.conversationId).toBe('conv_123');
      expect(response.tokensUsed).toBe(50);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'user', content: 'Hello' }),
            expect.objectContaining({
              role: 'assistant',
              content: 'Hello! How can I help you?',
            }),
          ]),
        })
      );
    });

    it('should reject empty messages', async () => {
      await expect(
        service.sendMessage('conv_123', 'user_123', '')
      ).rejects.toThrow('Message cannot be empty');

      await expect(
        service.sendMessage('conv_123', 'user_123', '   ')
      ).rejects.toThrow('Message cannot be empty');
    });

    it('should reject messages that are too long', async () => {
      const longMessage = 'a'.repeat(4001);

      await expect(
        service.sendMessage('conv_123', 'user_123', longMessage)
      ).rejects.toThrow('Message too long');
    });

    it('should reject unauthorized access', async () => {
      const mockConversation: Conversation = {
        id: 'conv_123',
        userId: 'user_456', // Different user
        messages: [],
        language: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      await expect(
        service.sendMessage('conv_123', 'user_123', 'Hello')
      ).rejects.toThrow('Unauthorized access to conversation');
    });

    it('should handle OpenAI API errors', async () => {
      const mockConversation: Conversation = {
        id: 'conv_123',
        userId: 'user_123',
        messages: [],
        language: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      const apiError = new OpenAI.APIError(
        500,
        { error: { message: 'API Error' } } as any,
        'API Error',
        {}
      );

      mockOpenAI.chat.completions.create.mockRejectedValue(apiError);

      await expect(
        service.sendMessage('conv_123', 'user_123', 'Hello')
      ).rejects.toThrow('OpenAI API error');
    });

    it('should handle missing response from AI', async () => {
      const mockConversation: Conversation = {
        id: 'conv_123',
        userId: 'user_123',
        messages: [],
        language: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [],
      });

      await expect(
        service.sendMessage('conv_123', 'user_123', 'Hello')
      ).rejects.toThrow('No response from AI');
    });

    it('should limit context to last 10 messages', async () => {
      const messages: Message[] = Array.from({ length: 15 }, (_, i) => ({
        role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
        content: `Message ${i}`,
        timestamp: Date.now(),
      }));

      const mockConversation: Conversation = {
        id: 'conv_123',
        userId: 'user_123',
        messages,
        language: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'Response' } }],
        usage: { total_tokens: 50 },
      });

      await service.sendMessage('conv_123', 'user_123', 'New message');

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            // Should only include last 10 messages + new message
          ]),
        })
      );

      const call = mockOpenAI.chat.completions.create.mock.calls[0][0];
      // System prompt + 10 recent messages + 1 new message = 12
      expect(call.messages.length).toBeLessThanOrEqual(12);
    });

    it('should use correct system prompt for Hebrew', async () => {
      const mockConversation: Conversation = {
        id: 'conv_123',
        userId: 'user_123',
        messages: [],
        language: 'he',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      mockOpenAI.chat.completions.create.mockResolvedValue({
        choices: [{ message: { content: 'שלום!' } }],
        usage: { total_tokens: 50 },
      });

      await service.sendMessage('conv_123', 'user_123', 'שלום');

      const call = mockOpenAI.chat.completions.create.mock.calls[0][0];
      expect(call.messages[0].content).toContain('אתה');
    });
  });

  describe('Delete Conversation', () => {
    it('should delete conversation', async () => {
      const mockConversation: Conversation = {
        id: 'conv_123',
        userId: 'user_123',
        messages: [],
        language: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      await service.deleteConversation('conv_123', 'user_123');

      expect(mockDelete).toHaveBeenCalled();
    });

    it('should reject unauthorized deletion', async () => {
      const mockConversation: Conversation = {
        id: 'conv_123',
        userId: 'user_456',
        messages: [],
        language: 'en',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => mockConversation,
      });

      await expect(
        service.deleteConversation('conv_123', 'user_123')
      ).rejects.toThrow('Unauthorized access to conversation');
    });

    it('should throw error for non-existent conversation', async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      await expect(
        service.deleteConversation('conv_999', 'user_123')
      ).rejects.toThrow('Conversation not found');
    });
  });

  describe('List Conversations', () => {
    it('should list user conversations', async () => {
      const mockConversations = [
        {
          id: 'conv_1',
          userId: 'user_123',
          messages: [],
          language: 'en',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: 'conv_2',
          userId: 'user_123',
          messages: [],
          language: 'he',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      mockGet.mockResolvedValue({
        docs: mockConversations.map((conv) => ({
          data: () => conv,
        })),
      });

      const result = await service.listConversations('user_123');

      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user_123');
      expect(mockOrderBy).toHaveBeenCalledWith('updatedAt', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(20);
      expect(result).toHaveLength(2);
    });

    it('should respect custom limit', async () => {
      mockGet.mockResolvedValue({ docs: [] });

      await service.listConversations('user_123', 10);

      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('should return empty array when no conversations', async () => {
      mockGet.mockResolvedValue({ docs: [] });

      const result = await service.listConversations('user_123');

      expect(result).toEqual([]);
    });
  });
});

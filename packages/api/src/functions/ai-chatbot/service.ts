/**
 * AI Chatbot Service
 * Handles conversation with OpenAI API
 */
import OpenAI from 'openai';
import * as admin from 'firebase-admin';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface Conversation {
  id: string;
  userId: string;
  messages: Message[];
  language?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  tokensUsed?: number;
}

export class AIChatbotService {
  private openai: OpenAI;
  private db: admin.firestore.Firestore;
  private readonly maxTokens = 1000;
  private readonly maxMessagesInContext = 10;

  constructor(apiKey: string, db?: admin.firestore.Firestore) {
    this.openai = new OpenAI({ apiKey });
    this.db = db || admin.firestore();
  }

  /**
   * Get system prompt based on language
   */
  private getSystemPrompt(language: string = 'en'): string {
    const prompts: Record<string, string> = {
      en: 'You are a helpful assistant for a premium business platform. Provide clear, professional answers.',
      he: 'אתה עוזר מועיל לפלטפורמת עסקים פרמיום. ספק תשובות ברורות ומקצועיות.',
      ar: 'أنت مساعد مفيد لمنصة أعمال متميزة. قدم إجابات واضحة ومهنية.',
    };
    return prompts[language] || prompts.en;
  }

  /**
   * Load conversation history
   */
  async loadConversation(conversationId: string): Promise<Conversation | null> {
    const doc = await this.db
      .collection('conversations')
      .doc(conversationId)
      .get();

    if (!doc.exists) {
      return null;
    }

    return doc.data() as Conversation;
  }

  /**
   * Create new conversation
   */
  async createConversation(
    userId: string,
    language: string = 'en'
  ): Promise<string> {
    const conversationRef = this.db.collection('conversations').doc();
    const now = Date.now();

    const conversation: Conversation = {
      id: conversationRef.id,
      userId,
      messages: [],
      language,
      createdAt: now,
      updatedAt: now,
    };

    await conversationRef.set(conversation);
    return conversationRef.id;
  }

  /**
   * Prepare messages for OpenAI API
   */
  private prepareMessages(
    conversation: Conversation,
    newMessage: string
  ): OpenAI.Chat.ChatCompletionMessageParam[] {
    const systemPrompt = this.getSystemPrompt(conversation.language);

    // Get last N messages for context
    const recentMessages = conversation.messages.slice(-this.maxMessagesInContext);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user' as const, content: newMessage },
    ];

    return messages;
  }

  /**
   * Send message and get response
   */
  async sendMessage(
    conversationId: string,
    userId: string,
    message: string
  ): Promise<ChatResponse> {
    // Validate input
    if (!message || message.trim().length === 0) {
      throw new Error('Message cannot be empty');
    }

    if (message.length > 4000) {
      throw new Error('Message too long (max 4000 characters)');
    }

    // Load or create conversation
    let conversation = await this.loadConversation(conversationId);

    if (!conversation) {
      // Create new conversation
      const newConversationId = await this.createConversation(userId);
      conversation = await this.loadConversation(newConversationId);
      if (!conversation) {
        throw new Error('Failed to create conversation');
      }
    }

    // Verify user owns conversation
    if (conversation.userId !== userId) {
      throw new Error('Unauthorized access to conversation');
    }

    // Prepare messages for API
    const messages = this.prepareMessages(conversation, message);

    try {
      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        max_tokens: this.maxTokens,
        temperature: 0.7,
      });

      const assistantMessage = completion.choices[0]?.message?.content;
      if (!assistantMessage) {
        throw new Error('No response from AI');
      }

      // Update conversation
      const now = Date.now();
      const updatedMessages = [
        ...conversation.messages,
        { role: 'user' as const, content: message, timestamp: now },
        { role: 'assistant' as const, content: assistantMessage, timestamp: now },
      ];

      await this.db
        .collection('conversations')
        .doc(conversationId)
        .update({
          messages: updatedMessages,
          updatedAt: now,
        });

      return {
        message: assistantMessage,
        conversationId: conversation.id,
        tokensUsed: completion.usage?.total_tokens,
      };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.loadConversation(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (conversation.userId !== userId) {
      throw new Error('Unauthorized access to conversation');
    }

    await this.db.collection('conversations').doc(conversationId).delete();
  }

  /**
   * List user's conversations
   */
  async listConversations(userId: string, limit: number = 20): Promise<Conversation[]> {
    const snapshot = await this.db
      .collection('conversations')
      .where('userId', '==', userId)
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => doc.data() as Conversation);
  }
}

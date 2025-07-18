/**
 * AI & Machine Learning Integration for BSN Social Network
 * Content Recommendation, Fraud Detection, and Sentiment Analysis
 */

import { User, Post, Interaction } from '../types';

interface RecommendationScore {
  postId: string;
  score: number;
  reason: string;
  confidence: number;
}

interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  toxicity: number;
}

interface FraudDetection {
  isFraudulent: boolean;
  riskScore: number;
  reasons: string[];
  confidence: number;
}

interface UserBehavior {
  userId: string;
  interests: string[];
  activityPattern: {
    timeOfDay: number[];
    dayOfWeek: number[];
    frequency: number;
  };
  contentPreferences: {
    categories: Record<string, number>;
    hashtags: Record<string, number>;
    authors: Record<string, number>;
  };
}

class ContentRecommendationEngine {
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private contentEmbeddings: Map<string, number[]> = new Map();
  private modelVersion: string = 'v1.0.0';

  /**
   * Generate personalized content recommendations
   */
  async generateRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<RecommendationScore[]> {
    try {
      const userBehavior = await this.getUserBehavior(userId);
      const availablePosts = await this.getAvailablePosts(userId);
      
      const recommendations: RecommendationScore[] = [];
      
      for (const post of availablePosts) {
        const score = await this.calculateRecommendationScore(post, userBehavior);
        recommendations.push({
          postId: post.id,
          score: score.score,
          reason: score.reason,
          confidence: score.confidence,
        });
      }
      
      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      return [];
    }
  }

  /**
   * Calculate recommendation score for a post
   */
  private async calculateRecommendationScore(
    post: Post,
    userBehavior: UserBehavior
  ): Promise<{ score: number; reason: string; confidence: number }> {
    let score = 0;
    const reasons: string[] = [];
    let confidence = 0.5;

    // Content similarity scoring
    const contentSimilarity = this.calculateContentSimilarity(post, userBehavior);
    score += contentSimilarity * 0.3;
    if (contentSimilarity > 0.7) {
      reasons.push('Similar to your interests');
    }

    // Author preference scoring
    const authorPreference = userBehavior.contentPreferences.authors[post.authorId] || 0;
    score += authorPreference * 0.2;
    if (authorPreference > 0.5) {
      reasons.push('From author you follow');
    }

    // Hashtag preference scoring
    const hashtagScore = this.calculateHashtagScore(post, userBehavior);
    score += hashtagScore * 0.2;
    if (hashtagScore > 0.6) {
      reasons.push('Contains hashtags you like');
    }

    // Engagement prediction
    const engagementScore = await this.predictEngagement(post);
    score += engagementScore * 0.15;
    if (engagementScore > 0.8) {
      reasons.push('High engagement potential');
    }

    // Recency bonus
    const recencyBonus = this.calculateRecencyBonus(post);
    score += recencyBonus * 0.15;
    if (recencyBonus > 0.5) {
      reasons.push('Recent content');
    }

    // Normalize score to 0-1 range
    score = Math.min(Math.max(score, 0), 1);
    confidence = Math.min(confidence + score * 0.5, 1);

    return {
      score,
      reason: reasons.join(', '),
      confidence,
    };
  }

  /**
   * Calculate content similarity based on user interests
   */
  private calculateContentSimilarity(
    post: Post,
    userBehavior: UserBehavior
  ): number {
    const postKeywords = this.extractKeywords(post.content);
    const userInterests = userBehavior.interests;
    
    let similarity = 0;
    let matches = 0;
    
    for (const keyword of postKeywords) {
      if (userInterests.includes(keyword)) {
        matches++;
      }
    }
    
    similarity = matches / Math.max(postKeywords.length, 1);
    return similarity;
  }

  /**
   * Calculate hashtag preference score
   */
  private calculateHashtagScore(
    post: Post,
    userBehavior: UserBehavior
  ): number {
    const postHashtags = this.extractHashtags(post.content);
    let totalScore = 0;
    
    for (const hashtag of postHashtags) {
      const preference = userBehavior.contentPreferences.hashtags[hashtag] || 0;
      totalScore += preference;
    }
    
    return totalScore / Math.max(postHashtags.length, 1);
  }

  /**
   * Predict engagement for a post
   */
  private async predictEngagement(post: Post): Promise<number> {
    // Simple engagement prediction based on content features
    let engagementScore = 0.5; // Base score
    
    // Content length factor
    const contentLength = post.content.length;
    if (contentLength > 100 && contentLength < 500) {
      engagementScore += 0.1;
    }
    
    // Hashtag factor
    const hashtagCount = this.extractHashtags(post.content).length;
    if (hashtagCount > 0 && hashtagCount <= 5) {
      engagementScore += 0.1;
    }
    
    // Media factor
    if (post.media && post.media.length > 0) {
      engagementScore += 0.2;
    }
    
    // Time factor (posts during peak hours get bonus)
    const postHour = new Date(post.createdAt).getHours();
    if (postHour >= 18 && postHour <= 22) {
      engagementScore += 0.1;
    }
    
    return Math.min(engagementScore, 1);
  }

  /**
   * Calculate recency bonus
   */
  private calculateRecencyBonus(post: Post): number {
    const now = new Date();
    const postDate = new Date(post.createdAt);
    const hoursDiff = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
    
    // Higher bonus for recent posts
    if (hoursDiff < 1) return 0.3;
    if (hoursDiff < 6) return 0.2;
    if (hoursDiff < 24) return 0.1;
    if (hoursDiff < 72) return 0.05;
    
    return 0;
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Remove common stop words
    const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    return words.filter(word => !stopWords.includes(word));
  }

  /**
   * Extract hashtags from content
   */
  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1)) : [];
  }

  /**
   * Get user behavior data
   */
  private async getUserBehavior(userId: string): Promise<UserBehavior> {
    // In production, this would fetch from database
    const cached = this.userBehaviors.get(userId);
    if (cached) return cached;

    const behavior: UserBehavior = {
      userId,
      interests: ['blockchain', 'crypto', 'technology', 'social'],
      activityPattern: {
        timeOfDay: [9, 12, 18, 21],
        dayOfWeek: [1, 2, 3, 4, 5],
        frequency: 5,
      },
      contentPreferences: {
        categories: {
          'blockchain': 0.8,
          'crypto': 0.7,
          'technology': 0.6,
        },
        hashtags: {
          'blockchain': 0.8,
          'crypto': 0.7,
          'defi': 0.6,
        },
        authors: {},
      },
    };

    this.userBehaviors.set(userId, behavior);
    return behavior;
  }

  /**
   * Get available posts for recommendation
   */
  private async getAvailablePosts(userId: string): Promise<Post[]> {
    // In production, this would fetch from API
    return [];
  }
}

class SentimentAnalysisEngine {
  private modelVersion: string = 'v1.0.0';

  /**
   * Analyze sentiment of content
   */
  async analyzeSentiment(content: string): Promise<SentimentAnalysis> {
    try {
      const words = content.toLowerCase().split(/\s+/);
      
      // Simple sentiment analysis based on keyword matching
      const positiveWords = ['good', 'great', 'awesome', 'love', 'like', 'happy', 'excellent', 'amazing'];
      const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'dislike', 'sad', 'horrible', 'worst'];
      
      let positiveCount = 0;
      let negativeCount = 0;
      
      for (const word of words) {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
      }
      
      const total = words.length;
      const positiveRatio = positiveCount / total;
      const negativeRatio = negativeCount / total;
      
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      let confidence = 0.5;
      
      if (positiveRatio > negativeRatio && positiveRatio > 0.1) {
        sentiment = 'positive';
        confidence = positiveRatio;
      } else if (negativeRatio > positiveRatio && negativeRatio > 0.1) {
        sentiment = 'negative';
        confidence = negativeRatio;
      }
      
      const keywords = this.extractKeywords(content);
      const toxicity = this.calculateToxicity(content);
      
      return {
        sentiment,
        confidence,
        keywords,
        toxicity,
      };
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        keywords: [],
        toxicity: 0,
      };
    }
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string): string[] {
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Return unique keywords
    return [...new Set(words)].slice(0, 10);
  }

  /**
   * Calculate toxicity score
   */
  private calculateToxicity(content: string): number {
    const toxicWords = [
      'hate', 'stupid', 'idiot', 'dumb', 'kill', 'death', 'violence',
      'racist', 'sexist', 'discriminatory', 'offensive'
    ];
    
    const words = content.toLowerCase().split(/\s+/);
    let toxicCount = 0;
    
    for (const word of words) {
      if (toxicWords.includes(word)) {
        toxicCount++;
      }
    }
    
    return Math.min(toxicCount / words.length, 1);
  }
}

class FraudDetectionEngine {
  private modelVersion: string = 'v1.0.0';
  private suspiciousPatterns: Map<string, number> = new Map();

  /**
   * Detect fraudulent activity
   */
  async detectFraud(
    userId: string,
    action: string,
    data: any
  ): Promise<FraudDetection> {
    try {
      let riskScore = 0;
      const reasons: string[] = [];
      let confidence = 0.5;

      // Check for suspicious patterns
      const patternScore = this.checkSuspiciousPatterns(userId, action, data);
      riskScore += patternScore.score;
      reasons.push(...patternScore.reasons);

      // Check for unusual activity
      const activityScore = await this.checkUnusualActivity(userId, action);
      riskScore += activityScore.score;
      reasons.push(...activityScore.reasons);

      // Check for bot-like behavior
      const botScore = this.checkBotBehavior(userId, data);
      riskScore += botScore.score;
      reasons.push(...botScore.reasons);

      // Normalize risk score
      riskScore = Math.min(Math.max(riskScore, 0), 1);
      confidence = Math.min(confidence + riskScore * 0.5, 1);

      return {
        isFraudulent: riskScore > 0.7,
        riskScore,
        reasons,
        confidence,
      };
    } catch (error) {
      console.error('Fraud detection failed:', error);
      return {
        isFraudulent: false,
        riskScore: 0,
        reasons: ['Analysis failed'],
        confidence: 0,
      };
    }
  }

  /**
   * Check for suspicious patterns
   */
  private checkSuspiciousPatterns(
    userId: string,
    action: string,
    data: any
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Check for rapid posting
    if (action === 'create_post') {
      const recentPosts = this.getRecentPosts(userId);
      if (recentPosts.length > 5) {
        score += 0.3;
        reasons.push('Rapid posting detected');
      }
    }

    // Check for spam-like content
    if (action === 'create_post' && data.content) {
      const content = data.content.toLowerCase();
      const spamIndicators = ['buy now', 'click here', 'free money', 'make money fast'];
      
      for (const indicator of spamIndicators) {
        if (content.includes(indicator)) {
          score += 0.4;
          reasons.push('Spam-like content detected');
          break;
        }
      }
    }

    // Check for suspicious links
    if (data.links && data.links.length > 0) {
      const suspiciousDomains = ['spam.com', 'fake.com', 'scam.com'];
      for (const link of data.links) {
        if (suspiciousDomains.some(domain => link.includes(domain))) {
          score += 0.5;
          reasons.push('Suspicious links detected');
        }
      }
    }

    return { score, reasons };
  }

  /**
   * Check for unusual activity patterns
   */
  private async checkUnusualActivity(
    userId: string,
    action: string
  ): Promise<{ score: number; reasons: string[] }> {
    let score = 0;
    const reasons: string[] = [];

    // Check for unusual time patterns
    const currentHour = new Date().getHours();
    if (currentHour < 6 || currentHour > 23) {
      score += 0.2;
      reasons.push('Unusual activity time');
    }

    // Check for excessive actions
    const recentActions = this.getRecentActions(userId);
    if (recentActions.length > 20) {
      score += 0.3;
      reasons.push('Excessive activity detected');
    }

    return { score, reasons };
  }

  /**
   * Check for bot-like behavior
   */
  private checkBotBehavior(
    userId: string,
    data: any
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Check for repetitive patterns
    if (data.content) {
      const words = data.content.split(/\s+/);
      const uniqueWords = new Set(words);
      const repetitionRatio = uniqueWords.size / words.length;
      
      if (repetitionRatio < 0.3) {
        score += 0.4;
        reasons.push('Repetitive content pattern');
      }
    }

    // Check for automated timing
    const recentActions = this.getRecentActions(userId);
    if (recentActions.length > 5) {
      const timeIntervals = [];
      for (let i = 1; i < recentActions.length; i++) {
        const interval = recentActions[i].timestamp - recentActions[i-1].timestamp;
        timeIntervals.push(interval);
      }
      
      const avgInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;
      const variance = timeIntervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / timeIntervals.length;
      
      if (variance < 1000) { // Very consistent timing
        score += 0.3;
        reasons.push('Automated timing pattern');
      }
    }

    return { score, reasons };
  }

  /**
   * Get recent posts for a user
   */
  private getRecentPosts(userId: string): any[] {
    // In production, this would fetch from database
    return [];
  }

  /**
   * Get recent actions for a user
   */
  private getRecentActions(userId: string): any[] {
    // In production, this would fetch from database
    return [];
  }
}

// Initialize AI engines
export const contentRecommendationEngine = new ContentRecommendationEngine();
export const sentimentAnalysisEngine = new SentimentAnalysisEngine();
export const fraudDetectionEngine = new FraudDetectionEngine();

/**
 * AI Service for BSN Social Network
 */
export class AIService {
  /**
   * Get personalized content recommendations
   */
  static async getRecommendations(userId: string, limit: number = 10) {
    return await contentRecommendationEngine.generateRecommendations(userId, limit);
  }

  /**
   * Analyze content sentiment
   */
  static async analyzeSentiment(content: string) {
    return await sentimentAnalysisEngine.analyzeSentiment(content);
  }

  /**
   * Detect fraudulent activity
   */
  static async detectFraud(userId: string, action: string, data: any) {
    return await fraudDetectionEngine.detectFraud(userId, action, data);
  }

  /**
   * Moderate content automatically
   */
  static async moderateContent(content: string, userId: string) {
    const [sentiment, fraud] = await Promise.all([
      this.analyzeSentiment(content),
      this.detectFraud(userId, 'create_post', { content })
    ]);

    return {
      isApproved: sentiment.toxicity < 0.7 && !fraud.isFraudulent,
      sentiment,
      fraud,
      moderationScore: (sentiment.toxicity + fraud.riskScore) / 2,
    };
  }
} 
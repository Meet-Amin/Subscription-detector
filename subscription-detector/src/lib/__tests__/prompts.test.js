import { describe, it, expect } from 'vitest';
import {
  getSubscriptionPrompt,
  getHiddenFeePrompt,
  getPlatformHiddenFeePrompt,
} from '../prompts.js';

describe('getSubscriptionPrompt', () => {
  it('returns a string containing the statement text', () => {
    const result = getSubscriptionPrompt('NETFLIX 15.49');
    expect(typeof result).toBe('string');
    expect(result).toContain('NETFLIX 15.49');
  });

  it('includes instructions for JSON array output', () => {
    const result = getSubscriptionPrompt('dummy');
    expect(result).toContain('JSON array');
  });

  it('includes all required field names', () => {
    const result = getSubscriptionPrompt('dummy');
    for (const field of ['id', 'name', 'icon', 'amount', 'frequency', 'category', 'recommendation', 'reason']) {
      expect(result).toContain(field);
    }
  });
});

describe('getHiddenFeePrompt', () => {
  it('returns a string containing the statement text', () => {
    const result = getHiddenFeePrompt('OVERDRAFT FEE 34.99');
    expect(typeof result).toBe('string');
    expect(result).toContain('OVERDRAFT FEE 34.99');
  });

  it('includes isHidden field instruction', () => {
    const result = getHiddenFeePrompt('dummy');
    expect(result).toContain('isHidden');
  });
});

describe('getPlatformHiddenFeePrompt', () => {
  it('includes the URL and page content', () => {
    const result = getPlatformHiddenFeePrompt('https://example.com/pricing', 'Cancel anytime*');
    expect(result).toContain('https://example.com/pricing');
    expect(result).toContain('Cancel anytime*');
  });

  it('truncates page content to 8000 characters', () => {
    const longContent = 'a'.repeat(10000);
    const result = getPlatformHiddenFeePrompt('https://example.com', longContent);
    // The content inside the prompt should not be more than 8000 chars worth
    expect(result).toContain('a'.repeat(8000));
    expect(result).not.toContain('a'.repeat(8001));
  });

  it('includes all required field names', () => {
    const result = getPlatformHiddenFeePrompt('https://x.com', 'text');
    for (const field of ['id', 'name', 'icon', 'amount', 'frequency', 'category', 'recommendation', 'reason']) {
      expect(result).toContain(field);
    }
  });
});

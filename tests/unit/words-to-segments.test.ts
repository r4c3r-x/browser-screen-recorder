import { describe, expect, it } from 'vitest';
import { groupWordsIntoSegments, type RecognizedWord } from '../../src/transcript/words-to-segments';

function word(start: number, end: number, text: string): RecognizedWord {
  return { conf: 1, start, end, word: text };
}

describe('groupWordsIntoSegments', () => {
  it('keeps a fluent run of words in one segment', () => {
    const segments = groupWordsIntoSegments([
      word(0, 0.3, 'hello'),
      word(0.35, 0.6, 'recorded'),
      word(0.65, 0.9, 'world'),
    ]);
    expect(segments).toHaveLength(1);
    expect(segments[0]?.text).toBe('hello recorded world');
    expect(segments[0]?.startMs).toBe(0);
    expect(segments[0]?.endMs).toBe(900);
  });

  it('starts a new segment after a speaker pause', () => {
    const segments = groupWordsIntoSegments([
      word(0, 0.5, 'first'),
      word(3.0, 3.5, 'second'), // 2.5 s gap > 1.5 s threshold
    ]);
    expect(segments).toHaveLength(2);
    expect(segments[0]?.text).toBe('first');
    expect(segments[1]?.text).toBe('second');
  });

  it('starts a new segment past the duration budget', () => {
    const segments = groupWordsIntoSegments([
      word(0, 4.0, 'one'),
      word(4.01, 6.0, 'two'), // segment would exceed 5 s
    ]);
    expect(segments).toHaveLength(2);
  });

  it('starts a new segment past the character budget', () => {
    const longWord = 'x'.repeat(80);
    const segments = groupWordsIntoSegments([
      word(0, 0.5, longWord),
      word(0.6, 1.0, longWord), // 80 + 1 + 80 > 84 chars
    ]);
    expect(segments).toHaveLength(2);
  });

  it('closes a segment after sentence-ending punctuation', () => {
    const segments = groupWordsIntoSegments([
      word(0, 0.5, 'stop.'),
      word(0.6, 1.0, 'next'),
    ]);
    expect(segments).toHaveLength(2);
    expect(segments[0]?.text).toBe('stop.');
    expect(segments[1]?.text).toBe('next');
  });

  it('returns an empty list for no words', () => {
    expect(groupWordsIntoSegments([])).toEqual([]);
  });
});

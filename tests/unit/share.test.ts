import { describe, expect, it } from 'vitest';
import {
  buildDriveViewLink,
  titleToFileName,
} from '../../src/share/drive-client';

describe('titleToFileName', () => {
  it('uses the title verbatim with the given extension', () => {
    expect(titleToFileName('Team standup', 'webm')).toBe('Team standup.webm');
    expect(titleToFileName('My notes', 'txt')).toBe('My notes.txt');
  });

  it('strips characters Windows and Drive reject', () => {
    expect(titleToFileName('a/b:c*d?"e<f>g|h', 'webm')).toBe('abcdefgh.webm');
  });

  it('collapses whitespace and trims', () => {
    expect(titleToFileName('  spaced   out  ', 'webm')).toBe('spaced out.webm');
  });

  it('falls back to a generic name for an empty title', () => {
    expect(titleToFileName('', 'webm')).toBe('Untitled recording.webm');
    expect(titleToFileName(' / : * ', 'txt')).toBe('Untitled recording.txt');
  });
});

describe('buildDriveViewLink', () => {
  it('builds the standard Drive viewer link from a file id', () => {
    expect(buildDriveViewLink('abc123')).toBe(
      'https://drive.google.com/file/d/abc123/view',
    );
  });
});

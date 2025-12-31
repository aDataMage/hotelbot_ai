import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            const result = cn('c-1', 'c-2');
            expect(result).toBe('c-1 c-2');
        });

        it('should handle conditional classes', () => {
            const condition = true;
            const result = cn('c-1', condition && 'c-2', !condition && 'c-3');
            expect(result).toBe('c-1 c-2');
        });

        it('should handle tailwind conflicts (using tw-merge via cn)', () => {
            // Assuming cn uses clsx + twMerge
            const result = cn('p-4', 'p-2');
            expect(result).toBe('p-2');
        });
    });
});

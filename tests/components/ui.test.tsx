import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import React from 'react';

describe('Button Component', () => {
    it('renders button with text', () => {
        render(<Button>Click Me</Button>);
        const button = screen.getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    it('renders disabled state', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('applies variant classes', () => {
        render(<Button variant="destructive">Delete</Button>);
        const button = screen.getByRole('button');
        expect(button.className).toContain('bg-destructive');
    });
});

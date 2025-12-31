import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navbar } from '@/components/layout/navbar';
import React from 'react';

// Mock the auth-client
vi.mock('@/lib/auth-client', () => ({
    authClient: {
        useSession: vi.fn(),
    },
}));

import { authClient } from '@/lib/auth-client';

describe('Navbar Integration', () => {
    // Helper to mock session state
    const mockSession = (session: any) => {
        (authClient.useSession as any).mockReturnValue({ data: session });
    };

    it('renders Sign In button when unauthenticated', () => {
        mockSession(null);
        render(<Navbar />);
        expect(screen.getByText(/sign in/i)).toBeInTheDocument();
        expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
    });

    it('renders Dashboard button when authenticated', () => {
        mockSession({ user: { name: 'Test User' } });
        render(<Navbar />);
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
    });
});

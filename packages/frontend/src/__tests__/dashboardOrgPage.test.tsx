import { render, screen } from '@testing-library/react';
import DashboardOrganizationsPage from '@/app/dashboard/org/page';
import * as swr from 'swr';

jest.mock('swr');

describe('DashboardOrganizationsPage loading skeleton', () => {
  it('shows skeleton cards while loading', () => {
    (swr.useSWR as jest.Mock).mockReturnValue({ data: undefined, error: undefined, isLoading: true });
    render(<DashboardOrganizationsPage />);
    const skeletons = screen.getAllByTestId('organization-skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

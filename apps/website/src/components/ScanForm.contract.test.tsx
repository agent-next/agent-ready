/**
 * ScanForm Component Tests
 *
 * Tests form validation, user input, and submission behavior
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScanForm } from './ScanForm';

describe('ScanForm', () => {
  describe('Rendering', () => {
    it('renders form elements (URL input, branch input, submit button)', () => {
      const mockSubmit = vi.fn();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      // Check for URL input
      const urlInput = screen.getByLabelText(/repository url/i);
      expect(urlInput).toBeInTheDocument();
      expect(urlInput).toHaveAttribute('type', 'url');

      // Check for branch input
      const branchInput = screen.getByLabelText(/branch/i);
      expect(branchInput).toBeInTheDocument();
      expect(branchInput).toHaveAttribute('type', 'text');

      // Check for submit button
      const submitButton = screen.getByRole('button', { name: /start scan/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    it('displays title and subtitle', () => {
      const mockSubmit = vi.fn();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      expect(screen.getByText(/scan your repository/i)).toBeInTheDocument();
      expect(
        screen.getByText(/enter a github repository url to get an agent readiness report/i)
      ).toBeInTheDocument();
    });
  });

  describe('Validation', () => {
    it('shows error when URL is empty', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(await screen.findByRole('alert')).toHaveTextContent(/please enter a repository url/i);
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('shows error when URL is invalid (not a valid URL)', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      // Use a clearly invalid URL that will fail URL parsing
      await user.type(urlInput, 'http://badhost/repo');

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /please enter a valid git repository url/i
      );
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('shows error when URL is invalid (unsupported protocol)', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      await user.type(urlInput, 'ftp://github.com/owner/repo');

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /please enter a valid git repository url/i
      );
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('shows error when URL domain is not allowed', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      await user.type(urlInput, 'https://evil.com/repo');

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(await screen.findByRole('alert')).toHaveTextContent(
        /please enter a valid git repository url/i
      );
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    it('accepts valid GitHub URL', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      await user.type(urlInput, 'https://github.com/owner/repo');

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledWith('https://github.com/owner/repo', undefined);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('accepts valid GitLab URL', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      await user.type(urlInput, 'https://gitlab.com/owner/repo');

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledWith('https://gitlab.com/owner/repo', undefined);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('accepts valid Bitbucket URL', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      await user.type(urlInput, 'https://bitbucket.org/owner/repo');

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledWith('https://bitbucket.org/owner/repo', undefined);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('accepts valid self-hosted git URL', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      await user.type(urlInput, 'https://git.company.example.com/repo');

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledWith('https://git.company.example.com/repo', undefined);
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Branch Input', () => {
    it('calls onSubmit with branch when provided', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      const branchInput = screen.getByLabelText(/branch/i);

      await user.type(urlInput, 'https://github.com/owner/repo');
      await user.type(branchInput, 'develop');

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledWith('https://github.com/owner/repo', 'develop');
    });

    it('calls onSubmit with undefined branch when empty', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      await user.type(urlInput, 'https://github.com/owner/repo');

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledWith('https://github.com/owner/repo', undefined);
    });

    it('trims whitespace from branch name', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      const branchInput = screen.getByLabelText(/branch/i);

      await user.type(urlInput, 'https://github.com/owner/repo');
      await user.type(branchInput, '  feature-branch  ');

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledWith('https://github.com/owner/repo', 'feature-branch');
    });
  });

  describe('Loading State', () => {
    it('disables inputs and button when isLoading=true', () => {
      const mockSubmit = vi.fn();
      render(<ScanForm onSubmit={mockSubmit} isLoading={true} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      const branchInput = screen.getByLabelText(/branch/i);
      const submitButton = screen.getByRole('button', { name: /scanning/i });

      expect(urlInput).toBeDisabled();
      expect(branchInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('shows scanning text when isLoading=true', () => {
      const mockSubmit = vi.fn();
      render(<ScanForm onSubmit={mockSubmit} isLoading={true} />);

      expect(screen.getByText(/scanning/i)).toBeInTheDocument();
      expect(screen.queryByText(/start scan/i)).not.toBeInTheDocument();
    });

    it('shows loading spinner when isLoading=true', () => {
      const mockSubmit = vi.fn();
      render(<ScanForm onSubmit={mockSubmit} isLoading={true} />);

      const button = screen.getByRole('button', { name: /scanning/i });
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('animate-spin');
    });

    it('enables inputs and button when isLoading=false', () => {
      const mockSubmit = vi.fn();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      const branchInput = screen.getByLabelText(/branch/i);
      const submitButton = screen.getByRole('button', { name: /start scan/i });

      expect(urlInput).not.toBeDisabled();
      expect(branchInput).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('clears error when user corrects invalid URL', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      const submitButton = screen.getByRole('button', { name: /start scan/i });

      // Submit empty form to trigger error
      await user.click(submitButton);
      expect(await screen.findByRole('alert')).toBeInTheDocument();

      // Type valid URL
      await user.type(urlInput, 'https://github.com/owner/repo');

      // Submit again
      await user.click(submitButton);

      // Error should be cleared
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(mockSubmit).toHaveBeenCalledWith('https://github.com/owner/repo', undefined);
    });

    it('trims whitespace from URL before validation', async () => {
      const mockSubmit = vi.fn();
      const user = userEvent.setup();
      render(<ScanForm onSubmit={mockSubmit} isLoading={false} />);

      const urlInput = screen.getByLabelText(/repository url/i);
      await user.type(urlInput, '  https://github.com/owner/repo  ');

      const submitButton = screen.getByRole('button', { name: /start scan/i });
      await user.click(submitButton);

      expect(mockSubmit).toHaveBeenCalledWith('https://github.com/owner/repo', undefined);
    });
  });
});

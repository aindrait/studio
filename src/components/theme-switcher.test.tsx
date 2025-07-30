import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeSwitcher } from './theme-switcher';
import { useTheme } from 'next-themes';

// Mock the useTheme hook from next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

describe('ThemeSwitcher Component', () => {
  it('should render the trigger button', () => {
    // @ts-ignore
    useTheme.mockReturnValue({ setTheme: vi.fn() });
    render(<ThemeSwitcher />);

    const triggerButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(triggerButton).toBeInTheDocument();
  });

  it('should open dropdown on click and show theme options', () => {
    // @ts-ignore
    useTheme.mockReturnValue({ setTheme: vi.fn() });
    render(<ThemeSwitcher />);
    
    const triggerButton = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(triggerButton);

    const lightOption = screen.getByRole('menuitem', { name: /light/i });
    const darkOption = screen.getByRole('menuitem', { name: /dark/i });
    const systemOption = screen.getByRole('menuitem', { name: /system/i });

    expect(lightOption).toBeInTheDocument();
    expect(darkOption).toBeInTheDocument();
    expect(systemOption).toBeInTheDocument();
  });

  it('should call setTheme when a theme option is clicked', () => {
    const setThemeMock = vi.fn();
    // @ts-ignore
    useTheme.mockReturnValue({ setTheme: setThemeMock });
    render(<ThemeSwitcher />);
    
    const triggerButton = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(triggerButton);
    
    const darkOption = screen.getByRole('menuitem', { name: /dark/i });
    fireEvent.click(darkOption);

    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });
});

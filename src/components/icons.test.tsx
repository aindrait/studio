import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from './icons';

describe('Logo Component', () => {
  it('should render the SVG icon', () => {
    render(<Logo />);
    
    const logoIcon = screen.getByRole('graphics-symbol');
    expect(logoIcon).toBeInTheDocument();
    expect(logoIcon.tagName).toBe('svg');
  });

  it('should apply additional props like className', () => {
    const className = 'test-class';
    render(<Logo className={className} />);
    
    const logoIcon = screen.getByRole('graphics-symbol');
    expect(logoIcon).toHaveClass(className);
  });
});

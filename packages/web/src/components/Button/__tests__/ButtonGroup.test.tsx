/**
 * Tests for ButtonGroup Component
 * Coverage: Orientation, attached, spacing, accessibility
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ButtonGroup } from '../ButtonGroup';
import { Button } from '../Button';

describe('ButtonGroup', () => {
  describe('Basic Rendering', () => {
    it('should render button group', () => {
      render(
        <ButtonGroup>
          <Button>First</Button>
          <Button>Second</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).toBeInTheDocument();
    });

    it('should render all children buttons', () => {
      render(
        <ButtonGroup>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </ButtonGroup>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(
        <ButtonGroup className="custom-group">
          <Button>Click</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).toHaveClass('custom-group');
    });
  });

  describe('Orientation', () => {
    it('should have horizontal orientation by default', () => {
      render(
        <ButtonGroup>
          <Button>First</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).toHaveClass(
        'button-group-horizontal'
      );
    });

    it('should apply vertical orientation', () => {
      render(
        <ButtonGroup orientation="vertical">
          <Button>First</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).toHaveClass('button-group-vertical');
    });
  });

  describe('Attached', () => {
    it('should not be attached by default', () => {
      render(
        <ButtonGroup>
          <Button>First</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).not.toHaveClass(
        'button-group-attached'
      );
    });

    it('should apply attached class', () => {
      render(
        <ButtonGroup attached>
          <Button>First</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).toHaveClass('button-group-attached');
    });

    it('should not have spacing class when attached', () => {
      render(
        <ButtonGroup attached>
          <Button>First</Button>
        </ButtonGroup>
      );

      const group = screen.getByTestId('button-group');
      expect(group.className).not.toContain('button-group-spacing');
    });
  });

  describe('Spacing', () => {
    it('should have sm spacing by default', () => {
      render(
        <ButtonGroup>
          <Button>First</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).toHaveClass(
        'button-group-spacing-sm'
      );
    });

    it('should apply none spacing', () => {
      render(
        <ButtonGroup spacing="none">
          <Button>First</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).toHaveClass(
        'button-group-spacing-none'
      );
    });

    it('should apply md spacing', () => {
      render(
        <ButtonGroup spacing="md">
          <Button>First</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).toHaveClass(
        'button-group-spacing-md'
      );
    });

    it('should apply lg spacing', () => {
      render(
        <ButtonGroup spacing="lg">
          <Button>First</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).toHaveClass(
        'button-group-spacing-lg'
      );
    });
  });

  describe('Full Width', () => {
    it('should not be full width by default', () => {
      render(
        <ButtonGroup>
          <Button>First</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).not.toHaveClass(
        'button-group-full-width'
      );
    });

    it('should apply full width class', () => {
      render(
        <ButtonGroup fullWidth>
          <Button>First</Button>
        </ButtonGroup>
      );

      expect(screen.getByTestId('button-group')).toHaveClass(
        'button-group-full-width'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have group role', () => {
      render(
        <ButtonGroup>
          <Button>First</Button>
        </ButtonGroup>
      );

      expect(screen.getByRole('group')).toBeInTheDocument();
    });
  });

  describe('Combined Props', () => {
    it('should apply multiple classes correctly', () => {
      render(
        <ButtonGroup
          orientation="vertical"
          attached
          fullWidth
          className="custom"
        >
          <Button>First</Button>
        </ButtonGroup>
      );

      const group = screen.getByTestId('button-group');
      expect(group).toHaveClass('button-group-vertical');
      expect(group).toHaveClass('button-group-attached');
      expect(group).toHaveClass('button-group-full-width');
      expect(group).toHaveClass('custom');
    });
  });

  describe('Integration with Buttons', () => {
    it('should work with different button variants', () => {
      render(
        <ButtonGroup>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </ButtonGroup>
      );

      expect(screen.getByText('Primary')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
    });

    it('should work with different button sizes', () => {
      render(
        <ButtonGroup>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </ButtonGroup>
      );

      expect(screen.getByText('Small')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Large')).toBeInTheDocument();
    });

    it('should work with icon buttons', () => {
      render(
        <ButtonGroup>
          <Button leftIcon={<span>←</span>}>Back</Button>
          <Button rightIcon={<span>→</span>}>Next</Button>
        </ButtonGroup>
      );

      expect(screen.getByText('Back')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should render pagination group', () => {
      render(
        <ButtonGroup attached>
          <Button>Previous</Button>
          <Button>1</Button>
          <Button>2</Button>
          <Button>3</Button>
          <Button>Next</Button>
        </ButtonGroup>
      );

      expect(screen.getByText('Previous')).toBeInTheDocument();
      expect(screen.getByText('Next')).toBeInTheDocument();
    });

    it('should render toolbar group', () => {
      render(
        <ButtonGroup spacing="sm">
          <Button variant="ghost">Edit</Button>
          <Button variant="ghost">Delete</Button>
          <Button variant="ghost">Share</Button>
        </ButtonGroup>
      );

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('should render action group', () => {
      render(
        <ButtonGroup fullWidth>
          <Button variant="outline">Cancel</Button>
          <Button variant="primary">Save</Button>
        </ButtonGroup>
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
    });
  });
});

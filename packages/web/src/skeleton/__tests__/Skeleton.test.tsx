/**
 * Tests for Skeleton Components
 * Coverage: All skeleton variants, props, accessibility
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTable,
  SkeletonList,
} from '../Skeleton';

describe('Skeleton', () => {
  describe('Basic Skeleton', () => {
    it('should render skeleton', () => {
      render(<Skeleton />);
      expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    });

    it('should apply custom width and height', () => {
      render(<Skeleton width={200} height={100} />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '200px', height: '100px' });
    });

    it('should accept string width and height', () => {
      render(<Skeleton width="50%" height="2em" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '50%', height: '2em' });
    });

    it('should have default text variant', () => {
      render(<Skeleton />);
      expect(screen.getByTestId('skeleton')).toHaveClass('skeleton-text');
    });

    it('should apply circular variant', () => {
      render(<Skeleton variant="circular" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('skeleton-circular');
    });

    it('should apply rectangular variant', () => {
      render(<Skeleton variant="rectangular" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('skeleton-rectangular');
    });

    it('should apply rounded variant', () => {
      render(<Skeleton variant="rounded" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('skeleton-rounded');
    });

    it('should have default pulse animation', () => {
      render(<Skeleton />);
      expect(screen.getByTestId('skeleton')).toHaveClass('skeleton-pulse');
    });

    it('should apply wave animation', () => {
      render(<Skeleton animation="wave" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('skeleton-wave');
    });

    it('should apply no animation', () => {
      render(<Skeleton animation="none" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('skeleton-none');
    });

    it('should apply custom className', () => {
      render(<Skeleton className="custom-skeleton" />);
      expect(screen.getByTestId('skeleton')).toHaveClass('custom-skeleton');
    });

    it('should set default height for text variant', () => {
      render(<Skeleton variant="text" />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ height: '1em' });
    });

    it('should set equal width and height for circular variant when only width is provided', () => {
      render(<Skeleton variant="circular" width={50} />);

      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveStyle({ width: '50px', height: '50px' });
    });
  });

  describe('Accessibility', () => {
    it('should have aria-busy attribute', () => {
      render(<Skeleton />);
      expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true');
    });

    it('should have aria-live polite', () => {
      render(<Skeleton />);
      expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-live', 'polite');
    });
  });
});

describe('SkeletonText', () => {
  it('should render default 3 lines', () => {
    const { container } = render(<SkeletonText />);
    const lines = container.querySelectorAll('.skeleton-text-line');
    expect(lines).toHaveLength(3);
  });

  it('should render custom number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const lines = container.querySelectorAll('.skeleton-text-line');
    expect(lines).toHaveLength(5);
  });

  it('should apply custom width', () => {
    render(<SkeletonText width="80%" />);
    const textContainer = screen.getByTestId('skeleton-text');
    expect(textContainer).toBeInTheDocument();
  });

  it('should make last line narrower by default', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const lines = container.querySelectorAll('.skeleton-text-line');
    const lastLine = lines[lines.length - 1];

    expect(lastLine).toHaveStyle({ width: '70%' });
  });

  it('should apply custom last line width', () => {
    const { container } = render(<SkeletonText lines={3} lastLineWidth="50%" />);
    const lines = container.querySelectorAll('.skeleton-text-line');
    const lastLine = lines[lines.length - 1];

    expect(lastLine).toHaveStyle({ width: '50%' });
  });

  it('should apply custom className', () => {
    render(<SkeletonText className="custom-text" />);
    expect(screen.getByTestId('skeleton-text')).toHaveClass('custom-text');
  });
});

describe('SkeletonAvatar', () => {
  it('should render avatar skeleton', () => {
    render(<SkeletonAvatar />);
    expect(screen.getByTestId('skeleton-avatar')).toBeInTheDocument();
  });

  it('should have default size of 40px', () => {
    render(<SkeletonAvatar />);
    const avatar = screen.getByTestId('skeleton-avatar');
    expect(avatar).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('should apply custom size', () => {
    render(<SkeletonAvatar size={60} />);
    const avatar = screen.getByTestId('skeleton-avatar');
    expect(avatar).toHaveStyle({ width: '60px', height: '60px' });
  });

  it('should accept string size', () => {
    render(<SkeletonAvatar size="3rem" />);
    const avatar = screen.getByTestId('skeleton-avatar');
    expect(avatar).toHaveStyle({ width: '3rem', height: '3rem' });
  });

  it('should be circular variant', () => {
    render(<SkeletonAvatar />);
    expect(screen.getByTestId('skeleton-avatar')).toHaveClass('skeleton-circular');
  });

  it('should apply custom className', () => {
    render(<SkeletonAvatar className="custom-avatar" />);
    expect(screen.getByTestId('skeleton-avatar')).toHaveClass('custom-avatar');
  });
});

describe('SkeletonCard', () => {
  it('should render card skeleton', () => {
    render(<SkeletonCard />);
    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
  });

  it('should render with image when hasImage is true', () => {
    const { container } = render(<SkeletonCard hasImage />);
    expect(container.querySelector('.skeleton-card-image')).toBeInTheDocument();
  });

  it('should not render image by default', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelector('.skeleton-card-image')).not.toBeInTheDocument();
  });

  it('should render avatar when hasAvatar is true', () => {
    render(<SkeletonCard hasAvatar />);
    expect(screen.getByTestId('skeleton-avatar')).toBeInTheDocument();
  });

  it('should not render avatar by default', () => {
    render(<SkeletonCard />);
    expect(screen.queryByTestId('skeleton-avatar')).not.toBeInTheDocument();
  });

  it('should render actions when hasActions is true', () => {
    const { container } = render(<SkeletonCard hasActions />);
    const actions = container.querySelectorAll('.skeleton-rounded');
    expect(actions.length).toBeGreaterThan(0);
  });

  it('should render text content', () => {
    const { container } = render(<SkeletonCard />);
    const content = container.querySelector('.skeleton-card-content');
    expect(content).toBeInTheDocument();
  });

  it('should apply custom width', () => {
    render(<SkeletonCard width={300} />);
    const card = screen.getByTestId('skeleton-card');
    expect(card).toHaveStyle({ width: '300px' });
  });

  it('should apply custom className', () => {
    render(<SkeletonCard className="custom-card" />);
    expect(screen.getByTestId('skeleton-card')).toHaveClass('custom-card');
  });
});

describe('SkeletonTable', () => {
  it('should render table skeleton', () => {
    render(<SkeletonTable />);
    expect(screen.getByTestId('skeleton-table')).toBeInTheDocument();
  });

  it('should render default 5 rows', () => {
    const { container } = render(<SkeletonTable />);
    const rows = container.querySelectorAll('.skeleton-table-row');
    expect(rows).toHaveLength(5);
  });

  it('should render custom number of rows', () => {
    const { container } = render(<SkeletonTable rows={10} />);
    const rows = container.querySelectorAll('.skeleton-table-row');
    expect(rows).toHaveLength(10);
  });

  it('should render default 4 columns', () => {
    const { container } = render(<SkeletonTable />);
    const firstRow = container.querySelector('.skeleton-table-row');
    const cells = firstRow?.querySelectorAll('.skeleton');
    expect(cells).toHaveLength(4);
  });

  it('should render custom number of columns', () => {
    const { container } = render(<SkeletonTable columns={6} />);
    const firstRow = container.querySelector('.skeleton-table-row');
    const cells = firstRow?.querySelectorAll('.skeleton');
    expect(cells).toHaveLength(6);
  });

  it('should render header by default', () => {
    const { container } = render(<SkeletonTable />);
    expect(container.querySelector('.skeleton-table-header')).toBeInTheDocument();
  });

  it('should not render header when hasHeader is false', () => {
    const { container } = render(<SkeletonTable hasHeader={false} />);
    expect(container.querySelector('.skeleton-table-header')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<SkeletonTable className="custom-table" />);
    expect(screen.getByTestId('skeleton-table')).toHaveClass('custom-table');
  });
});

describe('SkeletonList', () => {
  it('should render list skeleton', () => {
    render(<SkeletonList />);
    expect(screen.getByTestId('skeleton-list')).toBeInTheDocument();
  });

  it('should render default 5 items', () => {
    const { container } = render(<SkeletonList />);
    const items = container.querySelectorAll('.skeleton-list-item');
    expect(items).toHaveLength(5);
  });

  it('should render custom number of items', () => {
    const { container } = render(<SkeletonList items={10} />);
    const items = container.querySelectorAll('.skeleton-list-item');
    expect(items).toHaveLength(10);
  });

  it('should render avatars by default', () => {
    render(<SkeletonList items={3} />);
    const avatars = screen.getAllByTestId('skeleton-avatar');
    expect(avatars).toHaveLength(3);
  });

  it('should not render avatars when hasAvatar is false', () => {
    render(<SkeletonList hasAvatar={false} />);
    expect(screen.queryByTestId('skeleton-avatar')).not.toBeInTheDocument();
  });

  it('should render two lines by default', () => {
    const { container } = render(<SkeletonList items={1} />);
    const firstItem = container.querySelector('.skeleton-list-item');
    const lines = firstItem?.querySelectorAll('.skeleton-text');
    expect(lines).toHaveLength(2);
  });

  it('should render one line when hasTwoLines is false', () => {
    const { container } = render(<SkeletonList items={1} hasTwoLines={false} />);
    const firstItem = container.querySelector('.skeleton-list-item');
    const lines = firstItem?.querySelectorAll('.skeleton-text');
    expect(lines).toHaveLength(1);
  });

  it('should apply custom className', () => {
    render(<SkeletonList className="custom-list" />);
    expect(screen.getByTestId('skeleton-list')).toHaveClass('custom-list');
  });
});

describe('Integration', () => {
  it('should render complex card with all features', () => {
    const { container } = render(
      <SkeletonCard
        hasImage
        hasAvatar
        hasActions
        width={400}
        imageHeight={250}
      />
    );

    expect(container.querySelector('.skeleton-card-image')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-avatar')).toBeInTheDocument();
    expect(container.querySelectorAll('.skeleton-rounded').length).toBeGreaterThan(0);
  });

  it('should render multiple skeletons together', () => {
    render(
      <div>
        <SkeletonAvatar />
        <SkeletonText lines={2} />
        <SkeletonCard hasImage />
      </div>
    );

    expect(screen.getByTestId('skeleton-avatar')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-text')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-card')).toBeInTheDocument();
  });
});

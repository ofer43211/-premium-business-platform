/**
 * Portal Component
 * Renders children outside the DOM hierarchy
 */
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  container?: HTMLElement;
}

export function Portal({ children, container }: PortalProps) {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Use provided container or create default
    const node = container || document.body;
    setMountNode(node);

    return () => {
      setMountNode(null);
    };
  }, [container]);

  if (!mountNode) return null;

  return createPortal(children, mountNode);
}

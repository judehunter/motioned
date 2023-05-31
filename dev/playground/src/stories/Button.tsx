import React, { useState } from 'react';
import './button.css';
import { m } from '../../../../packages/motioned/dist';

interface ButtonProps {
  /**
   * Is this the principal call to action on the page?
   */
  primary?: boolean;
  /**
   * What background color to use
   */
  backgroundColor?: string;
  /**
   * How large should the button be?
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button contents
   */
  label: string;
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  ...props
}: ButtonProps) => {
  const mode = primary
    ? 'storybook-button--primary'
    : 'storybook-button--secondary';

  const [x, setX] = useState(10);
  return (
    <button
      onClick={() => setX((x) => -x)}
      className={['storybook-button', `storybook-button--${size}`, mode].join(
        ' ',
      )}
      style={{ backgroundColor }}
      // {...props}
    >
      {label}
      <m.div initial={{ x }} animate={{ x }} style={{ color: 'black' }}>
        a
      </m.div>
    </button>
  );
};

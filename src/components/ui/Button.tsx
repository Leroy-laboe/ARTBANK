import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'gold' | 'ghost';

type CommonProps = {
  variant?: Variant;
  size?: 'md' | 'sm';
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; to?: undefined };

type ButtonAsAnchor = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined };

type ButtonAsLink = CommonProps & Omit<LinkProps, 'className' | 'children'> & { href?: undefined };

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...rest
}: ButtonAsButton | ButtonAsAnchor | ButtonAsLink) {
  const classes = [styles.btn, styles[variant], size === 'sm' ? styles.sm : '', className]
    .filter(Boolean)
    .join(' ');

  if ('to' in rest && rest.to) {
    return (
      <Link className={classes} {...(rest as LinkProps)}>
        {children}
        {icon}
      </Link>
    );
  }

  if ('href' in rest && rest.href) {
    return (
      <a className={classes} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
        {icon}
      </a>
    );
  }

  return (
    <button className={classes} type="button" {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
      {icon}
    </button>
  );
}

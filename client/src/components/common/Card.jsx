import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-soft overflow-hidden ${
        hover ? 'transition-all duration-200 hover:shadow-premium hover:border-slate-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  title,
  subtitle,
  action,
  className = '',
  children,
}) => {
  return (
    <div
      className={`px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      {title ? (
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      ) : null}
      {children}
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div
      className={`px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between ${className}`}
    >
      {children}
    </div>
  );
};

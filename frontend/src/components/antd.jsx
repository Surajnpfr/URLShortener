/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { X } from 'lucide-react';

// Typography component mimicking Ant Design's Typography
export const Typography = {
  Title: ({ level = 1, children, className = '', style }) => {
    const Tag = level >= 1 && level <= 6 ? `h${level}` : 'h1';
    return (
      <Tag
        className={`ant-typography-title ant-typography-title-${level} ${className}`}
        style={style}
      >
        {children}
      </Tag>
    );
  },
  Text: ({ type, strong, children, className = '', style }) => {
    const classes = [
      'ant-typography-text',
      type ? `ant-typography-text-${type}` : '',
      strong ? 'ant-typography-text-strong' : '',
      className
    ].filter(Boolean).join(' ');
    
    return (
      <span className={classes} style={style}>
        {children}
      </span>
    );
  },
  Paragraph: ({ children, className = '', style }) => {
    return (
      <p className={`ant-typography-paragraph ${className}`} style={style}>
        {children}
      </p>
    );
  },
  Link: ({ href, children, className = '', style, onClick, target, rel }) => {
    return (
      <a
        href={href}
        className={`ant-typography-link ${className}`}
        style={style}
        onClick={onClick}
        target={target}
        rel={rel}
      >
        {children}
      </a>
    );
  }
};

// Card component mimicking Ant Design's Card
export const Card = ({ title, children, bordered = true, className = '', style }) => {
  const classes = [
    'ant-card',
    bordered ? 'ant-card-bordered' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={style}>
      {title && (
        <div className="ant-card-head">
          <div className="ant-card-head-wrapper">
            <div className="ant-card-head-title">{title}</div>
          </div>
        </div>
      )}
      <div className="ant-card-body">{children}</div>
    </div>
  );
};

// Divider component mimicking Ant Design's Divider
export const Divider = ({ className = '', style }) => {
  return <div className={`ant-divider ${className}`} style={style} />;
};

// Space component mimicking Ant Design's Space
export const Space = ({ direction = 'horizontal', size = 'small', children, className = '', style }) => {
  const gapSize = typeof size === 'number' 
    ? `${size}px` 
    : size === 'small' ? '8px' : size === 'middle' ? '16px' : size === 'large' ? '24px' : '8px';

  const combinedStyle = {
    gap: gapSize,
    ...style
  };

  const classes = [
    'ant-space',
    `ant-space-${direction}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={combinedStyle}>
      {React.Children.map(children, (child) => {
        if (child === null || child === undefined) return null;
        return <div className="ant-space-item">{child}</div>;
      })}
    </div>
  );
};

// Row component mimicking Ant Design's Row
export const Row = ({ children, gutter = 0, style, className = '' }) => {
  const [hGutter, vGutter] = Array.isArray(gutter) ? gutter : [gutter, gutter];
  
  const rowStyle = {
    marginLeft: `-${hGutter / 2}px`,
    marginRight: `-${hGutter / 2}px`,
    rowGap: `${vGutter}px`,
    ...style
  };

  return (
    <div className={`ant-row ${className}`} style={rowStyle}>
      {React.Children.map(children, (child) => {
        if (child === null || child === undefined) return null;
        return React.cloneElement(child, { hGutter });
      })}
    </div>
  );
};

// Col component mimicking Ant Design's Col
export const Col = ({ span, xs, sm, md, lg, children, style, className = '', hGutter = 0 }) => {
  const colStyle = {
    paddingLeft: `${hGutter / 2}px`,
    paddingRight: `${hGutter / 2}px`,
    ...style
  };

  const classes = [
    'ant-col',
    span ? `ant-col-${span}` : '',
    xs ? `ant-col-xs-${xs}` : '',
    sm ? `ant-col-sm-${sm}` : '',
    md ? `ant-col-md-${md}` : '',
    lg ? `ant-col-lg-${lg}` : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} style={colStyle}>
      {children}
    </div>
  );
};

// Modal component mimicking Ant Design's Modal
export const Modal = ({ open, title, children, footer, onCancel, width = 720, className = '', bodyStyle, maskClosable = true }) => {
  if (!open) return null;

  return (
    <div className="ant-modal-mask" onClick={maskClosable ? onCancel : undefined}>
      <div
        className={`ant-modal ${className}`.trim()}
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: width }}
      >
        <div className="ant-modal-header">
          <div className="ant-modal-title">{title}</div>
          <button type="button" className="ant-modal-close" onClick={onCancel} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="ant-modal-body" style={bodyStyle}>
          {children}
        </div>
        {footer ? <div className="ant-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
};

// Empty state component mimicking Ant Design's Empty
export const Empty = ({ description, image, children, className = '' }) => {
  return (
    <div className={`ant-empty ${className}`.trim()}>
      <div className="ant-empty-image">{image}</div>
      <div className="ant-empty-description">{description}</div>
      {children ? <div className="ant-empty-footer">{children}</div> : null}
    </div>
  );
};


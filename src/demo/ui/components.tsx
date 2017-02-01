import { style, classes } from 'typestyle';
import * as React from 'react';
import { verticallySpaced, horizontallySpaced } from 'csstips';


export const buttonClass = style({
  fontFamily: 'helvetica',
  cursor: 'pointer',
  height: 'auto',
  padding: "12px 30px 11px",
  border: `1px solid #333`,
  borderRadius: '3px',
  color: `white`,
  backgroundColor: '#333',
  fontSize: '15px',
  textDecoration: "none",
  lineHeight: "1em",
  outline: 'none',
  transition: 'color .2s, background-color .2s',
  display: 'inline-block',
  $nest: {
    '&:hover': {
      backgroundColor: '#666',
    },
    '&:active': {
      backgroundColor: '#666',
    },
    '&:focus': {
      outline: 'thin dotted',
      outlineColor: `#333`
    }
  }
});
export const Button
  = (props: React.HTMLProps<HTMLButtonElement>) =>
    <button {...props}
      type={props.type || 'button'}
      className={classes(buttonClass, props.className)}
    />

export const Alert
  = (props: { children?: any, }) => <div style={{ padding: '10px', backgroundColor: '#ffa3a3', color: '#883b3b' }}>
    {props.children}
  </div>

export const AlertSuccess
  = (props: { children?: any, }) => <div style={{ padding: '10px', backgroundColor: '#f0ffef', color: '#43883b' }}>
    {props.children}
  </div>

export const Vertical
  = ({ children }: { children?: any, }) => <div className={style(verticallySpaced(10))} children={children} />

export const Horizontal
  = ({ children }: { children?: any, }) => <div className={style(horizontallySpaced(10))} children={children} />
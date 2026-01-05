import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export default function Input(props: Props) {
  return <input className="fh-input" {...props} />;
}

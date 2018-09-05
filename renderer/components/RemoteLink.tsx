import React from 'react';

let shell: any = null;
if (window.require) {
  shell = window.require('electron').shell;
}


const onClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  if (shell) {
    shell.openExternal(href);
  }
};

interface IProps {
  href: string;
}

const RemoteLink: React.SFC<IProps> = ({ href, children }) => (
  <a href="#" onClick={onClick(href)}>
    {children}
  </a>
);

export default RemoteLink;

import React, { useCallback } from 'react';

let shell: any = null;
if ((window as any).require) {
  shell = (window as any).require('electron').shell;
}

interface IRemoteLinkProps {
  href: string;
}

const RemoteLink: React.FC<IRemoteLinkProps> = ({children, href}) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    shell.openExternal(href);
  }, [href]);

  return (
    <a href="/" onClick={handleClick}>{children || href}</a>
  );
};

export default RemoteLink;

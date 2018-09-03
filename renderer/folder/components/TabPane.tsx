import React from 'react';


interface IProps {
  isActive: boolean;
}

const TabPane: React.SFC<IProps> = ({ isActive, children }) => (
  <div className={`tab-pane ${isActive ? 'active d-flex flex-fill' : ''}`}>
    {children}
  </div>
);

export default TabPane;

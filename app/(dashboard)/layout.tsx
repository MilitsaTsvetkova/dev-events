import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <p>Dashboard layout</p>
      {children}
    </div>
  );
};

export default Layout;

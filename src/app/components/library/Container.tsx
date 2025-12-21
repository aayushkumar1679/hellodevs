import React from "react";

interface ContainerProps {
  id: string;
  children?: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ id, children }) => {
  return (
    <div id={id} className="bg-white rounded p-6 border border-gray-200">
      <p className="text-sm text-gray-500 mb-2">📦 Container</p>
      {children || <p className="text-gray-400">Container Content</p>}
    </div>
  );
};

export default Container;


import React from 'react';

interface CategoryHeaderProps {
  title: string;
  description?: string;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ title, description }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {description && <p className="text-gray-400 mt-1">{description}</p>}
    </div>
  );
};

export default CategoryHeader;

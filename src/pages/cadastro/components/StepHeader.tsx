import React from 'react'

interface StepHeaderProps {
  icon: any;
  title: string;
  description: string;
}

export const StepHeader: React.FC<StepHeaderProps> = ({ icon: Icon, title, description }) => (
  <div className="flex items-center pb-4 border-b border-gray-200 mb-6">
    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mr-3">
      <Icon className="w-6 h-6 text-blue-600" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
)

"use client";

import React from "react";

interface ComponentRendererProps {
  component: any;
}

export default function ComponentRenderer({
  component,
}: ComponentRendererProps) {
  const renderComponent = () => {
    switch (component.type) {
      case "navbar":
        return (
          <nav className="flex items-center justify-between h-16 bg-gray-900 text-white px-8 rounded">
            <div className="font-bold">Logo</div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-300">
                Home
              </a>
              <a href="#" className="hover:text-gray-300">
                About
              </a>
              <a href="#" className="hover:text-gray-300">
                Contact
              </a>
            </div>
          </nav>
        );
      case "hero":
        return (
          <div className="py-24 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded">
            <h1 className="text-4xl font-bold mb-4">Welcome to Your Site</h1>
            <p className="text-lg text-blue-100 mb-8">
              Create amazing designs with our builder
            </p>
            <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded hover:bg-gray-100">
              Get Started
            </button>
          </div>
        );
      case "card":
        return (
          <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2">Card Title</h3>
            <p className="text-gray-600 text-sm">Card content goes here</p>
          </div>
        );
      case "button":
        return (
          <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors">
            Button
          </button>
        );
      case "form":
        return (
          <form className="space-y-4 max-w-md">
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <textarea
              placeholder="Message"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              rows={4}
            />
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
            >
              Send
            </button>
          </form>
        );
      case "section":
        return (
          <div className="py-12 text-center text-gray-500 border-2 border-dashed border-gray-300 rounded">
            <p>Section content</p>
          </div>
        );
      case "text":
        return (
          <div className="text-gray-700">
            <p>This is sample text content</p>
          </div>
        );
      case "image":
        return (
          <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center text-gray-500">
            Image placeholder
          </div>
        );
      default:
        return (
          <div className="p-4 bg-gray-100 rounded text-gray-600 text-sm">
            {component.type} component
          </div>
        );
    }
  };

  return <>{renderComponent()}</>;
}

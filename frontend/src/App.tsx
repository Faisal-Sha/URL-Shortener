import React from 'react';
import UrlShortenerForm from './components/UrlShortenerForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            URL Shortener
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Enter a long URL and get a shortened version instantly
          </p>
        </div>
        <div className="mt-12">
          <UrlShortenerForm />
        </div>
      </div>
    </div>
  );
}

export default App;
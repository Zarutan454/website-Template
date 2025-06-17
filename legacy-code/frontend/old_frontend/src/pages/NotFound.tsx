
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Seite nicht gefunden</h2>
        <p className="text-gray-400 mb-8">
          Die von dir gesuchte Seite existiert nicht oder wurde verschoben.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

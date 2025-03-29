import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white shadow-xl py-4">
      <div className="container mx-auto flex flex-col items-center">
        <img
          src="/iconSF.png"
          alt="Logo"
          className="w-34 h-32 mb-6 shadow-lg transform transition-all hover:scale-110"
        />
        <p className="text-sm text-black-800">
          &copy; 2025 <span className="font-bold">Hackathon Mobility</span>. Todos los derechos reservados por <span className="font-bold">Headers</span>.
        </p>
        <p className="text-sm text-gray-800 mt-2">
          Desarrollado con pasión en el <span className="font-semibold text-blue-400">Hackathon Mobility</span>.
        </p>
      
      </div>
    </footer>
    
  );
};

export default Footer;

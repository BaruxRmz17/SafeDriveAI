import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import supabase from '../services/supabase';

// Variantes de animación
const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Interfaz para tipar los conductores
interface Driver {
  driver_id: number;
  driver_name: string;
}

const ReportarIncidente: React.FC = () => {
  const [formData, setFormData] = useState({
    incidentDate: '',
    incidentTime: '',
    location: '',
    description: '',
    driverState: '',
    driverId: '', // Nuevo campo para el ID del conductor
  });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  // Obtener la lista de conductores al cargar el componente
  useEffect(() => {
    const fetchDrivers = async () => {
      const { data, error } = await supabase.from('drivers').select('driver_id, driver_name');
      if (error) {
        console.error('Error fetching drivers:', error.message);
      } else {
        setDrivers(data || []);
      }
    };
    fetchDrivers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.from('incident_reports').insert([
      {
        incident_date: formData.incidentDate,
        incident_time: formData.incidentTime,
        location: formData.location,
        description: formData.description,
        driver_state: formData.driverState,
        driver_id: formData.driverId ? parseInt(formData.driverId) : null, // Convertir a entero
        created_at: new Date().toISOString(),
      },
    ]);

    setLoading(false);
    if (error) {
      setMessage(`Error al reportar el incidente: ${error.message}`);
    } else {
      setMessage('Incidente reportado exitosamente.');
      setFormData({
        incidentDate: '',
        incidentTime: '',
        location: '',
        description: '',
        driverState: '',
        driverId: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans py-12 px-6">
      <motion.div
        className="max-w-2xl mx-auto bg-gray-100 p-8 rounded-lg shadow-lg"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Reportar un Incidente
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="incidentDate" className="block text-sm font-medium">
              Fecha del Incidente
            </label>
            <input
              type="date"
              id="incidentDate"
              name="incidentDate"
              value={formData.incidentDate}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="incidentTime" className="block text-sm font-medium">
              Hora del Incidente
            </label>
            <input
              type="time"
              id="incidentTime"
              name="incidentTime"
              value={formData.incidentTime}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium">
              Ubicación
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej. Carretera 123, km 45"
              required
            />
          </div>

          <div>
            <label htmlFor="driverId" className="block text-sm font-medium">
              Conductor
            </label>
            <select
              id="driverId"
              name="driverId"
              value={formData.driverId}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona un conductor</option>
              {drivers.map((driver) => (
                <option key={driver.driver_id} value={driver.driver_id}>
                  {driver.driver_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Descripción del Incidente
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe qué pasó..."
              required
            />
          </div>

          <div>
            <label htmlFor="driverState" className="block text-sm font-medium">
              Estado del Conductor
            </label>
            <textarea
              id="driverState"
              name="driverState"
              value={formData.driverState}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Ej. Cansado, alerta, distraído..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Enviando...' : 'Reportar Incidente'}
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes('Error') ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ReportarIncidente;
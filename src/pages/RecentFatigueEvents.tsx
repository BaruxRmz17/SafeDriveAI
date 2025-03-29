import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../services/supabase'; // Ajusta la ruta según tu estructura

// Interfaces para tipado
interface FatigueEvent {
  event_id: number;
  session_id: number;
  event_time: string;
  alert_type: string;
  eye_closed_seconds: number;
  alarm_triggered: boolean;
  driver_sessions: {
    driver_id: number;
    drivers: {
      driver_name: string;
    };
  };
}

const RecentFatigueEvents: React.FC = () => {
  const navigate = useNavigate();
  const [fatigueEvents, setFatigueEvents] = useState<FatigueEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const eventsPerPage = 10; // Número de eventos por página

  // Obtener eventos de fatiga con información del conductor
  const fetchFatigueEvents = async () => {
    setLoading(true);
    let query = supabase
      .from('fatigue_events')
      .select(
        `
        *,
        driver_sessions (
          driver_id,
          drivers (
            driver_name
          )
        )
      `
      )
      .order('event_time', { ascending: false });

    // Aplicar filtro por fechas si están definidas
    if (startDate) {
      query = query.gte('event_time', new Date(startDate).toISOString());
    }
    if (endDate) {
      query = query.lte('event_time', new Date(endDate).toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching fatigue events:', error);
    } else {
      setFatigueEvents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFatigueEvents();
  }, [startDate, endDate]);

  // Paginación
  const totalPages = Math.ceil(fatigueEvents.length / eventsPerPage);
  const paginatedEvents = fatigueEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  // Animaciones para las filas de la tabla
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  // Animaciones para el contenedor
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-extrabold"><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
          Detalles de Fatiga Recientes </span>
        </h1>
      </motion.div>
      

      
      {/* Tabla de Eventos */}
      {loading ? (
        <div className="text-center text-white text-xl">Cargando datos...</div>
      ) : (
        <motion.div
          className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Eventos de Fatiga</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <tr>
                  <th className="p-3 font-semibold rounded-tl-lg">ID Evento</th>
                  <th className="p-3 font-semibold">Conductor</th>
                  <th className="p-3 font-semibold">ID Conductor</th>
                  <th className="p-3 font-semibold">Fecha y Hora</th>
                  <th className="p-3 font-semibold">Tipo de Alerta</th>
                  <th className="p-3 font-semibold">Segundos Ojos Cerrados</th>
                  <th className="p-3 font-semibold rounded-tr-lg">Alarma Activada</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {paginatedEvents.map((event, index) => (
                  <motion.tr
                    key={event.event_id}
                    className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <td className="p-3 text-gray-700">{event.event_id}</td>
                    <td className="p-3 text-gray-700">{event.driver_sessions.drivers.driver_name}</td>
                    <td className="p-3 text-gray-700">{event.driver_sessions.driver_id}</td>
                    <td className="p-3 text-gray-700">
                      {new Date(event.event_time).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 text-gray-700">{event.alert_type}</td>
                    <td className="p-3 text-gray-700">{event.eye_closed_seconds} s</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          event.alarm_triggered
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {event.alarm_triggered ? 'Sí' : 'No'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Anterior
              </button>
              <span className="px-4 py-2 mx-1 text-gray-800">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 mx-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                Siguiente
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default RecentFatigueEvents;
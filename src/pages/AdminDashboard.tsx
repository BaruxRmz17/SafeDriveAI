import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../services/supabase';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registra los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, BarElement, Title, Tooltip, Legend);

// Interfaces para tipado
interface Driver {
  driver_id: number;
  driver_name: string;
}

interface FatigueEvent {
  event_id: number;
  session_id: number;
  event_time: string;
  alert_type: string;
  eye_closed_seconds: number;
  alarm_triggered: boolean;
}

interface Emotion {
  emotion_id: number;
  session_id: number;
  event_time: string;
  emotion: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [fatigueEvents, setFatigueEvents] = useState<FatigueEvent[]>([]);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Verifica si el usuario está autenticado
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      }
    };
    checkUser();
  }, [navigate]);

  // Obtiene datos de Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Obtener conductores
      const { data: driversData, error: driversError } = await supabase
        .from('drivers')
        .select('*');
      if (driversError) {
        console.error('Error fetching drivers:', driversError);
      } else {
        setDrivers(driversData || []);
      }

      // Obtener eventos de fatiga (últimos 7 días)
      const { data: fatigueData, error: fatigueError } = await supabase
        .from('fatigue_events')
        .select('*')
        .gte('event_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('event_time', { ascending: false });
      if (fatigueError) {
        console.error('Error fetching fatigue events:', fatigueError);
      } else {
        setFatigueEvents(fatigueData || []);
      }

      // Obtener emociones (últimos 7 días)
      const { data: emotionsData, error: emotionsError } = await supabase
        .from('emotions')
        .select('*')
        .gte('event_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('event_time', { ascending: false });
      if (emotionsError) {
        console.error('Error fetching emotions:', emotionsError);
      } else {
        setEmotions(emotionsData || []);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Datos para el gráfico de eventos de fatiga por día (últimos 7 días)
  const fatigueByDay = Array(7).fill(0);
  const labelsByDay = Array(7)
    .fill(0)
    .map((_, i) => {
      const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    });

  fatigueEvents.forEach((event) => {
    const eventDate = new Date(event.event_time);
    const daysDiff = Math.floor((Date.now() - eventDate.getTime()) / (24 * 60 * 60 * 1000));
    if (daysDiff >= 0 && daysDiff < 7) {
      fatigueByDay[6 - daysDiff]++;
    }
  });

  const fatigueChartData = {
    labels: labelsByDay,
    datasets: [
      {
        label: 'Eventos de Fatiga',
        data: fatigueByDay,
        borderColor: 'rgba(236, 72, 153, 1)', // Rosa
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Datos para el gráfico de emociones (solo las 5 más populares)
  const emotionCounts: { [key: string]: number } = {};
  emotions.forEach((emotion) => {
    emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
  });

  // Filtrar las 5 emociones más frecuentes
  const topEmotions = Object.entries(emotionCounts)
    .sort(([, a], [, b]) => b - a) // Ordenar por valor descendente
    .slice(0, 5); // Tomar solo las primeras 5

  const emotionChartData = {
    labels: topEmotions.map(([emotion]) => emotion),
    datasets: [
      {
        label: 'Emociones',
        data: topEmotions.map(([, count]) => count),
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)', // Rosa
          'rgba(139, 92, 246, 0.8)', // Morado
          'rgba(34, 197, 94, 0.8)',  // Verde
          'rgba(59, 130, 246, 0.8)', // Azul
          'rgba(234, 179, 8, 0.8)',  // Amarillo
        ],
        borderColor: [
          'rgba(236, 72, 153, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(234, 179, 8, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Animaciones para las tarjetas
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.03, boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)', transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-white p-6">
      {/* Encabezado */}
      <motion.div
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-extrabold text-black">
          Dashboard de <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">SafeDrive IA</span>
        </h1>
      </motion.div>

      {loading ? (
        <div className="text-center text-white text-xl">Cargando datos...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjeta 1: Resumen de Conductores */}
          <motion.div
            className="p-6 bg-white bg-opacity-90 rounded-2xl shadow-lg cursor-pointer"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            onClick={() => navigate('/DriverDetails')}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Conductores Activos</h2>
            <p className="text-4xl font-semibold text-purple-600">{drivers.length}</p>
            <p className="text-gray-600 mt-2">Total de conductores registrados</p>
          </motion.div>

          {/* Tarjeta 2: Eventos de Fatiga */}
          <motion.div
            className="p-6 bg-white bg-opacity-90 rounded-2xl shadow-lg cursor-pointer"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            onClick={() => navigate('/FatigueDetails')}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Eventos de Fatiga (Últimos 7 días)</h2>
            <div className="h-40">
              <Line
                data={fatigueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false }, title: { display: false } },
                  scales: {
                    x: { grid: { display: false } },
                    y: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, beginAtZero: true },
                  },
                }}
              />
            </div>
            <p className="text-gray-600 mt-4">Total: <span className="font-semibold">{fatigueEvents.length}</span></p>
          </motion.div>

          {/* Tarjeta 3: Distribución de Emociones (Top 5) */}
          <motion.div
            className="p-6 bg-white bg-opacity-90 rounded-2xl shadow-lg cursor-pointer"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            onClick={() => navigate('/Emociones')}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Top 5 Emociones (Últimos 7 días)</h2>
            <div className="h-40">
              <Bar
                data={emotionChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom' },
                    title: { display: false },
                  },
                  scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
                  },
                }}
              />
            </div>
            <p className="text-gray-600 mt-4">Total: <span className="font-semibold">{emotions.length}</span></p>
          </motion.div>

          {/* Tarjeta 4: Últimos Eventos de Fatiga (mejorada) */}
          <motion.div
              className="p-6 bg-white bg-opacity-90 rounded-2xl shadow-lg lg:col-span-2 cursor-pointer"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              onClick={() => navigate('/RecentFatigueEvents')} // Redirige a la nueva página
            >
              <h2 className="text-xl font-bold text-gray-800 mb-4">Últimos Eventos de Fatiga</h2>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <tr>
                      <th className="p-3 font-semibold rounded-tl-lg">ID Evento</th>
                      <th className="p-3 font-semibold">Fecha y Hora</th>
                      <th className="p-3 font-semibold">Tipo de Alerta</th>
                      <th className="p-3 font-semibold">Segundos Ojos Cerrados</th>
                      <th className="p-3 font-semibold rounded-tr-lg">Alarma Activada</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {fatigueEvents.slice(0, 5).map((event, index) => (
                      <tr
                        key={event.event_id}
                        className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                        }`}
                      >
                        <td className="p-3 text-gray-700">{event.event_id}</td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
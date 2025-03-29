import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../services/supabase';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registra los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Interfaces para tipado
interface Emotion {
  emotion_id: number;
  session_id: number;
  event_time: string;
  emotion: string;
  driver_sessions: {
    driver_id: number;
    drivers: {
      driver_name: string;
    };
  };
}

const Emociones: React.FC = () => {
  const navigate = useNavigate();
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Estadísticas
  const [totalEmotions, setTotalEmotions] = useState<number>(0);
  const [mostCommonEmotion, setMostCommonEmotion] = useState<string>('');
  const [positiveEmotions, setPositiveEmotions] = useState<number>(0);

  // Obtener emociones con información del conductor
  const fetchEmotions = async () => {
    setLoading(true);
    let query = supabase
      .from('emotions')
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

    if (startDate) {
      query = query.gte('event_time', new Date(startDate).toISOString());
    }
    if (endDate) {
      query = query.lte('event_time', new Date(endDate).toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching emotions:', error);
    } else {
      setEmotions(data || []);
      setTotalEmotions(data.length);

      const emotionCounts: { [key: string]: number } = {};
      data.forEach((emotion: Emotion) => {
        emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
      });
      const mostCommon = Object.entries(emotionCounts).reduce(
        (a, b) => (b[1] > a[1] ? b : a),
        ['Ninguna', 0]
      );
      setMostCommonEmotion(mostCommon[0]);

      const positiveEmotionsList = ['alerta', 'feliz', 'calmado'];
      const positiveCount = data.filter((emotion: Emotion) =>
        positiveEmotionsList.includes(emotion.emotion.toLowerCase())
      ).length;
      setPositiveEmotions(data.length ? Number(((positiveCount / data.length) * 100).toFixed(1)) : 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmotions();
  }, [startDate, endDate]);

  const emotionCounts: { [key: string]: number } = {};
  emotions.forEach((emotion) => {
    emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
  });

  const emotionChartData = {
    labels: Object.keys(emotionCounts),
    datasets: [
      {
        label: 'Distribución de Emociones',
        data: Object.values(emotionCounts),
        backgroundColor: [
          'rgba(236, 72, 153, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const emotionsByDriver: { [key: string]: { [key: string]: number } } = {};
  emotions.forEach((emotion) => {
    const driverName = emotion.driver_sessions.drivers.driver_name;
    if (!emotionsByDriver[driverName]) {
      emotionsByDriver[driverName] = {};
    }
    emotionsByDriver[driverName][emotion.emotion] = (emotionsByDriver[driverName][emotion.emotion] || 0) + 1;
  });

  const driverLabels = Object.keys(emotionsByDriver);
  const uniqueEmotions = Array.from(new Set(emotions.map((e) => e.emotion)));
  const datasets = uniqueEmotions.map((emotion, index) => ({
    label: emotion,
    data: driverLabels.map((driver) => emotionsByDriver[driver][emotion] || 0),
    backgroundColor: [
      'rgba(236, 72, 153, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(234, 179, 8, 0.8)',
    ][index % 5],
    borderWidth: 1,
  }));

  const emotionsByDriverChartData = {
    labels: driverLabels,
    datasets,
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  const summaryVariants = {
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
          Detalles de Emociones </span>
        </h1>
      </motion.div>
      {/* Filtro por fechas */}
      <motion.div
        className="bg-white bg-opacity-90 rounded-2xl shadow-md hover:shadow-lg p-6 mb-6 transition-shadow duration-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Filtrar por Fecha</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Inicio
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Fin
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Resumen Estadístico */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        variants={summaryVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="p-4 bg-white bg-opacity-90 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-800">Total de Emociones</h3>
          <p className="text-2xl font-bold text-purple-600">{totalEmotions}</p>
        </div>
        <div className="p-4 bg-white bg-opacity-90 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-800">Emoción Más Común</h3>
          <p className="text-2xl font-bold text-purple-600">{mostCommonEmotion}</p>
        </div>
        <div className="p-4 bg-white bg-opacity-90 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-lg font-semibold text-gray-800">Emociones Positivas</h3>
          <p className="text-2xl font-bold text-purple-600">{positiveEmotions}%</p>
        </div>
      </motion.div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Gráfico 1: Distribución de Emociones */}
        <motion.div
          className="bg-white bg-opacity-90 rounded-2xl shadow-md hover:shadow-lg p-6 transition-shadow duration-300"
          variants={summaryVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Distribución de Emociones</h2>
          <div className="h-80">
            <Doughnut
              data={emotionChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' },
                  title: { display: true, text: 'Distribución General', font: { size: 16 } },
                },
              }}
            />
          </div>
        </motion.div>

        {/* Gráfico 2: Emociones por Conductor */}
        <motion.div
          className="bg-white bg-opacity-90 rounded-2xl shadow-md hover:shadow-lg p-6 transition-shadow duration-300"
          variants={summaryVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">Emociones por Conductor</h2>
          <div className="h-80">
            <Bar
              data={emotionsByDriverChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Emociones por Conductor', font: { size: 16 } },
                },
                scales: {
                  x: { title: { display: true, text: 'Conductor' } },
                  y: { title: { display: true, text: 'Número de Emociones' }, beginAtZero: true },
                },
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Tabla de Emociones */}
      {loading ? (
        <div className="text-center text-white text-xl">Cargando datos...</div>
      ) : (
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-md hover:shadow-lg p-6 transition-shadow duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Emociones</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 bg-gray-100">
                  <th className="p-3">ID Emoción</th>
                  <th className="p-3">Conductor</th>
                  <th className="p-3">ID Conductor</th>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Emoción</th>
                  <th className="p-3">Sesión ID</th>
                </tr>
              </thead>
              <tbody>
                {emotions.map((emotion, index) => (
                  <motion.tr
                    key={emotion.emotion_id}
                    className={`border-t ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-50 transition`}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <td className="p-3">{emotion.emotion_id}</td>
                    <td className="p-3">{emotion.driver_sessions.drivers.driver_name}</td>
                    <td className="p-3">{emotion.driver_sessions.driver_id}</td>
                    <td className="p-3">{new Date(emotion.event_time).toLocaleString()}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          ['alerta', 'feliz', 'calmado'].includes(emotion.emotion.toLowerCase())
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {emotion.emotion}
                      </span>
                    </td>
                    <td className="p-3">{emotion.session_id}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Emociones;
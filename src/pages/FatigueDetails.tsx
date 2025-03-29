import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../services/supabase';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Registra los componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

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

const FatigueDetails: React.FC = () => {
  const navigate = useNavigate();
  const [fatigueEvents, setFatigueEvents] = useState<FatigueEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Estadísticas
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [avgEyeClosed, setAvgEyeClosed] = useState<number>(0);
  const [alarmsTriggered, setAlarmsTriggered] = useState<number>(0);

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

      // Calcular estadísticas
      setTotalEvents(data.length);
      const totalEyeClosed = data.reduce((sum: number, event: FatigueEvent) => sum + event.eye_closed_seconds, 0);
      setAvgEyeClosed(data.length ? Number((totalEyeClosed / data.length).toFixed(2)) : 0);
      setAlarmsTriggered(data.filter((event: FatigueEvent) => event.alarm_triggered).length);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFatigueEvents();
  }, [startDate, endDate]);

  // Datos para el gráfico de eventos de fatiga por día
  const dateRange = startDate && endDate ? 
    Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)) + 1 : 30; // Últimos 30 días por defecto
  const fatigueByDay: number[] = Array(dateRange).fill(0);
  const labelsByDay: string[] = [];

  // Generar etiquetas para el eje X (fechas)
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  for (let i = 0; i < dateRange; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    labelsByDay.push(date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
  }

  fatigueEvents.forEach((event) => {
    const eventDate = new Date(event.event_time);
    const daysDiff = Math.floor((eventDate.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    if (daysDiff >= 0 && daysDiff < dateRange) {
      fatigueByDay[daysDiff]++;
    }
  });

  const fatigueChartData = {
    labels: labelsByDay,
    datasets: [
      {
        label: 'Eventos de Fatiga por Día',
        data: fatigueByDay,
        borderColor: 'rgba(236, 72, 153, 1)', // Rosa
        backgroundColor: 'rgba(236, 72, 153, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Animaciones para las filas de la tabla
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  // Animaciones para el resumen y el gráfico
  const summaryVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600 p-6">
    

      {/* Filtro por fechas */}
      <motion.div
        className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-6 mb-6"
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
        <div className="p-4 bg-white bg-opacity-90 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800">Total de Eventos</h3>
          <p className="text-2xl font-bold text-purple-600">{totalEvents}</p>
        </div>
        <div className="p-4 bg-white bg-opacity-90 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800">Promedio Ojos Cerrados</h3>
          <p className="text-2xl font-bold text-purple-600">{avgEyeClosed} s</p>
        </div>
        <div className="p-4 bg-white bg-opacity-90 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800">Alarmas Activadas</h3>
          <p className="text-2xl font-bold text-purple-600">{alarmsTriggered}</p>
        </div>
      </motion.div>

      {/* Tabla de Eventos */}
      {loading ? (
        <div className="text-center text-white text-xl">Cargando datos...</div>
      ) : (
        <div className="bg-white bg-opacity-90 rounded- pizzel shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Eventos de Fatiga</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 bg-gray-100">
                  <th className="p-3">ID Evento</th>
                  <th className="p-3">Conductor</th>
                  <th className="p-3">ID Conductor</th>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Tipo de Alerta</th>
                  <th className="p-3">Segundos Ojos Cerrados</th>
                  <th className="p-3">Alarma Activada</th>
                </tr>
              </thead>
              <tbody>
                {fatigueEvents.map((event, index) => (
                  <motion.tr
                    key={event.event_id}
                    className={`border-t ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-50 transition`}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <td className="p-3">{event.event_id}</td>
                    <td className="p-3">{event.driver_sessions.drivers.driver_name}</td>
                    <td className="p-3">{event.driver_sessions.driver_id}</td>
                    <td className="p-3">{new Date(event.event_time).toLocaleString()}</td>
                    <td className="p-3">{event.alert_type}</td>
                    <td className="p-3">{event.eye_closed_seconds} s</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          event.alarm_triggered ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
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
        </div>
      )}

      {/* Gráfico de Eventos de Fatiga (movido abajo) */}
      <motion.div
        className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-6"
        variants={summaryVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Eventos de Fatiga por Día</h2>
        <div className="h-96"> {/* Gráfico más grande */}
          <Line
            data={fatigueChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Tendencia de Eventos de Fatiga', font: { size: 16 } },
                tooltip: { enabled: true },
              },
              scales: {
                x: { grid: { display: false }, title: { display: true, text: 'Fecha' } },
                y: {
                  grid: { color: 'rgba(0, 0, 0, 0.1)' },
                  beginAtZero: true,
                  title: { display: true, text: 'Número de Eventos' },
                },
              },
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default FatigueDetails;
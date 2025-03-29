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

interface Driver {
  driver_id: number;
  driver_name: string;
  driver_email: string;
  created_at: string;
}

interface Emotion {
  emotion_id: number;
  session_id: number;
  event_time: string;
  emotion: string;
}

interface FatigueEvent {
  event_id: number;
  session_id: number;
  event_time: string;
  alert_type: string;
  eye_closed_seconds: number;
  alarm_triggered: boolean;
}

const DriverDetails: React.FC = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<number | null>(null);
  const [newDriver, setNewDriver] = useState({ driver_name: '', driver_email: '' });
  const [editDriver, setEditDriver] = useState({ driver_name: '', driver_email: '' });
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [fatigueEvents, setFatigueEvents] = useState<FatigueEvent[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Obtener lista de conductores
  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('driver_id', { ascending: true });
      if (error) {
        console.error('Error fetching drivers:', error);
      } else {
        setDrivers(data || []);
      }
      setLoading(false);
    };

    fetchDrivers();
  }, []);

  // Obtener datos del conductor seleccionado (emociones y eventos de fatiga)
  useEffect(() => {
    if (selectedDriverId === null) {
      setEmotions([]);
      setFatigueEvents([]);
      return;
    }

    const fetchDriverData = async () => {
      setDataLoading(true);

      // 1. Obtener los session_id asociados al driver_id
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('driver_sessions')
        .select('session_id')
        .eq('driver_id', selectedDriverId);

      if (sessionsError) {
        console.error('Error fetching driver sessions:', sessionsError);
        setDataLoading(false);
        return;
      }

      if (!sessionsData || sessionsData.length === 0) {
        console.log('No sessions found for this driver.');
        setEmotions([]);
        setFatigueEvents([]);
        setDataLoading(false);
        return;
      }

      const sessionIds = sessionsData.map((session) => session.session_id);

      // 2. Obtener emociones usando los session_id
      const { data: emotionsData, error: emotionsError } = await supabase
        .from('emotions')
        .select('*')
        .in('session_id', sessionIds);

      if (emotionsError) {
        console.error('Error fetching emotions:', emotionsError);
      } else {
        console.log('Emotions fetched:', emotionsData);
        setEmotions(emotionsData || []);
      }

      // 3. Obtener eventos de fatiga usando los session_id
      const { data: fatigueData, error: fatigueError } = await supabase
        .from('fatigue_events')
        .select('*')
        .in('session_id', sessionIds);

      if (fatigueError) {
        console.error('Error fetching fatigue events:', fatigueError);
      } else {
        console.log('Fatigue events fetched:', fatigueData);
        setFatigueEvents(fatigueData || []);
      }

      setDataLoading(false);
    };

    fetchDriverData();
  }, [selectedDriverId]);

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.driver_name.toLowerCase().includes(search.toLowerCase()) ||
      driver.driver_email.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateDriver = async () => {
    const { driver_name, driver_email } = newDriver;
    if (!driver_name || !driver_email) return;

    const { data, error } = await supabase.from('drivers').insert([{ driver_name, driver_email }]).select();
    if (error) {
      console.error('Error creating driver:', error);
    } else {
      setDrivers((prev) =>
        [...prev, data[0]].sort((a, b) => a.driver_id - b.driver_id)
      );
      setNewDriver({ driver_name: '', driver_email: '' });
      setShowCreateForm(false);
      alert('Usuario creado con éxito');
    }
  };

  const handleEditDriver = async (driver_id: number) => {
    const { driver_name, driver_email } = editDriver;
    if (!driver_name || !driver_email) return;

    const { data, error } = await supabase
      .from('drivers')
      .update({ driver_name, driver_email })
      .eq('driver_id', driver_id)
      .select();
    if (error) {
      console.error('Error updating driver:', error);
    } else {
      setDrivers((prev) =>
        prev
          .map((driver) => (driver.driver_id === driver_id ? data[0] : driver))
          .sort((a, b) => a.driver_id - b.driver_id)
      );
      setShowEditForm(null);
      alert('Usuario actualizado con éxito');
    }
  };

  const handleDeleteDriver = async (driver_id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este conductor?')) return;

    const { error } = await supabase.from('drivers').delete().eq('driver_id', driver_id);
    if (error) {
      console.error('Error deleting driver:', error);
    } else {
      setDrivers((prev) => prev.filter((driver) => driver.driver_id !== driver_id));
      if (selectedDriverId === driver_id) {
        setSelectedDriverId(null);
      }
      alert('Usuario eliminado con éxito');
    }
  };

  // Mapa de colores para las emociones
  const emotionColors: { [key: string]: string } = {
    feliz: 'rgba(34, 197, 94, 0.8)', // Verde
    alerta: 'rgba(59, 130, 246, 0.8)', // Azul
    cansado: 'rgba(234, 179, 8, 0.8)', // Amarillo
    estresado: 'rgba(236, 72, 153, 0.8)', // Rosa
    enojado: 'rgba(239, 68, 68, 0.8)', // Rojo
    // Agrega más emociones y colores según sea necesario
  };

  // Datos para el gráfico de emociones
  const emotionCounts: { [key: string]: number } = {};
  emotions.forEach((emotion) => {
    emotionCounts[emotion.emotion] = (emotionCounts[emotion.emotion] || 0) + 1;
  });

  const emotionChartData = {
    labels: Object.keys(emotionCounts),
    datasets: [
      {
        label: 'Emociones',
        data: Object.values(emotionCounts),
        backgroundColor: Object.keys(emotionCounts).map(
          (emotion) => emotionColors[emotion.toLowerCase()] || 'rgba(139, 92, 246, 0.8)' // Color por defecto si no está en el mapa
        ),
        borderColor: Object.keys(emotionCounts).map(
          (emotion) => emotionColors[emotion.toLowerCase()]?.replace('0.8', '1') || 'rgba(139, 92, 246, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  // Datos para el gráfico de eventos de fatiga
  const fatigueByDay = Array(30).fill(0); // Últimos 30 días
  const labelsByDay = Array(30)
    .fill(0)
    .map((_, i) => {
      const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    });

  fatigueEvents.forEach((event) => {
    const eventDate = new Date(event.event_time);
    const daysDiff = Math.floor((Date.now() - eventDate.getTime()) / (24 * 60 * 60 * 1000));
    if (daysDiff >= 0 && daysDiff < 30) {
      fatigueByDay[29 - daysDiff]++;
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

  // Estadísticas de alarmas
  const alarmsTriggeredCount = fatigueEvents.filter((event) => event.alarm_triggered).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-500 to-blue-600 p-6">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-extrabold text-white">
          Detalles de Conductores
        </h1>
      </motion.div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Buscar por nombre o correo"
          className="p-2 rounded-lg text-black w-full sm:w-auto"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-green-500 text-white p-2 rounded-lg w-full sm:w-auto"
          onClick={() => setShowCreateForm(true)}
        >
          Crear Nuevo Conductor
        </button>
      </div>

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nuevo Conductor</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Nombre</label>
            <input
              type="text"
              className="p-2 w-full rounded-lg"
              value={newDriver.driver_name}
              onChange={(e) => setNewDriver({ ...newDriver, driver_name: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Correo</label>
            <input
              type="email"
              className="p-2 w-full rounded-lg"
              value={newDriver.driver_email}
              onChange={(e) => setNewDriver({ ...newDriver, driver_email: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-500 text-white p-2 rounded-lg" onClick={handleCreateDriver}>
              Crear
            </button>
            <button
              className="bg-gray-500 text-white p-2 rounded-lg"
              onClick={() => setShowCreateForm(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Formulario de edición */}
      {showEditForm !== null && (
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Editar Conductor</h2>
          <div className="mb-4">
            <label className="block text-gray-700">Nombre</label>
            <input
              type="text"
              className="p-2 w-full rounded-lg"
              value={editDriver.driver_name}
              onChange={(e) => setEditDriver({ ...editDriver, driver_name: e.target.value })}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Correo</label>
            <input
              type="email"
              className="p-2 w-full rounded-lg"
              value={editDriver.driver_email}
              onChange={(e) => setEditDriver({ ...editDriver, driver_email: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="bg-blue-500 text-white p-2 rounded-lg"
              onClick={() => handleEditDriver(showEditForm)}
            >
              Guardar
            </button>
            <button
              className="bg-gray-500 text-white p-2 rounded-lg"
              onClick={() => setShowEditForm(null)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-white text-xl">Cargando datos...</div>
      ) : (
        <div className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Conductores</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-600 bg-gray-100">
                  <th className="p-3">ID</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3">Fecha de Registro</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 p-3">
                      No hay conductores disponibles.
                    </td>
                  </tr>
                ) : (
                  filteredDrivers.map((driver) => (
                    <tr key={driver.driver_id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{driver.driver_id}</td>
                      <td className="p-3">{driver.driver_name}</td>
                      <td className="p-3">{driver.driver_email}</td>
                      <td className="p-3">{new Date(driver.created_at).toLocaleDateString()}</td>
                      <td className="p-3 flex space-x-2">
                        <button
                          className="bg-yellow-500 text-white p-1 rounded-lg"
                          onClick={() => {
                            setEditDriver({
                              driver_name: driver.driver_name,
                              driver_email: driver.driver_email,
                            });
                            setShowEditForm(driver.driver_id);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="bg-red-500 text-white p-1 rounded-lg"
                          onClick={() => handleDeleteDriver(driver.driver_id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selector de usuario y gráficas */}
      <div className="bg-white bg-opacity-90 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Selecciona un usuario para ver sus estadísticas</h2>
        <select
          className="p-2 rounded-lg w-full sm:w-64 mb-6"
          value={selectedDriverId || ''}
          onChange={(e) => setSelectedDriverId(Number(e.target.value) || null)}
        >
          <option value="">-- Selecciona un conductor --</option>
          {drivers.map((driver) => (
            <option key={driver.driver_id} value={driver.driver_id}>
              {driver.driver_name} (ID: {driver.driver_id})
            </option>
          ))}
        </select>

        {selectedDriverId && (
          <div className="space-y-6">
            {dataLoading ? (
              <div className="text-center text-gray-600 text-xl">Cargando estadísticas...</div>
            ) : (
              <>
                {/* Gráfico de emociones */}
                <div className="w-full">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Emociones del Conductor</h3>
                  {emotions.length === 0 ? (
                    <p className="text-gray-600">No hay datos de emociones disponibles para este conductor.</p>
                  ) : (
                    <div className="h-64 w-full">
                      <Bar
                        data={emotionChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'top' } },
                          scales: {
                            x: { grid: { display: false } },
                            y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
                          },
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Gráfico de eventos de fatiga */}
                <div className="w-full">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Eventos de Fatiga (Últimos 30 días)</h3>
                  {fatigueEvents.length === 0 ? (
                    <p className="text-gray-600">No hay datos de eventos de fatiga disponibles para este conductor.</p>
                  ) : (
                    <div className="h-64 w-full">
                      <Line
                        data={fatigueChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { position: 'top' } },
                          scales: {
                            x: { grid: { display: false } },
                            y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.1)' } },
                          },
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Información de alarmas */}
                <div className="w-full">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Información de Alarmas</h3>
                  <p className="text-gray-700 mb-2">
                    ¿Sonó la alarma alguna vez?{' '}
                    <span className={alarmsTriggeredCount > 0 ? 'text-red-600' : 'text-green-600'}>
                      {alarmsTriggeredCount > 0 ? 'Sí' : 'No'}
                    </span>
                  </p>
                  <p className="text-gray-700">
                    Número de veces que sonó la alarma:{' '}
                    <span className="font-bold text-purple-600">{alarmsTriggeredCount}</span>
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDetails;
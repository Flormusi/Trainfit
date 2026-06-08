import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as apiService from '../../services/api';
const { trainerApi }: { trainerApi: typeof apiService.trainerApi } = apiService;

interface Exercise {
  id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  type?: string;
  muscles?: string[];
}

const EMPTY: Exercise = { name: '', description: '', imageUrl: '', videoUrl: '', type: '', muscles: [] };

const MyExercisesPage: React.FC = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Exercise | null>(null);
  const [form, setForm] = useState<Exercise>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const res = await trainerApi.getExercises();
      const data: any = res.data;
      const list = data?.data ?? data;
      setExercises(Array.isArray(list) ? list : []);
    } catch {
      setError('Error al cargar ejercicios.');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const openEdit = (ex: Exercise) => {
    setEditing(ex);
    setForm({ ...ex });
    setError(null);
    setSuccess(null);
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError('El nombre es obligatorio.'); return; }
    setSaving(true);
    setError(null);
    try {
      if (editing?.id) {
        await trainerApi.updateExercise(editing.id, form);
        setSuccess('Ejercicio actualizado.');
      } else {
        await trainerApi.createExercise(form);
        setSuccess('Ejercicio creado.');
      }
      await fetchExercises();
      setShowForm(false);
    } catch {
      setError('Error al guardar. Intentá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await trainerApi.deleteExercise(id);
      setExercises(prev => prev.filter(e => e.id !== id));
      setDeleteConfirm(null);
    } catch {
      setError('Error al eliminar.');
    }
  };

  const filtered = exercises.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#ff4444]">Mis Ejercicios</h1>
            <p className="text-gray-400 mt-1">Creá y gestioná tus ejercicios personalizados</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/trainer-dashboard')}
              className="px-5 py-3 border border-[#555] hover:bg-[#333] rounded-lg transition-all"
            >
              ← Dashboard
            </button>
            <button
              onClick={openNew}
              className="px-5 py-3 bg-[#ff4444] hover:bg-[#ff3333] rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo ejercicio
            </button>
          </div>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        {/* Buscador */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar ejercicio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#444] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff4444] focus:border-[#ff4444] transition-all"
          />
        </div>

        {/* Lista */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-lg">
              {search ? 'No se encontraron ejercicios.' : 'Todavía no creaste ningún ejercicio.'}
            </p>
            {!search && (
              <button onClick={openNew} className="mt-4 text-[#ff4444] hover:underline">
                Crear el primero →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(ex => (
              <div key={ex.id} className="bg-[#2a2a2a] border border-[#444] rounded-xl p-5 flex gap-4">
                {/* Imagen */}
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#1a1a1a] border border-[#333] flex items-center justify-center">
                  {ex.imageUrl ? (
                    <img src={ex.imageUrl} alt={ex.name} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg leading-tight">{ex.name}</h3>
                  {ex.description && (
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{ex.description}</p>
                  )}
                  {ex.videoUrl && (
                    <a
                      href={ex.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#ff4444] hover:underline mt-2"
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Ver video
                    </a>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => openEdit(ex)}
                    className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#333] transition-all"
                    title="Editar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(ex.id!)}
                    className="text-gray-400 hover:text-[#ff4444] p-1.5 rounded-lg hover:bg-[#333] transition-all"
                    title="Eliminar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-2xl p-8 w-full max-w-lg border border-[#444] max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editing ? 'Editar ejercicio' : 'Nuevo ejercicio'}
              </h2>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Ej: Curl de bíceps con polea baja"
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff4444] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Descripción</label>
                  <textarea
                    name="description"
                    value={form.description || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Descripción del ejercicio, músculos trabajados, técnica..."
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff4444] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    URL de imagen
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={form.imageUrl || ''}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff4444] transition-all"
                  />
                  {form.imageUrl && (
                    <img src={form.imageUrl} alt="preview" className="mt-2 h-24 rounded-lg object-cover border border-[#444]" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Link de video (YouTube, etc.)
                  </label>
                  <input
                    type="url"
                    name="videoUrl"
                    value={form.videoUrl || ''}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff4444] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo / Categoría</label>
                  <input
                    type="text"
                    name="type"
                    value={form.type || ''}
                    onChange={handleChange}
                    placeholder="Ej: Fuerza, Cardio, Movilidad..."
                    className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#555] rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#ff4444] transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 border border-[#555] hover:bg-[#333] rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-[#ff4444] hover:bg-[#ff3333] disabled:opacity-50 rounded-lg font-semibold transition-all"
                >
                  {saving ? 'Guardando...' : (editing ? 'Guardar cambios' : 'Crear ejercicio')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal confirmar eliminación */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#2a2a2a] rounded-2xl p-8 w-full max-w-sm border border-[#444] text-center">
              <svg className="w-12 h-12 text-[#ff4444] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold mb-2">¿Eliminar ejercicio?</h3>
              <p className="text-gray-400 mb-6 text-sm">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 border border-[#555] hover:bg-[#333] rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 bg-[#ff4444] hover:bg-[#ff3333] rounded-lg font-semibold transition-all"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyExercisesPage;

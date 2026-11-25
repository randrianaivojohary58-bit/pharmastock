import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PageHeader from '../components/common/PageHeader';
import { useToast } from '../context/ToastContext';

const MIN_PASSWORD = 6;

// Appelle la fonction Edge "admin-users" (création, mot de passe, suppression)
// et remonte le vrai message d'erreur renvoyé par le serveur
async function callAdminUsers(body) {
  const { data, error } = await supabase.functions.invoke('bright-function', { body });

  if (error) {
    let message = error.message;
    try {
      const details = await error.context.json();
      if (details?.error) message = details.error;
    } catch {
      /* on garde le message par défaut */
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export default function Utilisateurs() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({ username: '', password: '', full_name: '', role: 'caissier' });

  // Charger les utilisateurs
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, role, avatar, auth_id')
      .order('full_name');
    if (!error) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setForm({ username: user.username, password: '', full_name: user.full_name, role: user.role });
    } else {
      setEditingUser(null);
      setForm({ username: '', password: '', full_name: '', role: 'caissier' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (saving) return;

    if (!form.username.trim() || !form.full_name.trim()) {
      showToast('Attention', 'Nom complet et identifiant requis', 'error');
      return;
    }
    if (form.password && form.password.length < MIN_PASSWORD) {
      showToast('Attention', `Mot de passe : ${MIN_PASSWORD} caractères minimum`, 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        // 1. Nom et rôle : directement dans profiles (réservé à l'admin par le RLS)
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: form.full_name.trim(), role: form.role })
          .eq('id', editingUser.id);
        if (error) throw error;

        // 2. Mot de passe : seulement s'il est rempli, via la fonction sécurisée
        if (form.password) {
          if (!editingUser.auth_id) {
            throw new Error("Ce profil n'est lié à aucun compte de connexion");
          }
          await callAdminUsers({
            action: 'reset_password',
            auth_id: editingUser.auth_id,
            password: form.password,
          });
        }
        showToast('Succès', 'Utilisateur modifié');
      } else {
        // Création du compte de connexion + du profil
        if (!form.password) {
          showToast('Attention', 'Mot de passe requis pour un nouvel utilisateur', 'error');
          return;
        }
        await callAdminUsers({
          action: 'create',
          username: form.username,
          password: form.password,
          full_name: form.full_name,
          role: form.role,
        });
        showToast('Succès', 'Utilisateur ajouté');
      }

      fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      showToast('Erreur', err.message || 'Une erreur est survenue', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;

    try {
      if (user.auth_id) {
        // Supprime le compte de connexion (le profil part avec lui)
        await callAdminUsers({ action: 'delete', auth_id: user.auth_id });
      } else {
        // Profil orphelin sans compte de connexion
        const { error } = await supabase.from('profiles').delete().eq('id', user.id);
        if (error) throw error;
      }
      showToast('Succès', 'Utilisateur supprimé');
      fetchUsers();
    } catch (err) {
      showToast('Erreur', err.message || 'Suppression impossible', 'error');
    }
  };

  return (
    <div>
      <PageHeader
        title="Gestion des Utilisateurs"
        subtitle="Ajouter, modifier ou supprimer des comptes"
        action={
          <button onClick={() => handleOpenModal()}
            className="h-10 px-4 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-emerald-700">
            <Plus className="w-4 h-4" /> Nouvel utilisateur
          </button>
        }
      />

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Utilisateur</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Identifiant</th>
                <th className="px-4 py-3 text-left font-bold text-gray-600">Rôle</th>
                <th className="px-4 py-3 text-center font-bold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center text-gray-500">Chargement...</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        {u.avatar || u.full_name.substring(0, 2).toUpperCase()}
                      </div>
                      <strong>{u.full_name}</strong>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-emerald-700">{u.username}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'magasinier' ? 'bg-blue-100 text-blue-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {u.role === 'admin' ? 'Administrateur' : u.role === 'magasinier' ? 'Magasinier' : 'Caissier'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleOpenModal(u)}
                        className="w-7 h-7 bg-orange-50 text-orange-600 rounded hover:bg-orange-100 flex items-center justify-center">
                        <Edit className="w-3 h-3" />
                      </button>
                      {u.username !== 'admin' && (
                        <button onClick={() => handleDelete(u)}
                          className="w-7 h-7 bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">
              {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">Nom complet *</label>
                <input value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Identifiant *</label>
                <input value={form.username} onChange={(e) => setForm({...form, username: e.target.value})}
                  disabled={!!editingUser}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs disabled:bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : `* (${MIN_PASSWORD} caractères minimum)`}
                </label>
                <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                  autoComplete="new-password"
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Rôle *</label>
                <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-xs">
                  <option value="admin">Administrateur</option>
                  <option value="magasinier">Magasinier</option>
                  <option value="caissier">Caissier</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setIsModalOpen(false)} disabled={saving}
                className="px-4 py-2 border border-gray-200 rounded-lg text-xs disabled:opacity-50">Annuler</button>
              <button onClick={handleSave} disabled={saving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs disabled:opacity-50">
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
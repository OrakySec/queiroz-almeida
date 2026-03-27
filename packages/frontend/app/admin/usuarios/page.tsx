'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, UserX, UserCheck, Loader2, X, Save } from 'lucide-react'
import api from '@/lib/api'
import { useAdmin } from '@/context/AdminContext'

interface User {
  id: string
  nome: string
  email: string
  role: 'ADMIN' | 'GERENTE' | 'EDITOR'
  ativo: boolean
  createdAt: string
}

const ROLES: { value: User['role']; label: string; color: string }[] = [
  { value: 'ADMIN',   label: 'Admin',   color: 'bg-red-50 text-red-600 border-red-200' },
  { value: 'GERENTE', label: 'Gerente', color: 'bg-amber-50 text-amber-600 border-amber-200' },
  { value: 'EDITOR',  label: 'Editor',  color: 'bg-blue-50 text-blue-600 border-blue-200' },
]

function RoleBadge({ role }: { role: User['role'] }) {
  const r = ROLES.find(r => r.value === role)!
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${r.color}`}>
      {r.label}
    </span>
  )
}

interface ModalProps {
  user?: User
  onClose: () => void
  onSaved: () => void
}

function UserModal({ user, onClose, onSaved }: ModalProps) {
  const [nome, setNome]       = useState(user?.nome ?? '')
  const [email, setEmail]     = useState(user?.email ?? '')
  const [role, setRole]       = useState<User['role']>(user?.role ?? 'EDITOR')
  const [senha, setSenha]     = useState('')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  async function save() {
    setSaving(true)
    setError('')
    try {
      if (user) {
        const payload: any = { nome, role }
        if (senha) payload.senha = senha
        await api.put(`/api/admin/usuarios/${user.id}`, payload)
      } else {
        if (!senha) { setError('Senha obrigatória para novo usuário'); setSaving(false); return }
        await api.post('/api/admin/usuarios', { nome, email, role, senha })
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-brand-navy/30 hover:text-brand-navy">
          <X size={20} />
        </button>
        <h2 className="text-lg font-bold text-brand-navy mb-6">
          {user ? 'Editar Usuário' : 'Novo Usuário'}
        </h2>

        <div className="space-y-4">
          <Field label="Nome">
            <input value={nome} onChange={e => setNome(e.target.value)} className={inp()} placeholder="João Silva" />
          </Field>
          <Field label="E-mail">
            <input value={email} onChange={e => setEmail(e.target.value)} disabled={!!user} className={inp()} placeholder="joao@exemplo.com" type="email" />
          </Field>
          <Field label="Nível de Acesso">
            <select value={role} onChange={e => setRole(e.target.value as User['role'])} className={inp()}>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>
          <Field label={user ? 'Nova Senha (deixe em branco para manter)' : 'Senha'}>
            <input value={senha} onChange={e => setSenha(e.target.value)} className={inp()} type="password" placeholder="••••••••" />
          </Field>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={save}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-brand-marinho text-white font-semibold text-sm py-3 rounded-full hover:bg-brand-marinho/90 transition disabled:opacity-50 mt-2"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {user ? 'Salvar Alterações' : 'Criar Usuário'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-brand-navy/50 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function inp() {
  return 'w-full px-4 py-2.5 rounded-xl border border-brand-navy/10 bg-brand-navy/[0.02] text-brand-navy placeholder-brand-navy/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-marinho/30 disabled:opacity-50'
}

export default function UsuariosPage() {
  const { user: me } = useAdmin()
  const [users, setUsers]       = useState<User[]>([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState<{ open: boolean; user?: User }>({ open: false })
  const [actionId, setActionId] = useState<string | null>(null)

  const isAdmin = me?.role === 'ADMIN'

  async function load() {
    setLoading(true)
    try {
      const res = await api.get('/api/admin/usuarios')
      setUsers(res.data.data ?? res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function toggleAtivo(u: User) {
    setActionId(u.id)
    try {
      await api.patch(`/api/admin/usuarios/${u.id}/ativo`, { ativo: !u.ativo })
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro')
    } finally {
      setActionId(null)
    }
  }

  async function deleteUser(u: User) {
    if (!confirm(`Excluir usuário "${u.nome}"? Esta ação não pode ser desfeita.`)) return
    setActionId(u.id)
    try {
      await api.delete(`/api/admin/usuarios/${u.id}`)
      await load()
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Erro')
    } finally {
      setActionId(null)
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-brand-navy/40 text-sm">Acesso restrito a administradores.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {modal.open && (
        <UserModal
          user={modal.user}
          onClose={() => setModal({ open: false })}
          onSaved={load}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Usuários</h1>
          <p className="text-sm text-brand-navy/50 mt-1">{users.length} usuário(s)</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 bg-brand-marinho text-white font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-brand-marinho/90 transition"
        >
          <Plus size={16} />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-brand-navy/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-brand-marinho" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-navy/5">
                  {['Nome', 'E-mail', 'Nível', 'Status', 'Desde', 'Ações'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-brand-navy/30">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-navy/5">
                {users.map(u => (
                  <tr key={u.id} className={`hover:bg-brand-navy/[0.02] transition-colors ${!u.ativo ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-4 font-semibold text-brand-navy">{u.nome}</td>
                    <td className="px-5 py-4 text-brand-navy/60">{u.email}</td>
                    <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        u.ativo ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-brand-navy/40 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {u.id !== me?.id && (
                          <>
                            <button
                              onClick={() => setModal({ open: true, user: u })}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-navy/5 text-brand-navy/40 hover:text-brand-navy transition"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => toggleAtivo(u)}
                              disabled={actionId === u.id}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-brand-navy/40 hover:text-amber-600 transition"
                              title={u.ativo ? 'Desativar' : 'Reativar'}
                            >
                              {actionId === u.id
                                ? <Loader2 size={14} className="animate-spin" />
                                : u.ativo ? <UserX size={14} /> : <UserCheck size={14} />
                              }
                            </button>
                            <button
                              onClick={() => deleteUser(u)}
                              disabled={actionId === u.id}
                              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-brand-navy/40 hover:text-red-500 transition"
                              title="Excluir"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {u.id === me?.id && (
                          <span className="text-[10px] text-brand-navy/30 font-medium px-2">Você</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

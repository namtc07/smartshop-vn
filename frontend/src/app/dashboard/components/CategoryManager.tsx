'use client';

import { useState } from 'react';
import { Category } from './types';
import { toast } from './Toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface CategoryManagerProps {
  userId: string;
  categories: Category[];
  onChange: (categories: Category[]) => void;
}

export default function CategoryManager({ userId, categories, onChange }: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: newName.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      onChange([...categories, json.data]);
      setNewName('');
      toast.success('Đã thêm danh mục.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Thêm thất bại.');
    } finally {
      setAdding(false);
    }
  };

  const handleRename = async (id: string) => {
    if (!editName.trim()) return;
    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: editName.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      onChange(categories.map(c => c.id === id ? json.data : c));
      setEditingId(null);
      toast.success('Đã đổi tên danh mục.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Cập nhật thất bại.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xoá danh mục "${name}"? Sản phẩm trong danh mục sẽ không bị xoá.`)) return;
    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      onChange(categories.filter(c => c.id !== id));
      toast.success('Đã xoá danh mục.');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Xoá thất bại.');
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Danh mục sản phẩm</h3>
        <span className="text-[10px] text-zinc-600">{categories.length} danh mục</span>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-3">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="Tên danh mục mới..."
          maxLength={30}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/60 transition-all"
        />
        <button
          type="submit"
          disabled={adding || !newName.trim()}
          className="px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-semibold transition-all cursor-pointer"
        >
          Thêm
        </button>
      </form>

      {/* List */}
      {categories.length === 0 ? (
        <p className="text-xs text-zinc-600 text-center py-2">Chưa có danh mục nào</p>
      ) : (
        <div className="flex flex-col gap-1">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-zinc-800/50 group">
              {editingId === cat.id ? (
                <>
                  <input
                    autoFocus
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleRename(cat.id); if (e.key === 'Escape') setEditingId(null); }}
                    className="flex-1 bg-zinc-700 border border-zinc-600 rounded px-2 py-0.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/60"
                  />
                  <button onClick={() => handleRename(cat.id)} className="text-emerald-400 hover:text-emerald-300 text-xs font-medium cursor-pointer px-1">Lưu</button>
                  <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer px-1">Huỷ</button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm text-zinc-300 truncate">{cat.name}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                      className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                      title="Đổi tên"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                      title="Xoá"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

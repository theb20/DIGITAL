import React, { useEffect, useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import api from '../configurations/api/api_axios.js';
import privacyService from '../configurations/services/privacy.js';

// Helpers
const iconOptions = [
  { key: 'filetext', label: 'FileText', Icon: Icons.FileText },
  { key: 'lock', label: 'Lock', Icon: Icons.Lock },
  { key: 'shield', label: 'Shield', Icon: Icons.Shield },
  { key: 'database', label: 'Database', Icon: Icons.Database },
  { key: 'eye', label: 'Eye', Icon: Icons.Eye },
  { key: 'globe', label: 'Globe', Icon: Icons.Globe },
  { key: 'cookie', label: 'Cookie', Icon: Icons.Cookie },
  { key: 'calendar', label: 'Calendar', Icon: Icons.Calendar },
  { key: 'mail', label: 'Mail', Icon: Icons.Mail },
];

function SectionListItem({ section, active, onSelect, onEdit }) {
  const Icon = iconOptions.find(o => o.key === String(section?.section_icon || '').toLowerCase().replace(/\s+/g, '').replace(/-/g, '_'))?.Icon || Icons.FileText;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(section.section_number)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${active ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`}
    >
      <span className={`p-2 rounded ${active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
        <Icon className="w-4 h-4" />
      </span>
      <span className="flex-1">
        <div className="text-sm font-semibold">{section.section_number}. {section.section_title}</div>
        {section.section_badge && (
          <div className="text-xs text-gray-500">{section.section_badge}</div>
        )}
      </span>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onEdit(section); }}
        className={`px-2 py-1 rounded border text-xs ${active ? 'border-white/50 text-white' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
      >Modifier</button>
    </div>
  );
}

export default function PrivacyTerms() {
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionsError, setSectionsError] = useState(null);

  const [selectedSection, setSelectedSection] = useState(null); // section_number
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [entriesError, setEntriesError] = useState(null);

  const [sectionFormOpen, setSectionFormOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({ section_number: '', section_title: '', section_badge: '', section_icon: 'filetext' });
  const isEditingSection = useMemo(() => Boolean(sectionForm && sectionForm.__edit === true), [sectionForm]);

  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [entryForm, setEntryForm] = useState({ id: null, content_title: '', content_text: '' });
  const isEditingEntry = useMemo(() => Boolean(entryForm && entryForm.id), [entryForm]);

  // Load sections
  async function loadSections() {
    setLoadingSections(true);
    setSectionsError(null);
    try {
      const data = await privacyService.getSections();
      const arr = Array.isArray(data) ? data : (data?.sections || []);
      // Deduplicate by section_number
      const seen = new Set();
      const unique = [];
      for (const s of arr) {
        const key = s?.section_number ?? s?.id ?? s?.section_title;
        if (!seen.has(key)) { seen.add(key); unique.push(s); }
      }
      unique.sort((a,b) => Number(a.section_number) - Number(b.section_number));
      setSections(unique);
      if (!selectedSection && unique.length > 0) {
        setSelectedSection(unique[0].section_number);
      }
    } catch (e) {
      setSectionsError(e?.message || 'Erreur chargement des sections');
    } finally {
      setLoadingSections(false);
    }
  }

  async function loadEntries(sectionNumber) {
    if (!sectionNumber) return;
    setLoadingEntries(true);
    setEntriesError(null);
    try {
      const data = await privacyService.getPrivacySection(sectionNumber);
      const arr = Array.isArray(data) ? data : (data?.entries || []);
      setEntries(arr);
    } catch (e) {
      setEntriesError(e?.message || 'Erreur chargement des contenus');
    } finally {
      setLoadingEntries(false);
    }
  }

  useEffect(() => { loadSections(); }, []);
  useEffect(() => { if (selectedSection) loadEntries(selectedSection); }, [selectedSection]);

  // Section CRUD
  function openNewSection() {
    setSectionForm({ section_number: '', section_title: '', section_badge: '', section_icon: 'filetext' });
    setSectionFormOpen(true);
  }
  function openEditSection(s) {
    setSectionForm({ ...s, __edit: true });
    setSectionFormOpen(true);
  }
  async function saveSection() {
    const payload = {
      section_number: Number(sectionForm.section_number),
      section_title: String(sectionForm.section_title || ''),
      section_badge: String(sectionForm.section_badge || ''),
      section_icon: String(sectionForm.section_icon || 'filetext'),
      content_title: null,
      content_text: null,
      display_order: null,
    };
    try {
      if (isEditingSection) {
        // Mettre à jour les métadonnées de section sur toutes les entrées de cette section
        const currentEntries = Array.isArray(entries) ? entries : [];
        if (currentEntries.length > 0) {
          for (const item of currentEntries) {
            await api.put(`/privacy/${item.id}`,
              {
                section_number: payload.section_number,
                section_title: payload.section_title,
                section_badge: payload.section_badge,
                section_icon: payload.section_icon,
                content_title: item.content_title ?? null,
                content_text: item.content_text ?? null,
              }
            );
          }
        } else {
          // Pas d'entrées: créer une ligne d'en-tête de section
          await api.post('/privacy', payload);
        }
        // Si le numéro de section change, met à jour la sélection
        setSelectedSection(payload.section_number);
      } else {
        // Créer une nouvelle section en tant qu'en-tête (sans contenu)
        await api.post('/privacy', payload);
      }
      setSectionFormOpen(false);
      await loadSections();
      if (payload.section_number) {
        await loadEntries(payload.section_number);
      }
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || 'Erreur enregistrement section');
    }
  }
  async function deleteSection(sectionNumber) {
    if (!confirm('Supprimer cette section ?')) return;
    try {
      // Supprimer toutes les entrées de la section via les IDs
      const data = await privacyService.getPrivacySection(sectionNumber);
      const arr = Array.isArray(data) ? data : (data?.entries || []);
      for (const item of arr) {
        if (item?.id) {
          await api.delete(`/privacy/${item.id}`);
        }
      }
      if (selectedSection === sectionNumber) setSelectedSection(null);
      await loadSections();
      setEntries([]);
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || 'Erreur suppression section');
    }
  }

  // Entry CRUD
  function openNewEntry() {
    setEntryForm({ id: null, content_title: '', content_text: '' });
    setEntryFormOpen(true);
  }
  function openEditEntry(item) {
    setEntryForm({ id: item.id, content_title: item.content_title || '', content_text: item.content_text || '' });
    setEntryFormOpen(true);
  }
  async function saveEntry() {
    const sectionMeta = Array.isArray(sections) ? (sections.find(s => s.section_number === selectedSection) || {}) : {};
    const orders = (Array.isArray(entries) ? entries : []).map(e => Number(e.display_order)).filter(n => Number.isFinite(n));
    const nextOrder = orders.length ? Math.max(...orders) + 1 : 1;
    const payload = {
      content_title: String(entryForm.content_title || ''),
      content_text: String(entryForm.content_text || ''),
      section_number: Number.isFinite(Number(selectedSection)) ? Number(selectedSection) : null,
      // Métadonnées de la section sélectionnée
      section_title: sectionMeta.section_title ? String(sectionMeta.section_title) : '',
      section_badge: sectionMeta.section_badge ? String(sectionMeta.section_badge) : '',
      section_icon: sectionMeta.section_icon ? String(sectionMeta.section_icon) : 'filetext',
      display_order: nextOrder,
    };
    try {
      if (isEditingEntry) {
        await api.put(`/privacy/${entryForm.id}`, payload);
      } else {
        await api.post('/privacy', payload);
      }
      setEntryFormOpen(false);
      await loadEntries(selectedSection);
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || 'Erreur enregistrement contenu');
    }
  }
  async function deleteEntry(id) {
    if (!confirm('Supprimer ce contenu ?')) return;
    try {
      await api.delete(`/privacy/${id}`);
      await loadEntries(selectedSection);
    } catch (e) {
      alert(e?.response?.data?.error || e?.message || 'Erreur suppression contenu');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Confidentialité — CRUD</h2>
          <span className="text-xs text-gray-500">Sections & contenus</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openNewSection} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Icons.Plus className="w-4 h-4" /> Nouvelle section
          </button>
          {selectedSection && (
            <button onClick={openNewEntry} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <Icons.Plus className="w-4 h-4" /> Nouveau contenu
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sections list */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="text-sm text-gray-600">{loadingSections ? 'Chargement…' : `${sections.length} section(s)`}</div>
          </div>
          <div className="p-3 space-y-2">
            {sectionsError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded">{sectionsError}</div>
            )}
            {sections.map(s => (
              <SectionListItem
                key={s.section_number}
                section={s}
                active={selectedSection === s.section_number}
                onSelect={setSelectedSection}
                onEdit={openEditSection}
              />
            ))}
            {sections.length === 0 && !loadingSections && (
              <div className="text-sm text-gray-500">Aucune section</div>
            )}
          </div>
        </div>

        {/* Section editor */}
        <div className="bg-white rounded-lg shadow lg:col-span-2">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="text-sm text-gray-600">{selectedSection ? `Section ${selectedSection}` : 'Sélectionnez une section'}</div>
            {selectedSection && (
              <button onClick={() => deleteSection(selectedSection)} className="px-3 py-1 text-red-700 border border-red-300 rounded hover:bg-red-50">Supprimer section</button>
            )}
          </div>

          {/* Section form modal */}
          {sectionFormOpen && (
            <div className="p-4 border-b bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Numéro</label>
                  <input type="number" value={sectionForm.section_number} onChange={(e)=>setSectionForm(f=>({...f, section_number:e.target.value}))} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Titre</label>
                  <input type="text" value={sectionForm.section_title} onChange={(e)=>setSectionForm(f=>({...f, section_title:e.target.value}))} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Badge (optionnel)</label>
                  <input type="text" value={sectionForm.section_badge} onChange={(e)=>setSectionForm(f=>({...f, section_badge:e.target.value}))} className="w-full px-3 py-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icône</label>
                  <select value={sectionForm.section_icon} onChange={(e)=>setSectionForm(f=>({...f, section_icon:e.target.value}))} className="w-full px-3 py-2 border rounded">
                    {iconOptions.map(o => (<option key={o.key} value={o.key}>{o.label}</option>))}
                  </select>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={saveSection} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{isEditingSection ? 'Mettre à jour' : 'Créer'}</button>
                <button onClick={()=>setSectionFormOpen(false)} className="px-3 py-2 border rounded">Annuler</button>
              </div>
            </div>
          )}

          {/* Entries list */}
          <div className="p-4">
            {selectedSection ? (
              <>
                {entriesError && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-2 rounded mb-3">{entriesError}</div>
                )}
                {loadingEntries ? (
                  <div className="text-sm text-gray-500">Chargement des contenus…</div>
                ) : (
                  <div className="space-y-3">
                    {entries.map(item => (
                      <div key={item.id} className="border rounded p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold">{item.content_title || 'Sans titre'}</div>
                            <div className="text-sm text-gray-700 whitespace-pre-line">{item.content_text || ''}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditEntry(item)} className="px-2 py-1 text-xs border rounded">Modifier</button>
                            <button onClick={() => deleteEntry(item.id)} className="px-2 py-1 text-xs text-red-700 border border-red-300 rounded">Supprimer</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {entries.length === 0 && (
                      <div className="text-sm text-gray-500">Aucun contenu dans cette section</div>
                    )}
                  </div>
                )}

                {/* Entry form modal */}
                {entryFormOpen && (
                  <div className="mt-4 border rounded p-4 bg-gray-50">
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Titre</label>
                        <input type="text" value={entryForm.content_title} onChange={(e)=>setEntryForm(f=>({...f, content_title:e.target.value}))} className="w-full px-3 py-2 border rounded" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Texte</label>
                        <textarea rows={6} value={entryForm.content_text} onChange={(e)=>setEntryForm(f=>({...f, content_text:e.target.value}))} className="w-full px-3 py-2 border rounded" />
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={saveEntry} className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700">{isEditingEntry ? 'Mettre à jour' : 'Créer'}</button>
                      <button onClick={()=>setEntryFormOpen(false)} className="px-3 py-2 border rounded">Annuler</button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">Choisissez une section pour gérer ses contenus</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
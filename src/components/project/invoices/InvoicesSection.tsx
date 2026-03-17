import { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from '../../../data/initialData';
import type { InvoiceStatus } from '../../../types';

interface Props {
  projectId: string;
}

export default function InvoicesSection({ projectId }: Props) {
  const allInvoices = useStore((s) => s.invoices);
  const invoices = useMemo(() => allInvoices.filter((i) => i.project_id === projectId), [allInvoices, projectId]);
  const addInvoice = useStore((s) => s.addInvoice);
  const updateInvoice = useStore((s) => s.updateInvoice);
  const deleteInvoice = useStore((s) => s.deleteInvoice);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newConsultant, setNewConsultant] = useState('');
  const [newDate, setNewDate] = useState('');
  const [editingCell, setEditingCell] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAdd = () => {
    if (!newConsultant.trim()) return;
    addInvoice({
      project_id: projectId,
      consultant_name: newConsultant.trim(),
      submission_date: newDate || null,
      status: 'pending',
      notes: '',
    });
    setNewConsultant('');
    setNewDate('');
    setShowAddForm(false);
  };

  const startEdit = (id: string, field: string, currentValue: string) => {
    setEditingCell({ id, field });
    setEditValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingCell) return;
    updateInvoice(editingCell.id, { [editingCell.field]: editValue });
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditingCell(null);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">
          {invoices.length} חשבונות |{' '}
          {invoices.filter((i) => i.status !== 'paid').length} פתוחים
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          <span>חשבון חדש</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[25%]">שם יועץ</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[20%]">תאריך הגשת חשבונית</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[15%]">סטטוס</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 w-[35%]">הערות</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 w-[5%]"></th>
            </tr>
          </thead>
          <tbody>
            {showAddForm && (
              <tr className="border-b border-gray-100 bg-blue-50/50">
                <td className="px-4 py-2">
                  <input
                    autoFocus
                    value={newConsultant}
                    onChange={(e) => setNewConsultant(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder="שם היועץ..."
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="px-4 py-2">
                  <span className="text-xs text-gray-400">ממתין</span>
                </td>
                <td className="px-4 py-2" colSpan={2}>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAdd}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      הוסף
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300"
                    >
                      ביטול
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {/* Consultant Name */}
                <td className="px-4 py-3">
                  {editingCell?.id === invoice.id && editingCell.field === 'consultant_name' ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span
                      onClick={() => startEdit(invoice.id, 'consultant_name', invoice.consultant_name)}
                      className="text-sm text-gray-800 cursor-pointer hover:text-blue-600"
                    >
                      {invoice.consultant_name}
                    </span>
                  )}
                </td>

                {/* Submission Date */}
                <td className="px-4 py-3">
                  <input
                    type="date"
                    value={invoice.submission_date || ''}
                    onChange={(e) => updateInvoice(invoice.id, { submission_date: e.target.value || null })}
                    className="text-sm bg-transparent border-0 cursor-pointer text-gray-600"
                  />
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <div className="relative">
                    <select
                      value={invoice.status}
                      onChange={(e) => updateInvoice(invoice.id, { status: e.target.value as InvoiceStatus })}
                      className={`appearance-none text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer border-0 ${INVOICE_STATUS_COLORS[invoice.status]}`}
                    >
                      {Object.entries(INVOICE_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                  </div>
                </td>

                {/* Notes */}
                <td className="px-4 py-3">
                  {editingCell?.id === invoice.id && editingCell.field === 'notes' ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-white border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span
                      onClick={() => startEdit(invoice.id, 'notes', invoice.notes)}
                      className="text-sm text-gray-500 cursor-pointer hover:text-blue-600"
                    >
                      {invoice.notes || <span className="text-gray-300">הוסף הערה...</span>}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteInvoice(invoice.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}

            {invoices.length === 0 && !showAddForm && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                  אין חשבונות עדיין. הוסף חשבון חדש!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

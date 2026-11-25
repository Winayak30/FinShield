import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Clock,
  HeartHandshake,
} from 'lucide-react';
import { useFinShield } from '../../context/FinShieldContext';

export const ManageNominees: React.FC = () => {
  const { currentUser, registerNominee, removeNominee } = useFinShield();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Family / Contact');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const nominees = currentUser.registered_nominees || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    registerNominee({ name, relationship, phone, email });
    setName('');
    setPhone('');
    setEmail('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Trusted Contacts</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            If a suspicious or coerced transfer is detected on your phone, FinShield sends a secure verification alert to your trusted contact before money leaves your account.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      {/* Nominees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nominees.map((nominee, idx) => (
          <div
            key={nominee.id || idx}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm">
                  {nominee.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">{nominee.name}</h3>
                    {nominee.is_primary && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{nominee.relationship}</span>
                </div>
              </div>

              <button
                onClick={() => removeNominee(nominee.id)}
                className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                title="Remove contact"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-950 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-200">{nominee.phone}</span>
                <span className="text-emerald-400 text-[10px] ml-auto flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified Channel
                </span>
              </div>
              {nominee.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-300">{nominee.email}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Security authorization active</span>
              <span>15-min decision window</span>
            </div>
          </div>
        ))}

        {nominees.length === 0 && (
          <div className="col-span-2 py-12 text-center bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No Trusted Contacts Added</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Add a trusted family member or contact who can protect your transfers in an emergency.
            </p>
          </div>
        )}
      </div>

      {/* Add Nominee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Add Trusted Contact</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2.5 py-1 rounded bg-slate-800"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul Varma"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  placeholder="e.g. Brother / Spouse / Trusted Friend"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Mobile Phone Number</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98201 XXXXX"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                >
                  Save Trusted Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

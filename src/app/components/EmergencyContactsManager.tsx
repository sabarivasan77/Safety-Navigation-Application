import { useState } from 'react';
import { sosService, EmergencyContact } from '../services/sosService';
import { Button } from './ui/button';
import { UserPlus, Trash2, Phone, Users, Edit2, Check, X } from 'lucide-react';

interface EmergencyContactsManagerProps {
  onClose?: () => void;
}

export function EmergencyContactsManager({ onClose }: EmergencyContactsManagerProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>(sosService.getContacts());
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    relationship: '',
  });

  const refreshContacts = () => {
    setContacts(sosService.getContacts());
  };

  const handleAdd = () => {
    if (!formData.name || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }

    sosService.addContact(formData);
    setFormData({ name: '', phone: '', relationship: '' });
    setIsAdding(false);
    refreshContacts();
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
    });
  };

  const handleUpdate = (id: string) => {
    if (!formData.name || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }

    sosService.updateContact(id, formData);
    setEditingId(null);
    setFormData({ name: '', phone: '', relationship: '' });
    refreshContacts();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this contact?')) {
      sosService.removeContact(id);
      refreshContacts();
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', relationship: '' });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-gray-900">Emergency Contacts</h2>
        </div>
        {onClose && (
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-sm text-blue-900">
          These contacts will be notified automatically when SOS is activated. 
          They will receive your live location and emergency alert.
        </p>
      </div>

      {/* Contact List */}
      <div className="space-y-3 mb-4">
        {contacts.length === 0 && !isAdding && (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No emergency contacts added yet</p>
            <Button onClick={() => setIsAdding(true)} className="bg-red-600 hover:bg-red-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Your First Contact
            </Button>
          </div>
        )}

        {contacts.map((contact) => (
          <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
            {editingId === contact.id ? (
              // Edit Mode
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone (e.g., +91-9876543210)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="Relationship (e.g., Family, Friend)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleUpdate(contact.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" className="flex-1">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg">{contact.name}</div>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{contact.phone}</span>
                  </div>
                  {contact.relationship && (
                    <div className="text-xs text-gray-500 mt-1">
                      {contact.relationship}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(contact)}
                    variant="outline"
                    size="sm"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(contact.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Contact Form */}
      {isAdding && (
        <div className="border-2 border-red-200 bg-red-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Add New Contact</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone Number (e.g., +91-9876543210)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <input
              type="text"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="Relationship (e.g., Family, Friend, Colleague)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-2">
              <Button onClick={handleAdd} className="flex-1 bg-red-600 hover:bg-red-700">
                <Check className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      {!isAdding && contacts.length > 0 && (
        <Button
          onClick={() => setIsAdding(true)}
          className="w-full bg-red-600 hover:bg-red-700 py-3"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Another Contact
        </Button>
      )}

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Recommended: Add at least 2-3 emergency contacts
      </div>
    </div>
  );
}

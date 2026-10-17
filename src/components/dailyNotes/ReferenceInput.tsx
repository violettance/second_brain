import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Globe, Video, User, FileText, Plus, X, ChevronDown, Quote } from 'lucide-react';
import { Reference } from '../../types/database';

interface ReferenceInputProps {
  references: Reference[];
  onReferencesChange: (references: Reference[]) => void;
}

const REFERENCE_TYPES = [
  { type: 'book' as const, label: 'Book', icon: BookOpen, placeholder: 'Author, Title, Year, Publisher (recommended order)' },
  { type: 'article' as const, label: 'Article', icon: FileText, placeholder: 'Author, "Title", Journal, Year (recommended order)' },
  { type: 'website' as const, label: 'Website', icon: Globe, placeholder: 'Author/Site, "Title", URL, Date (recommended order)' },
  { type: 'video' as const, label: 'Video', icon: Video, placeholder: 'Creator, "Title", Platform, Date (recommended order)' },
  { type: 'personal' as const, label: 'Personal Communication', icon: User, placeholder: 'Name, Topic, Date (recommended order)' },
  { type: 'other' as const, label: 'Other', icon: Quote, placeholder: 'Free format reference' }
];

export const ReferenceInput: React.FC<ReferenceInputProps> = ({
  references,
  onReferencesChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<Reference['type']>('book');
  const [input, setInput] = useState('');
  const [editingReference, setEditingReference] = useState<Reference | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // No formatting - just return what user typed
  const formatReference = (type: Reference['type'], rawInput: string): string => {
    return rawInput;
  };

  const addReference = () => {
    if (!input.trim()) return;

    if (editingReference) {
      // Update existing reference
      const updatedReference: Reference = {
        ...editingReference,
        type: selectedType,
        raw_input: input.trim(),
        formatted: formatReference(selectedType, input.trim()),
      };
      
      onReferencesChange(references.map(ref => 
        ref.id === editingReference.id ? updatedReference : ref
      ));
      setEditingReference(null);
    } else {
      // Add new reference
      const newReference: Reference = {
        id: Date.now().toString(),
        type: selectedType,
        raw_input: input.trim(),
        formatted: formatReference(selectedType, input.trim()),
        created_at: new Date().toISOString()
      };
      
      onReferencesChange([...references, newReference]);
    }
    
    setInput('');
    setEditingReference(null);
    setIsOpen(false);
  };

  const removeReference = (id: string) => {
    onReferencesChange(references.filter(ref => ref.id !== id));
  };

  const editReference = (ref: Reference) => {
    setEditingReference(ref);
    setSelectedType(ref.type);
    setInput(ref.raw_input);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      addReference();
    }
  };

  const selectedTypeData = REFERENCE_TYPES.find(t => t.type === selectedType);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Quote className="h-4 w-4 text-muted" />
        <label className="text-sm font-medium text-muted">References</label>
      </div>

      {/* Input Area */}
      <div className="relative" ref={dropdownRef}>
        <div 
          className="w-full px-3 py-2 bg-surface-muted border border-ink rounded-md text-ink placeholder-slate-400 focus-within:ring-1 text-sm cursor-pointer hover:bg-surface-muted transition-colors"
          style={{ '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <div className="space-y-3" onClick={e => e.stopPropagation()}>
              {/* Type Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted">Type:</span>
                <div className="flex flex-wrap gap-1">
                  {REFERENCE_TYPES.map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                        selectedType === type
                          ? 'bg-purple-500/30 text-brand-purple-deep border border-purple-500/50'
                          : 'bg-surface-muted text-muted hover:bg-slate-500'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Field */}
              <div className="space-y-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={selectedTypeData?.placeholder || 'Enter reference details'}
                  className="w-full px-3 py-2 bg-surface-muted border border-ink rounded text-ink placeholder-slate-400 focus:outline-none focus:ring-1 text-sm"
                  style={{ '--tw-ring-color': 'var(--color-brand-primary)' } as React.CSSProperties}
                  autoFocus
                />
                
                {/* Add Button */}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setEditingReference(null);
                      setInput('');
                    }}
                    className="px-3 py-1 text-xs bg-surface-muted hover:bg-slate-500 text-muted rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addReference}
                    disabled={!input.trim()}
                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 text-ink rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{editingReference ? 'Update' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-muted">
                {references.length > 0 ? `${references.length} reference(s) added` : 'Click to add references'}
              </span>
              <ChevronDown className="h-4 w-4 text-muted" />
            </div>
          )}
        </div>
      </div>

      {/* References List */}
      {references.length > 0 && (
        <div className="space-y-2">
          {references.map((ref, index) => (
            <div key={ref.id} className="bg-surface-muted border border-ink rounded p-3">
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1 cursor-pointer hover:bg-surface-muted rounded p-1 -m-1 transition-colors"
                  onClick={() => editReference(ref)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {(() => {
                      const typeData = REFERENCE_TYPES.find(t => t.type === ref.type);
                      const Icon = typeData?.icon || Quote;
                      return <Icon className="h-3 w-3 text-muted" />;
                    })()}
                    <span className="text-xs text-muted uppercase">{ref.type}</span>
                  </div>
                  <div className="text-sm text-ink">{ref.formatted}</div>
                </div>
                <button
                  onClick={() => removeReference(ref.id)}
                  className="p-1 hover:bg-surface-muted rounded transition-colors"
                >
                  <X className="h-3 w-3 text-muted hover:text-brand-primary-deep" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

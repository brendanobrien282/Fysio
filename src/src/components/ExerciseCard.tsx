// import React from 'react';

interface ExerciseCardProps {
  id: string;
  emoji: string;
  title: string;
  description: string;
  placeholder: string;
  isCompleted: boolean;
  onComplete: (id: string) => void;
  isNoteExpanded: boolean;
  onToggleNote: (id: string) => void;
  currentNote: { text: string; date: string };
  onUpdateNote: (id: string, field: string, value: string) => void;
  onSaveNote: (id: string) => void;
  previousNotes: any[];
}

function ExerciseCard({
  id,
  emoji,
  title,
  description,
  placeholder,
  isCompleted,
  onComplete,
  isNoteExpanded,
  onToggleNote,
  currentNote,
  onUpdateNote,
  onSaveNote,
  previousNotes
}: ExerciseCardProps) {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: isCompleted ? '2px solid #48bb78' : '2px solid transparent',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{emoji}</span>
            <span style={{ fontWeight: '600', color: '#2d3748', fontSize: '1.1rem' }}>
              {title}
            </span>
          </div>
          <p style={{ color: '#718096', margin: 0, fontSize: '0.95rem' }}>
            {description}
          </p>
        </div>
        <button 
          onClick={() => onComplete(id)}
          style={{
            padding: '10px 20px',
            backgroundColor: isCompleted ? '#48bb78' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '0.9rem'
          }}
        >
          {isCompleted ? '✓ Done' : 'Complete'}
        </button>
      </div>
      
      <div style={{ marginTop: '12px' }}>
        {!isNoteExpanded ? (
          <button
            onClick={() => onToggleNote(id)}
            style={{
              backgroundColor: '#f7fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.8rem',
              color: '#4a5568',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            📝 Add Note {previousNotes.length > 0 && `(${previousNotes.length})`}
          </button>
        ) : (
          <div style={{
            backgroundColor: '#f7fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <input
                type="date"
                value={currentNote.date}
                onChange={(e) => onUpdateNote(id, 'date', e.target.value)}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '0.8rem'
                }}
              />
            </div>
            <textarea
              value={currentNote.text}
              onChange={(e) => onUpdateNote(id, 'text', e.target.value)}
              placeholder={placeholder}
              style={{
                width: '100%',
                minHeight: '50px',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '0.85rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                marginBottom: '8px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onSaveNote(id)}
                style={{
                  backgroundColor: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>
              <button
                onClick={() => onToggleNote(id)}
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#4a5568',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
            
            {previousNotes.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '6px', fontWeight: '600' }}>
                  Previous Notes:
                </div>
                {previousNotes.slice(-3).reverse().map((note: any, index: number) => (
                  <div key={index} style={{
                    fontSize: '0.75rem',
                    color: '#4b5563',
                    marginBottom: '4px',
                    padding: '4px 8px',
                    backgroundColor: 'white',
                    borderRadius: '4px'
                  }}>
                    <strong>{note.date}:</strong> {note.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ExerciseCard;



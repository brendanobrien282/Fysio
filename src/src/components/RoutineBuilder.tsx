import React, { useState } from 'react';

// Comprehensive PT Exercise Database organized by categories
const PT_EXERCISES = {
  "Upper Body Strengthening": [
    "Shoulder Blade Squeezes", "Wall Push-ups", "Arm Circles", "Shoulder Shrugs", 
    "Bicep Curls", "Tricep Extensions", "Lateral Raises", "Front Raises",
    "Resistance Band Pull-Aparts", "Doorway Chest Stretch", "Overhead Press",
    "Bent-Over Rows", "Wrist Flexor Stretch", "Wrist Extensor Stretch"
  ],
  "Lower Body Strengthening": [
    "Squats", "Lunges", "Calf Raises", "Glute Bridges", "Step-Ups", 
    "Single-Leg Stands", "Heel-to-Toe Walking", "Side-Lying Leg Lifts",
    "Clamshells", "Wall Sits", "Leg Press", "Hamstring Curls", "Quad Sets",
    "Straight Leg Raises", "Hip Abductions", "Hip Adductions"
  ],
  "Core Strengthening": [
    "Planks", "Side Planks", "Dead Bug", "Bird Dog", "Modified Crunches",
    "Pelvic Tilts", "Bridges", "Cat-Cow Stretch", "Knee-to-Chest",
    "Russian Twists", "Mountain Climbers", "Leg Raises", "Flutter Kicks"
  ],
  "Neck & Cervical": [
    "Neck Rotations", "Chin Tucks", "Neck Side Bends", "Neck Forward/Backward",
    "Upper Trap Stretch", "Levator Scapulae Stretch", "SCM Stretch",
    "Neck Isometrics", "Shoulder Rolls"
  ],
  "Back & Spine": [
    "Cat-Cow Stretch", "Knee-to-Chest", "Lower Trunk Rotation", "Pelvic Tilts",
    "McKenzie Extensions", "Williams Flexion", "Piriformis Stretch",
    "Hip Flexor Stretch", "Thoracic Spine Mobility", "Lumbar Rotation"
  ],
  "Balance & Proprioception": [
    "Single-Leg Stands", "Heel-to-Toe Walking", "Balance Beam Walk",
    "Tandem Standing", "Eyes Closed Balance", "Foam Pad Balance",
    "Bosu Ball Exercises", "Wobble Board", "Ankle Pumps"
  ],
  "Flexibility & Stretching": [
    "Hamstring Stretch", "Quadriceps Stretch", "Calf Stretch", "IT Band Stretch",
    "Hip Flexor Stretch", "Piriformis Stretch", "Chest Doorway Stretch",
    "Shoulder Cross-Body Stretch", "Tricep Stretch", "Neck Stretches",
    "Spinal Twist", "Figure-4 Stretch", "Child's Pose"
  ],
  "Shoulder Rehabilitation": [
    "Pendulum Swings", "Wall Slides", "External Rotation", "Internal Rotation",
    "Scapular Stabilization", "Shoulder Flexion", "Shoulder Abduction",
    "Cross-Body Stretch", "Sleeper Stretch", "Codman Exercises"
  ],
  "Knee Rehabilitation": [
    "Quad Sets", "Straight Leg Raises", "Heel Slides", "Mini Squats",
    "Step-Ups", "Stationary Bike", "Hamstring Curls", "Calf Raises",
    "Terminal Knee Extension", "Patellar Mobilization"
  ],
  "Ankle & Foot": [
    "Ankle Pumps", "Ankle Circles", "Calf Raises", "Heel Walks", "Toe Walks",
    "Alphabet Exercises", "Towel Scrunches", "Marble Pick-ups",
    "Achilles Stretch", "Plantar Fascia Stretch", "Inversion/Eversion"
  ],
  "Hand & Wrist": [
    "Wrist Flexor Stretch", "Wrist Extensor Stretch", "Tendon Glides",
    "Finger Extensions", "Grip Strengthening", "Putty Exercises",
    "Finger Spreads", "Thumb Opposition", "Prayer Stretch"
  ],
  "Cardiovascular": [
    "Walking", "Stationary Bike", "Elliptical", "Swimming", "Water Walking",
    "Arm Bike", "Seated Marching", "Step-Ups", "Recumbent Bike"
  ]
};

interface Exercise {
  name: string;
  category: string;
  type: 'reps' | 'time'; // reps/sets or time/sets
  sets: number;
  reps?: number; // for strength exercises
  duration?: number; // for stretches/cardio (in seconds)
  notes?: string;
}

interface RoutinePreferences {
  name: string;
  preferredTime: 'morning' | 'afternoon' | 'evening';
  notificationsEnabled: boolean;
  notificationType: 'email' | 'mobile' | 'both';
  reminderMessage: string;
}

interface RoutineBuilderProps {
  onSaveRoutine: (routine: RoutinePreferences, exercises: Exercise[]) => void;
  onCancel: () => void;
}

export default function RoutineBuilder({ onSaveRoutine, onCancel }: RoutineBuilderProps) {
  const [routineName, setRoutineName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExercise, setSelectedExercise] = useState('');
  

  const addExercise = () => {
    if (!selectedExercise || !selectedCategory) return;

    // Determine if this is typically a time-based or rep-based exercise
    const isTimeBasedCategory = ['Flexibility & Stretching', 'Cardiovascular', 'Balance & Proprioception'].includes(selectedCategory);
    
    const newExercise: Exercise = {
      name: selectedExercise,
      category: selectedCategory,
      type: isTimeBasedCategory ? 'time' : 'reps',
      sets: 1,
      reps: isTimeBasedCategory ? undefined : 10,
      duration: isTimeBasedCategory ? 30 : undefined,
      notes: ''
    };

    setSelectedExercises([...selectedExercises, newExercise]);
    setSelectedExercise('');
  };

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    console.log('Save button clicked!');
    console.log('Routine name:', `"${routineName}"`);
    console.log('Selected exercises:', selectedExercises);
    console.log('Routine name trimmed:', `"${routineName.trim()}"`);
    console.log('Exercises length:', selectedExercises.length);
    
    if (!routineName.trim() || selectedExercises.length === 0) {
      alert('Please enter a routine name and add at least one exercise.');
      return;
    }
    
    const routinePreferences: RoutinePreferences = {
      name: routineName,
      preferredTime: 'morning', // Default value
      notificationsEnabled: false,
      notificationType: 'email',
      reminderMessage: ''
    };
    
    onSaveRoutine(routinePreferences, selectedExercises);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Exercise Silhouettes Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.25,
        pointerEvents: 'none'
      }}>
        {/* Weightlifter - top left */}
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '12%',
          fontSize: '6rem',
          color: '#4c1d95',
          transform: 'rotate(-10deg)',
          fontFamily: 'Arial, sans-serif'
        }}>⛹</div>
        
        {/* Runner - middle left */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '5%',
          fontSize: '5.5rem',
          color: '#4c1d95',
          transform: 'rotate(-8deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🏃</div>
        
        {/* Cyclist - bottom right */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          fontSize: '6rem',
          color: '#4c1d95',
          transform: 'rotate(12deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🚴</div>
        
        {/* Swimmer - top right */}
        <div style={{
          position: 'absolute',
          top: '12%',
          right: '15%',
          fontSize: '5rem',
          color: '#4c1d95',
          transform: 'rotate(15deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🏊</div>
      </div>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{
            color: '#1a202c',
            fontSize: '2.5rem',
            fontWeight: '800',
            margin: '0 0 10px 0',
            fontFamily: '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '-0.01em',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🏗️ Create Your Routine
          </h1>
          <p style={{ color: '#718096', margin: 0 }}>
            Build a personalized exercise routine with professional PT exercises
          </p>
        </div>

        {/* Routine Name */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            Routine Name
          </label>
          <input
            type="text"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            placeholder="e.g., Morning Mobility, Post-Surgery Recovery, Core Strength"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>


        {/* Add Exercise Section */}
        <div style={{
          backgroundColor: '#f8fafc',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>➕ Add Exercise</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
            {/* Category Dropdown */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedExercise('');
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select Category</option>
                {Object.keys(PT_EXERCISES).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Exercise Dropdown */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
                Exercise
              </label>
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                disabled={!selectedCategory}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: selectedCategory ? 'white' : '#f3f4f6'
                }}
              >
                <option value="">Select Exercise</option>
                {selectedCategory && PT_EXERCISES[selectedCategory as keyof typeof PT_EXERCISES].map(exercise => (
                  <option key={exercise} value={exercise}>{exercise}</option>
                ))}
              </select>
            </div>

            {/* Add Button */}
            <button
              onClick={addExercise}
              disabled={!selectedExercise}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedExercise ? '#667eea' : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: selectedExercise ? 'pointer' : 'not-allowed',
                fontWeight: '500'
              }}
            >
              Add
            </button>
          </div>
        </div>

        {/* Selected Exercises List */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>
            📋 Your Routine ({selectedExercises.length} exercises)
          </h3>
          
          {selectedExercises.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#9ca3af',
              fontStyle: 'italic'
            }}>
              No exercises added yet. Select exercises from the dropdown above.
            </div>
          ) : (
            <div style={{ space: '12px' }}>
              {selectedExercises.map((exercise, index) => (
                <div key={index} style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', color: '#1f2937' }}>{exercise.name}</h4>
                      <span style={{ fontSize: '12px', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                        {exercise.category}
                      </span>
                    </div>
                    <button
                      onClick={() => removeExercise(index)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr auto', gap: '12px', alignItems: 'center' }}>
                    {/* Type Toggle */}
                    <div>
                      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Type</label>
                      <select
                        value={exercise.type}
                        onChange={(e) => updateExercise(index, 'type', e.target.value)}
                        style={{ padding: '6px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      >
                        <option value="reps">Reps</option>
                        <option value="time">Time</option>
                      </select>
                    </div>

                    {/* Sets */}
                    <div>
                      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Sets</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={exercise.sets}
                        onChange={(e) => updateExercise(index, 'sets', parseInt(e.target.value))}
                        style={{ width: '60px', padding: '6px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                    </div>

                    {/* Reps or Duration */}
                    <div>
                      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                        {exercise.type === 'reps' ? 'Reps' : 'Duration (sec)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={exercise.type === 'reps' ? "100" : "300"}
                        value={exercise.type === 'reps' ? exercise.reps || 10 : exercise.duration || 30}
                        onChange={(e) => updateExercise(index, exercise.type === 'reps' ? 'reps' : 'duration', parseInt(e.target.value))}
                        style={{ width: '80px', padding: '6px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                    </div>

                    {/* Notes */}
                    <div style={{ gridColumn: 'span 1' }}>
                      <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Notes</label>
                      <input
                        type="text"
                        value={exercise.notes || ''}
                        onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                        placeholder="Optional notes..."
                        style={{ width: '100%', padding: '6px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ← Back to Welcome
          </button>
          <button
            onClick={handleSave}
            disabled={!routineName.trim() || selectedExercises.length === 0}
            style={{
              padding: '12px 24px',
              backgroundColor: routineName.trim() && selectedExercises.length > 0 ? '#10b981' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: routineName.trim() && selectedExercises.length > 0 ? 'pointer' : 'not-allowed',
              fontWeight: '500',
              fontSize: '16px'
            }}
          >
            Save Routine ({selectedExercises.length} exercises)
          </button>
        </div>
      </div>
    </div>
  );
}

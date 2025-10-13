
import { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import RoutineBuilder from './components/RoutineBuilder';
import ExerciseCard from './components/ExerciseCard';

// Workout Calendar Component
function WorkoutCalendar({ workoutHistory, onUpdateWorkoutHistory }: { workoutHistory: any[], onUpdateWorkoutHistory: (newHistory: any[]) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [editingNotes, setEditingNotes] = useState<{[key: string]: boolean}>({});
  const [editedNotes, setEditedNotes] = useState<{[key: string]: string}>({});
  const [editingGeneralNote, setEditingGeneralNote] = useState(false);
  const [editedGeneralNote, setEditedGeneralNote] = useState('');
  const [showCompletionTooltip, setShowCompletionTooltip] = useState(false);

  // Function to get exercise completion details for tooltip
  const getExerciseCompletionDetails = (workout: any) => {
    console.log('🔍 Getting completion details for workout:', workout);
    
    if (!workout) return [];
    
    // Try different possible data structures
    let exercises = [];
    if (workout.routine && workout.routine.exercises) {
      exercises = workout.routine.exercises;
    } else if (workout.exercises) {
      exercises = workout.exercises;
    } else if (workout.allExercises) {
      exercises = workout.allExercises;
    }
    
    console.log('📋 Found exercises:', exercises);
    console.log('✅ Completed exercises:', workout.completedExercises);
    
    if (!exercises || exercises.length === 0) return [];
    
    const details = exercises.map((exercise: any) => {
      // Try multiple ways to match completed exercises
      const exerciseId = exercise.id || exercise.name || exercise.title;
      const exerciseName = exercise.name || exercise.title || exercise.id;
      
      // Check if this exercise was completed by trying different matching strategies
      const isCompleted = workout.completedExercises.includes(exerciseId) ||
                         workout.completedExercises.includes(exerciseName) ||
                         workout.completedExercises.includes(exercise.id) ||
                         workout.completedExercises.includes(exercise.name);
      
      return {
        name: exerciseName,
        isCompleted: isCompleted
      };
    }).sort((a: any, b: any) => a.name.localeCompare(b.name)); // Sort alphabetically
    
    console.log('📊 Exercise details:', details);
    return details;
  };

  // Functions for editing notes
  const startEditingNote = (exerciseId: string, currentNote: string) => {
    setEditingNotes(prev => ({ ...prev, [exerciseId]: true }));
    setEditedNotes(prev => ({ ...prev, [exerciseId]: currentNote }));
  };

  const startEditingGeneralNote = (currentNote: string) => {
    setEditingGeneralNote(true);
    setEditedGeneralNote(currentNote || '');
  };

  const cancelEditingNote = (exerciseId: string) => {
    setEditingNotes(prev => ({ ...prev, [exerciseId]: false }));
    setEditedNotes(prev => {
      const newNotes = { ...prev };
      delete newNotes[exerciseId];
      return newNotes;
    });
  };

  const cancelEditingGeneralNote = () => {
    setEditingGeneralNote(false);
    setEditedGeneralNote('');
  };

  const saveEditedNote = (exerciseId: string, noteIndex: number) => {
    const noteKey = `${exerciseId}-${noteIndex}`;
    console.log('🔧 Saving note:', { exerciseId, noteIndex, noteKey, editedText: editedNotes[noteKey] });
    
    if (!selectedWorkout || !editedNotes[noteKey]) {
      console.log('❌ Save failed - missing data:', { selectedWorkout: !!selectedWorkout, hasEditedNote: !!editedNotes[noteKey] });
      return;
    }
    
    const updatedHistory = workoutHistory.map(workout => {
      if (workout.date === selectedWorkout.date) {
        const updatedWorkout = { ...workout };
        if (updatedWorkout.exerciseNotes && updatedWorkout.exerciseNotes[exerciseId]) {
          updatedWorkout.exerciseNotes[exerciseId][noteIndex].text = editedNotes[noteKey];
          console.log('✅ Note updated in workout:', updatedWorkout.exerciseNotes[exerciseId][noteIndex]);
        }
        return updatedWorkout;
      }
      return workout;
    });
    
    // Only update through the main callback to avoid duplicates
    onUpdateWorkoutHistory(updatedHistory);
    
    // Update selectedWorkout to match the updated workout
    const updatedWorkout = updatedHistory.find(w => w.date === selectedWorkout.date);
    if (updatedWorkout) {
      setSelectedWorkout(updatedWorkout);
    }
    
    cancelEditingNote(noteKey);
  };

  const saveEditedGeneralNote = () => {
    console.log('🔧 Saving general note:', { editedGeneralNote, selectedWorkout: !!selectedWorkout });
    
    if (!selectedWorkout) return;
    
    const updatedHistory = workoutHistory.map(workout => {
      if (workout.date === selectedWorkout.date) {
        return { ...workout, notes: editedGeneralNote };
      }
      return workout;
    });
    
    // Only update through the main callback to avoid duplicates
    onUpdateWorkoutHistory(updatedHistory);
    
    // Update selectedWorkout to match the updated workout
    const updatedWorkout = updatedHistory.find(w => w.date === selectedWorkout.date);
    if (updatedWorkout) {
      setSelectedWorkout(updatedWorkout);
    }
    
    cancelEditingGeneralNote();
    console.log('✅ General note saved successfully');
  };

  const addNewNote = (exerciseId: string) => {
    console.log('🔧 Adding new note for:', exerciseId);
    
    if (!selectedWorkout) return;
    
    const newNote = {
      text: '',
      date: new Date().toISOString().split('T')[0]
    };
    
    const updatedHistory = workoutHistory.map(workout => {
      if (workout.date === selectedWorkout.date) {
        const updatedWorkout = { ...workout };
        if (!updatedWorkout.exerciseNotes) updatedWorkout.exerciseNotes = {};
        if (!updatedWorkout.exerciseNotes[exerciseId]) updatedWorkout.exerciseNotes[exerciseId] = [];
        updatedWorkout.exerciseNotes[exerciseId].push(newNote);
        return updatedWorkout;
      }
      return workout;
    });
    
    // Only update through the main callback to avoid duplicates
    onUpdateWorkoutHistory(updatedHistory);
    
    // Update selectedWorkout to match the updated workout
    const updatedWorkout = updatedHistory.find(w => w.date === selectedWorkout.date);
    if (updatedWorkout) {
      setSelectedWorkout(updatedWorkout);
    }
    
    // Start editing the new note immediately with correct key format
    const newNoteIndex = (selectedWorkout.exerciseNotes?.[exerciseId]?.length || 0);
    const noteKey = `${exerciseId}-${newNoteIndex}`;
    console.log('✅ New note added, starting edit with key:', noteKey);
    startEditingNote(noteKey, '');
  };

  // Get calendar data for current month
  const getCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

    const days = [];
    const currentDay = new Date(startDate);
    
    // Get today's date in local timezone (same format as workout saving)
    const today = new Date();
    const todayString = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');

    // Generate 42 days (6 weeks) for calendar grid
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDay.getFullYear() + '-' + 
        String(currentDay.getMonth() + 1).padStart(2, '0') + '-' + 
        String(currentDay.getDate()).padStart(2, '0');
      const workout = workoutHistory.find(w => w.date === dateStr);
      
      days.push({
        date: new Date(currentDay),
        dateStr,
        workout,
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: dateStr === todayString
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return days;
  };

  const calendarDays = getCalendarData();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    setSelectedWorkout(null);
  };

  return (
    <div>
      {/* Calendar Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={() => navigateMonth(-1)}
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          ← Previous
        </button>
        
        <h2 style={{
          margin: 0,
          fontSize: '1.8rem',
          fontWeight: '700',
          color: '#1f2937'
        }}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth(1)}
          style={{
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '2px',
        backgroundColor: '#e5e7eb',
        borderRadius: '12px',
        padding: '2px',
        marginBottom: '20px'
      }}>
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} style={{
            backgroundColor: '#f3f4f6',
            padding: '12px',
            textAlign: 'center',
            fontWeight: '600',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => day.workout && setSelectedWorkout(day.workout)}
            style={{
              backgroundColor: day.isCurrentMonth ? 'white' : '#f9fafb',
              padding: '12px',
              minHeight: '80px',
              cursor: day.workout ? 'pointer' : 'default',
              border: day.isToday ? '2px solid #667eea' : 'none',
              borderRadius: '8px',
              position: 'relative',
              opacity: day.isCurrentMonth ? 1 : 0.5
            }}
          >
            <div style={{
              fontSize: '14px',
              fontWeight: day.isToday ? '700' : '500',
              color: day.isToday ? '#667eea' : '#374151',
              marginBottom: '4px'
            }}>
              {day.date.getDate()}
            </div>
            
            {day.workout && (
              <div style={{
                backgroundColor: day.workout.completionPercentage === 100 ? '#10b981' : '#f59e0b',
                color: 'white',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '10px',
                fontWeight: '600',
                textAlign: 'center'
              }}>
                {day.workout.completionPercentage}%
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Selected Workout Details */}
      {selectedWorkout && (
        <div style={{
          backgroundColor: 'white',
          border: '2px solid #667eea',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>
              {(() => {
                // Parse date string properly to avoid timezone issues
                const [year, month, day] = selectedWorkout.date.split('-').map(Number);
                const localDate = new Date(year, month - 1, day); // month is 0-indexed
                return localDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                });
              })()}
            </h3>
            <button
              onClick={() => setSelectedWorkout(null)}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✕ Close
            </button>
          </div>

          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
            <div 
              style={{
                backgroundColor: selectedWorkout.completionPercentage === 100 ? '#10b981' : '#f59e0b',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'inline-block',
                cursor: 'help'
              }}
              onMouseEnter={() => setShowCompletionTooltip(true)}
              onMouseLeave={() => setShowCompletionTooltip(false)}
            >
              {selectedWorkout.completionPercentage}% Complete ({selectedWorkout.completedExercises.length}/{selectedWorkout.totalExercises} exercises)
            </div>
            
            {/* Completion Tooltip */}
            {showCompletionTooltip && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginTop: '8px',
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                minWidth: '200px',
                maxWidth: '300px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
                  Exercise Status
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {getExerciseCompletionDetails(selectedWorkout).length > 0 ? (
                    getExerciseCompletionDetails(selectedWorkout).map((exercise: any, index: number) => (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        padding: '2px 0'
                      }}>
                        <span style={{ 
                          fontSize: '14px',
                          color: exercise.isCompleted ? '#10b981' : '#ef4444',
                          fontWeight: 'bold'
                        }}>
                          {exercise.isCompleted ? '✓' : '✗'}
                        </span>
                        <span style={{ 
                          color: exercise.isCompleted ? '#d1fae5' : '#fecaca',
                          fontSize: '11px'
                        }}>
                          {exercise.name}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#9ca3af', 
                      fontSize: '11px',
                      fontStyle: 'italic'
                    }}>
                      Exercise details not available
                      <br />
                      {selectedWorkout.completedExercises.length} of {selectedWorkout.totalExercises} completed
                    </div>
                  )}
                </div>
                
                {/* Tooltip Arrow */}
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '6px solid rgba(0, 0, 0, 0.9)'
                }}></div>
              </div>
            )}
          </div>

          {selectedWorkout.notes && (
            <div style={{
              backgroundColor: '#f3f4f6',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <strong>Workout Notes:</strong>
                <button
                  onClick={() => startEditingGeneralNote(selectedWorkout.notes)}
                  style={{
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Edit
                </button>
              </div>
              {editingGeneralNote ? (
                <div>
                  <textarea
                    value={editedGeneralNote}
                    onChange={(e) => setEditedGeneralNote(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '60px',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      marginBottom: '8px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={saveEditedGeneralNote}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      💾 Save
                    </button>
                    <button
                      onClick={cancelEditingGeneralNote}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>{selectedWorkout.notes}</div>
              )}
            </div>
          )}

          {selectedWorkout.exerciseNotes && Object.keys(selectedWorkout.exerciseNotes).length > 0 && (
            <div>
              <h4 style={{ color: '#374151', marginBottom: '12px' }}>Exercise Notes:</h4>
              <div style={{ display: 'grid', gap: '8px' }}>
                {Object.entries(selectedWorkout.exerciseNotes).map(([exerciseId, notes]: [string, any]) => (
                  notes && notes.length > 0 && (
                    <div key={exerciseId} style={{
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <strong>{exerciseId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}:</strong>
                        <button
                          onClick={() => addNewNote(exerciseId)}
                          style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          ➕ Add Note
                        </button>
                      </div>
                      <div style={{ marginTop: '4px', color: '#6b7280' }}>
                        {notes.map((note: any, index: number) => (
                          <div key={index} style={{ 
                            marginBottom: index < notes.length - 1 ? '8px' : '0',
                            padding: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            borderRadius: '4px',
                            border: '1px solid rgba(186, 230, 253, 0.5)'
                          }}>
                            {editingNotes[`${exerciseId}-${index}`] ? (
                              <div>
                                <textarea
                                  value={editedNotes[`${exerciseId}-${index}`] || ''}
                                  onChange={(e) => setEditedNotes(prev => ({ ...prev, [`${exerciseId}-${index}`]: e.target.value }))}
                                  style={{
                                    width: '100%',
                                    minHeight: '50px',
                                    padding: '6px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical',
                                    marginBottom: '6px',
                                    boxSizing: 'border-box'
                                  }}
                                />
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button
                                    onClick={() => saveEditedNote(exerciseId, index)}
                                    style={{
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      padding: '3px 8px',
                                      fontSize: '10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    💾 Save
                                  </button>
                                  <button
                                    onClick={() => cancelEditingNote(`${exerciseId}-${index}`)}
                                    style={{
                                      backgroundColor: '#6b7280',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '3px',
                                      padding: '3px 8px',
                                      fontSize: '10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    ❌ Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                  <strong>{note.date}:</strong> {note.text}
                                </div>
                                <button
                                  onClick={() => startEditingNote(`${exerciseId}-${index}`, note.text)}
                                  style={{
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '3px',
                                    padding: '2px 6px',
                                    fontSize: '9px',
                                    cursor: 'pointer',
                                    marginLeft: '8px'
                                  }}
                                >
                                  ✏️ Edit
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>
            Completed at {new Date(selectedWorkout.completedAt).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Fysio component
function PTExerciseTrackerContent() {
  const { user, loading } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showSignupConfirmation, setShowSignupConfirmation] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showRoutineBuilder, setShowRoutineBuilder] = useState(false);
  const [showMedicalDisclaimer, setShowMedicalDisclaimer] = useState(false);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [currentRoutine, setCurrentRoutine] = useState<any>(null);
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempModifications, setTempModifications] = useState<{[key: string]: any}>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);

  // Function to update workout history and persist to storage
  const updateWorkoutHistory = (newHistory: any[]) => {
    setWorkoutHistory(newHistory);
    // Also save to localStorage/sessionStorage
    try {
      localStorage.setItem('fysio_workout_history', JSON.stringify(newHistory));
    } catch (error) {
      try {
        sessionStorage.setItem('fysio_workout_history', JSON.stringify(newHistory));
      } catch (sessionError) {
        console.warn('Failed to save workout history:', sessionError);
      }
    }
  };
  
  // Stable first name extraction
  const userFirstName = useMemo(() => {
    if (!user) return 'User';
    
    // Check if name is a placeholder or real name
    const name = user.name;
    if (name && name !== 'Your Name' && name !== 'PT Name' && name.trim() && !name.includes('placeholder')) {
      // Use the real name
      return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1).toLowerCase();
    }
    
    // Fallback to email-based name
    if (user.email) {
      const emailName = user.email.split('@')[0].split('.')[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
    }
    
    return 'User';
  }, [user]);
  const [exerciseNotes, setExerciseNotes] = useState<{[key: string]: any[]}>({
    'neck-rolls': [],
    'shoulder-shrugs': [],
    'arm-circles': [],
    'wall-push-ups': [],
    'chest-stretch': [],
    'cat-cow': [],
    'knee-to-chest': [],
    'calf-raises': [],
    'mini-squats': [],
    'hamstring-stretch': [],
    'ankle-circles': [],
    'balance-stands': []
  });
  const [expandedNotes, setExpandedNotes] = useState<{[key: string]: boolean}>({});
  const [currentNotes, setCurrentNotes] = useState<{[key: string]: {text: string, date: string}}>({
    'neck-rolls': { text: '', date: new Date().toISOString().split('T')[0] },
    'shoulder-shrugs': { text: '', date: new Date().toISOString().split('T')[0] },
    'arm-circles': { text: '', date: new Date().toISOString().split('T')[0] },
    'wall-push-ups': { text: '', date: new Date().toISOString().split('T')[0] },
    'chest-stretch': { text: '', date: new Date().toISOString().split('T')[0] },
    'cat-cow': { text: '', date: new Date().toISOString().split('T')[0] },
    'knee-to-chest': { text: '', date: new Date().toISOString().split('T')[0] },
    'calf-raises': { text: '', date: new Date().toISOString().split('T')[0] },
    'mini-squats': { text: '', date: new Date().toISOString().split('T')[0] },
    'hamstring-stretch': { text: '', date: new Date().toISOString().split('T')[0] },
    'ankle-circles': { text: '', date: new Date().toISOString().split('T')[0] },
    'balance-stands': { text: '', date: new Date().toISOString().split('T')[0] }
  });

  const { signOut } = useAuth();

  // Check if user should see welcome screen
  useEffect(() => {
    if (user) {
      try {
        // Don't show welcome screen yet - wait for data to load first
        
        // Check if localStorage is corrupted and repair if needed
        try {
          localStorage.getItem('test');
        } catch (error) {
          console.log('🔧 Detected localStorage corruption, repairing...');
          try {
            localStorage.clear();
            localStorage.setItem('fysio_routines', '[]');
            localStorage.setItem('fysio_workout_history', '[]');
            console.log('✅ localStorage repaired successfully');
          } catch (repairError) {
            console.log('❌ Could not repair localStorage, will use sessionStorage');
          }
        }

        // Load workout history and saved routines
        try {
          loadWorkoutHistory();
          loadSavedRoutines();
          setDataLoaded(true);
          console.log('✅ Data loading completed successfully');
        } catch (error) {
          console.warn('Failed to load workout history or routines:', error);
          // If loading fails due to corruption, treat as new user
          setSavedRoutines([]);
          setWorkoutHistory([]);
          setDataLoaded(true);
          console.log('⚠️ Data loading failed, adding demo data for presentation');
          
          // Add demo data for presentation purposes
          const demoRoutines = [
            {
              id: 'demo-morning-mobility',
              name: 'Morning Mobility',
              exercises: [
                { id: 'neck-rolls', name: 'Neck Rolls', category: 'Neck & Cervical', sets: 1, reps: 5, type: 'reps' },
                { id: 'shoulder-shrugs', name: 'Shoulder Shrugs', category: 'Upper Body', sets: 2, reps: 10, type: 'reps' },
                { id: 'arm-circles', name: 'Arm Circles', category: 'Upper Body', sets: 1, reps: 10, type: 'reps' }
              ],
              createdAt: new Date().toISOString(),
              userId: user?.id
            }
          ];
          
          const demoHistory = [
            {
              id: 'demo-workout-1',
              date: new Date().toISOString().split('T')[0],
              completedExercises: ['neck-rolls', 'shoulder-shrugs'],
              totalExercises: 3,
              completionPercentage: 67,
              notes: 'Feeling good today!',
              userId: user?.id,
              completedAt: new Date().toISOString(),
              // Add exercise list for tooltip functionality
              exercises: [
                { id: 'neck-rolls', name: 'Neck Rolls', category: 'Neck & Cervical' },
                { id: 'shoulder-shrugs', name: 'Shoulder Shrugs', category: 'Upper Body' },
                { id: 'arm-circles', name: 'Arm Circles', category: 'Upper Body' }
              ],
              routine: {
                name: 'Morning Mobility',
                exercises: [
                  { id: 'neck-rolls', name: 'Neck Rolls', category: 'Neck & Cervical' },
                  { id: 'shoulder-shrugs', name: 'Shoulder Shrugs', category: 'Upper Body' },
                  { id: 'arm-circles', name: 'Arm Circles', category: 'Upper Body' }
                ]
              }
            }
          ];
          
          setSavedRoutines(demoRoutines);
          setWorkoutHistory(demoHistory);
          setCurrentRoutine(demoRoutines[0]);
        }
      } catch (error) {
        console.warn('localStorage access failed, showing welcome screen:', error);
        // If localStorage is corrupted, show welcome screen as default
        setShowWelcome(true);
      }
    }
  }, [user]);

  // Show welcome screen after data loads (only for new users)
  useEffect(() => {
    if (user && dataLoaded && !welcomeDismissed) {
      // Debug: Check what data we have
      console.log('🔍 DEBUG: savedRoutines.length:', savedRoutines.length);
      console.log('🔍 DEBUG: workoutHistory.length:', workoutHistory.length);
      console.log('🔍 DEBUG: savedRoutines:', savedRoutines);
      
      // Only show welcome screen for truly new users (no routines, no history)
      const isNewUser = savedRoutines.length === 0 && workoutHistory.length === 0;
      console.log('🔍 DEBUG: isNewUser:', isNewUser);
      
      if (isNewUser) {
        setShowWelcome(true);
      }
    }
  }, [user, dataLoaded, welcomeDismissed, savedRoutines, workoutHistory]);

  // Load current workout session from localStorage on mount
  useEffect(() => {
    if (user) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const savedSession = localStorage.getItem(`fysio_current_session_${user.id}_${today}`);
        if (savedSession) {
          const { completedExercises: saved, exerciseNotes: savedNotes } = JSON.parse(savedSession);
          setCompletedExercises(saved || []);
          setExerciseNotes(savedNotes || exerciseNotes);
          console.log('✅ Restored workout session:', saved?.length || 0, 'exercises completed');
        }
      } catch (error) {
        console.warn('Failed to restore workout session:', error);
      }
    }
  }, [user]);

  // Save current workout session to localStorage whenever it changes
  useEffect(() => {
    if (user && completedExercises.length > 0) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const sessionData = {
          completedExercises,
          exerciseNotes,
          lastSaved: new Date().toISOString()
        };
        localStorage.setItem(`fysio_current_session_${user.id}_${today}`, JSON.stringify(sessionData));
        console.log('💾 Saved current session:', completedExercises.length, 'exercises');
      } catch (error) {
        console.warn('Failed to save workout session:', error);
      }
    }
  }, [user, completedExercises, exerciseNotes]);

  const handleLogout = async () => {
    try {
      console.log('Attempting to sign out...');
      await signOut();
      console.log('Sign out successful');
      
      // Clear local state
      setCompletedExercises([]);
      setExerciseNotes({
        'neck-rolls': [],
        'shoulder-shrugs': [],
        'arm-circles': [],
        'wall-push-ups': [],
        'chest-stretch': [],
        'cat-cow': [],
        'knee-to-chest': [],
        'calf-raises': [],
        'mini-squats': [],
        'hamstring-stretch': [],
        'ankle-circles': [],
        'balance-stands': []
      });
      
      // Force clear any cached auth state and reload
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
      // If signOut fails, force logout anyway
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handleSaveRoutine = (routine: any, exercises: any[]) => {
    try {
      console.log('Saving routine:', routine.name, 'with', exercises.length, 'exercises');
      
      const newRoutine = {
        id: Date.now().toString(),
        ...routine,
        exercises,
        createdAt: new Date().toISOString(),
        userId: user?.id
      };

      // Try to load existing routines with fallback
      let existingRoutines: any[] = [];
      try {
        existingRoutines = JSON.parse(localStorage.getItem('fysio_routines') || '[]');
      } catch (error) {
        try {
          existingRoutines = JSON.parse(sessionStorage.getItem('fysio_routines') || '[]');
        } catch (sessionError) {
          existingRoutines = [];
        }
      }

      const updatedRoutines = [...existingRoutines, newRoutine];
      const saveResult = saveWithFallback('fysio_routines', updatedRoutines);
      
      if (saveResult.success) {
        alert(`🎉 Routine "${routine.name}" saved successfully! (${saveResult.storage})`);
        
        // Update current routine to the newly saved one
        setCurrentRoutine(newRoutine);
        setSavedRoutines(updatedRoutines.filter((r: any) => r.userId === user?.id));
        
        // Reset exercise completion state for new routine
        setCompletedExercises([]);
        
        // Initialize exercise notes for new routine (merge with existing)
        try {
          const newExerciseNotes: {[key: string]: any[]} = { ...exerciseNotes };
          exercises.forEach((ex: any) => {
            const exerciseId = ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
            if (!newExerciseNotes[exerciseId]) {
              newExerciseNotes[exerciseId] = [];
            }
          });
          setExerciseNotes(newExerciseNotes);
          console.log('Exercise notes updated successfully');
        } catch (notesError) {
          console.error('Error updating exercise notes:', notesError);
          // Continue without crashing
        }
        
      } else {
        alert(`⚠️ Routine "${routine.name}" created but couldn't be saved. It will be available this session only.`);
        // Still set as current routine for this session
        setCurrentRoutine(newRoutine);
      }
      
      setShowRoutineBuilder(false);
      
    } catch (error) {
      console.error('Error in handleSaveRoutine:', error);
      alert(`❌ Error saving routine: ${error}. Please try again.`);
      // Don't close the routine builder if there's an error
    }
  };

  const handleCompleteWorkout = () => {
    // Always show completion dialog to allow users to add notes
    setShowCompletionDialog(true);
    // Scroll to position where modal will be perfectly centered
    setTimeout(() => {
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      
      // Calculate the scroll position that puts the modal center in the middle of viewport
      const modalCenterPosition = documentHeight / 2; // Modal appears at 50% of document height
      const idealScrollPosition = modalCenterPosition - (windowHeight / 2); // Center it in viewport
      
      window.scrollTo({
        top: Math.max(0, idealScrollPosition),
        behavior: 'smooth'
      });
    }, 100); // Small delay to ensure modal is rendered
  };

  const completeWorkout = () => {
    try {
      // Get today's date in local timezone (not UTC)
      const today = new Date();
      const localDateString = today.getFullYear() + '-' + 
        String(today.getMonth() + 1).padStart(2, '0') + '-' + 
        String(today.getDate()).padStart(2, '0');
      
      const workoutData = {
        id: Date.now().toString(),
        date: localDateString,
        completedExercises: [...completedExercises],
        totalExercises: allExercises.length,
        completionPercentage: Math.round((completedExercises.length / allExercises.length) * 100),
        notes: completionNotes,
        exerciseNotes: { ...exerciseNotes },
        userId: user?.id,
        completedAt: new Date().toISOString(),
        // Add the full exercise list for tooltip functionality
        exercises: allExercises.map((exercise: any) => ({
          id: exercise.id,
          name: exercise.name,
          category: exercise.category || 'General'
        })),
        routine: currentRoutine ? {
          name: currentRoutine.name,
          exercises: allExercises.map((exercise: any) => ({
            id: exercise.id,
            name: exercise.name,
            category: exercise.category || 'General'
          }))
        } : null
      };

      console.log('💾 Saving workout with date:', localDateString, 'and exercise notes:', exerciseNotes);

      // Try to save to localStorage with error handling
      try {
        const history = JSON.parse(localStorage.getItem('fysio_workout_history') || '[]');
        history.push(workoutData);
        localStorage.setItem('fysio_workout_history', JSON.stringify(history));
        
        // Update state
        setWorkoutHistory(history);
        
        alert(`🎉 Today's workout completed and saved! ${workoutData.completionPercentage}% completion rate.`);
      } catch (storageError) {
        console.warn('localStorage failed, workout completed but not saved:', storageError);
        
        // Still update state for current session
        setWorkoutHistory(prev => [...prev, workoutData]);
        
        alert(`🎉 Today's workout completed! ${workoutData.completionPercentage}% completion rate.\n\n⚠️ Note: Workout data couldn't be saved permanently due to browser storage issues, but it's available for this session.`);
      }
      
      // Reset for next day
      setCompletedExercises([]);
      setCompletionNotes('');
      setShowCompletionDialog(false);
      
      // Clear today's session from localStorage since workout is logged
      try {
        const today = new Date();
        const localDateString = today.getFullYear() + '-' + 
          String(today.getMonth() + 1).padStart(2, '0') + '-' + 
          String(today.getDate()).padStart(2, '0');
        localStorage.removeItem(`fysio_current_session_${user?.id}_${localDateString}`);
        console.log('🧹 Cleared current session after logging workout');
      } catch (error) {
        console.warn('Failed to clear session:', error);
      }
      
    } catch (error) {
      console.error('Failed to complete workout:', error);
      alert('⚠️ There was an error completing the workout. Please try again.');
    }
  };

  const loadWorkoutHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('fysio_workout_history') || '[]');
      setWorkoutHistory(history.filter((workout: any) => workout.userId === user?.id));
    } catch (error) {
      console.warn('Failed to load workout history from localStorage:', error);
      // Set empty history if localStorage is corrupted
      setWorkoutHistory([]);
    }
  };

  const loadSavedRoutines = () => {
    try {
      console.log('🔍 Loading saved routines...');
      
      // Try localStorage first, then sessionStorage as fallback
      let routines: any[] = [];
      try {
        routines = JSON.parse(localStorage.getItem('fysio_routines') || '[]');
        console.log('📦 All routines in localStorage:', routines);
      } catch (localStorageError) {
        console.log('⚠️ localStorage failed, trying sessionStorage...');
        try {
          routines = JSON.parse(sessionStorage.getItem('fysio_routines') || '[]');
          console.log('📦 All routines in sessionStorage:', routines);
        } catch (sessionStorageError) {
          console.log('❌ Both localStorage and sessionStorage failed');
          routines = [];
        }
      }
      
      console.log('👤 Current user ID:', user?.id);
      
      const userRoutines = routines.filter((routine: any) => routine.userId === user?.id);
      console.log('🎯 User routines found:', userRoutines);
      
      setSavedRoutines(userRoutines);
      
      // If user has saved routines, use the most recent one as current
      if (userRoutines.length > 0) {
        const mostRecentRoutine = userRoutines.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        console.log('✅ Setting current routine to:', mostRecentRoutine.name);
        setCurrentRoutine(mostRecentRoutine);
      } else {
        console.log('❌ No user routines found, using default');
        // Use default routine if no custom routines exist
        setCurrentRoutine(null);
      }
    } catch (error) {
      console.error('💥 Failed to load saved routines:', error);
      setSavedRoutines([]);
      setCurrentRoutine(null);
    }
  };


  // Fallback storage using sessionStorage when localStorage fails
  const saveWithFallback = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return { success: true, storage: 'localStorage' };
    } catch (error) {
      try {
        sessionStorage.setItem(key, JSON.stringify(data));
        return { success: true, storage: 'sessionStorage' };
      } catch (sessionError) {
        console.error('Both localStorage and sessionStorage failed:', error, sessionError);
        return { success: false, storage: 'none' };
      }
    }
  };


  // Basic Strengthening & Stretching Routine
  const basicRoutineExercises = [
    { id: 'neck-rolls', name: 'Neck Rolls', category: 'Neck & Cervical', sets: 1, reps: 5, type: 'reps' },
    { id: 'shoulder-shrugs', name: 'Shoulder Shrugs', category: 'Upper Body', sets: 2, reps: 10, type: 'reps' },
    { id: 'arm-circles', name: 'Arm Circles', category: 'Upper Body', sets: 1, reps: 10, type: 'reps' },
    { id: 'wall-push-ups', name: 'Wall Push-ups', category: 'Upper Body', sets: 2, reps: 8, type: 'reps' },
    { id: 'chest-stretch', name: 'Doorway Chest Stretch', category: 'Flexibility', sets: 2, duration: 30, type: 'time' },
    { id: 'cat-cow', name: 'Cat-Cow Stretch', category: 'Back & Spine', sets: 1, reps: 8, type: 'reps' },
    { id: 'knee-to-chest', name: 'Knee-to-Chest Stretch', category: 'Lower Body', sets: 2, duration: 30, type: 'time' },
    { id: 'calf-raises', name: 'Calf Raises', category: 'Lower Body', sets: 2, reps: 12, type: 'reps' },
    { id: 'mini-squats', name: 'Mini Squats', category: 'Lower Body', sets: 2, reps: 10, type: 'reps' },
    { id: 'hamstring-stretch', name: 'Seated Hamstring Stretch', category: 'Flexibility', sets: 2, duration: 30, type: 'time' },
    { id: 'ankle-circles', name: 'Ankle Circles', category: 'Lower Body', sets: 1, reps: 10, type: 'reps' },
    { id: 'balance-stands', name: 'Single-Leg Balance', category: 'Balance', sets: 2, duration: 15, type: 'time' }
  ];
  
  // Use current routine if available, otherwise use basic routine
  // Ensure custom routine exercises have proper IDs and apply temporary modifications
  const baseExercises = currentRoutine ? 
    currentRoutine.exercises.map((ex: any) => ({
      ...ex,
      id: ex.id || ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    })) : 
    basicRoutineExercises;

  // Apply temporary modifications if in edit mode
  const allExercises = baseExercises
    .map((ex: any) => {
      if (tempModifications[ex.id]) {
        const modified = { ...ex, ...tempModifications[ex.id] };
        console.log(`🔄 Modified exercise ${ex.id}:`, modified);
        return modified;
      }
      return ex;
    })
    .filter((ex: any) => {
      const shouldKeep = !ex.removed;
      if (!shouldKeep) {
        console.log(`❌ Filtering out removed exercise:`, ex.id);
      }
      return shouldKeep;
    }) // Filter out removed exercises
    .concat(
      // Add new exercises from temp modifications
      Object.values(tempModifications)
        .filter((mod: any) => mod.added)
        .map((mod: any) => ({ ...mod }))
    );

  console.log('📋 Final allExercises:', allExercises.map((ex: any) => ex.id));

  // Helper function to get exercise icon - simple and clean
  const getExerciseEmoji = (_exercise: any) => {
    // Just return a simple bullet point for all exercises
    // Clean and consistent, no confusing emojis
    return '•';
  };

  // Helper function to format exercise description
  const getExerciseDescription = (exercise: any) => {
    if (exercise.type === 'reps') {
      return `${exercise.sets} set${exercise.sets > 1 ? 's' : ''} of ${exercise.reps} repetitions`;
    } else {
      const minutes = Math.floor(exercise.duration / 60);
      const seconds = exercise.duration % 60;
      const timeStr = minutes > 0 ? `${minutes}:${seconds.toString().padStart(2, '0')}` : `${seconds} seconds`;
      return `${exercise.sets} set${exercise.sets > 1 ? 's' : ''} of ${timeStr}`;
    }
  };

  // Helper function to get exercise placeholder text
  const getExercisePlaceholder = (exercise: any) => {
    const name = exercise.name.toLowerCase();
    if (name.includes('neck')) return 'Any tension or stiffness in your neck?';
    if (name.includes('shoulder')) return 'How did your shoulders feel? Any tightness?';
    if (name.includes('stretch')) return 'How did this stretch feel? Any areas of tightness?';
    if (name.includes('squat') || name.includes('leg')) return 'How did your legs feel during this exercise?';
    if (name.includes('balance')) return 'How was your balance? Any difficulty maintaining stability?';
    return 'How did this exercise feel? Any discomfort or notes?';
  };

  // Functions for temporary exercise editing
  const updateTempExercise = (exerciseId: string, field: string, value: any) => {
    setTempModifications(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };

  const resetTempModifications = () => {
    setTempModifications({});
    setIsEditMode(false);
  };

  const deleteRoutine = (routineId: string, routineName: string) => {
    // Ask for confirmation before deleting
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the routine "${routineName}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmDelete) {
      try {
        // Remove from savedRoutines
        const updatedRoutines = savedRoutines.filter(routine => routine.id !== routineId);
        setSavedRoutines(updatedRoutines);
        
        // If the deleted routine was the current one, switch to basic routine
        if (currentRoutine && currentRoutine.id === routineId) {
          setCurrentRoutine(null);
          setCompletedExercises([]);
        }
        
        // Update localStorage
        const saveResult = saveWithFallback('fysio_routines', updatedRoutines);
        
        if (saveResult.success) {
          alert(`✅ Routine "${routineName}" deleted successfully!`);
        } else {
          alert(`⚠️ Routine "${routineName}" deleted from this session, but couldn't be saved permanently.`);
        }
        
      } catch (error) {
        console.error('Error deleting routine:', error);
        alert(`❌ Error deleting routine: ${error}. Please try again.`);
      }
    }
  };

  const removeExerciseFromRoutine = (exerciseId: string) => {
    if (!isEditMode) return;
    
    console.log('🗑️ Removing exercise:', exerciseId);
    
    // Remove from temp modifications (this will hide it from the current session)
    setTempModifications(prev => {
      const newMods = {
        ...prev,
        [exerciseId]: { ...prev[exerciseId], removed: true }
      };
      console.log('🔧 Updated tempModifications:', newMods);
      return newMods;
    });
  };

  const addExerciseToRoutine = () => {
    if (!isEditMode) return;
    
    // Simple exercise picker - in a real app this would be a modal with the full exercise list
    const exerciseName = prompt('Enter exercise name:');
    if (!exerciseName) return;
    
    const exerciseType = confirm('Is this a repetition-based exercise?\nOK = Reps, Cancel = Time-based') ? 'reps' : 'time';
    
    let sets = 1;
    let reps = 10;
    let duration = 30;
    
    if (exerciseType === 'reps') {
      const setsInput = prompt('How many sets?', '2');
      const repsInput = prompt('How many reps per set?', '10');
      sets = parseInt(setsInput || '2');
      reps = parseInt(repsInput || '10');
    } else {
      const setsInput = prompt('How many sets?', '2');
      const durationInput = prompt('How many seconds per set?', '30');
      sets = parseInt(setsInput || '2');
      duration = parseInt(durationInput || '30');
    }
    
    const newExercise = {
      id: exerciseName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now(),
      name: exerciseName,
      category: 'Custom',
      sets,
      ...(exerciseType === 'reps' ? { reps, type: 'reps' } : { duration, type: 'time' })
    };
    
    // Add to temp modifications
    setTempModifications(prev => ({
      ...prev,
      [newExercise.id]: { ...newExercise, added: true }
    }));
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Exiting edit mode - ask if user wants to keep changes
      const hasChanges = Object.keys(tempModifications).length > 0;
      if (hasChanges) {
        const keepChanges = confirm('You have unsaved changes. Keep them for this session?');
        if (!keepChanges) {
          setTempModifications({});
        }
      }
    }
    setIsEditMode(!isEditMode);
  };
  const completionPercentage = (completedExercises.length / allExercises.length) * 100;
  
  // Calculate dynamic adherence based on actual workout history
  const calculateAdherence = () => {
    if (workoutHistory.length === 0) return { weekly: 0, overall: 0 };
    
    // Weekly adherence - based on days active this week, not arbitrary 7 days
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    
    const weeklyWorkouts = workoutHistory.filter(workout => 
      new Date(workout.date) >= startOfWeek
    );
    
    // Count unique days with workouts this week
    const uniqueWorkoutDays = new Set(
      weeklyWorkouts.map(workout => workout.date)
    ).size;
    
    // Simple PT logic: Any workout this week = 100% weekly adherence
    const weeklyAdherence = uniqueWorkoutDays > 0 ? 100 : 0;
    
    // Overall adherence (since first workout)
    const firstWorkout = workoutHistory.length > 0 ? new Date(workoutHistory[0].date) : new Date();
    const daysSinceFirst = Math.max(1, Math.ceil((new Date().getTime() - firstWorkout.getTime()) / (1000 * 60 * 60 * 24)));
    const overallAdherence = workoutHistory.length > 0 ? Math.min((workoutHistory.length / daysSinceFirst) * 100, 100) : 0;
    
    return { 
      weekly: Math.round(weeklyAdherence * 10) / 10, 
      overall: Math.round(overallAdherence * 10) / 10 
    };
  };

  const { weekly: weeklyAdherence, overall: overallAdherence } = calculateAdherence();
  
  // Calculate current streak based on actual workout history
  const calculateStreak = () => {
    if (workoutHistory.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check each day backwards from today
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasWorkout = workoutHistory.some(workout => workout.date === dateStr);
      
      if (hasWorkout) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // If today has no workout, streak is 0
        // If yesterday+ has no workout, break the streak
        if (currentDate.getTime() === today.getTime()) {
          streak = 0;
        }
        break;
      }
    }
    
    return streak;
  };
  
  const currentStreak = calculateStreak();
  
  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Let's get a streak started!";
    if (streak === 1) return "Great start! Keep it up!";
    if (streak <= 3) return "Building momentum!";
    if (streak <= 7) return "You're on fire! 🔥";
    if (streak <= 14) return "Incredible dedication!";
    return "You're unstoppable! 💪";
  };
  
  const getLetterGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: '🏆 Champion', color: '#22543d' };
    if (percentage >= 80) return { grade: '⭐ Strong', color: '#2f855a' };
    if (percentage >= 70) return { grade: '💪 Steady', color: '#38a169' };
    if (percentage >= 60) return { grade: '🎯 Focused', color: '#48bb78' };
    if (percentage >= 40) return { grade: '🌱 Growing', color: '#ed8936' };
    if (percentage >= 20) return { grade: '🚀 Rising', color: '#dd6b20' };
    return { grade: '✨ Starting', color: '#667eea' };
  };
  
  const weeklyGrade = workoutHistory.length > 0 ? getLetterGrade(weeklyAdherence) : { grade: '--', color: '#9ca3af' };
  const overallGrade = workoutHistory.length > 0 ? getLetterGrade(overallAdherence) : { grade: '--', color: '#9ca3af' };

  const updateCurrentNote = (exerciseId: string, field: string, value: string) => {
    setCurrentNotes(prev => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] || { text: '', date: new Date().toISOString().split('T')[0] }),
        [field]: value
      }
    }));
  };
  
  const saveNote = (exerciseId: string) => {
    const note = currentNotes[exerciseId] || { text: '', date: new Date().toISOString().split('T')[0] };
    if (note.text.trim()) {
      setExerciseNotes(prev => ({
        ...prev,
        [exerciseId]: [...(prev[exerciseId] || []), note]
      }));
      setCurrentNotes(prev => ({
        ...prev,
        [exerciseId]: { text: '', date: new Date().toISOString().split('T')[0] }
      }));
      setExpandedNotes(prev => ({
        ...prev,
        [exerciseId]: false
      }));
    }
  };
  
  const toggleNoteSection = (exerciseId: string) => {
    setExpandedNotes(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const generateProgressReport = () => {
    // Get today's workout data from history (most recent workout for today)
    const todayString = new Date().toISOString().split('T')[0];
    const todaysWorkout = workoutHistory.find(workout => workout.date === todayString);
    
    // Use saved workout data if available, otherwise fall back to current state
    const completedToday = todaysWorkout ? todaysWorkout.completedExercises.length : completedExercises.length;
    const totalToday = todaysWorkout ? todaysWorkout.totalExercises : allExercises.length;
    const workoutCompletedExercises = todaysWorkout ? todaysWorkout.completedExercises : completedExercises;
    const workoutExerciseNotes = todaysWorkout ? todaysWorkout.exerciseNotes : exerciseNotes;
    const workoutExercises = todaysWorkout ? (todaysWorkout.exercises || allExercises) : allExercises;
    
    const weeklyGrade = getLetterGrade(weeklyAdherence);
    const overallGrade = getLetterGrade(overallAdherence);
    
    console.log('📊 Progress Report Debug:', {
      todaysWorkout,
      completedToday,
      totalToday,
      workoutCompletedExercises,
      workoutExerciseNotes
    });
    
    // Create detailed exercise breakdown using saved workout data
    const exerciseBreakdown = workoutExercises.map((exercise: any) => {
      const isCompleted = workoutCompletedExercises.includes(exercise.id);
      const exerciseNotesList = workoutExerciseNotes[exercise.id] || [];
      const todaysNotes = exerciseNotesList.filter((note: any) => 
        note.date === todayString
      );
      
      let exerciseDetails = `${isCompleted ? '✅' : '❌'} ${exercise.name}`;
      
      // Add exercise specifications
      if (exercise.sets) {
        if (exercise.type === 'reps' && exercise.reps) {
          exerciseDetails += ` (${exercise.sets} sets × ${exercise.reps} reps)`;
        } else if (exercise.type === 'time' && exercise.duration) {
          exerciseDetails += ` (${exercise.sets} sets × ${exercise.duration}s)`;
        }
      }
      
      // Add today's notes if any
      if (todaysNotes.length > 0) {
        const noteTexts = todaysNotes.map((note: any) => `"${note.text}"`).join(', ');
        exerciseDetails += `\n    Notes: ${noteTexts}`;
      }
      
      return exerciseDetails;
    });
    
    // Get all notes from today's session using saved workout data
    const todaysAllNotes = [];
    for (const exerciseId of Object.keys(workoutExerciseNotes)) {
      const notes = workoutExerciseNotes[exerciseId] || [];
      const todaysNotes = notes.filter((note: any) => 
        note.date === todayString
      );
      for (const note of todaysNotes) {
        const exerciseName = workoutExercises.find((ex: any) => ex.id === exerciseId)?.name || exerciseId;
        todaysAllNotes.push(`${exerciseName}: "${note.text}"`);
      }
    }
    
    // Create motivational subject line
    const getMotivationalSubject = () => {
      if (currentStreak >= 7) return `🔥 ${currentStreak}-Day Streak! Progress Update from ${userFirstName}`;
      if (currentStreak >= 3) return `💪 Building Momentum! Progress Update from ${userFirstName}`;
      if (completedToday === totalToday) return `✅ 100% Complete Today! Progress Update from ${userFirstName}`;
      return `📈 Progress Update from ${userFirstName}`;
    };
    
    // Create comprehensive email body
    const emailBody = `Hi ${user?.pt_name || 'Dr. Gauntlet'}!

Hope you're doing well! I wanted to share my detailed progress from today's session:

🎯 TODAY'S SESSION SUMMARY:
${completedToday === totalToday ? '🎉 Completed ALL prescribed exercises!' : `✅ Completed ${completedToday} out of ${totalToday} exercises (${Math.round((completedToday/totalToday)*100)}%)`}
${currentStreak > 0 ? `🔥 Current workout streak: ${currentStreak} session${currentStreak > 1 ? 's' : ''} strong!` : '🚀 Starting fresh with today\'s session!'}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

📋 DETAILED EXERCISE BREAKDOWN:
${exerciseBreakdown.join('\n')}

${todaysAllNotes.length > 0 ? `💭 TODAY'S NOTES & OBSERVATIONS:
${todaysAllNotes.map(note => `• ${note}`).join('\n')}

` : ''}📊 PROGRESS STATS:
• This Week: ${weeklyGrade.grade} (${weeklyAdherence}% adherence)
• Overall: ${overallGrade.grade} (${overallAdherence}% adherence)
• Total Sessions Completed: ${workoutHistory.length}
• Current Routine: ${currentRoutine?.name || 'Custom Routine'}

${completedToday === totalToday ? "Feeling accomplished after completing everything today! " : completedToday > 0 ? "Made good progress today and noting areas for improvement. " : "Had some challenges today but staying committed to the program. "}${currentStreak >= 7 ? "The consistency is really paying off - feeling stronger and more confident with the movements! " : currentStreak >= 3 ? "Building good momentum and starting to see improvements! " : "Focused on proper form and taking it one session at a time. "}Thanks for all your guidance and support.

Best regards,
${userFirstName}

---
Generated by Fysio
${new Date().toLocaleString()}`;

    // Create mailto link
    const subject = encodeURIComponent(getMotivationalSubject());
    const body = encodeURIComponent(emailBody);
    const ptEmail = user?.pt_email || 'DrGauntlet@gmail.com';
    
    const mailtoLink = `mailto:${ptEmail}?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
  };

  const markComplete = (exerciseId: string) => {
    if (completedExercises.includes(exerciseId)) {
      setCompletedExercises(completedExercises.filter(id => id !== exerciseId));
    } else {
      setCompletedExercises([...completedExercises, exerciseId]);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>🔄</div>
          <p style={{ color: '#4a5568', margin: 0 }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show medical disclaimer
  if (showMedicalDisclaimer && user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          maxWidth: '700px',
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{
              color: '#1a202c',
              fontSize: '2.2rem',
              fontWeight: '800',
              margin: '0 0 10px 0',
              fontFamily: '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              letterSpacing: '-0.01em',
              backgroundImage: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Important Medical Notice
            </h1>
            <p style={{ color: '#718096', margin: 0, fontSize: '1.1rem' }}>
              Please read carefully before proceeding
            </p>
          </div>

          <div style={{
            backgroundColor: '#fef2f2',
            border: '2px solid #fecaca',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '30px'
          }}>
            <h3 style={{ color: '#dc2626', margin: '0 0 16px 0', fontSize: '1.3rem' }}>
              ⚕️ Health & Safety Advisory
            </h3>
            <div style={{ color: '#374151', lineHeight: '1.6', fontSize: '15px' }}>
              <p><strong>CONSULT YOUR HEALTHCARE PROVIDER</strong> before beginning any new exercise routine, especially if you:</p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li>Have any medical conditions or injuries</li>
                <li>Are recovering from surgery or physical therapy</li>
                <li>Experience pain, dizziness, or discomfort during exercise</li>
                <li>Are pregnant or have cardiovascular conditions</li>
                <li>Are taking medications that may affect exercise capacity</li>
              </ul>
              
              <p><strong>STOP IMMEDIATELY</strong> and seek medical attention if you experience:</p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li>Chest pain or difficulty breathing</li>
                <li>Severe joint or muscle pain</li>
                <li>Dizziness, nausea, or fainting</li>
                <li>Any unusual symptoms</li>
              </ul>

              <p><strong>DISCLAIMER:</strong> Fysio is for informational purposes only and does not replace professional medical advice. The exercises provided are general recommendations and may not be suitable for your specific condition. Always follow your physical therapist's or healthcare provider's specific instructions.</p>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '30px'
          }}>
            <p style={{ margin: 0, color: '#1e40af', fontSize: '14px', textAlign: 'center' }}>
              <strong>By proceeding, you acknowledge that you understand these risks and have consulted with your healthcare provider as appropriate.</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setShowMedicalDisclaimer(false);
                setShowWelcome(true);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              ← Back to Welcome
            </button>
            <button
              onClick={() => {
                setShowMedicalDisclaimer(false);
                // Proceed to main app (basic routine)
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '16px'
              }}
            >
              ✅ I Understand - Continue to Basic Routine
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show workout history
  if (showHistory && user) {
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
          <div style={{
            position: 'absolute',
            top: '8%',
            left: '12%',
            fontSize: '6rem',
            color: '#4c1d95',
            transform: 'rotate(-10deg)',
            fontFamily: 'Arial, sans-serif'
          }}>⛹</div>
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '5%',
            fontSize: '5.5rem',
            color: '#4c1d95',
            transform: 'rotate(-8deg)',
            fontFamily: 'Arial, sans-serif'
          }}>🏃</div>
          <div style={{
            position: 'absolute',
            bottom: '15%',
            right: '8%',
            fontSize: '6rem',
            color: '#4c1d95',
            transform: 'rotate(12deg)',
            fontFamily: 'Arial, sans-serif'
          }}>🚴</div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{
              color: '#1a202c',
              fontSize: '2.5rem',
              fontWeight: '800',
              margin: 0,
              fontFamily: '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              📊 Workout History
            </h1>
            <button
              onClick={() => setShowHistory(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ← Back to Exercises
            </button>
          </div>

          {workoutHistory.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📈</div>
              <h3>No workout history yet</h3>
              <p>Complete your first workout to see your progress here!</p>
            </div>
          ) : (
            <div>
              {workoutHistory.slice().reverse().map((workout: any) => (
                <div key={workout.id} style={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, color: '#1f2937' }}>
                      {(() => {
                        // Parse date string properly to avoid timezone issues
                        const [year, month, day] = workout.date.split('-').map(Number);
                        const localDate = new Date(year, month - 1, day); // month is 0-indexed
                        return localDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        });
                      })()}
                    </h3>
                    <div style={{
                      backgroundColor: workout.completionPercentage === 100 ? '#10b981' : '#f59e0b',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {workout.completionPercentage}% Complete
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '12px', color: '#6b7280' }}>
                    <strong>{workout.completedExercises.length}</strong> of <strong>{workout.totalExercises}</strong> exercises completed
                  </div>
                  
                  {workout.notes && (
                    <div style={{
                      backgroundColor: '#f3f4f6',
                      padding: '12px',
                      borderRadius: '8px',
                      marginTop: '12px'
                    }}>
                      <strong>Notes:</strong> {workout.notes}
                    </div>
                  )}
                  
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                    Completed at {new Date(workout.completedAt).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show calendar view
  if (showCalendar && user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h1 style={{
              color: '#1a202c',
              fontSize: '2.5rem',
              fontWeight: '800',
              margin: 0,
              fontFamily: '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
              backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              📅 Workout Calendar
            </h1>
            <button
              onClick={() => {
                setShowCalendar(false);
                setWelcomeDismissed(true);
                setShowWelcome(false);
              }}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Calendar Component */}
          <WorkoutCalendar workoutHistory={workoutHistory} onUpdateWorkoutHistory={updateWorkoutHistory} />
        </div>
      </div>
    );
  }

  // Show routine builder
  if (showRoutineBuilder && user) {
    return (
      <RoutineBuilder
        onSaveRoutine={handleSaveRoutine}
        onCancel={() => setShowRoutineBuilder(false)}
      />
    );
  }

  // Show signup confirmation screen
  if (showSignupConfirmation) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          width: '100%',
          maxWidth: '450px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
          
          <h1 style={{
            color: '#2d3748',
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '20px'
          }}>
            Account Created Successfully!
          </h1>
          
          <div style={{
            backgroundColor: '#ecfdf5',
            border: '2px solid #10b981',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <p style={{
              color: '#065f46',
              fontSize: '1.1rem',
              margin: '0 0 15px 0',
              lineHeight: '1.5'
            }}>
              A confirmation email has been sent to your email address.
            </p>
            <p style={{
              color: '#047857',
              fontSize: '0.95rem',
              margin: 0,
              fontStyle: 'italic'
            }}>
              Please check your inbox and click the confirmation link to activate your account.
            </p>
          </div>
          
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '30px'
          }}>
            <p style={{
              color: '#1e40af',
              fontSize: '0.9rem',
              margin: 0
            }}>
              💡 <strong>Note:</strong> If the confirmation link doesn't work, contact your administrator to activate your account manually.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => {
                setShowSignupConfirmation(false);
                setIsLogin(false);
              }}
              style={{
                flex: '1',
                padding: '14px',
                backgroundColor: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ← Back to Sign Up
            </button>
            <button
              onClick={() => {
                setShowSignupConfirmation(false);
                setIsLogin(true);
              }}
              style={{
                flex: '2',
                padding: '14px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#5a67d8';
              }}
              onMouseOut={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#667eea';
              }}
            >
              Continue to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show welcome screen for new users
  if (showWelcome && user) {
    // Determine if user is new or returning based on their data
    const isNewUser = savedRoutines.length === 0 && workoutHistory.length === 0;
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          width: '100%',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🏋️‍♀️</div>
          
          <h1 style={{
            color: '#1a202c',
            fontSize: '3rem',
            fontWeight: '800',
            margin: '0 0 20px 0',
            fontFamily: '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '-0.01em',
            lineHeight: '0.9',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {isNewUser ? 'Welcome to FYSIO!' : `Welcome back, ${userFirstName}!`}
          </h1>
          
          <p style={{
            color: '#4a5568',
            fontSize: '1.2rem',
            lineHeight: '1.6',
            margin: '0 0 30px 0'
          }}>
            {isNewUser 
              ? 'Your personal exercise tracker designed to help you stay consistent with your physical therapy and fitness routines.'
              : 'Ready to continue your fitness journey? Choose how you\'d like to proceed with your exercises today.'
            }
          </p>
          
          {isNewUser ? (
            <div style={{
              backgroundColor: '#f7fafc',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              padding: '25px',
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              <h3 style={{
                color: '#2d3748',
                fontSize: '1.3rem',
                fontWeight: '600',
                margin: '0 0 15px 0'
              }}>
                What Fysio helps you do:
              </h3>
              <ul style={{
                color: '#4a5568',
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: 0,
                paddingLeft: '20px'
              }}>
                <li style={{ marginBottom: '8px' }}>📋 Create custom exercise routines tailored to your needs</li>
                <li style={{ marginBottom: '8px' }}>✅ Track daily exercise completion and progress</li>
                <li style={{ marginBottom: '8px' }}>📝 Add notes about how exercises feel</li>
                <li style={{ marginBottom: '8px' }}>📊 Monitor your streaks and adherence rates</li>
                <li style={{ marginBottom: '8px' }}>📤 Generate progress reports for your PT or trainer</li>
              </ul>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#f0fff4',
              border: '2px solid #9ae6b4',
              borderRadius: '12px',
              padding: '25px',
              marginBottom: '30px',
              textAlign: 'left'
            }}>
              <h3 style={{
                color: '#2d3748',
                fontSize: '1.3rem',
                fontWeight: '600',
                margin: '0 0 15px 0'
              }}>
                Your Progress Summary:
              </h3>
              <div style={{
                color: '#4a5568',
                fontSize: '1rem',
                lineHeight: '1.6',
                margin: 0
              }}>
                <p style={{ marginBottom: '8px' }}>🏋️ <strong>{savedRoutines.length}</strong> custom routine{savedRoutines.length !== 1 ? 's' : ''} created</p>
                <p style={{ marginBottom: '8px' }}>📅 <strong>{workoutHistory.length}</strong> workout{workoutHistory.length !== 1 ? 's' : ''} completed</p>
                <p style={{ marginBottom: '8px' }}>🔥 Current streak: <strong>{calculateStreak()}</strong> day{calculateStreak() !== 1 ? 's' : ''}</p>
              </div>
            </div>
          )}
          
          {isNewUser ? (
            // Buttons for new users
            <>
              <button
                onClick={() => {
                  setShowWelcome(false);
                  setShowRoutineBuilder(true);
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '15px',
                  boxShadow: '0 4px 8px rgba(72, 187, 120, 0.3)'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#38a169';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#48bb78';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0px)';
                }}
              >
                🚀 Get Started - Create Your Exercise Routine
              </button>
              
              <button
                onClick={() => {
                  setShowWelcome(false);
                  setShowMedicalDisclaimer(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#667eea';
                  (e.target as HTMLButtonElement).style.color = 'white';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.target as HTMLButtonElement).style.color = '#667eea';
                }}
              >
                Skip for now - Use Basic Strengthening & Stretching Routine
              </button>
            </>
          ) : (
            // Buttons for returning users
            <>
              <button
                onClick={() => {
                  setShowWelcome(false);
                  setWelcomeDismissed(true); // Mark welcome as dismissed
                  setDataLoaded(true); // Ensure data is marked as loaded
                  // Go directly to main app for returning users - no other screens needed
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  marginBottom: '15px',
                  boxShadow: '0 4px 8px rgba(72, 187, 120, 0.3)'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#38a169';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#48bb78';
                  (e.target as HTMLButtonElement).style.transform = 'translateY(0px)';
                }}
              >
                💪 Continue with My Routines
              </button>
              
              <button
                onClick={() => {
                  setShowWelcome(false);
                  setShowRoutineBuilder(true);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#667eea';
                  (e.target as HTMLButtonElement).style.color = 'white';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.target as HTMLButtonElement).style.color = '#667eea';
                }}
              >
                ➕ Create New Routine
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show authentication form if user is not logged in
  if (!user) {
    return (
      <AuthForm 
        onSwitchMode={() => setIsLogin(!isLogin)}
        isLogin={isLogin}
        onSignupSuccess={() => setShowSignupConfirmation(true)}
      />
    );
  }

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
        opacity: 0.4,
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
        }}>🏋️‍♂️</div>
        
        {/* Runner - middle left */}
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '5%',
          fontSize: '5.5rem',
          color: '#4c1d95',
          transform: 'rotate(-8deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🏃‍♀️</div>
        
        {/* Cyclist - bottom right */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          fontSize: '6rem',
          color: '#4c1d95',
          transform: 'rotate(12deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🚴‍♂️</div>
        
        {/* Swimmer - top right */}
        <div style={{
          position: 'absolute',
          top: '12%',
          right: '15%',
          fontSize: '5rem',
          color: '#4c1d95',
          transform: 'rotate(15deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🏊‍♀️</div>
        
        {/* Boxing - middle center */}
        <div style={{
          position: 'absolute',
          top: '25%',
          left: '45%',
          fontSize: '4.5rem',
          color: '#4c1d95',
          transform: 'rotate(5deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🥊</div>
        
        {/* Yoga - bottom left */}
        <div style={{
          position: 'absolute',
          bottom: '25%',
          left: '15%',
          fontSize: '5rem',
          color: '#4c1d95',
          transform: 'rotate(-15deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🧘‍♀️</div>
        
        {/* Tennis - middle right */}
        <div style={{
          position: 'absolute',
          top: '55%',
          right: '20%',
          fontSize: '4rem',
          color: '#4c1d95',
          transform: 'rotate(20deg)',
          fontFamily: 'Arial, sans-serif'
        }}>🎾</div>
        
        {/* Basketball - top center */}
        <div style={{
          position: 'absolute',
          top: '5%',
          left: '60%',
          fontSize: '4.5rem',
          color: '#4c1d95',
          transform: 'rotate(-12deg)',
          fontFamily: 'Arial, sans-serif'
        }}>⛹️‍♀️</div>
      </div>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        
        {/* Logout Button - Top Right */}
        <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <button
              onClick={handleLogout}
              style={{
              backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              fontWeight: '500'
              }}
            >
              Logout
            </button>
          </div>

        {/* App Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{
            color: '#1a202c',
            fontSize: '4rem',
            fontWeight: '800',
            margin: '0 0 15px 0',
            fontFamily: '"Montserrat", "Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            letterSpacing: '-0.01em',
            lineHeight: '0.9',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            FYSIO
          </h1>
          <p style={{
            color: '#718096',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Your Personal Fysio!
          </p>
        </div>

        {/* Welcome Message */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <p style={{ fontSize: '1rem', color: '#4a5568', margin: '0 0 15px 0' }}>
            Welcome back, <strong>{userFirstName}!</strong>
          </p>
        </div>

        {/* Current Routine Display */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f7fafc',
          borderRadius: '12px',
          border: '2px solid #e2e8f0'
        }}>
          <h3 style={{ 
            color: '#2d3748', 
            margin: '0 0 10px 0',
            fontSize: '1.1rem',
            fontWeight: '600'
          }}>
            📋 Current Routine
          </h3>
          <p style={{ 
            color: '#4a5568', 
            margin: '0 0 10px 0',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            {currentRoutine ? currentRoutine.name : 'Basic Strengthening & Flexibility'}
            {isEditMode && <span style={{ color: '#f56565', marginLeft: '8px', fontSize: '0.9rem' }}>(Editing)</span>}
          </p>
          
          {/* Edit Mode Toggle */}
          <div style={{ marginBottom: '10px' }}>
            <button
              onClick={toggleEditMode}
              style={{
                backgroundColor: isEditMode ? '#f56565' : '#4299e1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              {isEditMode ? '✏️ Exit Edit Mode' : '✏️ Edit Routine'}
            </button>
            <button
              onClick={() => setShowRoutineBuilder(true)}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              ➕ Create New Routine
            </button>
            {currentRoutine && (
              <button
                onClick={() => deleteRoutine(currentRoutine.id, currentRoutine.name)}
                style={{
                  backgroundColor: '#e53e3e',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                🗑️ Delete Routine
              </button>
            )}
            {isEditMode && Object.keys(tempModifications).length > 0 && (
              <button
                onClick={resetTempModifications}
                style={{
                  backgroundColor: '#718096',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                🔄 Reset Changes
              </button>
            )}
            {isEditMode && (
              <button
                onClick={addExerciseToRoutine}
                style={{
                  backgroundColor: '#48bb78',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                ➕ Add Exercise
              </button>
            )}
          </div>
          {savedRoutines.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => {
                  setCurrentRoutine(null);
                  setCompletedExercises([]);
                  // Exit edit mode when switching routines
                  setIsEditMode(false);
                  setTempModifications({});
                  // No need to reset exercise notes - keep all existing notes
                }}
                style={{
                  backgroundColor: currentRoutine ? '#e2e8f0' : '#667eea',
                  color: currentRoutine ? '#4a5568' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                Basic Routine
              </button>
              {savedRoutines.map((routine: any) => (
                <div
                  key={routine.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    marginRight: '8px',
                    marginTop: '4px'
                  }}
                >
                  <button
                    onClick={() => {
                      setCurrentRoutine(routine);
                      setCompletedExercises([]);
                      // Exit edit mode when switching routines
                      setIsEditMode(false);
                      setTempModifications({});
                      // Initialize exercise notes for custom routine (merge with existing)
                      const newExerciseNotes: {[key: string]: any[]} = { ...exerciseNotes };
                      routine.exercises.forEach((ex: any) => {
                        const exerciseId = ex.id || ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
                        if (!newExerciseNotes[exerciseId]) {
                          newExerciseNotes[exerciseId] = [];
                        }
                      });
                      setExerciseNotes(newExerciseNotes);
                    }}
                    style={{
                      backgroundColor: currentRoutine?.id === routine.id ? '#667eea' : '#e2e8f0',
                      color: currentRoutine?.id === routine.id ? 'white' : '#4a5568',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      width: '100%'
                    }}
                  >
                    {routine.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>


        {/* Share Progress Button */}
        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={generateProgressReport}
            style={{
              backgroundColor: '#48bb78',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 8px rgba(72, 187, 120, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#38a169';
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#48bb78';
              (e.target as HTMLButtonElement).style.transform = 'translateY(0px)';
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>📤</span>
            Share Progress with {user?.pt_name || 'Your PT'}
          </button>
          <p style={{
            color: '#4a5568',
            fontSize: '0.85rem',
            marginTop: '8px',
            fontStyle: 'italic'
          }}>
            Generate a report to email {user?.pt_email || 'your PT'}
          </p>
        </div>

        {/* Routine Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{
            color: '#2d3748',
            fontSize: '1.4rem',
            fontWeight: '600',
            margin: 0
          }}>
            Basic Strengthening & Stretching Routine
          </h2>
        </div>

        {/* Stats Dashboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '30px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '2px solid #10b981'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>💪</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#059669', marginBottom: '2px' }}>
              {workoutHistory.length}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Workouts
            </div>
            <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '2px' }}>
              Completed
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '2px solid #4299e1'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🔥</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2b6cb0', marginBottom: '2px' }}>
              {currentStreak}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Day Streak
            </div>
            <div style={{ fontSize: '0.7rem', color: '#4a5568', marginTop: '4px', fontStyle: 'italic' }}>
              {getStreakMessage(currentStreak)}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${weeklyGrade.color}`,
            minWidth: 0,
            maxWidth: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📊</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '700', color: weeklyGrade.color, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 4px' }}>
              {weeklyGrade.grade}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              This Week
            </div>
            <div style={{ fontSize: '0.7rem', color: '#718096', marginTop: '2px', wordWrap: 'break-word', lineHeight: '1.2' }}>
              {workoutHistory.length > 0 ? `${weeklyAdherence}%` : 'Start tracking'}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${overallGrade.color}`,
            minWidth: 0,
            maxWidth: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🏆</div>
            <div style={{ fontSize: '1.3rem', fontWeight: '700', color: overallGrade.color, marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 4px' }}>
              {overallGrade.grade}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall
            </div>
            <div style={{ fontSize: '0.7rem', color: '#718096', marginTop: '2px', wordWrap: 'break-word', lineHeight: '1.2' }}>
              {workoutHistory.length > 0 ? `${overallAdherence}%` : 'Start tracking'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '30px'
        }}>
          <button
            onClick={() => setShowCalendar(true)}
            style={{
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0px)';
              (e.target as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            📅 View Workout History
          </button>
          
          <button
            onClick={generateProgressReport}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.target as HTMLButtonElement).style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.3)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0px)';
              (e.target as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            📤 Share Progress
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span style={{ color: '#4a5568', fontWeight: '600' }}>
              Progress
            </span>
            <span style={{ color: '#667eea', fontWeight: '600' }}>
              {completedExercises.length} of {allExercises.length} completed
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#e2e8f0',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${completionPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #48bb78, #38a169)',
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          {/* Prominent warning for incomplete workout - right after progress bar */}
          {completedExercises.length < allExercises.length && completedExercises.length > 0 && (
            <div style={{
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '8px',
              padding: '12px 16px',
              marginTop: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.2)'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span style={{ color: '#92400e', fontWeight: '600', fontSize: '14px', textAlign: 'center' }}>
                {allExercises.length - completedExercises.length} exercise{allExercises.length - completedExercises.length !== 1 ? 's' : ''} remaining! 
                Remember to complete all exercises before finishing your workout.
              </span>
            </div>
          )}
        </div>

        {/* Dynamic Exercise List */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            color: '#2d3748',
            fontSize: '1.4rem',
            fontWeight: '600',
            marginBottom: '15px',
            borderLeft: '4px solid #667eea',
            paddingLeft: '12px'
          }}>
            🏃‍♀️ {currentRoutine ? currentRoutine.name : 'Basic Strengthening & Flexibility'}
          </h3>
          
          {/* Edit Mode Info */}
          {isEditMode && (
            <div style={{
              backgroundColor: '#fef5e7',
              border: '1px solid #f6ad55',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <p style={{ 
                margin: 0, 
                fontSize: '0.9rem', 
                color: '#744210',
                fontWeight: '500'
              }}>
                ✏️ <strong>Edit Mode Active:</strong> Modify exercises for today's session only. 
                Changes won't affect your saved routine.
              </p>
            </div>
          )}
          
          {allExercises.map((exercise: any) => (
            <div key={`${exercise.id}-${Object.keys(tempModifications).length}-${isEditMode ? 'edit' : 'normal'}`}>
          <ExerciseCard 
                id={exercise.id}
                emoji={getExerciseEmoji(exercise)}
                title={exercise.name}
                description={getExerciseDescription(exercise)}
                placeholder={getExercisePlaceholder(exercise)}
                isCompleted={completedExercises.includes(exercise.id)}
            onComplete={markComplete}
                isNoteExpanded={expandedNotes[exercise.id] || false}
            onToggleNote={toggleNoteSection}
                currentNote={currentNotes[exercise.id] || { text: '', date: new Date().toISOString().split('T')[0] }}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
                previousNotes={exerciseNotes[exercise.id] || []}
              />
              
              {/* Edit Controls - Only shown in edit mode */}
              {isEditMode && (
                <div style={{
                  backgroundColor: '#f7fafc',
                  border: '2px dashed #cbd5e0',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '-8px',
                  marginBottom: '16px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '600', 
                      color: '#4a5568',
                      minWidth: '60px'
                    }}>
                      ✏️ Edit:
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <label style={{ fontSize: '0.85rem', color: '#718096' }}>Sets:</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={exercise.sets}
                        onChange={(e) => updateTempExercise(exercise.id, 'sets', parseInt(e.target.value))}
                        style={{
                          width: '50px',
                          padding: '4px',
                          border: '1px solid #cbd5e0',
                          borderRadius: '4px',
                          fontSize: '0.85rem'
                        }}
          />
        </div>

                    {exercise.type === 'reps' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#718096' }}>Reps:</label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={exercise.reps}
                          onChange={(e) => updateTempExercise(exercise.id, 'reps', parseInt(e.target.value))}
                          style={{
                            width: '50px',
                            padding: '4px',
                            border: '1px solid #cbd5e0',
                            borderRadius: '4px',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#718096' }}>Duration (sec):</label>
                        <input
                          type="number"
                          min="5"
                          max="300"
                          step="5"
                          value={exercise.duration}
                          onChange={(e) => updateTempExercise(exercise.id, 'duration', parseInt(e.target.value))}
                          style={{
                            width: '60px',
                            padding: '4px',
                            border: '1px solid #cbd5e0',
                            borderRadius: '4px',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                    )}

                    {tempModifications[exercise.id] && (
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: '#f56565', 
                        fontWeight: '500' 
                      }}>
                        Modified ✓
                      </span>
                    )}
                    
                    <button
                      onClick={() => removeExerciseFromRoutine(exercise.id)}
                      style={{
                        backgroundColor: '#e53e3e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        marginLeft: 'auto'
                      }}
                      title={`Remove "${exercise.name}" from routine`}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Complete Today's Exercises Button */}
        <div style={{
          marginTop: '40px',
          padding: '24px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ color: '#374151', margin: '0 0 16px 0' }}>
            Ready to finish today's workout?
          </h3>
          <p style={{ color: '#6b7280', margin: '0 0 20px 0', fontSize: '14px' }}>
            {completedExercises.length} of {allExercises.length} exercises completed ({Math.round((completedExercises.length / allExercises.length) * 100)}%)
          </p>
          
          <button
            onClick={handleCompleteWorkout}
            style={{
              padding: '16px 32px',
              backgroundColor: completedExercises.length === allExercises.length ? '#10b981' : '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.transform = 'translateY(0px)';
            }}
          >
            {completedExercises.length === allExercises.length ? 
              '🎉 Complete Today\'s Exercises' : 
              '⚠️ Complete Today\'s Exercises'
            }
          </button>
        </div>

        {/* Completion Dialog */}
        {showCompletionDialog && (
          <>
            {/* Backdrop */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999
            }}></div>
            
            {/* Modal */}
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
              zIndex: 1000
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                {completedExercises.length === allExercises.length ? (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
                    <h2 style={{ color: '#059669', margin: '0 0 12px 0' }}>
                      Amazing Work!
                    </h2>
                    <p style={{ color: '#374151', margin: 0 }}>
                      You've completed <strong>all {allExercises.length} exercises</strong> (100%)!
                    </p>
                    <p style={{ color: '#6b7280', margin: '8px 0 0 0', fontSize: '14px' }}>
                      Add notes about how today's workout went before logging it.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{ color: '#dc2626', margin: '0 0 12px 0' }}>
                      Incomplete Workout
                    </h2>
                    <p style={{ color: '#374151', margin: 0 }}>
                      You've completed <strong>{completedExercises.length}</strong> of <strong>{allExercises.length}</strong> exercises ({Math.round((completedExercises.length / allExercises.length) * 100)}%).
                    </p>
                    <p style={{ color: '#6b7280', margin: '8px 0 0 0', fontSize: '14px' }}>
                      Add notes about why you're finishing early (optional).
                    </p>
                  </>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Workout Notes (Optional)
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g., Felt good overall, knee was a bit stiff during squats..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
          />
        </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setShowCompletionDialog(false);
                    setCompletionNotes('');
                  }}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: 'transparent',
                    color: '#6b7280',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '16px'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={completeWorkout}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: completedExercises.length === allExercises.length ? '#10b981' : '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '16px'
                  }}
                >
                  {completedExercises.length === allExercises.length ? '✅ Log Workout' : '⚠️ Log Incomplete Workout'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Completion Message */}
        {completedExercises.length === allExercises.length && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f0fff4',
            borderRadius: '12px',
            textAlign: 'center',
            border: '2px solid #48bb78'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎉</div>
            <h3 style={{ color: '#22543d', margin: '0 0 5px 0' }}>
              Great job, {user.name}!
            </h3>
            <p style={{ color: '#2f855a', margin: 0 }}>
              You've completed all your PT exercises for today!
            </p>
          </div>
        )}
        
      </div>
    </div>
  );
}

// Wrapper component with AuthProvider
function Fysio() {
  return (
    <AuthProvider>
      <PTExerciseTrackerContent />
    </AuthProvider>
  );
}

export default Fysio;

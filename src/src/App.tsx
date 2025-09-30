import { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthForm from './components/AuthForm';
import RoutineBuilder from './components/RoutineBuilder';
import ExerciseCard from './components/ExerciseCard';

// Main PT Exercise Tracker component
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
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [currentRoutine, setCurrentRoutine] = useState<any>(null);
  const [savedRoutines, setSavedRoutines] = useState<any[]>([]);
  
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

  // Check if user is new and should see welcome screen
  useEffect(() => {
    if (user) {
      try {
        // Check if user has seen welcome screen before (using localStorage for now)
        const hasSeenWelcome = localStorage.getItem(`fysio_welcome_${user.id}`);
        if (!hasSeenWelcome) {
          setShowWelcome(true);
        }
        
        // Load workout history and saved routines
        try {
          loadWorkoutHistory();
          loadSavedRoutines();
        } catch (error) {
          console.warn('Failed to load workout history or routines:', error);
        }
      } catch (error) {
        console.warn('localStorage access failed, showing welcome screen:', error);
        // If localStorage is corrupted, show welcome screen as default
        setShowWelcome(true);
      }
    }
  }, [user]);

  // Save data whenever it changes - In future, sync with Supabase database
  useEffect(() => {
    // TODO: Implement data persistence with Supabase
    // For now, data persists only during the session
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
    const completedCount = completedExercises.length;
    const totalCount = allExercises.length;
    
    if (completedCount < totalCount) {
      // Show warning dialog
      setShowCompletionDialog(true);
    } else {
      // Complete workout directly
      completeWorkout();
    }
  };

  const completeWorkout = () => {
    try {
      const workoutData = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        completedExercises: [...completedExercises],
        totalExercises: allExercises.length,
        completionPercentage: Math.round((completedExercises.length / allExercises.length) * 100),
        notes: completionNotes,
        exerciseNotes: { ...exerciseNotes },
        userId: user?.id,
        completedAt: new Date().toISOString()
      };

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
      const routines = JSON.parse(localStorage.getItem('fysio_routines') || '[]');
      const userRoutines = routines.filter((routine: any) => routine.userId === user?.id);
      setSavedRoutines(userRoutines);
      
      // If user has saved routines, use the most recent one as current
      if (userRoutines.length > 0) {
        const mostRecentRoutine = userRoutines.sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
        setCurrentRoutine(mostRecentRoutine);
      } else {
        // Use default routine if no custom routines exist
        setCurrentRoutine(null);
      }
    } catch (error) {
      console.warn('Failed to load saved routines from localStorage:', error);
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
  // Ensure custom routine exercises have proper IDs
  const allExercises = currentRoutine ? 
    currentRoutine.exercises.map((ex: any) => ({
      ...ex,
      id: ex.id || ex.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    })) : 
    basicRoutineExercises;
  const completionPercentage = (completedExercises.length / allExercises.length) * 100;
  
  // Calculate dynamic adherence based on actual workout history
  const calculateAdherence = () => {
    if (workoutHistory.length === 0) return { weekly: 0, overall: 0 };
    
    // Weekly adherence (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyWorkouts = workoutHistory.filter(workout => 
      new Date(workout.date) >= oneWeekAgo
    );
    const weeklyAdherence = workoutHistory.length > 0 ? Math.min((weeklyWorkouts.length / 7) * 100, 100) : 0;
    
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
    if (percentage >= 95) return { grade: 'A+', color: '#22543d' };
    if (percentage >= 90) return { grade: 'A', color: '#22543d' };
    if (percentage >= 85) return { grade: 'A-', color: '#2f855a' };
    if (percentage >= 80) return { grade: 'B+', color: '#38a169' };
    if (percentage >= 75) return { grade: 'B', color: '#48bb78' };
    if (percentage >= 70) return { grade: 'B-', color: '#68d391' };
    if (percentage >= 65) return { grade: 'C+', color: '#ed8936' };
    if (percentage >= 60) return { grade: 'C', color: '#dd6b20' };
    return { grade: 'F', color: '#e53e3e' };
  };
  
  const weeklyGrade = workoutHistory.length > 0 ? getLetterGrade(weeklyAdherence) : { grade: '--', color: '#9ca3af' };
  const overallGrade = workoutHistory.length > 0 ? getLetterGrade(overallAdherence) : { grade: '--', color: '#9ca3af' };

  const updateCurrentNote = (exerciseId: string, field: string, value: string) => {
    setCurrentNotes(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value
      }
    }));
  };
  
  const saveNote = (exerciseId: string) => {
    const note = currentNotes[exerciseId];
    if (note.text.trim()) {
      setExerciseNotes(prev => ({
        ...prev,
        [exerciseId]: [...prev[exerciseId], note]
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
    const completedToday = completedExercises.length;
    const totalToday = allExercises.length;
    const weeklyGrade = getLetterGrade(weeklyAdherence);
    const overallGrade = getLetterGrade(overallAdherence);
    
    // Get recent notes from completed exercises
    const recentNotes = [];
    for (const exerciseId of completedExercises) {
      const notes = exerciseNotes[exerciseId] || [];
      if (notes.length > 0) {
        const latestNote = notes[notes.length - 1];
        const exerciseName = allExercises.find(ex => ex.id === exerciseId)?.name || exerciseId;
        recentNotes.push(`${exerciseName}: "${latestNote.text}"`);
      }
    }
    
    // Create motivational subject line
    const getMotivationalSubject = () => {
      if (currentStreak >= 7) return `🔥 ${currentStreak}-Day Streak! Progress Update from ${userFirstName}`;
      if (currentStreak >= 3) return `💪 Building Momentum! Progress Update from ${userFirstName}`;
      if (completedToday === totalToday) return `✅ 100% Complete Today! Progress Update from ${userFirstName}`;
      return `📈 Progress Update from ${userFirstName}`;
    };
    
    // Create email body
    const emailBody = `Hi ${user?.pt_name || 'Dr. Gauntlet'}!

Hope you're doing well! I wanted to share my latest progress with Fysio:

🎯 TODAY'S HIGHLIGHTS:
${completedToday === totalToday ? '🎉 Completed ALL exercises today!' : `✅ Completed ${completedToday} out of ${totalToday} exercises`}
${currentStreak > 0 ? `🔥 Current streak: ${currentStreak} day${currentStreak > 1 ? 's' : ''} strong!` : '🚀 Ready to start building my streak!'}

📊 CURRENT STATS:
• This Week: ${weeklyGrade.grade} grade (${weeklyAdherence}% adherence)
• Overall: ${overallGrade.grade} grade (${overallAdherence}% adherence)
• Total Workouts Completed: ${workoutHistory.length}

${recentNotes.length > 0 ? `💭 RECENT NOTES:
${recentNotes.slice(0, 3).map(note => `• ${note}`).join('\n')}

` : ''}${currentStreak >= 7 ? "I'm really feeling the momentum and seeing improvements! " : currentStreak >= 3 ? "Starting to feel stronger and more consistent! " : completedToday === totalToday ? "Feeling great about today's session! " : "Making steady progress! "}Thanks for all your guidance and support.

Best regards,
${userFirstName}

---
Sent via Fysio - Your Personal Exercise Tracker`;

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
                      {new Date(workout.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
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
            Welcome to FYSIO!
          </h1>
          
          <p style={{
            color: '#4a5568',
            fontSize: '1.2rem',
            lineHeight: '1.6',
            margin: '0 0 30px 0'
          }}>
            Your personal exercise tracker designed to help you stay consistent with your physical therapy and fitness routines.
          </p>
          
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
          
          <button
            onClick={() => {
              try {
                localStorage.setItem(`fysio_welcome_${user.id}`, 'true');
              } catch (error) {
                console.warn('Failed to save welcome preference:', error);
              }
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
              try {
                localStorage.setItem(`fysio_welcome_${user.id}`, 'true');
              } catch (error) {
                console.warn('Failed to save welcome preference:', error);
              }
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
            Your Personal Exercise Tracker!
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
          </p>
          {savedRoutines.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => {
                  setCurrentRoutine(null);
                  setCompletedExercises([]);
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
                <button
                  key={routine.id}
                  onClick={() => {
                    setCurrentRoutine(routine);
                    setCompletedExercises([]);
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
                    marginRight: '8px',
                    marginTop: '4px'
                  }}
                >
                  {routine.name}
                </button>
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
          marginBottom: '30px'
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
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${weeklyGrade.color}`
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📊</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: weeklyGrade.color, marginBottom: '2px' }}>
              {weeklyGrade.grade}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              This Week
            </div>
            <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '2px' }}>
              {workoutHistory.length > 0 ? `${weeklyAdherence}%` : 'Complete workouts to see grade'}
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: `2px solid ${overallGrade.color}`
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🏆</div>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: overallGrade.color, marginBottom: '2px' }}>
              {overallGrade.grade}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall
            </div>
            <div style={{ fontSize: '0.75rem', color: '#718096', marginTop: '2px' }}>
              {workoutHistory.length > 0 ? `${overallAdherence}%` : 'Complete workouts to see grade'}
            </div>
          </div>
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
        </div>

        {/* Upper Body Strengthening & Flexibility */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{
            color: '#2d3748',
            fontSize: '1.4rem',
            fontWeight: '600',
            marginBottom: '15px',
            borderLeft: '4px solid #ed8936',
            paddingLeft: '12px'
          }}>
            💪 Upper Body Strengthening & Flexibility
          </h3>
          
          <ExerciseCard 
            id="neck-rolls"
            emoji="🔄"
            title="Neck Rolls"
            description="1 set of 5 repetitions"
            placeholder="Any tension or stiffness in your neck?"
            isCompleted={completedExercises.includes('neck-rolls')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['neck-rolls'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['neck-rolls']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['neck-rolls']}
          />
          
          <ExerciseCard 
            id="shoulder-shrugs"
            emoji="🤷‍♀️"
            title="Shoulder Shrugs"
            description="2 sets of 10 repetitions"
            placeholder="How did your shoulders feel? Any tightness?"
            isCompleted={completedExercises.includes('shoulder-shrugs')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['shoulder-shrugs'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['shoulder-shrugs']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['shoulder-shrugs']}
          />

          <ExerciseCard 
            id="arm-circles"
            emoji="🌀"
            title="Arm Circles"
            description="1 set of 10 repetitions"
            placeholder="Any shoulder mobility restrictions?"
            isCompleted={completedExercises.includes('arm-circles')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['arm-circles'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['arm-circles']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['arm-circles']}
          />

          <ExerciseCard 
            id="wall-push-ups"
            emoji="🏠"
            title="Wall Push-ups"
            description="2 sets of 8 repetitions"
            placeholder="How challenging was this? Any wrist or shoulder discomfort?"
            isCompleted={completedExercises.includes('wall-push-ups')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['wall-push-ups'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['wall-push-ups']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['wall-push-ups']}
          />

          <ExerciseCard 
            id="chest-stretch"
            emoji="🚪"
            title="Doorway Chest Stretch"
            description="2 sets of 30 seconds"
            placeholder="How deep could you stretch? Any tightness in chest?"
            isCompleted={completedExercises.includes('chest-stretch')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['chest-stretch'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['chest-stretch']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['chest-stretch']}
          />

          <ExerciseCard 
            id="cat-cow"
            emoji="🐱"
            title="Cat-Cow Stretch"
            description="1 set of 8 repetitions"
            placeholder="How did your spine feel? Any stiffness or improvements?"
            isCompleted={completedExercises.includes('cat-cow')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['cat-cow'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['cat-cow']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['cat-cow']}
          />
        </div>

        {/* Lower Body Strengthening & Flexibility */}
        <div>
          <h3 style={{
            color: '#2d3748',
            fontSize: '1.4rem',
            fontWeight: '600',
            marginBottom: '15px',
            borderLeft: '4px solid #9f7aea',
            paddingLeft: '12px'
          }}>
            🦵 Lower Body Strengthening & Flexibility
          </h3>
          
          <ExerciseCard 
            id="knee-to-chest"
            emoji="🤗"
            title="Knee-to-Chest Stretch"
            description="2 sets of 30 seconds each leg"
            placeholder="How did your lower back feel? Any tightness?"
            isCompleted={completedExercises.includes('knee-to-chest')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['knee-to-chest'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['knee-to-chest']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['knee-to-chest']}
          />

          <ExerciseCard 
            id="calf-raises"
            emoji="🏃‍♀️"
            title="Calf Raises"
            description="2 sets of 12 repetitions"
            placeholder="How did this exercise feel? Any calf tightness?"
            isCompleted={completedExercises.includes('calf-raises')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['calf-raises'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['calf-raises']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['calf-raises']}
          />

          <ExerciseCard 
            id="mini-squats"
            emoji="🏋️‍♀️"
            title="Mini Squats"
            description="2 sets of 10 repetitions"
            placeholder="How deep could you squat? Any knee or hip discomfort?"
            isCompleted={completedExercises.includes('mini-squats')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['mini-squats'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['mini-squats']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['mini-squats']}
          />
          
          <ExerciseCard 
            id="hamstring-stretch"
            emoji="🧘‍♀️"
            title="Seated Hamstring Stretch"
            description="2 sets of 30 seconds each leg"
            placeholder="How far could you stretch? Any tightness or improvements?"
            isCompleted={completedExercises.includes('hamstring-stretch')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['hamstring-stretch'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['hamstring-stretch']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['hamstring-stretch']}
          />
          
          <ExerciseCard 
            id="ankle-circles"
            emoji="🤸‍♀️"
            title="Ankle Circles"
            description="1 set of 10 each direction"
            placeholder="Any stiffness or range of motion changes?"
            isCompleted={completedExercises.includes('ankle-circles')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['ankle-circles'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['ankle-circles']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['ankle-circles']}
          />

          <ExerciseCard 
            id="balance-stands"
            emoji="⚖️"
            title="Single-Leg Balance"
            description="2 sets of 15 seconds each leg"
            placeholder="How was your balance? Any wobbling or improvements?"
            isCompleted={completedExercises.includes('balance-stands')}
            onComplete={markComplete}
            isNoteExpanded={expandedNotes['balance-stands'] || false}
            onToggleNote={toggleNoteSection}
            currentNote={currentNotes['balance-stands']}
            onUpdateNote={updateCurrentNote}
            onSaveNote={saveNote}
            previousNotes={exerciseNotes['balance-stands']}
          />
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
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                <h2 style={{ color: '#dc2626', margin: '0 0 12px 0' }}>
                  Incomplete Workout
                </h2>
                <p style={{ color: '#374151', margin: 0 }}>
                  You've only completed <strong>{completedExercises.length}</strong> of <strong>{allExercises.length}</strong> exercises ({Math.round((completedExercises.length / allExercises.length) * 100)}%).
                </p>
                <p style={{ color: '#6b7280', margin: '8px 0 0 0', fontSize: '14px' }}>
                  Are you sure you want to complete today's workout?
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#374151' }}>
                  Optional Notes (How did today's workout go?)
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
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '16px'
                  }}
                >
                  Yes, Complete Workout
                </button>
              </div>
            </div>
          </div>
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

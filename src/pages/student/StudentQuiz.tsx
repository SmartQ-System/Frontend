import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsApi, progressApi, categoriesApi, settingsApi } from '../../lib/api';
import { useThemeStore } from '../../stores/themeStore';
import { useTTS } from '../../hooks/useTTS';
import { FiVolume2, FiCheck, FiX, FiClock, FiLayers, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import Countdown from '../../components/Countdown';
import { Howl } from 'howler';
import { playBeep } from '../../utils/sound';

// Sounds
const correctSound = new Howl({ src: ['/assets/sounds/correct.mp3'] });
const wrongSound = new Howl({ src: ['/assets/sounds/wrong.mp3'] });

interface Question {
  id: number;
  questionText: string;
  correctAnswer: string;
  option2: string;
  option3: string;
  option4: string;
  levelId: number;
}

interface Category {
  id: number;
  name: string;
}

interface QuizConfig {
  categoryId: number | null;
  limit: number;
  mode: 'normal' | 'rapid';
}

export default function StudentQuiz() {
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const isDark = theme === 'dark';
  const { speak, isPlaying, isLoading: isTTSLoading } = useTTS();
  
  // Quiz State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);

  // Setup State
  const [showSetup, setShowSetup] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<QuizConfig>({
    categoryId: null,
    limit: 10,
    mode: 'normal'
  });
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Settings State
  const [styles, setStyles] = useState({
    backgroundColor: '',
    questionColor: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
        const res = await settingsApi.get();
        if (res.data.settings) {
            const { voiceId, backgroundColor, questionColor } = res.data.settings;
            if (voiceId) localStorage.setItem('smartq_voice_preference', voiceId);
            setStyles({ backgroundColor, questionColor });
        }
    } catch (error) {
        console.error('Failed to fetch settings', error);
    }
  };


  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data.categories);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      toast.error('فشل تحميل التصنيفات');
    }
  };

  const startQuiz = async () => {
    setLoading(true);
    try {
      const limit = config.mode === 'rapid' ? 100 : config.limit;
      const res = await questionsApi.getAll({ 
        limit, 
        categoryId: config.categoryId || undefined,
        excludeAnswered: true
      });
      
      if (res.data.questions.length === 0) {
        toast.error('لا توجد أسئلة متاحة لهذا الخيار');
        setLoading(false);
        return;
      }

      setQuestions(res.data.questions);
      setLoading(false);
      setShowSetup(false);
      setShowCountdown(true);
      
      if (config.mode === 'rapid') {
        setTimeLeft(300);
      } else {
        setTimeLeft(30);
      }
    } catch (error) {
      setLoading(false);
      toast.error('فشل بدء الاختبار');
    }
  };

  // Shuffle options when question changes
  useEffect(() => {
    if (quizStarted && questions[currentQuestionIndex]) {
        const q = questions[currentQuestionIndex];
        const options = [q.correctAnswer, q.option2, q.option3, q.option4];
        setShuffledOptions(options.sort(() => Math.random() - 0.5));
    }
  }, [currentQuestionIndex, questions, quizStarted]);

  // Timer Effect
  useEffect(() => {
    if (!quizStarted || showScore || (config.mode === 'normal' && isAnswered)) return;

    if (timeLeft <= 5 && timeLeft > 0) {
      playBeep(800, 0.1, 'square');
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      if (config.mode === 'rapid') {
        finishQuiz();
      } else {
        handleAnswer("TIMEOUT");
      }
    }
  }, [timeLeft, quizStarted, isAnswered, showScore, config.mode]);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    
    setIsAnswered(true);
    
    if (answer === "TIMEOUT") {
        wrongSound.play();
    } else {
        setSelectedAnswer(answer);
        const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
        
        if (isCorrect) {
            setScore(s => s + 1);
            triggerConfetti();
            correctSound.play();
        } else {
            wrongSound.play();
        }

        progressApi.save(questions[currentQuestionIndex].id, isCorrect).catch(console.error);
    }

    const delay = config.mode === 'rapid' ? 1000 : 2000;

    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            
            if (config.mode === 'normal') {
              setTimeLeft(30);
            }
        } else {
            finishQuiz();
        }
    }, delay); 
  };

  const finishQuiz = () => {
    setShowScore(true);
    triggerConfetti();
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // 1. Setup Screen
  if (showSetup) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-theme-main mb-8 text-center">إعدادات الاختبار</h1>
        
        <div className="card space-y-8">
          {/* Category Selection */}
          <div>
            <h3 className="text-xl text-theme-main mb-4 flex items-center gap-2">
              <FiLayers className="text-purple-500" /> اختر التصنيف
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setConfig({ ...config, categoryId: null })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  config.categoryId === null
                    ? 'border-purple-500 bg-purple-500/20 text-theme-main'
                    : isDark 
                        ? 'border-gray-600 bg-gray-700/30 text-gray-400 hover:border-gray-500'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                }`}
              >
                الكل (منوع)
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setConfig({ ...config, categoryId: cat.id })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    config.categoryId === cat.id
                      ? 'border-purple-500 bg-purple-500/20 text-theme-main'
                      : isDark 
                          ? 'border-gray-600 bg-gray-700/30 text-gray-400 hover:border-gray-500'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Selection */}
          <div>
            <h3 className="text-xl text-theme-main mb-4 flex items-center gap-2">
              <FiZap className="text-yellow-500" /> نوع التحدي
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setConfig({ ...config, mode: 'normal' })}
                className={`p-6 rounded-xl border-2 text-right transition-all group ${
                  config.mode === 'normal'
                    ? 'border-blue-500 bg-blue-500/10'
                    : isDark 
                        ? 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-lg font-bold ${config.mode==='normal'?'text-blue-500':'text-theme-body'}`}>الوضع العادي</span>
                  {config.mode === 'normal' && <FiCheck className="text-blue-500 text-xl" />}
                </div>
                <p className="text-sm text-theme-muted">30 ثانية لكل سؤال • عدد أسئلة محدد</p>
              </button>

              <button
                onClick={() => setConfig({ ...config, mode: 'rapid' })}
                className={`p-6 rounded-xl border-2 text-right transition-all group ${
                  config.mode === 'rapid'
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : isDark 
                        ? 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-lg font-bold ${config.mode==='rapid'?'text-yellow-500':'text-theme-body'}`}>تحدي السرعة ⚡</span>
                  {config.mode === 'rapid' && <FiCheck className="text-yellow-500 text-xl" />}
                </div>
                <p className="text-sm text-theme-muted">5 دقائق كاملة • أجب على أكبر عدد ممكن!</p>
              </button>
            </div>
          </div>

          {/* Question Count (Only for Normal Mode) */}
          {config.mode === 'normal' && (
            <div>
              <h3 className="text-xl text-theme-main mb-4 flex items-center gap-2">
                <FiCheck className="text-green-500" /> عدد الأسئلة
              </h3>
              <div className="flex gap-4">
                {[5, 10, 20, 30].map(count => (
                  <button
                    key={count}
                    onClick={() => setConfig({ ...config, limit: count })}
                    className={`flex-1 py-3 rounded-lg font-bold border-2 transition-all ${
                      config.limit === count
                        ? 'border-green-500 bg-green-500/20 text-theme-main'
                        : isDark 
                            ? 'border-gray-600 bg-gray-700/30 text-gray-400 hover:border-gray-500'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={startQuiz}
            disabled={loading}
            className="btn-primary w-full text-xl flex items-center justify-center gap-2"
          >
            {loading ? 'جاري التحضير...' : 'ابدأ الاختبار! 🚀'}
          </button>
        </div>
      </div>
    );
  }

  // 2. Countdown Screen
  if (showCountdown) {
    return <Countdown onComplete={() => {
      setShowCountdown(false);
      setQuizStarted(true);
    }} duration={3} />;
  }

  // 3. Score Screen
  if (showScore) {
      const percentage = Math.round((score / (config.mode === 'rapid' ? currentQuestionIndex + 1 : questions.length)) * 100);
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-theme-main animate-fade-in relative">
             <h1 className="text-5xl font-bold mb-8">انتهى الاختبار! 🎉</h1>
             
             <div className="card text-center mb-8">
               <div className="text-theme-muted mb-2">النتيجة النهائية</div>
               <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-4">
                 {percentage}%
               </div>
               <div className="text-xl">
                 أجبت على <span className="text-green-500 font-bold">{score}</span> من <span className="font-bold">{currentQuestionIndex + 1}</span> سؤال
               </div>
             </div>

             <div className="flex gap-4">
                 <button
                     onClick={() => {
                       setShowScore(false);
                       setShowSetup(true);
                       setCurrentQuestionIndex(0);
                       setScore(0);
                       setQuizStarted(false);
                     }}
                     className="btn-primary"
                 >
                     اختبار جديد
                 </button>
                 <button
                     onClick={() => navigate('/dashboard')}
                     className="btn-secondary"
                 >
                     لوحة التحكم
                 </button>
             </div>
        </div>
      );
  }

  // 4. Active Quiz Interface
  return (
    <ActiveQuiz 
       questions={questions}
       currentQuestionIndex={currentQuestionIndex}
       score={score}
       handleAnswer={handleAnswer}
       shuffledOptions={shuffledOptions}
       selectedAnswer={selectedAnswer}
       isAnswered={isAnswered}
       isPlaying={isPlaying}
       isTTSLoading={isTTSLoading}
       speak={speak}
       timeLeft={timeLeft}
       mode={config.mode}
       styles={styles}
       isDark={isDark}
    />
  );
}

// -----------------------------------------------------------------------------
// Active Quiz Component
// -----------------------------------------------------------------------------
function ActiveQuiz({ questions, currentQuestionIndex, score, handleAnswer, shuffledOptions, selectedAnswer, isAnswered, isPlaying, isTTSLoading, speak, timeLeft, mode, styles, isDark }: any) {
  const currentQuestion = questions[currentQuestionIndex];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in relative pb-24">
      {/* Header Bar */}
      <div className="card flex justify-between items-center p-4 mb-6">
        <div className="text-theme-main font-bold flex items-center gap-2">
            <span className={`px-3 py-1 rounded-lg text-sm ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {mode === 'rapid' ? `س: ${currentQuestionIndex + 1}` : `${currentQuestionIndex + 1} / ${questions.length}`}
            </span>
        </div>
        
        {/* Timer Display */}
        <div className={`text-2xl font-mono font-bold flex items-center gap-2 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
            <FiClock /> {mode === 'rapid' ? formatTime(timeLeft) : timeLeft}
        </div>

        <div className="text-green-500 font-bold bg-green-500/10 px-4 py-1 rounded-lg">
            ن: {score}
        </div>
      </div>

      {/* Progress Bar (Only for Normal Mode) */}
      {mode === 'normal' && (
        <div className="mb-8">
          <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Question Card */}
      <div className="card p-6 sm:p-10 mb-8 relative overflow-hidden">
        {/* TTS Button */}
        <button 
            onClick={() => speak(currentQuestion.questionText)}
            disabled={isTTSLoading || isPlaying}
            className={`absolute top-4 left-4 p-3 rounded-full transition-all ${
              isPlaying 
                ? 'bg-green-500 text-white animate-pulse' 
                : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
        >
            <FiVolume2 size={24} />
        </button>

        <h2 className="text-2xl sm:text-3xl text-theme-main font-bold text-center mb-12 leading-relaxed px-8"
            style={{ color: styles?.questionColor ? styles.questionColor : undefined }}
        >
            {currentQuestion.questionText}
        </h2>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {shuffledOptions.map((option: string, idx: number) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                
                let btnClass = isDark 
                  ? "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200";
                
                if (isAnswered) {
                    if (isCorrect) btnClass = "bg-green-600 text-white border-green-500 ring-2 ring-green-400";
                    else if (isSelected) btnClass = "bg-red-600 text-white border-red-500";
                    else if (option === currentQuestion.correctAnswer) btnClass = "bg-green-600/20 text-green-600 border-green-500 ring-2 ring-green-400"; 
                    else btnClass = isDark 
                        ? "bg-gray-700 text-gray-400 opacity-50"
                        : "bg-gray-100 text-gray-400 opacity-50";
                }

                return (
                    <div key={idx} className="relative group">
                        <button
                            onClick={() => handleAnswer(option)}
                            disabled={isAnswered}
                            className={`w-full p-5 rounded-xl text-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-95 border-2 ${btnClass} flex items-center justify-between shadow-lg h-full`}
                        >
                            <span className="flex-1 text-center leading-relaxed">{option}</span>
                            
                            {/* Result Icons */}
                            {isAnswered && isCorrect && <FiCheck className="text-2xl flex-shrink-0 ml-2" />}
                            {isAnswered && isSelected && !isCorrect && <FiX className="text-2xl flex-shrink-0 ml-2" />}
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                speak(option);
                            }}
                            disabled={isTTSLoading || isPlaying} 
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 ${
                              isDark 
                                ? 'bg-gray-600/50 hover:bg-gray-500 text-white'
                                : 'bg-gray-200/80 hover:bg-gray-300 text-gray-700'
                            }`}
                            title="استمع للإجابة"
                        >
                            <FiVolume2 size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
}

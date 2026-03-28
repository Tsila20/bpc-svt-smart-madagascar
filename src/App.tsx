import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Camera, 
  Loader2, 
  User, 
  Trash2, 
  ChevronLeft, 
  BookOpen, 
  HelpCircle, 
  Trophy, 
  FileText, 
  Home, 
  MessageSquare, 
  Settings,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { getSVTResponse, Message } from './services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { AppLogo, MadagascarMap } from './components/Branding';
import confetti from 'canvas-confetti';

// --- Types ---
type Screen = 'splash' | 'home' | 'chat' | 'lessons' | 'quiz' | 'exam' | 'progress';

interface Chapter {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
}

const CHAPTERS: Chapter[] = [
  {
    id: 'nervous',
    title: 'Système Nerveux',
    icon: <AlertCircle className="text-blue-500" />,
    content: "# Le Système Nerveux\n\nLe système nerveux permet à l'organisme de recevoir des informations de son environnement et d'y répondre.\n\n## 1. Les Organes\n- **Le Cerveau** : Centre des actes volontaires.\n- **La Moelle épinière** : Centre des réflexes.\n- **Les Nerfs** : Conducteurs de l'influx nerveux.\n\n## 2. Le Neurone\nC'est l'unité de base du système nerveux. Il comprend un corps cellulaire, des dendrites et un axone.\n\n## 3. L'Arc Réflexe\nC'est le trajet suivi par l'influx nerveux lors d'un acte réflexe : Récepteur -> Nerf sensitif -> Centre (Moelle) -> Nerf moteur -> Effecteur (Muscle)."
  },
  {
    id: 'eye',
    title: 'Œil et Vision',
    icon: <Camera className="text-purple-500" />,
    content: "# L'Œil et la Vision\n\nL'œil est l'organe de la vue qui capte la lumière.\n\n## 1. Structure de l'œil\nComprend la cornée, l'iris, le cristallin et la rétine.\n\n## 2. Défauts de vision\n- **Myopie** : Vision floue de loin (œil trop long). Correction : Verres divergents.\n- **Hypermétropie** : Vision floue de près (œil trop court). Correction : Verres convergents."
  },
  {
    id: 'microbes',
    title: 'Les Microbes',
    icon: <AlertCircle className="text-green-500" />,
    content: "# Les Microbes\n\nLes microbes sont des êtres vivants invisibles à l'œil nu.\n\n## 1. Types de microbes\n- **Bactéries** (ex: Bacille de Koch)\n- **Virus** (ex: VIH)\n- **Champignons**\n- **Protozoaires**\n\n## 2. Conditions de vie\nIls aiment l'humidité, la chaleur et la nourriture."
  },
  {
    id: 'immunology',
    title: 'Immunologie',
    icon: <CheckCircle2 className="text-red-500" />,
    content: "# Immunologie\n\nC'est l'étude des moyens de défense de l'organisme.\n\n## 1. Antigène\nSubstance étrangère qui provoque une réaction immunitaire.\n\n## 2. Anticorps\nProtéines produites par les lymphocytes B pour neutraliser les antigènes."
  }
];

// --- Components ---

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <AppLogo className="w-32 h-32 mb-6" />
      </motion.div>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-mad-green mb-2">BPC SVT Smart</h1>
        <p className="text-mad-red font-medium tracking-widest uppercase text-xs">Madagascar</p>
      </motion.div>
      <div className="absolute bottom-12 flex flex-col items-center">
        <div className="flex gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-mad-red animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-mad-green animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-white border border-gray-200 animate-bounce" />
        </div>
        <p className="text-gray-400 text-[10px] uppercase tracking-[0.3em]">Réviser • Comprendre • Réussir</p>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('splash');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Manao ahoana ! Je suis ton tuteur **BPC SVT Smart**. Comment puis-je t'aider aujourd'hui ? Tu peux me poser une question ou m'envoyer une photo d'exercice.",
    },
  ]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (screen === 'chat') scrollToBottom();
  }, [messages, screen]);

  const handleSend = async () => {
    if (!input.trim() && !image) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      image: image || undefined,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setImage(null);
    setIsLoading(true);

    try {
      const response = await getSVTResponse(newMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Désolé, une erreur est survenue. Vérifie ta connexion Internet." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setScreen('chat');
      };
      reader.readAsDataURL(file);
    }
  };

  const renderHeader = (title: string, showBack = true) => (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center gap-3 shadow-sm">
      {showBack && (
        <button 
          onClick={() => {
            if (selectedChapter) setSelectedChapter(null);
            else setScreen('home');
          }}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <div className="flex-1">
        <h1 className="text-lg font-bold text-mad-green leading-tight">{title}</h1>
        <p className="text-[10px] text-mad-red font-bold uppercase tracking-wider">BPC SVT Smart</p>
      </div>
      {!showBack && <AppLogo className="w-10 h-10" />}
    </header>
  );

  const renderHome = () => (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 relative">
      <MadagascarMap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs" />
      
      <div className="relative z-10 text-center space-y-2">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <AppLogo className="w-24 h-24 mx-auto mb-4" />
        </motion.div>
        <h2 className="text-2xl font-bold text-mad-green">Manao ahoana !</h2>
        <p className="text-gray-500 text-sm">Prêt pour tes révisions de SVT ?</p>
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-4">
        <button 
          onClick={() => setScreen('chat')}
          className="col-span-2 bg-mad-green text-white p-6 rounded-3xl shadow-lg flex items-center justify-between group active:scale-[0.98] transition-transform"
        >
          <div className="text-left">
            <h3 className="text-xl font-bold mb-1">Poser une question</h3>
            <p className="text-white/80 text-xs">Ton tuteur IA répond à tout</p>
          </div>
          <div className="bg-white/20 p-3 rounded-2xl">
            <MessageSquare size={32} />
          </div>
        </button>

        <button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="bg-mad-red/10 p-3 rounded-2xl text-mad-red">
            <Camera size={24} />
          </div>
          <span className="font-bold text-sm">Photo Exercice</span>
        </button>

        <button 
          onClick={() => setScreen('lessons')}
          className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500">
            <BookOpen size={24} />
          </div>
          <span className="font-bold text-sm">Leçons</span>
        </button>

        <button 
          onClick={() => setScreen('quiz')}
          className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-500">
            <HelpCircle size={24} />
          </div>
          <span className="font-bold text-sm">Quiz</span>
        </button>

        <button 
          onClick={() => setScreen('exam')}
          className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 flex flex-col items-center gap-3 active:scale-[0.98] transition-transform"
        >
          <div className="bg-orange-500/10 p-3 rounded-2xl text-orange-500">
            <FileText size={24} />
          </div>
          <span className="font-bold text-sm">Examen Blanc</span>
        </button>
      </div>

      <div className="relative z-10 bg-white/50 border border-white p-4 rounded-2xl text-center">
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
          “Ceci est un assistant d'enseignement et de révision basé sur le programme de SVT 3ème à Madagascar.”
        </p>
      </div>
    </div>
  );

  const renderChat = () => (
    <div className="flex-1 flex flex-col bg-mad-gray relative">
      <MadagascarMap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xs opacity-[0.03]" />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar relative z-10">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                msg.role === 'user' ? "bg-mad-green text-white" : "bg-white border border-gray-100"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <AppLogo className="w-6 h-6" />}
              </div>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm",
                msg.role === 'user' 
                  ? "bg-mad-green text-white rounded-tr-none" 
                  : "bg-white border border-gray-100 rounded-tl-none"
              )}>
                {msg.image && (
                  <img 
                    src={msg.image} 
                    alt="Exercice" 
                    className="rounded-xl mb-2 max-h-60 w-full object-cover border border-white/20"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className={cn(
                  "prose prose-sm max-w-none leading-relaxed",
                  msg.role === 'user' ? "text-white prose-invert" : "text-[#1A1A1A]"
                )}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
              <Loader2 className="animate-spin text-mad-green" size={16} />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-mad-green rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-mad-green rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-mad-green rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-4 bg-white border-t border-gray-100 relative z-10">
        {image && (
          <div className="relative inline-block mb-3">
            <img src={image} alt="Preview" className="h-20 w-20 object-cover rounded-xl border-2 border-mad-green shadow-md" />
            <button 
              onClick={() => setImage(null)}
              className="absolute -top-2 -right-2 bg-mad-red text-white rounded-full p-1 shadow-lg"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <div className="flex items-end gap-2 bg-mad-gray rounded-2xl p-2 border border-gray-100">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-mad-green hover:bg-white rounded-xl transition-all"
          >
            <Camera size={22} />
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pose ta question..."
            className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-sm max-h-32"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !image)}
            className={cn(
              "p-3 rounded-xl transition-all flex items-center justify-center shadow-md",
              isLoading || (!input.trim() && !image)
                ? "bg-gray-200 text-gray-400"
                : "bg-mad-green text-white"
            )}
          >
            <Send size={20} />
          </button>
        </div>
      </footer>
    </div>
  );

  const renderLessons = () => (
    <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
      {selectedChapter ? (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="prose prose-sm max-w-none bg-white p-6 rounded-3xl shadow-soft border border-gray-100">
            <ReactMarkdown>{selectedChapter.content}</ReactMarkdown>
          </div>
          <button 
            onClick={() => setScreen('chat')}
            className="w-full bg-mad-green text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <MessageSquare size={20} />
            Poser une question sur ce cours
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setSelectedChapter(ch)}
              className="bg-white p-5 rounded-3xl shadow-soft border border-gray-100 flex items-center gap-4 text-left active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
                {ch.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800">{ch.title}</h3>
                <p className="text-xs text-gray-400">Clique pour lire le cours</p>
              </div>
              <ArrowRight size={18} className="text-gray-300" />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuiz = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="bg-purple-500/10 p-8 rounded-full text-purple-500 mb-4">
        <Trophy size={64} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Mode Quiz Interactif</h2>
      <p className="text-gray-500">Teste tes connaissances avec des questions rapides sur tout le programme.</p>
      <button 
        onClick={() => {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }}
        className="bg-purple-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
      >
        Commencer le Quiz
      </button>
      <p className="text-xs text-gray-400 italic">Bientôt disponible : Classement national</p>
    </div>
  );

  const renderExam = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="bg-orange-500/10 p-8 rounded-full text-orange-500 mb-4">
        <FileText size={64} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Examen Blanc BPC</h2>
      <p className="text-gray-500">Mets-toi en condition réelle avec un sujet complet de SVT chronométré.</p>
      <button className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">
        Lancer l'Examen
      </button>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        <div className="bg-white p-3 rounded-xl border border-gray-100">
          <span className="block text-xl font-bold text-mad-green">45</span>
          <span className="text-[10px] text-gray-400 uppercase">Minutes</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-gray-100">
          <span className="block text-xl font-bold text-mad-red">20</span>
          <span className="text-[10px] text-gray-400 uppercase">Points</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-mad-gray shadow-2xl relative overflow-hidden">
      <AnimatePresence>
        {screen === 'splash' && <SplashScreen onComplete={() => setScreen('home')} />}
      </AnimatePresence>

      {screen !== 'splash' && (
        <>
          {screen === 'home' ? renderHeader("BPC SVT Smart", false) : 
           screen === 'chat' ? renderHeader("Tuteur IA") :
           screen === 'lessons' ? renderHeader(selectedChapter ? selectedChapter.title : "Leçons SVT") :
           screen === 'quiz' ? renderHeader("Quiz") :
           screen === 'exam' ? renderHeader("Examen Blanc") : null}

          <main className="flex-1 flex flex-col overflow-hidden">
            {screen === 'home' && renderHome()}
            {screen === 'chat' && renderChat()}
            {screen === 'lessons' && renderLessons()}
            {screen === 'quiz' && renderQuiz()}
            {screen === 'exam' && renderExam()}
          </main>

          {/* Bottom Navigation */}
          <nav className="bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center relative z-20">
            <button 
              onClick={() => setScreen('home')}
              className={cn("p-2 rounded-xl transition-all", screen === 'home' ? "text-mad-green bg-mad-green/10" : "text-gray-400")}
            >
              <Home size={24} />
            </button>
            <button 
              onClick={() => setScreen('chat')}
              className={cn("p-2 rounded-xl transition-all", screen === 'chat' ? "text-mad-green bg-mad-green/10" : "text-gray-400")}
            >
              <MessageSquare size={24} />
            </button>
            <button 
              onClick={() => setScreen('lessons')}
              className={cn("p-2 rounded-xl transition-all", screen === 'lessons' ? "text-mad-green bg-mad-green/10" : "text-gray-400")}
            >
              <BookOpen size={24} />
            </button>
            <button 
              onClick={() => setScreen('progress')}
              className={cn("p-2 rounded-xl transition-all", screen === 'progress' ? "text-mad-green bg-mad-green/10" : "text-gray-400")}
            >
              <Trophy size={24} />
            </button>
          </nav>
        </>
      )}

      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
    </div>
  );
}

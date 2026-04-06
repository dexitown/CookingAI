import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChefHat, 
  Search, 
  Plus, 
  X, 
  Clock, 
  Users, 
  Flame, 
  MessageCircle, 
  ArrowRight, 
  UtensilsCrossed,
  Sparkles,
  ChevronRight,
  BookOpen,
  Trash2
} from 'lucide-react';
import { Recipe, ChatMessage } from './types';
import { generateRecipe, getCookingAdvice } from './services/gemini';

export default function App() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputIngredient, setInputIngredient] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const addIngredient = () => {
    if (inputIngredient.trim() && !ingredients.includes(inputIngredient.trim())) {
      setIngredients([...ingredients, inputIngredient.trim()]);
      setInputIngredient('');
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    setIsGenerating(true);
    try {
      const newRecipe = await generateRecipe(ingredients, cuisine);
      setRecipes([newRecipe, ...recipes]);
      setSelectedRecipe(newRecipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatMessages([...chatMessages, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const response = await getCookingAdvice(chatInput, chatMessages);
      setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error("Error in chat:", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass border-b border-brand-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-2 rounded-xl">
            <ChefHat className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-950">Culina AI</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <button className="text-sm font-medium hover:text-accent transition-colors">Descubrir</button>
          <button className="text-sm font-medium hover:text-accent transition-colors">Mis Recetas</button>
          <button className="text-sm font-medium hover:text-accent transition-colors">Técnicas</button>
        </nav>
        <button 
          onClick={() => setShowChat(!showChat)}
          className="flex items-center gap-2 bg-brand-200 hover:bg-brand-300 px-4 py-2 rounded-full text-sm font-medium transition-all"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Asistente Chef</span>
        </button>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-8 rounded-[32px] card-shadow space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold">¿Qué tienes hoy?</h2>
              <p className="text-brand-700 text-sm">Dime qué ingredientes tienes y crearé algo especial para ti.</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    value={inputIngredient}
                    onChange={(e) => setInputIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addIngredient()}
                    placeholder="Ej: Pollo, Tomate, Ajo..."
                    className="w-full bg-brand-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                  />
                </div>
                <button 
                  onClick={addIngredient}
                  className="bg-accent text-white p-3 rounded-2xl hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {ingredients.map((ing) => (
                    <motion.span 
                      key={ing}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="bg-brand-200 text-brand-900 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                    >
                      {ing}
                      <button onClick={() => removeIngredient(ing)} className="hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-brand-600">Estilo de Cocina (Opcional)</label>
              <select 
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full bg-brand-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20 outline-none appearance-none"
              >
                <option value="">Cualquier estilo</option>
                <option value="Mediterránea">Mediterránea</option>
                <option value="Asiática">Asiática</option>
                <option value="Mexicana">Mexicana</option>
                <option value="Italiana">Italiana</option>
                <option value="Saludable">Saludable / Fitness</option>
              </select>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={ingredients.length === 0 || isGenerating}
              className="w-full bg-brand-950 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 animate-pulse" />
                  Cocinando receta...
                </>
              ) : (
                <>
                  <UtensilsCrossed className="w-5 h-5" />
                  Generar Receta
                </>
              )}
            </button>
          </section>

          {/* Trending / Tips Section */}
          <section className="hidden lg:block space-y-4">
            <h3 className="text-xl font-semibold px-2">Consejos del Chef</h3>
            <div className="bg-brand-200/50 p-6 rounded-[32px] border border-brand-300/50 space-y-4">
              <div className="flex gap-4">
                <div className="bg-white p-2 rounded-xl h-fit">
                  <Flame className="text-orange-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Sellar la carne</h4>
                  <p className="text-xs text-brand-700 mt-1">Asegúrate de que la sartén esté muy caliente para obtener esa costra deliciosa.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white p-2 rounded-xl h-fit">
                  <Clock className="text-blue-500 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Mise en place</h4>
                  <p className="text-xs text-brand-700 mt-1">Prepara todos tus ingredientes antes de empezar a cocinar para evitar estrés.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-8">
          {recipes.length === 0 && !isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20">
              <div className="bg-brand-200 p-8 rounded-full">
                <BookOpen className="w-12 h-12 text-brand-400" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-semibold">Tu recetario está vacío</h3>
                <p className="text-brand-600">Agrega algunos ingredientes a la izquierda para empezar a crear platos increíbles.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {recipes.map((recipe) => (
                  <motion.div 
                    key={recipe.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-[32px] overflow-hidden card-shadow group cursor-pointer"
                    onClick={() => setSelectedRecipe(recipe)}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {recipe.cuisine}
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold leading-tight group-hover:text-accent transition-colors">{recipe.title}</h3>
                        <div className="flex items-center gap-1 text-xs font-medium text-brand-500">
                          <Clock className="w-3 h-3" />
                          {recipe.cookTime}
                        </div>
                      </div>
                      <p className="text-sm text-brand-700 line-clamp-2">{recipe.description}</p>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1 text-xs text-brand-500">
                          <Users className="w-3 h-3" />
                          {recipe.servings} pers.
                        </div>
                        <div className="flex items-center gap-1 text-xs text-brand-500">
                          <Flame className="w-3 h-3" />
                          {recipe.difficulty}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* Recipe Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecipe(null)}
              className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-brand-50 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[40px] shadow-2xl flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setSelectedRecipe(null)}
                className="absolute top-6 right-6 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="md:w-2/5 h-64 md:h-auto relative">
                <img 
                  src={selectedRecipe.image} 
                  alt={selectedRecipe.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="md:w-3/5 p-8 md:p-12 overflow-y-auto space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-accent font-semibold text-sm uppercase tracking-widest">
                    <UtensilsCrossed className="w-4 h-4" />
                    {selectedRecipe.cuisine}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight">{selectedRecipe.title}</h2>
                  <div className="flex flex-wrap gap-6 text-sm text-brand-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Prep: {selectedRecipe.prepTime} | Cocción: {selectedRecipe.cookTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{selectedRecipe.servings} porciones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      <span>{selectedRecipe.difficulty}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-bold border-b border-brand-200 pb-2">Ingredientes</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-3 text-brand-800">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                        <span className="text-sm">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold border-b border-brand-200 pb-2">Instrucciones</h3>
                  <div className="space-y-6">
                    {selectedRecipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-6">
                        <span className="text-4xl font-serif font-bold text-brand-200 leading-none">{String(i + 1).padStart(2, '0')}</span>
                        <p className="text-brand-800 leading-relaxed pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Assistant Drawer */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 w-full max-w-md h-screen bg-white shadow-2xl flex flex-col border-l border-brand-200"
          >
            <div className="p-6 border-b border-brand-100 flex items-center justify-between bg-brand-50">
              <div className="flex items-center gap-3">
                <div className="bg-accent p-2 rounded-xl">
                  <ChefHat className="text-white w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold">Asistente Culina</h3>
                  <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    En línea
                  </p>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="p-2 hover:bg-brand-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-50/30">
              {chatMessages.length === 0 && (
                <div className="text-center py-10 space-y-4">
                  <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Sparkles className="text-brand-400 w-8 h-8" />
                  </div>
                  <p className="text-sm text-brand-600 px-10">
                    Hola! Soy tu asistente de cocina. Pregúntame sobre técnicas, sustituciones o consejos para tus platos.
                  </p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-brand-950 text-white rounded-tr-none' 
                      : 'bg-white text-brand-900 rounded-tl-none shadow-sm border border-brand-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-brand-100 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-300 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-brand-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-brand-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 border-t border-brand-100 bg-white">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Escribe tu duda..."
                  className="flex-1 bg-brand-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20 outline-none"
                />
                <button 
                  onClick={handleChatSend}
                  disabled={!chatInput.trim() || isChatLoading}
                  className="bg-accent text-white p-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-brand-950 text-brand-200 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <ChefHat className="w-6 h-6" />
              <span className="text-xl font-bold">Culina AI</span>
            </div>
            <p className="text-sm text-brand-400 max-w-xs">
              Redefiniendo la cocina casera con inteligencia artificial. Tu próximo plato estrella empieza aquí.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">App</h4>
              <ul className="text-sm space-y-2 text-brand-400">
                <li><a href="#" className="hover:text-white transition-colors">Generador</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Asistente</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Recetario</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Legal</h4>
              <ul className="text-sm space-y-2 text-brand-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Newsletter</h4>
            <p className="text-sm text-brand-400">Recibe consejos semanales y nuevas recetas.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Email" className="bg-brand-900 border-none rounded-lg px-4 py-2 text-sm w-full outline-none focus:ring-1 focus:ring-brand-700" />
              <button className="bg-white text-brand-950 px-4 py-2 rounded-lg text-sm font-bold">Unirse</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-brand-900 text-center text-xs text-brand-600">
          © 2026 Culina AI. Hecho con pasión por la gastronomía.
        </div>
      </footer>
    </div>
  );
}


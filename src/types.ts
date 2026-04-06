export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Fácil' | 'Media' | 'Difícil';
  cuisine: string;
  calories?: number;
  image?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

import OpenAI from 'openai';
import { Category, Action, Goal } from '../types';

let openai: OpenAI | null = null;

// Initialize OpenAI client only if API key is available
try {
  if (import.meta.env.VITE_OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error);
}

interface TaskSuggestion {
  title: string;
  category: string;
  type: 'action' | 'goal';
  target?: number;
  deadline?: string;
}

// Smart suggestions based on time of day and user patterns
const getContextualSuggestions = (
  categories: Category[],
  recentActions: Action[],
  type: 'action' | 'goal'
): TaskSuggestion[] => {
  const hour = new Date().getHours();
  const suggestions: TaskSuggestion[] = [];

  // Find category IDs
  const exerciseCategory = categories.find(c => 
    c.name.toLowerCase().includes('exercise') || 
    c.name.toLowerCase().includes('fitness'))?.id;
  
  const learningCategory = categories.find(c => 
    c.name.toLowerCase().includes('learning') || 
    c.name.toLowerCase().includes('study'))?.id;
  
  const mindfulnessCategory = categories.find(c => 
    c.name.toLowerCase().includes('mindful') || 
    c.name.toLowerCase().includes('meditation'))?.id;

  // Morning suggestions (5 AM - 11 AM)
  if (hour >= 5 && hour < 11) {
    if (exerciseCategory) {
      suggestions.push({
        title: 'Morning workout routine',
        category: exerciseCategory,
        type: 'action'
      });
    }
    if (mindfulnessCategory) {
      suggestions.push({
        title: 'Morning meditation session',
        category: mindfulnessCategory,
        type: 'action'
      });
    }
  }
  
  // Afternoon suggestions (11 AM - 5 PM)
  else if (hour >= 11 && hour < 17) {
    if (learningCategory) {
      suggestions.push({
        title: 'Study session for skill improvement',
        category: learningCategory,
        type: 'action'
      });
    }
    if (exerciseCategory) {
      suggestions.push({
        title: 'Quick stretching break',
        category: exerciseCategory,
        type: 'action'
      });
    }
  }
  
  // Evening suggestions (5 PM - 10 PM)
  else if (hour >= 17 && hour < 22) {
    if (mindfulnessCategory) {
      suggestions.push({
        title: 'Evening relaxation routine',
        category: mindfulnessCategory,
        type: 'action'
      });
    }
    if (exerciseCategory) {
      suggestions.push({
        title: 'Light evening yoga',
        category: exerciseCategory,
        type: 'action'
      });
    }
  }

  // Add goal suggestions if requested
  if (type === 'goal') {
    if (exerciseCategory) {
      suggestions.push({
        title: 'Complete weekly exercise routine',
        category: exerciseCategory,
        type: 'goal',
        target: 3,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    if (learningCategory) {
      suggestions.push({
        title: 'Finish online course module',
        category: learningCategory,
        type: 'goal',
        target: 5,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
  }

  // Analyze patterns from recent actions
  const categoryFrequency = recentActions.reduce((acc, action) => {
    acc[action.category] = (acc[action.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Suggest more of what the user frequently does
  const mostFrequentCategory = Object.entries(categoryFrequency)
    .sort(([, a], [, b]) => b - a)[0]?.[0];

  if (mostFrequentCategory) {
    const category = categories.find(c => c.id === mostFrequentCategory);
    if (category) {
      suggestions.push({
        title: `Continue your progress in ${category.name}`,
        category: mostFrequentCategory,
        type: type,
        ...(type === 'goal' && {
          target: 5,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      });
    }
  }

  return suggestions;
};

export async function generateTaskSuggestions(
  categories: Category[],
  recentActions: Action[],
  currentGoals: Goal[]
): Promise<TaskSuggestion[]> {
  // If offline or no OpenAI client, return contextual suggestions
  if (!openai || !navigator.onLine) {
    const type = currentGoals.length > 0 ? 'action' : 'goal';
    return getContextualSuggestions(categories, recentActions, type);
  }

  try {
    const prompt = `As an AI assistant, analyze these recent activities and goals to suggest 3 new personalized tasks or goals.
    
Current categories: ${categories.map(c => c.name).join(', ')}
Recent actions: ${recentActions.slice(0, 5).map(a => a.title).join(', ')}
Current goals: ${currentGoals.map(g => g.title).join(', ')}
Time of day: ${new Date().getHours()}:${new Date().getMinutes()}

Consider:
1. Time of day appropriateness
2. User's activity patterns
3. Balance between categories
4. Progressive difficulty
5. Realistic deadlines`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "system",
        content: "You are a productivity assistant that suggests personalized tasks and goals. Respond in JSON format with an array of suggestions, each containing title, category (matching existing categories), type (action/goal), and optional target/deadline."
      }, {
        role: "user",
        content: prompt
      }],
      temperature: 0.7,
      max_tokens: 500
    });

    const suggestions = JSON.parse(response.choices[0].message.content || '[]');
    return suggestions.map((suggestion: any) => ({
      ...suggestion,
      category: categories.find(c => 
        c.name.toLowerCase() === suggestion.category.toLowerCase()
      )?.id || categories[0].id
    }));
  } catch (error) {
    console.error('Error generating AI suggestions:', error);
    // Fallback to contextual suggestions on error
    const type = currentGoals.length > 0 ? 'action' : 'goal';
    return getContextualSuggestions(categories, recentActions, type);
  }
}
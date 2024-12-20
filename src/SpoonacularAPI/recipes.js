import axios from 'axios';
const spoonacularApiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;

export const searchRecipe = async(argumentMap, numberOfRecipes) => {

  // Obtain Map Information 

  // Required Arguments
  const query = argumentMap.get('query');

  // Optional Arguments
  var includeIngredients = argumentMap.get('includeIngredients'); // Comma separated List
  var excludeIngredients = argumentMap.get('excludeIngredients'); // Comma separated List
  var intolerances = argumentMap.get('intolerances'); // Comma separated List
  var diet = argumentMap.get('diet'); // Comma separated List
  var addRecipeInformation = argumentMap.get('addRecipeInformation'); // True or False

  
  if(intolerances == undefined){
    intolerances = '';
  } 
  //intolerances ??= ''; //IF SHIT BREAKS UNCOMMENT - EM TOLD ME TO DO THIS

  if(includeIngredients == undefined){
    includeIngredients = '';
  }

  if(excludeIngredients == undefined){
    excludeIngredients = '';
  }

  try {
    const url = "https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch";
    const response = await axios.get(url, {
      headers: {
          'x-rapidapi-key': spoonacularApiKey,
          'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
      },
      params: {
          query: query,
          intolerances: intolerances,
          diet: diet,
          includeIngredients: includeIngredients,
          excludeIngredients: excludeIngredients,
          addRecipeInformation: 'true',
          number: numberOfRecipes,
        },
    }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
}

export const getRecipeInformation = async(recipeID, includeRecipeInformation) => {
  try {
    const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeID}/information`;
    const response = await axios.get(url, {
      headers: {
          'x-rapidapi-key': spoonacularApiKey,
          'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
      },
      params: {
          includeNutrition: includeRecipeInformation,
        },
    }
    );
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
}

  

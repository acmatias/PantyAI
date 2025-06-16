import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VisionResponse {
  responses: Array<{
    labelAnnotations?: Array<{
      description: string
      score: number
      topicality: number
    }>
    localizedObjectAnnotations?: Array<{
      name: string
      score: number
    }>
  }>
}

const FOOD_CATEGORIES = {
  'Fruit': ['apple', 'banana', 'orange', 'grape', 'berry', 'lemon', 'lime', 'peach', 'pear', 'cherry'],
  'Vegetables': ['carrot', 'broccoli', 'spinach', 'lettuce', 'tomato', 'cucumber', 'pepper', 'onion', 'garlic', 'potato'],
  'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream'],
  'Meat': ['chicken', 'beef', 'pork', 'fish', 'turkey', 'ham', 'bacon'],
  'Bakery': ['bread', 'bagel', 'muffin', 'croissant', 'roll'],
  'Pantry': ['rice', 'pasta', 'cereal', 'flour', 'sugar', 'salt', 'oil', 'vinegar', 'sauce', 'spice'],
  'Beverages': ['juice', 'soda', 'water', 'coffee', 'tea'],
  'Snacks': ['chips', 'crackers', 'nuts', 'cookies', 'candy'],
  'Frozen': ['ice cream', 'frozen'],
  'Canned': ['can', 'jar', 'bottle']
}

function categorizeItem(itemName: string): string {
  const lowerName = itemName.toLowerCase()
  
  for (const [category, keywords] of Object.entries(FOOD_CATEGORIES)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category
    }
  }
  
  return 'Other'
}

function filterFoodItems(labels: Array<{ description: string, score: number }>): Array<{ name: string, confidence: number, category: string }> {
  const foodKeywords = Object.values(FOOD_CATEGORIES).flat()
  const generalFoodTerms = ['food', 'ingredient', 'produce', 'grocery', 'edible', 'consumable']
  
  return labels
    .filter(label => {
      const name = label.description.toLowerCase()
      return foodKeywords.some(keyword => name.includes(keyword)) || 
             generalFoodTerms.some(term => name.includes(term)) ||
             label.score > 0.8 // High confidence items
    })
    .filter(label => label.score > 0.5) // Minimum confidence threshold
    .map(label => ({
      name: label.description,
      confidence: label.score,
      category: categorizeItem(label.description)
    }))
    .slice(0, 10) // Limit to top 10 items
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image data provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get Google Cloud Vision API key from environment
    const apiKey = Deno.env.get('GOOGLE_CLOUD_VISION_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Cloud Vision API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Call Google Cloud Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: image
              },
              features: [
                {
                  type: 'LABEL_DETECTION',
                  maxResults: 20
                },
                {
                  type: 'OBJECT_LOCALIZATION',
                  maxResults: 10
                }
              ]
            }
          ]
        })
      }
    )

    if (!visionResponse.ok) {
      throw new Error(`Vision API error: ${visionResponse.statusText}`)
    }

    const visionData: VisionResponse = await visionResponse.json()
    const response = visionData.responses[0]

    // Combine label and object annotations
    const allDetections: Array<{ description: string, score: number }> = []
    
    if (response.labelAnnotations) {
      allDetections.push(...response.labelAnnotations.map(label => ({
        description: label.description,
        score: label.score
      })))
    }
    
    if (response.localizedObjectAnnotations) {
      allDetections.push(...response.localizedObjectAnnotations.map(obj => ({
        description: obj.name,
        score: obj.score
      })))
    }

    // Filter and format food items
    const foodItems = filterFoodItems(allDetections)
    
    // Convert to PantryItem format
    const pantryItems = foodItems.map((item, index) => ({
      id: (Date.now() + index).toString(),
      name: item.name,
      confidence: item.confidence,
      category: item.category,
      quantity: 1
    }))

    return new Response(
      JSON.stringify({ 
        items: pantryItems,
        totalDetections: allDetections.length 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error analyzing image:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze image',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
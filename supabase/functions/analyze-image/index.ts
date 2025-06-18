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
    textAnnotations?: Array<{
      description: string
      boundingPoly?: {
        vertices: Array<{ x: number, y: number }>
      }
    }>
    fullTextAnnotation?: {
      text: string
    }
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

function extractFoodItemsFromText(text: string): Array<{ name: string, confidence: number, category: string, source: string }> {
  if (!text) return []
  
  const foodItems: Array<{ name: string, confidence: number, category: string, source: string }> = []
  const words = text.toLowerCase().split(/\s+/)
  const allFoodKeywords = Object.values(FOOD_CATEGORIES).flat()
  
  // Look for food keywords in the detected text
  for (const word of words) {
    for (const keyword of allFoodKeywords) {
      if (word.includes(keyword) || keyword.includes(word)) {
        // Capitalize first letter
        const itemName = word.charAt(0).toUpperCase() + word.slice(1)
        foodItems.push({
          name: itemName,
          confidence: 0.8, // High confidence for text-based detection
          category: categorizeItem(word),
          source: 'text'
        })
        break
      }
    }
  }
  
  // Remove duplicates
  const uniqueItems = foodItems.filter((item, index, self) => 
    index === self.findIndex(t => t.name.toLowerCase() === item.name.toLowerCase())
  )
  
  return uniqueItems.slice(0, 5) // Limit to top 5 text-based items
}

function filterFoodItems(labels: Array<{ description: string, score: number }>): Array<{ name: string, confidence: number, category: string, source: string }> {
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
      category: categorizeItem(label.description),
      source: 'vision'
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

    // Call Google Cloud Vision API with text detection
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
                },
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 50
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

    // Extract detected text
    let detectedText = ''
    if (response.textAnnotations && response.textAnnotations.length > 0) {
      // The first textAnnotation contains the full detected text
      detectedText = response.textAnnotations[0].description || ''
    }

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

    // Filter and format food items from vision detection
    const visionFoodItems = filterFoodItems(allDetections)
    
    // Extract food items from detected text
    const textFoodItems = extractFoodItemsFromText(detectedText)
    
    // Combine both sources of food items
    const allFoodItems = [...visionFoodItems, ...textFoodItems]
    
    // Remove duplicates by name (prioritize higher confidence)
    const uniqueFoodItems = allFoodItems.reduce((acc, current) => {
      const existingIndex = acc.findIndex(item => 
        item.name.toLowerCase() === current.name.toLowerCase()
      )
      
      if (existingIndex >= 0) {
        // Keep the one with higher confidence
        if (current.confidence > acc[existingIndex].confidence) {
          acc[existingIndex] = current
        }
      } else {
        acc.push(current)
      }
      
      return acc
    }, [] as Array<{ name: string, confidence: number, category: string, source: string }>)
    
    // Convert to PantryItem format
    const pantryItems = uniqueFoodItems.map((item, index) => ({
      id: (Date.now() + index).toString(),
      name: item.name,
      confidence: item.confidence,
      category: item.category,
      quantity: 1,
      source: item.source
    }))

    // Parse detected text for additional information
    const textLines = detectedText.split('\n').filter(line => line.trim().length > 0)
    const brandInfo = textLines.filter(line => 
      line.length > 2 && 
      line.length < 30 && 
      /^[A-Z][a-zA-Z\s&'-]+$/.test(line.trim())
    )

    return new Response(
      JSON.stringify({ 
        items: pantryItems,
        detectedText: detectedText,
        textLines: textLines,
        brandInfo: brandInfo,
        totalDetections: allDetections.length,
        analysis: {
          visionItems: visionFoodItems.length,
          textItems: textFoodItems.length,
          totalUniqueItems: pantryItems.length
        }
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
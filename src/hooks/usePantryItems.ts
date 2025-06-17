import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PantryItem } from '../types';

export const usePantryItems = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savePantryItems = async (items: PantryItem[]): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be signed in to save pantry items');
      }

      // Filter out items with invalid data
      const validItems = items.filter(item => 
        item.name && 
        item.name.trim() !== '' && 
        item.name !== 'No food items detected'
      );

      if (validItems.length === 0) {
        throw new Error('No valid items to save');
      }

      // Map PantryItem to database schema
      const pantryItemsToInsert = validItems.map(item => ({
        user_id: user.id,
        name: item.name.trim(),
        quantity: item.quantity || 1,
        category: item.category || 'Other',
        confidence_score: item.confidence,
        expiry_date: item.expiryDate || null,
      }));

      // Insert items into database
      const { error: insertError } = await supabase
        .from('pantry_items')
        .insert(pantryItemsToInsert);

      if (insertError) {
        throw insertError;
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save pantry items';
      setError(errorMessage);
      console.error('Error saving pantry items:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const getPantryItems = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('You must be signed in to view pantry items');
      }

      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch pantry items';
      setError(errorMessage);
      console.error('Error fetching pantry items:', err);
      return [];
    }
  };

  return {
    savePantryItems,
    getPantryItems,
    isSaving,
    error,
  };
};
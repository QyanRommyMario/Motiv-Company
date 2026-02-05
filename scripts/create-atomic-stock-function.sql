/**
 * Atomic Stock Decrement Function
 * Prevents race condition when multiple payments are confirmed simultaneously
 * 
 * Usage from application:
 * supabase.rpc('atomic_decrement_stock', { variant_id_param: 'uuid', quantity_param: 5 })
 */

-- Drop existing function if exists (both UUID and TEXT versions)
DROP FUNCTION IF EXISTS atomic_decrement_stock(uuid, integer);
DROP FUNCTION IF EXISTS atomic_decrement_stock(text, integer);

-- Create atomic stock decrement function
CREATE OR REPLACE FUNCTION atomic_decrement_stock(
  variant_id_param TEXT,  -- Changed from UUID to TEXT
  quantity_param INTEGER
)
RETURNS TABLE(
  success BOOLEAN,
  old_stock INTEGER,
  new_stock INTEGER,
  message TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  current_stock INTEGER;
  updated_stock INTEGER;
BEGIN
  -- Lock the row for update (prevents concurrent modifications)
  SELECT stock INTO current_stock
  FROM "ProductVariant"
  WHERE id = variant_id_param
  FOR UPDATE;

  -- Check if variant exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'Variant not found';
    RETURN;
  END IF;

  -- Check if stock is sufficient
  IF current_stock < quantity_param THEN
    RETURN QUERY SELECT 
      FALSE, 
      current_stock, 
      current_stock, 
      format('Insufficient stock. Available: %s, Required: %s', current_stock, quantity_param);
    RETURN;
  END IF;

  -- Perform atomic update
  UPDATE "ProductVariant"
  SET stock = stock - quantity_param,
      "updatedAt" = NOW()
  WHERE id = variant_id_param
  RETURNING stock INTO updated_stock;

  -- Return success result
  RETURN QUERY SELECT 
    TRUE, 
    current_stock, 
    updated_stock, 
    format('Stock deducted successfully. %s → %s', current_stock, updated_stock);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION atomic_decrement_stock(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION atomic_decrement_stock(text, integer) TO service_role;

-- Create example usage comment
COMMENT ON FUNCTION atomic_decrement_stock IS 
'Atomically decrements product variant stock with row-level locking to prevent race conditions. Returns old and new stock values.';

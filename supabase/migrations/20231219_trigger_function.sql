-- Create a function that can be called from client-side to trigger vector store update
-- This will be called via RPC with anon key, but executes with elevated permissions

CREATE OR REPLACE FUNCTION trigger_vector_store_update(
  p_user_id UUID
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- This allows it to run with elevated permissions
SET search_path = public
AS $$
DECLARE
  v_result json;
BEGIN
  -- Verify the caller is the same user or is authenticated
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  
  -- Return success - the actual vector store update will happen via webhook/API
  v_result := json_build_object(
    'success', true,
    'user_id', p_user_id,
    'message', 'Vector store update triggered'
  );
  
  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION trigger_vector_store_update(UUID) TO authenticated;

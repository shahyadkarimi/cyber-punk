-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own transactions (as buyer or seller)
CREATE POLICY "Users can view their own transactions" ON public.transactions
    FOR SELECT USING (
        auth.uid() = buyer_id OR 
        auth.uid() = seller_id OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Policy for users to insert transactions (as buyer or seller)
CREATE POLICY "Users can insert transactions" ON public.transactions
    FOR INSERT WITH CHECK (
        auth.uid() = buyer_id OR 
        auth.uid() = seller_id OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Policy for users to update their own transactions
CREATE POLICY "Users can update their own transactions" ON public.transactions
    FOR UPDATE USING (
        auth.uid() = buyer_id OR 
        auth.uid() = seller_id OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Policy for admins to manage all transactions
CREATE POLICY "Admins can manage all transactions" ON public.transactions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Grant necessary permissions
GRANT ALL ON public.transactions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 1. Buat tabel sim_trades untuk menyimpan posisi trading offline
CREATE TABLE public.sim_trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    instrument TEXT NOT NULL,
    type TEXT NOT NULL,
    entry_price NUMERIC NOT NULL,
    exit_price NUMERIC,
    units NUMERIC NOT NULL,
    stop_loss NUMERIC,
    take_profit NUMERIC,
    pnl NUMERIC,
    status TEXT DEFAULT 'OPEN' NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Tambah proteksi keamanan (RLS) supaya tiap user cuma bisa lihat trade miliknya
ALTER TABLE public.sim_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sim trades"
    ON public.sim_trades FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sim trades"
    ON public.sim_trades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sim trades"
    ON public.sim_trades FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sim trades"
    ON public.sim_trades FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Tambahkan kolom current_balance ke tabel profiles jika belum ada
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_balance NUMERIC;

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kjklswamolencobodafv.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqa2xzd2Ftb2xlbmNvYm9kYWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2NjI4NDEsImV4cCI6MjA3ODIzODg0MX0.3I_gyKlRoxLH0g2jmiimyzw_dpIIJU9QtTDndz0IgVI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

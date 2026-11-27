import { PUBLISHABLE, SECRET, URL } from "./helpers";

// The data layer reads its Supabase client settings from the environment.
process.env.NEXT_PUBLIC_SUPABASE_URL = URL;
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = PUBLISHABLE;
process.env.SUPABASE_SECRET_KEY = SECRET;

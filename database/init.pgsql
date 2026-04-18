CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  email text NOT NULL UNIQUE,
  pic text,
  user_type text DEFAULT 'student',
  clerk_id text DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.organisation (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES public.users(id), -- Points to the creator/owner
  name text NOT NULL,
  description text,
  logo text,
  website text
);

create table if not exists jobs(
  id uuid not null default gen_random_uuid() primary key,
  org_id uuid not null references public.organisation(id),
  title text not null,
  description text,
  type text[],
  timing text[],
  expeired boolean default false
);

create table if not exists events(
  id uuid not null default gen_random_uuid() primary key,
  org_id uuid not null references public.organisation(id),
  title text not null,
  description text,
  type text,
  start_date timestamp not null,
  end_date timestamp not null,
  location text not null,
  created_at timestamp default now()
);

CREATE TABLE IF NOT EXISTS mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_user_id uuid NOT NULL 
    REFERENCES public.users(id) ON DELETE CASCADE,
  bio text,
  experience jsonb DEFAULT '[]',  
  -- e.g. [{"company": "X", "years": 2}]
  expertise text[],  
  -- e.g. ['React', 'AI', 'Career Guidance']
  email text not null,
  phone text,
  socials jsonb DEFAULT '[]',  
  -- e.g. [{"platform": "LinkedIn", "url": "..."}]
  created_at timestamp DEFAULT now(),
  UNIQUE(mentor_user_id)
);
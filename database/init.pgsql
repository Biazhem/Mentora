-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  clerk_id text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  updated_at timestamp with time zone DEFAULT now(),
  pic text,
  name text,
  CONSTRAINT users_pkey PRIMARY KEY (id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clerk_id text NOT NULL,
  org_name text NOT NULL DEFAULT ''::text,
  description text NOT NULL DEFAULT ''::text,
  org_email text NOT NULL DEFAULT ''::text,
  company_type text NOT NULL DEFAULT ''::text,
  company_size text NOT NULL DEFAULT ''::text,
  company_level text NOT NULL DEFAULT ''::text,
  org_phone text NOT NULL DEFAULT ''::text,
  website text NOT NULL DEFAULT ''::text,
  country text NOT NULL DEFAULT ''::text,
  city text NOT NULL DEFAULT ''::text,
  postal_code text NOT NULL DEFAULT ''::text,
  street_address text NOT NULL DEFAULT ''::text,
  founder_name text NOT NULL DEFAULT ''::text,
  founder_email text NOT NULL DEFAULT ''::text,
  founder_phone text NOT NULL DEFAULT ''::text,
  founder_gender text NOT NULL DEFAULT ''::text,
  founder_dob text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_clerk_id_fkey FOREIGN KEY (clerk_id) REFERENCES public.users(clerk_id)
);
CREATE TABLE public.mentors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clerk_id text NOT NULL,
  name text NOT NULL DEFAULT ''::text,
  bio text NOT NULL DEFAULT ''::text,
  email text NOT NULL DEFAULT ''::text,
  phone text NOT NULL DEFAULT ''::text,
  gender text NOT NULL DEFAULT ''::text,
  dob text NOT NULL DEFAULT ''::text,
  field text NOT NULL DEFAULT ''::text,
  expertise text NOT NULL DEFAULT ''::text,
  experience text NOT NULL DEFAULT ''::text,
  institute text NOT NULL DEFAULT ''::text,
  inst_email text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  experiences ARRAY DEFAULT '{}'::jsonb[],
  mentoring_style text,
  availability text,
  CONSTRAINT mentors_pkey PRIMARY KEY (id),
  CONSTRAINT mentors_clerk_id_fkey FOREIGN KEY (clerk_id) REFERENCES public.users(clerk_id)
);
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  clerk_id text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT ''::text,
  email text NOT NULL DEFAULT ''::text,
  phone text NOT NULL DEFAULT ''::text,
  university text NOT NULL DEFAULT ''::text,
  semester text NOT NULL DEFAULT ''::text,
  expertise text NOT NULL DEFAULT ''::text,
  skills text NOT NULL DEFAULT ''::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_clerk_id_fkey FOREIGN KEY (clerk_id) REFERENCES public.users(clerk_id)
);
CREATE TABLE public.organization_members (
  organization_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT organization_members_pkey PRIMARY KEY (organization_id, user_id),
  CONSTRAINT fk_organization FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  requirements text DEFAULT ''::text,
  benefits text DEFAULT ''::text,
  workplace_type text NOT NULL,
  job_type text NOT NULL,
  experience_level text NOT NULL,
  industry text NOT NULL,
  job_function text NOT NULL,
  country text NOT NULL,
  city text NOT NULL,
  address text DEFAULT ''::text,
  salary_min numeric,
  salary_max numeric,
  salary_currency character varying DEFAULT 'USD'::character varying,
  salary_period text DEFAULT 'yearly'::text,
  is_easy_apply boolean NOT NULL DEFAULT false,
  external_apply_url text,
  status text NOT NULL DEFAULT 'active'::text,
  views_count integer NOT NULL DEFAULT 0,
  applicants_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  title text DEFAULT ''::text,
  headline text DEFAULT ''::text,
  start_date date,
  end_date date,
  description text DEFAULT ''::text,
  location text DEFAULT ''::text,
  type text DEFAULT ''::text,
  guest jsonb DEFAULT '{}'::jsonb,
  links jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.job_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  student_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  cover_letter text DEFAULT ''::text,
  resume_url text,
  applied_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT job_applications_pkey PRIMARY KEY (id),
  CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT job_applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT job_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT ''::text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.organizations(id),
  CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.task_assignees (
  task_id uuid NOT NULL,
  user_id uuid NOT NULL,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT task_assignees_pkey PRIMARY KEY (task_id, user_id),
  CONSTRAINT task_assignees_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT task_assignees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.event_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'registered'::text,
  registered_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT event_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.mentorship_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  student_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  message text DEFAULT ''::text,
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mentorship_requests_pkey PRIMARY KEY (id),
  CONSTRAINT mentorship_requests_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentors(id),
  CONSTRAINT mentorship_requests_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT mentorship_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.mentor_teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  name text NOT NULL,
  description text DEFAULT ''::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mentor_teams_pkey PRIMARY KEY (id),
  CONSTRAINT mentor_teams_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentors(id)
);
CREATE TABLE public.team_members (
  team_id uuid NOT NULL,
  student_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (team_id, student_id),
  CONSTRAINT team_members_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.mentor_teams(id)
);
CREATE TABLE public.team_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  created_by uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT ''::text,
  status text NOT NULL DEFAULT 'pending'::text,
  start_date date,
  end_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_tasks_pkey PRIMARY KEY (id),
  CONSTRAINT team_tasks_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.mentor_teams(id),
  CONSTRAINT team_tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.team_task_assignees (
  task_id uuid NOT NULL,
  student_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  completed_at timestamp with time zone,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT team_task_assignees_pkey PRIMARY KEY (task_id, student_id),
  CONSTRAINT team_task_assignees_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.team_tasks(id),
  CONSTRAINT team_task_assignees_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT team_task_assignees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
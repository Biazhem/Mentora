-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.alumni (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  university character varying,
  batch character varying,
  current_job_title character varying,
  experience_years integer,
  cv_url character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT alumni_pkey PRIMARY KEY (id),
  CONSTRAINT alumni_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL,
  student_id uuid NOT NULL,
  submission_url character varying,
  submitted_at timestamp without time zone DEFAULT now(),
  status character varying DEFAULT 'pending'::character varying,
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id),
  CONSTRAINT applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.event_registrations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  registered_at timestamp without time zone DEFAULT now(),
  CONSTRAINT event_registrations_pkey PRIMARY KEY (id),
  CONSTRAINT event_registrations_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  event_type character varying,
  host_id uuid NOT NULL,
  event_date timestamp without time zone NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_host_id_fkey FOREIGN KEY (host_id) REFERENCES public.users(id)
);
CREATE TABLE public.jobs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  title character varying NOT NULL,
  description text NOT NULL,
  skills_required text,
  job_type character varying,
  deadline date,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT jobs_pkey PRIMARY KEY (id),
  CONSTRAINT jobs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
CREATE TABLE public.mentor_relationships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  student_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT mentor_relationships_pkey PRIMARY KEY (id),
  CONSTRAINT mentor_relationships_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentors(id),
  CONSTRAINT mentor_relationships_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.mentors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  expertise text,
  experience_years integer,
  communication_mode character varying,
  is_verified boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT mentors_pkey PRIMARY KEY (id),
  CONSTRAINT mentors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  message text NOT NULL,
  sent_at timestamp without time zone DEFAULT now(),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id),
  CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.organizations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name character varying NOT NULL,
  industry character varying,
  description text,
  website character varying,
  logo character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT organizations_pkey PRIMARY KEY (id),
  CONSTRAINT organizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  university character varying,
  program character varying,
  skills text,
  year integer,
  cv_url character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.task_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL,
  student_id uuid NOT NULL,
  submission_url character varying,
  submitted_at timestamp without time zone DEFAULT now(),
  CONSTRAINT task_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT task_submissions_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT task_submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  deadline date,
  status character varying DEFAULT 'pending'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  student_id uuid NOT NULL,
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_members_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  organization_id uuid NOT NULL,
  mentor_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
  CONSTRAINT teams_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentors(id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  name character varying,
  email character varying NOT NULL UNIQUE,
  profile_pic character varying,
  role character varying NOT NULL DEFAULT 'user'::character varying,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
-- Fix Supabase RLS recursion for organization meeting calls.
-- Run this in Supabase SQL Editor for the hosted project.

ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  policy_record record;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('meetings', 'meeting_participants')
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  END LOOP;
END $$;

CREATE POLICY "meetings_select_public"
ON public.meetings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "meetings_insert_org_member"
ON public.meetings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = meetings.org_id
      AND om.user_id = meetings.host_id
  )
);

CREATE POLICY "meetings_update_org_member"
ON public.meetings
FOR UPDATE
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = meetings.org_id
      AND om.user_id = meetings.host_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = meetings.org_id
      AND om.user_id = meetings.host_id
  )
);

CREATE POLICY "meeting_participants_select_public"
ON public.meeting_participants
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "meeting_participants_insert_org_member"
ON public.meeting_participants
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.meetings m
    INNER JOIN public.organization_members om
      ON om.organization_id = m.org_id
    WHERE m.id = meeting_participants.meeting_id
      AND m.status = 'active'
      AND om.user_id = meeting_participants.user_id
  )
);

CREATE POLICY "meeting_participants_update_org_member"
ON public.meeting_participants
FOR UPDATE
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.meetings m
    INNER JOIN public.organization_members om
      ON om.organization_id = m.org_id
    WHERE m.id = meeting_participants.meeting_id
      AND om.user_id = meeting_participants.user_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.meetings m
    INNER JOIN public.organization_members om
      ON om.organization_id = m.org_id
    WHERE m.id = meeting_participants.meeting_id
      AND om.user_id = meeting_participants.user_id
  )
);


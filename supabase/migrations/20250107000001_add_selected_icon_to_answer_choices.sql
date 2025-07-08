-- Migration: Add 'selectedIcon' column to answer_choices table
-- This column will store the icon to display when an answer is selected

ALTER TABLE answer_choices ADD COLUMN selectedIcon text NULL;

COMMENT ON COLUMN answer_choices.selectedIcon IS 'The icon to display when this answer choice is selected. Falls back to icon column if null.'; 
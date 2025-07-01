-- Migration: Add 'icon' column to answer_choices
ALTER TABLE answer_choices ADD COLUMN icon text NULL; 
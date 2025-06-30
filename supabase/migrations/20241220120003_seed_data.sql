-- Insert the 7 brand cards (if they don't exist)
INSERT INTO cards (name, slug, description, order_index) VALUES
    ('Purpose', 'purpose', 'Discover why your brand exists beyond making money', 1),
    ('Positioning', 'positioning', 'Learn how to position your brand in the market', 2),
    ('Personality', 'personality', 'Define your brand personality and voice', 3),
    ('Product-Market Fit', 'product-market-fit', 'Understand how your product fits the market', 4),
    ('Perception', 'perception', 'Learn how customers perceive your brand', 5),
    ('Presentation', 'presentation', 'Master how to present your brand', 6),
    ('Proof', 'proof', 'Build credibility and social proof for your brand', 7)
ON CONFLICT (slug) DO NOTHING;

-- Get the Purpose card ID for sections and questions
DO $$
DECLARE
    purpose_card_id UUID;
    educational_section_id UUID;
    guided_section_id UUID;
    question_id UUID;
    section_count INTEGER;
BEGIN
    -- Get Purpose card ID
    SELECT id INTO purpose_card_id FROM cards WHERE slug = 'purpose';
    
    -- Check if sections already exist
    SELECT COUNT(*) INTO section_count FROM card_sections WHERE card_id = purpose_card_id;
    
    -- Insert sections for Purpose card only if they don't exist
    IF section_count = 0 THEN
        INSERT INTO card_sections (card_id, name, type, order_index) VALUES
            (purpose_card_id, 'Learn About Purpose', 'educational', 1),
            (purpose_card_id, 'Define Your Purpose', 'guided', 2);
    END IF;
    
    -- Get section IDs
    SELECT id INTO educational_section_id FROM card_sections WHERE card_id = purpose_card_id AND type = 'educational' LIMIT 1;
    SELECT id INTO guided_section_id FROM card_sections WHERE card_id = purpose_card_id AND type = 'guided' LIMIT 1;
    
    -- Insert questions for Purpose card educational section only if they don't exist
    SELECT COUNT(*) INTO section_count FROM questions WHERE section_id = educational_section_id;
    
    IF section_count = 0 THEN
        -- Question 1
        INSERT INTO questions (section_id, question_text, question_type, order_index) 
        VALUES (educational_section_id, 'What is a brand''s purpose?', 'multiple_choice', 1)
        RETURNING id INTO question_id;
        
        INSERT INTO answer_choices (question_id, choice_text, is_correct, order_index) VALUES
            (question_id, 'A tagline you put under your logo', false, 1),
            (question_id, 'The reason your brand exists beyond making money', true, 2),
            (question_id, 'The product you sell', false, 3),
            (question_id, 'The mission of your marketing team', false, 4);
    
        -- Question 2
        INSERT INTO questions (section_id, question_text, question_type, order_index) 
        VALUES (educational_section_id, 'Which of the following is a strong example of brand purpose?', 'multiple_choice', 2)
        RETURNING id INTO question_id;
        
        INSERT INTO answer_choices (question_id, choice_text, is_correct, order_index) VALUES
            (question_id, 'We aim to dominate market share.', false, 1),
            (question_id, 'We want to make healthy eating fun and accessible.', true, 2),
            (question_id, 'We offer discounts every weekend.', false, 3),
            (question_id, 'We launched in 2020 with a vision to grow.', false, 4);
        
        -- Question 3
        INSERT INTO questions (section_id, question_text, question_type, order_index) 
        VALUES (educational_section_id, 'Which factor matters most when uncovering your brand''s purpose?', 'multiple_choice', 3)
        RETURNING id INTO question_id;
        
        INSERT INTO answer_choices (question_id, choice_text, is_correct, order_index) VALUES
            (question_id, 'Your founder''s favorite quote', false, 1),
            (question_id, 'The change you want to see in the world', true, 2),
            (question_id, 'How many Instagram followers you have', false, 3),
            (question_id, 'How big your competitor''s market is', false, 4);
        
        -- Question 4
        INSERT INTO questions (section_id, question_text, question_type, order_index) 
        VALUES (educational_section_id, 'A clear brand purpose statement is MOST likely to include:', 'multiple_choice', 4)
        RETURNING id INTO question_id;
        
        INSERT INTO answer_choices (question_id, choice_text, is_correct, order_index) VALUES
            (question_id, 'A product feature list', false, 1),
            (question_id, 'A vision of how your offering improves lives', true, 2),
            (question_id, 'A list of job titles on your team', false, 3),
            (question_id, 'Your company''s profit margin goals', false, 4);
        
        -- Question 5
        INSERT INTO questions (section_id, question_text, question_type, order_index) 
        VALUES (educational_section_id, 'Why is brand purpose important?', 'multiple_choice', 5)
        RETURNING id INTO question_id;
        
        INSERT INTO answer_choices (question_id, choice_text, is_correct, order_index) VALUES
            (question_id, 'It helps you write longer bios', false, 1),
            (question_id, 'It motivates your team and guides decision-making', true, 2),
            (question_id, 'It makes your packaging look more premium', false, 3),
            (question_id, 'It helps you go viral on social media', false, 4);
    END IF;
    
END $$;

-- Insert placeholder sections for other cards (they can be populated later)
DO $$
DECLARE
    card_record RECORD;
    section_count INTEGER;
BEGIN
    FOR card_record IN SELECT id, slug FROM cards WHERE slug != 'purpose'
    LOOP
        -- Check if sections already exist for this card
        SELECT COUNT(*) INTO section_count FROM card_sections WHERE card_id = card_record.id;
        
        -- Only insert if no sections exist
        IF section_count = 0 THEN
            INSERT INTO card_sections (card_id, name, type, order_index) VALUES
                (card_record.id, 'Learn About ' || INITCAP(REPLACE(card_record.slug, '-', ' ')), 'educational', 1),
                (card_record.id, 'Define Your ' || INITCAP(REPLACE(card_record.slug, '-', ' ')), 'guided', 2);
        END IF;
    END LOOP;
END $$; 
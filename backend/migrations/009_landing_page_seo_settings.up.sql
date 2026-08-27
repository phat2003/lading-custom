ALTER TABLE landing_page
    ADD COLUMN seo_settings JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN landing_page.seo_settings IS
    'SEO metadata theo từng Landing Page: title, description, keywords, og_image, favicon';

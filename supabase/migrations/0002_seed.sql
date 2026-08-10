-- Initial structural content — run once, right after 0001_init.sql.
--
-- Deliberately does NOT seed fake portfolio projects, testimonials, or media —
-- publishing fabricated customer names/quotes/work on a real client's live
-- site would be misleading. Those stay empty for the real owner to fill in
-- via the admin CMS. Service descriptions and the hero's own tagline are the
-- business's own copy (not fabricated third-party content), so those ARE
-- seeded to avoid a blank launch.

insert into categories (name, slug, sort_order) values
  ('Wedding', 'wedding', 1),
  ('Reception', 'reception', 2),
  ('Engagement', 'engagement', 3),
  ('Birthday', 'birthday', 4),
  ('Baby Shower', 'baby-shower', 5),
  ('Corporate', 'corporate', 6),
  ('Stage', 'stage', 7);

insert into services (title, slug, short_description, description, icon, sort_order, workflow_status, published_at, meta_title, meta_description) values
  ('Wedding Decoration', 'wedding-decoration', 'Full-scale design for the one day you''ll replay forever.', '<p>Full-scale design for the one day you''ll replay forever.</p><p>Every detail — florals, drapery, lighting, and staging — designed as one cohesive scene, not a checklist of add-ons.</p>', 'sparkles', 0, 'published', now(), 'Wedding Decoration | 3 Star Decoration', 'Full-scale design for the one day you''ll replay forever.'),
  ('Reception Styling', 'reception-styling', 'Tablescapes and lighting that keep the evening glowing.', '<p>Tablescapes and lighting that keep the evening glowing.</p><p>Every detail — florals, drapery, lighting, and staging — designed as one cohesive scene, not a checklist of add-ons.</p>', 'sparkles', 1, 'published', now(), 'Reception Styling | 3 Star Decoration', 'Tablescapes and lighting that keep the evening glowing.'),
  ('Engagement Setups', 'engagement-setups', 'An intimate scene for the moment you say yes.', '<p>An intimate scene for the moment you say yes.</p><p>Every detail — florals, drapery, lighting, and staging — designed as one cohesive scene, not a checklist of add-ons.</p>', 'sparkles', 2, 'published', now(), 'Engagement Setups | 3 Star Decoration', 'An intimate scene for the moment you say yes.'),
  ('Birthday & Baby Shower', 'birthday-baby-shower', 'Playful, considered styling for milestones big and small.', '<p>Playful, considered styling for milestones big and small.</p><p>Every detail — florals, drapery, lighting, and staging — designed as one cohesive scene, not a checklist of add-ons.</p>', 'sparkles', 3, 'published', now(), 'Birthday & Baby Shower | 3 Star Decoration', 'Playful, considered styling for milestones big and small.');

insert into hero_banners (eyebrow, title, subtitle, cta_label, cta_href, layout_type, sort_order, workflow_status, published_at) values
  ('3 Star Decoration', 'Celebrations, beautifully designed', 'Weddings · Receptions · Every occasion', 'View our work', '/portfolio', 'fullscreen_image', 1, 'published', now());

insert into homepage_sections (section_key, is_enabled, sort_order, is_featured, config) values
  ('hero', true, 1, false, '{}'),
  ('featured_works', true, 2, true, '{}'),
  ('featured_services', true, 3, false, '{}'),
  ('before_after', true, 4, false, '{}'),
  ('testimonials', true, 5, false, '{}'),
  ('instagram', true, 6, false, '{}'),
  ('quote_cta', true, 7, false, '{}');

insert into site_settings (id, site_name, whatsapp_message_template, social_links, default_meta_title, default_meta_description) values
  (1, '3 Star Decoration', 'Hi 3 Star Decoration, I''d like a quote. {details}', '{"instagram": "", "facebook": "", "youtube": ""}', '3 Star Decoration — Premium Event Decoration', 'Weddings, receptions, and celebrations, beautifully designed.');

insert into seo_meta (route_key, meta_title, meta_description) values
  ('home', '3 Star Decoration — Premium Event Decoration', 'Weddings, receptions, and celebrations, beautifully designed.'),
  ('portfolio', 'Our Work | 3 Star Decoration', 'Explore our event decoration portfolio.');

-- Generic starter legal copy — NOT a substitute for your own legal review
-- before a real public launch. Edit the text below (or ask to have it
-- rewritten) before you publicize the site.
insert into legal_pages (slug, title, body) values
  ('privacy', 'Privacy Policy', '<p>3 Star Decoration ("we", "us") respects your privacy. This policy explains what information we collect when you use this website and get in touch with us, and how we use it.</p><h2>Information we collect</h2><p>When you submit a quote request or contact form, we collect the details you provide — your name, phone number, email address, and information about your event (type, date, city, venue, guest count, budget, and any message you send us).</p><h2>How we use it</h2><ul><li>To respond to your enquiry and discuss your event with you, usually over WhatsApp or phone.</li><li>To prepare quotes and proposals tailored to your celebration.</li><li>To keep a record of past enquiries so we can serve returning clients better.</li></ul><p>We do not sell your information to third parties.</p><h2>WhatsApp</h2><p>Submitting the quote form opens a WhatsApp conversation with our team using the details you provided. WhatsApp''s own privacy policy applies to messages sent through that platform.</p><h2>Your choices</h2><p>You can ask us at any time to review, correct, or delete the information we hold about you by reaching out through the Contact page.</p><h2>Contact us</h2><p>Questions about this policy can be sent to the email address listed on our Contact page.</p>'),
  ('terms', 'Terms & Conditions', '<p>These terms apply when you enquire about or book event decoration services with 3 Star Decoration ("we", "us"). By submitting an enquiry or confirming a booking, you agree to the terms below.</p><h2>Quotes and bookings</h2><p>Quotes shared over WhatsApp, email, or in person are estimates based on the details provided and may be revised once we understand your event in full. A booking is confirmed only once both parties agree on scope, pricing, and date.</p><h2>Changes and cancellations</h2><p>We understand event plans change. Please let us know about date changes, guest-count changes, or cancellations as early as possible so we can adjust sourcing, staffing, and materials accordingly.</p><h2>On the day</h2><p>We arrive with enough time to set up, style, and finish every detail before your event begins, and typically handle breakdown after the event concludes, as agreed in your booking.</p><h2>Liability</h2><p>We take care to protect venues and property while working, and carry appropriate care for the materials and installations we bring. Specific liability terms for your event are confirmed as part of your booking.</p><h2>Contact us</h2><p>If anything here is unclear, reach out through our Contact page before booking — we''re happy to talk it through.</p>');

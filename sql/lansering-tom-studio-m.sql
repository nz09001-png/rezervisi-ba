-- ============================================================
-- SALONIX – TÖM STUDIO M INFÖR LANSERING
-- ============================================================
-- KÖRS INTE NU. Körs som SISTA steg före lansering, efter det
-- slutliga testet i produktion (punkt 13).
-- Ägarens beslut (7 oktober 2026): vid lansering ska bara salongen
-- Studio M Exclusive finnas kvar med namn, naslovna slika, adress,
-- telefon, Instagram och Facebook. Allt annat töms så att salongens
-- admin själv bygger upp tjänster, personal, tider m.m.
--
-- Finns kvar: salongsraden (salon-x), image_url, address, phone,
-- instagram_url, facebook_url, city, categories, latitude, longitude,
-- is_published, owner_id (inloggningen).
-- Körs i Supabase → SQL Editor → Run. Allt eller inget (begin/commit).
-- ============================================================

begin;

delete from service_steps where service_id in (
  select id from services where salon_id = (select id from salons where slug = 'salon-x'));
delete from service_barbers where service_id in (
  select id from services where salon_id = (select id from salons where slug = 'salon-x'));
delete from services where salon_id = (select id from salons where slug = 'salon-x');
delete from service_categories where salon_id = (select id from salons where slug = 'salon-x');
delete from available_times where salon_id = (select id from salons where slug = 'salon-x');
delete from closed_days where salon_id = (select id from salons where slug = 'salon-x');
delete from barbers where salon_id = (select id from salons where slug = 'salon-x');
delete from salon_shortened_hours where salon_id = (select id from salons where slug = 'salon-x');
delete from salon_images where salon_id = (select id from salons where slug = 'salon-x');
delete from admin_notifications where salon_id = (select id from salons where slug = 'salon-x');
delete from bookings where salon = (select salon_name from salons where slug = 'salon-x');

update salons
set description = null, opening_hours = null, closed_weekdays = '{}', tiktok_url = null
where slug = 'salon-x';

commit;

-- Kontroll: en rad med Studio M, har_bild = true, och 0 tjänster/personal/bokningar.
select salon_name, address, phone, instagram_url, facebook_url, image_url is not null as har_bild,
  (select count(*) from services) as tjanster, (select count(*) from barbers) as personal,
  (select count(*) from bookings) as bokningar
from salons;

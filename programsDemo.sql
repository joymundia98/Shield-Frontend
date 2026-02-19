INSERT INTO programs 
(id, name, description, department_id, category_id, organization_id, created_at, date, time, venue, agenda, status, event_type, notes)
VALUES

-- LIFE EVENTS (category_id = 1)

(1, 'New Year Baby Dedication', 'Dedication ceremony for infants born in the previous year', 72, 1, 27, '2026-01-01 08:00:00', '2026-01-03', '10:00:00', 'Main Sanctuary', 'Prayer and blessing for babies, family photos', 'Scheduled', 'Ceremony', 'Families encouraged to RSVP'),

(2, 'Youth Confirmation Class', 'Initiation into the faith for teenagers', 64, 1, 27, '2026-01-05 09:30:00', '2026-02-14', '09:00:00', 'Youth Hall', 'Bible study, mentor guidance, preparation for confirmation', 'Scheduled', 'Class', 'Includes certificate distribution'),

(3, 'Couple’s Marriage Workshop', 'Pre-marriage counseling for engaged couples', 72, 1, 27, '2026-01-10 12:00:00', '2026-02-20', '14:00:00', 'Fellowship Hall', 'Communication exercises, financial planning, spiritual guidance', 'Scheduled', 'Workshop', 'Couples must register in advance'),

(4, 'Easter Baby Dedication', 'Dedication for babies born in the last six months', 72, 1, 27, '2026-02-01 08:15:00', '2026-04-05', '10:00:00', 'Main Sanctuary', 'Blessing, prayers, and family reception', 'Scheduled', 'Ceremony', 'Photos allowed'),

(5, 'First Communion Ceremony', 'Children receive their first communion', 64, 1, 27, '2026-03-01 09:00:00', '2026-05-10', '11:00:00', 'Main Sanctuary', 'Teaching of sacrament, ceremony, group photos', 'Scheduled', 'Ceremony', 'Parents invited'),

(6, 'Graduation Recognition Sunday', 'Celebrating academic achievements', 66, 1, 27, '2026-04-01 08:30:00', '2026-06-07', '10:30:00', 'Main Sanctuary', 'Presentation of graduates, prayer, and fellowship', 'Scheduled', 'Celebration', 'Graduates to wear gowns'),

(7, 'Anniversary Blessing', 'Celebrating couples’ wedding anniversaries', 72, 1, 27, '2026-04-15 10:00:00', '2026-06-21', '09:00:00', 'Fellowship Hall', 'Prayer, couple testimonies, cake cutting', 'Scheduled', 'Ceremony', 'Open to all married couples'),

(8, 'Youth Leadership Induction', 'Recognition of new youth leaders', 64, 1, 27, '2026-05-01 08:45:00', '2026-07-05', '10:00:00', 'Youth Hall', 'Prayer, role assignments, motivational talk', 'Scheduled', 'Ceremony', 'Parents invited'),

(9, 'Memorial Service for Members', 'Honoring deceased members of the church', 72, 1, 27, '2026-05-10 09:00:00', '2026-08-01', '14:00:00', 'Main Sanctuary', 'Tributes, eulogies, scripture reading', 'Scheduled', 'Service', 'Family attendance encouraged'),

(10, 'Marriage Vow Renewal', 'Couples renew their wedding vows', 72, 1, 27, '2026-06-01 08:30:00', '2026-09-14', '10:00:00', 'Main Sanctuary', 'Prayer, renewal ceremony, reception', 'Scheduled', 'Ceremony', 'Couples to register'),

(11, 'Baptism Sunday', 'Infant and adult baptisms', 72, 1, 27, '2026-06-05 09:00:00', '2026-09-21', '11:00:00', 'Baptismal Pool', 'Baptism, testimony sharing', 'Scheduled', 'Ceremony', 'Families encouraged to attend'),

(12, 'Child Dedication Weekend', 'Celebrating children under age 5', 72, 1, 27, '2026-07-01 08:30:00', '2026-10-05', '09:30:00', 'Main Sanctuary', 'Dedication ceremony, prayer, group photos', 'Scheduled', 'Ceremony', 'RSVP required'),

(13, 'College Send-Off Prayer', 'Prayer and encouragement for graduating college students', 64, 1, 27, '2026-07-10 09:00:00', '2026-10-12', '10:00:00', 'Youth Hall', 'Prayer, gift distribution, testimonies', 'Scheduled', 'Ceremony', 'Students bring parents'),

(14, 'High School Senior Recognition', 'Celebrating high school graduates', 64, 1, 27, '2026-07-20 08:45:00', '2026-10-19', '10:30:00', 'Main Sanctuary', 'Prayer, certificates, refreshments', 'Scheduled', 'Celebration', 'Parents encouraged to attend'),

(15, 'Marriage Preparation Seminar', 'Pre-marital seminar for engaged couples', 72, 1, 27, '2026-08-01 08:30:00', '2026-11-02', '14:00:00', 'Fellowship Hall', 'Interactive sessions, counseling tips, prayer', 'Scheduled', 'Seminar', 'Couples must register'),

-- COMMUNITY EVENTS (category_id = 3)

(16, 'Community Health Fair',  'Free health screenings and wellness workshops', 59, 3, 27, '2026-01-10 09:00:00', '2026-01-25', '09:00:00', 'Fellowship Hall', 'Blood pressure checks, nutrition seminars, exercise demo', 'Scheduled', 'Fair', 'Open to all residents'),

(17, 'Winter Coat Drive', 'Collecting coats for those in need', 59, 3, 27, '2026-01-15 08:30:00', '2026-02-05', '10:00:00', 'Church Lobby', 'Collection, sorting, and distribution to families', 'Scheduled', 'Charity', 'Volunteers needed'),

(18, 'Martin Luther King Jr. Celebration', 'Commemorating civil rights legacy', 59, 3, 27, '2026-01-20 08:45:00', '2026-01-21', '10:00:00', 'Main Sanctuary', 'Guest speakers, choir performance, reflection', 'Scheduled', 'Program', 'Community members invited'),

(19, 'Valentine’s Community Dinner', 'Fellowship dinner for singles and couples', 59, 3, 27, '2026-02-01 09:00:00', '2026-02-14', '18:00:00', 'Fellowship Hall', 'Dinner, games, and networking', 'Scheduled', 'Celebration', 'Tickets required'),

(20, 'Neighborhood Cleanup Day', 'Community environmental service', 59, 3, 27, '2026-02-10 08:00:00', '2026-03-01', '09:00:00', 'Church Grounds & Nearby Streets', 'Trash collection, tree planting, recycling awareness', 'Scheduled', 'Volunteer Event', 'Bring gloves and tools'),

(21, 'Spring Food Drive', 'Collecting non-perishable food for shelters', 59, 3, 27, '2026-03-01 08:45:00', '2026-03-15', '10:00:00', 'Church Lobby', 'Collection, sorting, delivery to shelters', 'Scheduled', 'Charity', 'Volunteers needed'),

(22, 'Easter Community Festival', 'Easter celebration with activities', 59, 3, 27, '2026-03-15 09:00:00', '2026-04-09', '11:00:00', 'Church Grounds', 'Egg hunt, games, music, food stalls', 'Scheduled', 'Festival', 'Free entry'),

(23, 'Back-to-School Drive', 'Providing school supplies for children', 59, 3, 27, '2026-06-01 08:30:00', '2026-08-10', '10:00:00', 'Fellowship Hall', 'Supply collection, distribution, mentorship registration', 'Scheduled', 'Charity', 'Donations welcome'),

(24, 'Summer Youth Camp', 'Camp for local children', 64, 3, 27, '2026-06-15 08:00:00', '2026-07-15', '08:00:00', 'Campgrounds', 'Games, Bible study, skill workshops', 'Scheduled', 'Camp', 'Ages 8–15'),

(25, 'Harvest Festival', 'Celebration and thanksgiving for the community', 59, 3, 27, '2026-09-01 08:30:00', '2026-09-20', '11:00:00', 'Church Grounds', 'Music, food, games, and donations', 'Scheduled', 'Festival', 'Open to all'),

(26, 'Thanksgiving Outreach Dinner', 'Meal for the homeless', 59, 3, 27, '2026-11-01 08:45:00', '2026-11-25', '12:00:00', 'Fellowship Hall', 'Meal preparation and distribution', 'Scheduled', 'Charity', 'Volunteers needed'),

(27, 'Christmas Toy Drive', 'Collecting toys for children', 59, 3, 27, '2026-12-01 08:30:00', '2026-12-20', '10:00:00', 'Church Lobby', 'Toy collection, wrapping, and delivery', 'Scheduled', 'Charity', 'Donations welcome');

-- SPIRITUAL EVENTS (category_id = 4)

(28, 'Advent Candle Lighting', 'Community prayer and reflection', 67, 4, 27, '2026-11-25 08:45:00', '2026-12-03', '18:00:00', 'Main Sanctuary', 'Scripture reading, candle lighting, prayers', 'Scheduled', 'Ceremony', 'Open to all'),

(29, 'Lent Prayer Vigil', 'Extended prayer and reflection', 67, 4, 27, '2026-02-01 09:00:00', '2026-03-05', '19:00:00', 'Prayer Room', 'Guided prayer sessions, meditation', 'Scheduled', 'Vigil', 'Bring prayer journals'),

(30, 'Good Friday Service', 'Commemorating Jesus’ crucifixion', 67, 4, 27, '2026-03-01 08:30:00', '2026-04-10', '15:00:00', 'Main Sanctuary', 'Scripture reading, sermon, music', 'Scheduled', 'Service', 'Attire formal'),

(31, 'Easter Sunrise Service', 'Celebrating resurrection', 67, 4, 27, '2026-03-15 08:00:00', '2026-04-12', '06:00:00', 'Church Courtyard', 'Worship, sermon, communion', 'Scheduled', 'Service', 'Outdoor service'),

(32, 'Pentecost Celebration', 'Church anniversary and spiritual reflection', 67, 4, 27, '2026-05-01 08:45:00', '2026-05-31', '10:00:00', 'Main Sanctuary', 'Sermon, worship, fellowship', 'Scheduled', 'Celebration', 'Special guest speaker'),

(33, 'Mid-Year Revival', 'Spiritual renewal and outreach', 67, 4, 27, '2026-06-01 09:00:00', '2026-06-15', '18:00:00', 'Main Sanctuary', 'Worship sessions, preaching, altar calls', 'Scheduled', 'Revival', 'Multiple-day event'),

(34, 'Prayer & Fasting Week', 'Dedicated prayer and fasting', 67, 4, 27, '2026-07-01 08:30:00', '2026-07-15', '06:00:00', 'Prayer Room', 'Daily prayers, devotional readings', 'Scheduled', 'Program', 'Open to all members'),

(35, 'Spiritual Retreat', 'Retreat for church leaders', 67, 4, 27, '2026-08-01 09:00:00', '2026-08-20', '08:00:00', 'Retreat Center', 'Workshops, meditation, team building', 'Scheduled', 'Retreat', 'Leaders only'),

(36, 'Christmas Eve Service', 'Celebrating the birth of Jesus', 67, 4, 27, '2026-12-01 08:45:00', '2026-12-24', '19:00:00', 'Main Sanctuary', 'Worship, sermon, nativity', 'Scheduled', 'Service', 'Candlelight ceremony'),

-- CHURCH BUSINESS EVENTS (category_id = 2)

(37, 'Annual Church Meeting', 'Planning and reporting', 61, 2, 27, '2026-01-01 08:00:00', '2026-02-01', '09:00:00', 'Conference Room', 'Review reports, elect officers, plan programs', 'Scheduled', 'Meeting', 'All department heads must attend'),

(38, 'Finance Committee Review', 'Reviewing church finances', 71, 2, 27, '2026-01-05 09:30:00', '2026-02-10', '08:30:00', 'Finance Office', 'Budget analysis, audit review', 'Scheduled', 'Meeting', 'Finance team only'),

(39, 'Leadership Training', 'Training for ministry leaders', 61, 2, 27, '2026-01-10 12:00:00', '2026-03-01', '09:00:00', 'Fellowship Hall', 'Workshop on leadership skills, conflict resolution', 'Scheduled', 'Training', 'Mandatory for all leaders'),

(40, 'Volunteer Orientation', 'Training new volunteers', 61, 2, 27, '2026-02-01 08:15:00', '2026-03-10', '10:00:00', 'Youth Hall', 'Church policies, roles, and responsibilities', 'Scheduled', 'Training', 'Open to all new volunteers'),

(41, 'Strategic Planning Retreat', 'Planning for church growth', 61, 2, 27, '2026-03-01 09:00:00', '2026-04-05', '09:00:00', 'Retreat Center', 'Goal setting, program planning, team workshops', 'Scheduled', 'Retreat', 'Leadership only'),

(42, 'Board of Trustees Meeting', 'Governance and oversight', 61, 2, 27, '2026-04-01 08:30:00', '2026-05-10', '08:30:00', 'Conference Room', 'Financials, policies, strategic decisions', 'Scheduled', 'Meeting', 'Trustees only'),

(43, 'Mid-Year Ministry Report', 'Reporting ministry progress', 61, 2, 27, '2026-06-01 08:45:00', '2026-07-01', '09:00:00', 'Conference Room', 'Departmental reports, Q&A, action planning', 'Scheduled', 'Review', 'Open to all staff'),

(44, 'End-of-Year Planning', 'Scheduling programs for next year', 61, 2, 27, '2026-09-01 08:30:00', '2026-11-10', '10:00:00', 'Conference Room', 'Calendar review, budget allocation', 'Scheduled', 'Planning', 'Department heads attend'),

(45, 'Annual Fundraising Strategy', 'Planning fundraising activities', 61, 2, 27, '2026-10-01 08:45:00', '2026-11-15', '09:30:00', 'Fellowship Hall', 'Strategy session, goal setting', 'Scheduled', 'Planning', 'Finance & outreach teams'),

(46, 'Church Constitution Review', 'Updating church policies', 61, 2, 27, '2026-10-05 09:00:00', '2026-12-01', '10:00:00', 'Conference Room', 'Policy review, legal compliance', 'Scheduled', 'Review', 'Board of Trustees only'),

(47, 'Leadership Retreat', 'Annual retreat for pastors and leaders', 61, 2, 27, '2026-11-01 08:30:00', '2026-12-05', '08:00:00', 'Retreat Center', 'Team building, vision casting, prayer', 'Scheduled', 'Retreat', 'Leaders only'),

-- SPIRITUAL EVENTS CONTINUED (category_id = 4)

(48, 'Church Anniversary Celebration', 'Celebrating the church founding', 67, 4, 27, '2026-03-01 08:30:00', '2026-06-21', '10:00:00', 'Main Sanctuary', 'Worship, sermon, fellowship meal', 'Scheduled', 'Celebration', 'All members invited'),

(49, 'Bible Marathon', 'Reading the Bible together', 67, 4, 27, '2026-01-01 08:00:00', '2026-03-15', '08:00:00', 'Main Sanctuary', 'Continuous scripture reading, group discussions', 'Scheduled', 'Program', 'Bring Bibles'),

(50, 'Music Ministry Concert', 'Choir and band performance', 60, 4, 27, '2026-02-01 08:45:00', '2026-04-10', '18:00:00', 'Main Sanctuary', 'Musical worship, testimonies', 'Scheduled', 'Concert', 'Open to public'),

(51, 'Women’s Fellowship Retreat', 'Retreat for women members', 72, 4, 27, '2026-05-01 09:00:00', '2026-06-12', '08:00:00', 'Retreat Center', 'Prayer, workshops, bonding', 'Scheduled', 'Retreat', 'Women only'),

(52, 'Men’s Ministry Camp', 'Retreat for men', 66, 4, 27, '2026-06-01 08:30:00', '2026-07-10', '08:00:00', 'Campgrounds', 'Team-building, worship, mentorship', 'Scheduled', 'Camp', 'Men only'),

(53, 'Choir Auditions', 'Recruitment for choir', 60, 2, 27, '2026-07-01 08:45:00', '2026-08-05', '10:00:00', 'Music Room', 'Singing evaluation, practice sessions', 'Scheduled', 'Audition', 'Open to members'),

(54, 'Drama Ministry Workshop', 'Training for drama ministry', 60, 2, 27, '2026-08-01 09:00:00', '2026-09-10', '14:00:00', 'Fellowship Hall', 'Acting exercises, script reading', 'Scheduled', 'Workshop', 'Ages 12+'),

(55, 'Church Technology Training', 'Training on AV and streaming', 92, 2, 27, '2026-09-01 08:30:00', '2026-09-25', '09:00:00', 'AV Room', 'Camera operation, live streaming', 'Scheduled', 'Training', 'Volunteers welcome'),

(56, 'Sunday School Teacher Training', 'Equipping Sunday School teachers', 71, 2, 27, '2026-09-10 08:45:00', '2026-10-05', '10:00:00', 'Education Room', 'Curriculum planning, classroom management', 'Scheduled', 'Training', 'Teachers only'),

(57, 'Community Outreach Planning', 'Planning outreach programs', 59, 2, 27, '2026-10-01 09:00:00', '2026-10-15', '09:00:00', 'Conference Room', 'Program calendar, volunteer coordination', 'Scheduled', 'Planning', 'All outreach volunteers'),

(58, 'Pastoral Staff Meeting', 'Regular meeting for pastors', 72, 2, 27, '2026-11-01 08:30:00', '2026-11-05', '09:00:00', 'Pastors’ Office', 'Ministry updates, administrative tasks', 'Scheduled', 'Meeting', 'Pastors only'),

(59, 'Volunteer Appreciation Dinner', 'Honoring volunteers', 61, 3, 27, '2026-12-01 08:45:00', '2026-12-10', '18:00:00', 'Fellowship Hall', 'Dinner, awards, testimonies', 'Scheduled', 'Celebration', 'All volunteers invited'),

(60, 'Christmas Day Service', 'Worship and celebration', 67, 4, 27, '2026-12-01 09:00:00', '2026-12-25', '10:00:00', 'Main Sanctuary', 'Worship, sermon, fellowship', 'Scheduled', 'Service', 'Families encouraged to attend');

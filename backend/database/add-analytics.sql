-- Analytics Tables for BiharEssence

-- Site Visits Tracking
CREATE TABLE IF NOT EXISTS site_visits (
    id SERIAL PRIMARY KEY,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    visit_count INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(visit_date)
);

-- User Activity Tracking (Signups and Logins)
CREATE TABLE IF NOT EXISTS user_activity (
    id SERIAL PRIMARY KEY,
    activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
    signups_count INTEGER DEFAULT 0,
    logins_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(activity_date)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_visits_date ON site_visits(visit_date);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity(activity_date);

-- Initialize current date entries
INSERT INTO site_visits (visit_date, visit_count, unique_visitors)
VALUES (CURRENT_DATE, 0, 0)
ON CONFLICT (visit_date) DO NOTHING;

INSERT INTO user_activity (activity_date, signups_count, logins_count)
VALUES (CURRENT_DATE, 0, 0)
ON CONFLICT (activity_date) DO NOTHING;

COMMIT;

-- =====================================================
-- NEXUS — University Carpooling System
-- PostgreSQL Database Schema (DDL)
-- Capstone Design Project | Universidad de La Sabana
-- =====================================================
-- Version: 1.0.0
-- Date: 2026-05-04
-- Target: PostgreSQL 16+
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. ENUM TYPES
-- =====================================================

CREATE TYPE user_role_enum AS ENUM ('driver', 'passenger');
CREATE TYPE user_status_enum AS ENUM ('active', 'suspended', 'deactivated');
CREATE TYPE trip_status_enum AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE booking_status_enum AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_method_enum AS ENUM ('pse', 'card', 'sabana_points');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE notification_type_enum AS ENUM ('booking_confirmed', 'booking_cancelled', 'trip_cancelled', 'trip_modified', 'payment_received', 'rating_received', 'sabana_coins_earned');
CREATE TYPE coin_type_enum AS ENUM ('earned', 'spent', 'redeemed', 'bonus');

-- =====================================================
-- 2. USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255)        NOT NULL UNIQUE,
    full_name       VARCHAR(255)        NOT NULL,
    profile_photo_url  VARCHAR(500),
    faculty         VARCHAR(150),
    phone           VARCHAR(20),
    status          user_status_enum    NOT NULL DEFAULT 'active',
    ms_graph_token  TEXT,
    refresh_token   TEXT,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_email_domain CHECK (email LIKE '%@unisabana.edu.co')
);

CREATE TABLE user_roles (
    user_id     UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        user_role_enum      NOT NULL,
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    PRIMARY KEY (user_id, role)
);

-- =====================================================
-- 3. TRIPS
-- =====================================================

CREATE TABLE trips (
    id                  UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id           UUID                NOT NULL REFERENCES users(id),
    origin_name         VARCHAR(255)        NOT NULL,
    origin_lat          DECIMAL(9, 6)       NOT NULL,
    origin_lng          DECIMAL(9, 6)       NOT NULL,
    destination_name    VARCHAR(255)        NOT NULL,
    destination_lat     DECIMAL(9, 6)       NOT NULL,
    destination_lng     DECIMAL(9, 6)       NOT NULL,
    departure_time      TIMESTAMPTZ         NOT NULL,
    total_seats         INTEGER             NOT NULL CHECK (total_seats > 0 AND total_seats <= 7),
    available_seats     INTEGER             NOT NULL,
    price               DECIMAL(10, 2)      NOT NULL CHECK (price >= 0),
    status              trip_status_enum    NOT NULL DEFAULT 'scheduled',
    notes               TEXT,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT ck_available_seats CHECK (available_seats >= 0 AND available_seats <= total_seats)
);

-- =====================================================
-- 4. BOOKINGS
-- =====================================================

CREATE TABLE bookings (
    id                  UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id             UUID                NOT NULL REFERENCES trips(id),
    passenger_id        UUID                NOT NULL REFERENCES users(id),
    status              booking_status_enum NOT NULL DEFAULT 'pending',
    meeting_point_name  VARCHAR(255),
    meeting_point_lat   DECIMAL(9, 6),
    meeting_point_lng   DECIMAL(9, 6),
    booked_at           TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_booking_trip_passenger UNIQUE (trip_id, passenger_id)
);

-- =====================================================
-- 5. PAYMENTS
-- =====================================================

CREATE TABLE payments (
    id                  UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id          UUID                NOT NULL UNIQUE REFERENCES bookings(id),
    amount              DECIMAL(10, 2)      NOT NULL CHECK (amount > 0),
    method              payment_method_enum NOT NULL,
    status              payment_status_enum NOT NULL DEFAULT 'pending',
    provider_reference  VARCHAR(255),
    provider_response   JSONB,
    paid_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 6. REVIEWS & RATINGS
-- =====================================================

CREATE TABLE reviews (
    id                  UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id             UUID                NOT NULL REFERENCES trips(id),
    reviewer_id         UUID                NOT NULL REFERENCES users(id),
    reviewed_user_id    UUID                NOT NULL REFERENCES users(id),
    rating              INTEGER             NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment             TEXT,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_review_trip_reviewer_reviewed UNIQUE (trip_id, reviewer_id, reviewed_user_id),
    CONSTRAINT ck_different_users CHECK (reviewer_id <> reviewed_user_id)
);

CREATE TABLE review_tags (
    id          UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50)         NOT NULL UNIQUE,
    category    VARCHAR(50),
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE TABLE review_tag_mapping (
    review_id   UUID                NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    tag_id      UUID                NOT NULL REFERENCES review_tags(id) ON DELETE CASCADE,

    PRIMARY KEY (review_id, tag_id)
);

-- =====================================================
-- 7. SABANA COINS (INCENTIVE SYSTEM)
-- =====================================================

CREATE TABLE sabana_coins_ledger (
    id          UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID                NOT NULL REFERENCES users(id),
    amount      INTEGER             NOT NULL,
    type        coin_type_enum      NOT NULL,
    description VARCHAR(255),
    reference_id UUID,
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE MATERIALIZED VIEW user_sabana_coins_balance AS
SELECT
    user_id,
    COALESCE(SUM(amount), 0) AS balance,
    COALESCE(SUM(CASE WHEN type = 'earned' OR type = 'bonus' THEN amount ELSE 0 END), 0) AS total_earned,
    COALESCE(SUM(CASE WHEN type = 'spent' OR type = 'redeemed' THEN ABS(amount) ELSE 0 END), 0) AS total_spent
FROM sabana_coins_ledger
GROUP BY user_id;

-- =====================================================
-- 8. NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id          UUID                    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID                    NOT NULL REFERENCES users(id),
    type        notification_type_enum  NOT NULL,
    title       VARCHAR(255)            NOT NULL,
    message     TEXT                    NOT NULL,
    is_read     BOOLEAN                 NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

CREATE TABLE user_devices (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID                NOT NULL REFERENCES users(id),
    expo_push_token VARCHAR(255)        NOT NULL,
    platform        VARCHAR(10)         NOT NULL CHECK (platform IN ('ios', 'android')),
    is_active       BOOLEAN             NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_user_token UNIQUE (user_id, expo_push_token)
);

-- =====================================================
-- 9. INDEXES FOR PERFORMANCE
-- =====================================================

-- Trips search indexes
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_departure_time ON trips(departure_time);
CREATE INDEX idx_trips_departure_time_status ON trips(departure_time, status) WHERE status = 'scheduled';
CREATE INDEX idx_trips_origin_coords ON trips(origin_lat, origin_lng);
CREATE INDEX idx_trips_destination_coords ON trips(destination_lat, destination_lng);

-- Bookings search indexes
CREATE INDEX idx_bookings_trip_id ON bookings(trip_id);
CREATE INDEX idx_bookings_passenger_id ON bookings(passenger_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_trip_status ON bookings(trip_id, status);

-- Payments search indexes
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Reviews search indexes
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);
CREATE INDEX idx_reviews_trip_id ON reviews(trip_id);

-- Notifications search indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Sabana coins indexes
CREATE INDEX idx_sabana_coins_user_id ON sabana_coins_ledger(user_id);
CREATE INDEX idx_sabana_coins_type ON sabana_coins_ledger(type);

-- User devices indexes
CREATE INDEX idx_user_devices_user_id ON user_devices(user_id);
CREATE INDEX idx_user_devices_token ON user_devices(expo_push_token);

-- =====================================================
-- 10. TRIGGERS FOR AUTOMATED FIELDS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_devices_updated_at
    BEFORE UPDATE ON user_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-decrement available_seats when booking is confirmed
CREATE OR REPLACE FUNCTION decrement_available_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        UPDATE trips
        SET available_seats = available_seats - 1
        WHERE id = NEW.trip_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_seats
    AFTER INSERT OR UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION decrement_available_seats();

-- Auto-increment available_seats when booking is cancelled
CREATE OR REPLACE FUNCTION increment_available_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
        UPDATE trips
        SET available_seats = available_seats + 1
        WHERE id = NEW.trip_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_seats
    AFTER UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION increment_available_seats();

-- =====================================================
-- 11. SEED DATA (INITIAL REVIEW TAGS)
-- =====================================================

INSERT INTO review_tags (name, category) VALUES
    ('puntual', 'comportamiento'),
    ('seguro', 'seguridad'),
    ('amable', 'comportamiento'),
    ('ordenado', 'comportamiento'),
    ('conversador', 'comportamiento'),
    ('respetuoso', 'comportamiento'),
    ('música alta', 'comportamiento'),
    ('conductor responsable', 'seguridad'),
    ('vehículo limpio', 'comportamiento'),
    ('flexible con horario', 'comportamiento');

-- =====================================================
-- 12. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE users IS 'Core user table for verified university members';
COMMENT ON TABLE trips IS 'Published trips by drivers with route and seat details';
COMMENT ON TABLE bookings IS 'Seat reservations linking passengers to trips';
COMMENT ON TABLE payments IS 'Payment records for completed bookings';
COMMENT ON TABLE reviews IS 'User ratings and reviews after completed trips';
COMMENT ON TABLE sabana_coins_ledger IS 'Ledger for Sabana Coins incentive transactions';
COMMENT ON TABLE notifications IS 'Push and in-app notifications for users';
COMMENT ON TABLE user_devices IS 'Device tokens for push notification delivery';

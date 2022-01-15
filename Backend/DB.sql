CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    password VARCHAR(128),
    last_online TIMESTAMP DEFAULT now()
);

CREATE TABLE games (
    game_id SERIAL PRIMARY KEY,
    wh_player INT REFERENCES users(user_id) ON DELETE SET NULL,
    bl_player INT REFERENCES users(user_id) ON DELETE SET NULL,
    is_running BOOLEAN NOT NULL DEFAULT TRUE,
    options TEXT,
    CONSTRAINT valid_players CHECK (NOT(wh_player = bl_player))
);

-- Usuwa gry, w których obaj gracze zostali usunięci.
-- Ustawia status na zakończony jeśli jeden z graczy został usunięty.
CREATE OR REPLACE FUNCTION check_null_games() RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.wh_player IS NULL AND NEW.bl_player IS NULL) THEN
        DELETE FROM games WHERE game_id = NEW.game_id;
        RETURN NULL;
    ELSEIF (NEW.wh_player IS NULL OR NEW.bl_player IS NULL) THEN
        NEW.is_running := FALSE;
    END IF;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;


CREATE TRIGGER check_null_games BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION check_null_games();

-- Aktualizuje graczom ostatnią aktywność po utworzeniu meczu.
-- Dodatkowo gwarantuje, że nowe gry są tworzone z dwoma graczami.
CREATE OR REPLACE FUNCTION update_activity_new_game() RETURNS TRIGGER AS $$
BEGIN
    IF(NEW.wh_player IS NULL OR NEW.bl_player IS NULL) THEN
        RETURN NULL;
    END IF;
    UPDATE users SET last_online = now() 
        WHERE user_id IN (NEW.wh_player, NEW.bl_player);
    RETURN NEW;
END
$$ LANGUAGE plpgsql;
CREATE TRIGGER new_game BEFORE INSERT ON games FOR EACH ROW EXECUTE FUNCTION update_activity_new_game();

CREATE TABLE moves (
    game_id INT REFERENCES games (game_id) ON DELETE CASCADE,
    turn INT,
    wh_move VARCHAR(10) NOT NULL,
    bl_move VARCHAR(10),
    PRIMARY KEY(game_id, turn)
);


-- Sprawdza czy gracz biały i czarny ruszają się na przemian. Dodatkowo pilnuje, aby numery tur się zgadzały oraz żeby nie dało się dodawać ruchów do skończonych gier.
CREATE OR REPLACE FUNCTION valid_move() RETURNS TRIGGER AS $$
DECLARE
    last_move moves%rowtype;
    running BOOLEAN;
BEGIN
    SELECT is_running INTO running
        FROM games WHERE games.game_id = NEW.game_id;
    IF(NOT running) THEN
        RETURN NULL;
    END IF;

    SELECT * INTO last_move
        FROM moves AS m 
        WHERE m.game_id = NEW.game_id 
        ORDER BY turn DESC LIMIT 1;

    IF (last_move IS NULL) THEN
        RETURN(NEW.game_id, 1, NEW.wh_move, NEW.bl_move);

    ELSEIF (last_move.bl_move IS NULL) THEN
        UPDATE moves SET bl_move = NEW.bl_move WHERE game_id = last_move.game_id AND turn = last_move.turn;
        RETURN NULL;
    ELSE 
        RETURN(NEW.game_id, last_move.turn+1, NEW.wh_move, NEW.bl_move);
    END IF;
END
$$ LANGUAGE plpgsql;
CREATE TRIGGER valid_move BEFORE INSERT ON moves FOR EACH ROW EXECUTE FUNCTION valid_move();

-- Aktualizuje graczom ostatnią aktywność po wykonaniu ruchu
CREATE OR REPLACE FUNCTION update_activity_new_move() RETURNS TRIGGER AS $$
DECLARE
    player INT;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        -- Update case -> update bl_player
        SELECT user_id INTO player FROM games JOIN users ON (games.bl_player = users.user_id) WHERE game_id = NEW.game_id;
    ELSEIF (TG_OP = 'INSERT') THEN
        -- Insert case -> update wh_player
        SELECT user_id INTO player FROM games JOIN users ON (games.wh_player = users.user_id) WHERE game_id = NEW.game_id;
    END IF;
    UPDATE users SET last_online = now() WHERE user_id = player;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_new_move_wh AFTER INSERT ON moves FOR EACH ROW EXECUTE FUNCTION update_activity_new_move();
CREATE TRIGGER update_activity_new_move_bl AFTER UPDATE ON moves FOR EACH ROW EXECUTE FUNCTION update_activity_new_move();
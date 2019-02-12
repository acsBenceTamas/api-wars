from connection import connection_handler
from psycopg2 import sql


@connection_handler
def get_user_by_id(cursor, id):
    cursor.execute(
        sql.SQL(
            """
            SELECT * FROM users
            WHERE id = {id}
            """
        ).format(
            id=sql.Literal(id)
        )
    )
    return cursor.fetchone()


@connection_handler
def get_user_by_username(cursor, username):
    cursor.execute(
        sql.SQL(
            """
            SELECT * FROM users
            WHERE LOWER(username) = LOWER({username})
            """
        ).format(
            username=sql.Literal(username)
        )
    )
    return cursor.fetchone()


@connection_handler
def save_new_user(cursor, username, password):
    cursor.execute(
        sql.SQL(
            """
            INSERT INTO users (username, password)
            VALUES ({username}, {password})
            """
        ).format(
            username=sql.Literal(username),
            password=sql.Literal(password)
        )
    )


@connection_handler
def check_vote(cursor, user_id, planet_id):
    cursor.execute(
        sql.SQL(
            """
            SELECT COUNT(*) FROM "planet-votes"
            WHERE user_id = {user_id} AND planet_id = {planet_id}
            """
        ).format(
            user_id=sql.Literal(user_id),
            planet_id=sql.Literal(planet_id),
        )
    )
    print(cursor.fetchone())
    return cursor.fetchone()


@connection_handler
def make_vote(cursor, planet_id, planet_name, user_id, submission_time):
    cursor.execute(
        sql.SQL(
            """
            INSERT INTO "planet-votes" (planet_id, planet_name, user_id, submission_time)
            VALUES ({planet_id}, {planet_name}, {user_id}, {submission_time})
            """
        ).format(
            planet_id = sql.Literal(planet_id),
            planet_name = sql.Literal(planet_name),
            user_id = sql.Literal(user_id),
            submission_time = sql.Literal(submission_time),
        )
    )


@connection_handler
def get_vote_statistics(cursor):
    cursor.execute(
        """
        SELECT planet_name AS name , COUNT(planet_name) AS vote_count FROM "planet-votes"
        GROUP BY planet_name
        ORDER BY planet_name ASC
        """
    )
    return cursor.fetchall()

@connection_handler
def test(cursor, time):
    cursor.execute("INSERT INTO users (username, password) VALUES ('Pog','test');")
    # cursor.execute(
    #     sql.SQL(
    #         """
    #         INSERT INTO "planet-votes" (planet_id, planet_name, user_id, submission_time)
    #         VALUES (666, 'Falap', 15, {time})
    #         RETURNING *
    #         """
    #     ).format(time=time)
    # )
    # return cursor.fetchone()
    return True
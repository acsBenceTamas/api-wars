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

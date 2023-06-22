import functools
import string
import nanoid
from neo4j import GraphDatabase
from backend.config import *

READ = "read"
WRITE = "write"

driver = GraphDatabase.driver(NEO4J_URI, auth=NEO4J_AUTH)

def execute(mode, db="neo4j"):
    def execute_internal(method):
        @functools.wraps(method)
        def wrapper(*args, **kwargs):
            with driver.session(database=db) as session:
                if mode == READ:
                    result = session.execute_read(method, *args, **kwargs)
                elif mode == WRITE:
                    result = session.execute_write(method, *args, **kwargs)
                return result
        return wrapper
    return execute_internal

@execute(READ)
def get_root(tx):
    query = "MATCH (r:User {root: true}) RETURN r"
    result = tx.run(query)
    item = result.single()
    if item:
        user = item.data().get('r')
        return user

@execute(WRITE)
def create_root(tx):
    props = {
        "key": nanoid.generate(SECRET_CHAR_SET, SECRET_LENGTH),
        "id": nanoid.generate(SECRET_CHAR_SET, SECRET_LENGTH),
        "name": "Root",
        "root": True
    }
    query = "CREATE (u:User $props) RETURN u"
    result = tx.run(query, props=props)
    return result.single().data()['u']

@execute(READ)
def user_id_from_key(tx, user_key):
    query = "MATCH (u:User {key: $key}) RETURN u"
    result = tx.run(query, key=user_key)
    item = result.single()
    if item:
        user = item.data().get('u')
        return user.pop('id', None)

@execute(WRITE)
def create_user(tx, referrer_id):
    props = {
        "key": nanoid.generate(SECRET_CHAR_SET, SECRET_LENGTH),
        "id": nanoid.generate(SECRET_CHAR_SET, SECRET_LENGTH),
        "referrer": referrer_id
    }
    query = "CREATE (u:User $props) RETURN u"
    result = tx.run(query, props=props)
    return result.single().data()['u']

@execute(READ)
def read_user(tx, user_id):
    query = "MATCH (u:User {id: $id}) RETURN u"
    result = tx.run(query, id=user_id)
    item = result.single()
    if item:
        user = item.data().get('u')
        user.pop('key', None)
        return user
   
@execute(WRITE)
def update_user(tx, user_key, data):
    query = "MATCH (u:User {key: $key}) SET u += $props RETURN u"
    result = tx.run(query, key=user_key, props=data)
    item = result.single()
    if item:
        return item.data().get('u')

@execute(WRITE)
def delete_user(tx, user_key):
    query = "MATCH (u:User {key: $key}) DETACH DELETE u"
    result = tx.run(query, key=user_key)

@execute(WRITE)
def connect_to_user(tx, user_key, other_id, data):
    query = "MATCH (u:User {key: $key}) " \
            "MATCH (o:User {id: $id}) " \
            "MERGE (u)-[r:KNOWS]->(o) " \
            "MERGE (u)<-[:KNOWS]-(o) " \
            "SET r += $props " \
            "RETURN r"
    result = tx.run(query, key=user_key, id=other_id, props=data)

@execute(WRITE)
def get_user_connection(tx, user_key, other_id):
    query = "MATCH (u:User {key: $key})-[r:KNOWS]->(o:User {id: $id}) RETURN properties(r) as r"

    result = tx.run(query, key=user_key, id=other_id)
    item = result.single()
    if item:
        return item.data().get('r')

@execute(READ)
def get_user_connections(tx, user_key):
    query = "MATCH (u:User {key: $key})-[r:KNOWS]->(o:User) " \
    "RETURN properties(o) as user, properties(r) as connection"
    result = tx.run(query, key=user_key)
    connections = []
    for record in result:
        row = record.data()
        user = row['user']
        connection = row['connection']
        user.pop('key', None)
        user.update(connection)
        connections.append(user)
    return connections

import functools
import string
import nanoid
from neo4j import GraphDatabase
from backend.config import NEO4J_URI, NEO4J_AUTH

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

@execute(WRITE)
def create_user(tx, referrer_id):
    props = {
        "key": nanoid.generate(),
        "id": nanoid.generate(),
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
    data.pop("key", None)
    data.pop("id", None)
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

@execute(READ)
def get_user_connections(tx, user_key):
    query = "MATCH (u:User {key: $key})-[r:KNOWS]->(o:User)" \
    "RETURN r, o"

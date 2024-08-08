from fastapi import APIRouter, HTTPException, Header
from backend.rid_types import CommunityUser, CommunityContact
from koi.exceptions import RID
from koi.graph import driver
import bs4

router = APIRouter(
    prefix="/api/user"
)

@router.get("/{user_id}/all")
def read_all(user_id: str, user_key = Header(...)):
    user = CommunityUser(user_id)
    user_data = user.cache.read().json_data
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    if user_key != user_data["user_key"]:
        raise HTTPException(status_code=401, detail="Unauthorized")
    del user_data["user_key"]
    
    contact_set = user.graph.read_link("has_contacts")
    contacts = contact_set.graph.read()
    
    knowledge_set = user.graph.read_link("has_knowledge")
    knowledge_objs = knowledge_set.graph.read()
    knowledge = [obj.reference for obj in knowledge_objs]
        
    connections = []
    for contact in contacts:
        contact_data = contact.cache.read().json_data
        if not contact_data:
            print(contact.user_id)
            continue
        del contact_data["user_key"]
        contact_data.update(CommunityContact(
            user_id, contact_data["user_id"]).cache.read().json_data)
        connections.append(contact_data)
        
    connections.sort(key=lambda x: x["timestamp"])
        
    return {
        "user": user_data,
        "connections": connections,
        "knowledge": knowledge,
        "graph": read_graph(user_id)
    }
        
@driver.execute_read
def read_graph(tx, root_user_id):
    READ_GRAPH = """//cypher
        MATCH (n)
        OPTIONAL MATCH (n)-[e]->(m)
        RETURN n.rid as n, type(e) as e_type, e.tag as e_tag, m.rid as m
        """
        
    nodes = []
    edges = []
            
    record = tx.run(READ_GRAPH)
    entries = [dict(entry) for entry in record]
        
    node_contact_set_pairs = {}
    for entry in entries:
        if entry["e_tag"] == "has_contacts":
            node_contact_set_pairs[entry["m"]] = entry["n"]
            
    node_knowledge_set_pairs = {}
    for entry in entries:
        if entry["e_tag"] == "has_knowledge":
            node_knowledge_set_pairs[entry["m"]] = entry["n"]
        
    invitation_pairs = {}
    for entry in entries:
        if entry["e_tag"] == "invited_by":
            invitation_pairs[entry["n"]] = entry["m"]
    
    contact_links = [entry for entry in entries if entry["e_type"] == "CONTAINS"]
    
    unique_nodes = set(node_contact_set_pairs.values())
    
    for node in unique_nodes:
        user = RID.from_string(node)
        nodes.append({
            "id": RID.from_string(node).reference,
            "name": user.cache.read().json_data.get("name"),
            "type": "user"
        })
    
    for link in contact_links:
        set_node = link["n"]
        member_node = link["m"]
        
        if set_node in node_contact_set_pairs:
            user_node = node_contact_set_pairs[set_node]
            
            contact_id = RID.from_string(member_node).reference
            user_id = RID.from_string(user_node).reference
            
            if contact_id == root_user_id:
                for node in nodes:
                    if node.get("id") == user_id:
                        node["friend"] = True
            
            if CommunityContact(user_id, contact_id).cache.read().json_data.get("inviter"):
                edges.append({
                    "to": user_id,
                    "from": contact_id,
                    "type": "user", 
                    "invited": invitation_pairs.get(user_node) == member_node
                })
        
        elif set_node in node_knowledge_set_pairs:
            user_node = node_knowledge_set_pairs[set_node]
            
            knowledge = RID.from_string(member_node)
            user_id = RID.from_string(user_node).reference
            
            html = knowledge.cache.read().json_data.get("html")
            
            if html:
                title = bs4.BeautifulSoup(html).title.text
            else:
                title = "Knowledge Object"
            
            nodes.append({
                "id": knowledge.reference,
                "name": title,
                "type": "knowledge"
            })
            
            edges.append({
                "to": knowledge.reference,
                "from": user_id,
                "type": "knowledge"
            })
            
            
        
    return {
        "nodes": nodes,
        "edges": edges
    }
                
        
                        
    
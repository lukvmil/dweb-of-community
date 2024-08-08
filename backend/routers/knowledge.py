from fastapi import APIRouter
from pydantic import BaseModel
from rid_lib.types import WebPage
from backend.rid_types import CommunityUser

router = APIRouter(
    prefix="/api/user/{user_id}/knowledge"
)

class KnowledgeModel(BaseModel):
    url: str
    
@router.post("")
def create_knowledge(user_id: str, knowledge: KnowledgeModel):
    user = CommunityUser(user_id)
    
    document = WebPage(knowledge.url)
    document.graph.create()
    document.cache.write(from_dereference=True)
    document.vector.embed(from_cache=True, flush_queue=True)
    
    knowledge_set = user.graph.read_link("has_knowledge")
    knowledge_set.graph.update(add_members=[document])
    
    return document.cache.read().json_data
from rid_lib.core import RID, DataObject
from backend import utils

class CommunityUser(RID):
    space = "community"
    format = "user"

    def __init__(self, user_id=None):
        if not user_id:
            user_id = utils.generate_secret()
        
        self.user_id = user_id
        self.reference = user_id
        
    @classmethod
    def from_reference(cls, reference):
        return cls(reference)

    def dereference(self):
        return DataObject()

RID._add_type(CommunityUser)
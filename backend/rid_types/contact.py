from rid_lib.core import RID, DataObject
from rid_lib.exceptions import InvalidReferenceFormatError


class CommunityContact(RID):
    space = "community"
    format = "contact"
    
    def __init__(self, user_id, contact_id):
        self.user_id = user_id
        self.contact_id = contact_id
        
        self.reference = f"{user_id}/{contact_id}"
        
    @classmethod
    def from_reference(cls, reference):
        components = reference.split("/")
        if len(components) == 2:
            return cls(*components)
        else:
            raise InvalidReferenceFormatError(
                "Community Contact should be of format: {user_id}/{contact_id}"
            )
            
    def dereference(self):
        return DataObject()
    
RID._add_type(CommunityContact)
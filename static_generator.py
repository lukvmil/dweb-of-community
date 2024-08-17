from koi.graph import driver
from backend.rid_types import CommunityUser, CommunityContact
from rid_lib.core import RID
from backend.routers.all import read_all
from backend import email_api
import json

@driver.execute_read
def read_graph(tx):
    READ_GRAPH = """//cypher
        MATCH (n:user) RETURN n.rid
        """
    records = tx.run(READ_GRAPH)
    user_ids = [record.get("n.rid") for record in records]
    
    return [RID.from_string(rid) for rid in user_ids]

with open("frontend/template.html") as f:
    html_template = f.read()

for rid in read_graph():
    data = rid.cache.read()
    user_id = data.json_data["user_id"]
    user_key = data.json_data["user_key"]
    user_name = data.json_data.get("name")
    user_email = data.json_data.get("email")
    user_data = read_all(user_id, user_key)
    
    # print(json.dumps(user_data, indent=2))
    
    if not user_name:
        continue
    
    # if user_id != "xBMiGKFBaH":
    #     continue
    
    user_html = html_template.replace("null", json.dumps(user_data))
    
    static_page_filename = f"export/static_page_{user_id}.html"
    with open(static_page_filename, "w") as f:
        f.write(user_html)
    
    user_data_filename = f"export/user_data_{user_id}.json"
    with open(user_data_filename, "w") as f:
        json.dump(user_data, f, indent=2)

    print(user_id, user_name, user_email)    

    # continue
    email_api.send(
        to=user_email,
        subject="Thanks for using Web of Community!",
        content=f"""<p>Hi {user_name},</p>
<p style="text-indent: 4em;">Thank you for participating in the Web of Community at DWeb Camp! Since the experiment has come to an end, this email contains all of the data associated with your user, and a permanent way of viewing the interface. There are two attachments named user_data_(...).json and static_page_(...).html included with this email. The JSON file contains the raw data associated with your user, the connections you made, and the graph. The HTML file is a static snapshot of the interface from community.dweb, and allows you to continue to view your connections and interact with the graph by opening it with an internet browser. The servers are no longer live, and this static file has your data stored in it. It does require an internet connection to load the external libraries (for the user interface and graph view).<br>Web of Community was enabled by KOI Pond, a collaboration between BlockScience and Metagov, read more here: https://metagov.org/projects/koi-pond</p>

<p>Thanks for participating,<br>
Luke Miller<br>
Research Engineer<br>
BlockScience, Metagov</p>
        """,
        attachments=[
            static_page_filename,
            user_data_filename
        ]
    )
    

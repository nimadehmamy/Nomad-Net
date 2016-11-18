import pandas as pd
import json
dtset = {
    "nodes": {
        "people": {
        },
        "projects": {
        }
    },
    "links":"node1,node2;node1,t1;node2,t2"    
}
df = pd.read_table('rocket_chat_msg.tsv')
users = df['User'].unique()
for u in users:
    dtset['nodes']['people'][u] = {}
rooms = df['RoomName'].unique()
for r in rooms:
    if 'P:' not in r:
        dtset['nodes']['projects'][r] = {}
links = {}
for i in range(len(df)):
    u = df['User'][i]
    r = df['RoomName'][i]
    if "P:" in r:
        u1,u2 = r.replace("P:","").split('|')
        if u1 == u:
            r = u2
        else:
            r = u1
    l = "{},{}".format(r,u)
    if l not in links:
        links[l] = 0
    links[l] += 1
r = ";".join(links.keys())
dtset['links'] = r
json.dump(dtset,open("leo.json",'w'))

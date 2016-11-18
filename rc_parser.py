import pandas as pd
import json
dtset = {
    "nodes": {
        "people": {
        },
        "projects": {
        }
    },
    "links":{}
}
df = pd.read_table('rocket_chat_msg.tsv')
users = df['User'].unique()
for u in users:
    dtset['nodes']['people'][u] = {'size':0}
rooms = df['RoomName'].unique()
for r in rooms:
    if 'P:' not in r:
        dtset['nodes']['projects'][r] = {'size':0}
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
        dtset['nodes']['people'][r]['size'] += 1
    else:
        dtset['nodes']['projects'][r]['size'] += 1
    l = "{},{}".format(r,u)
    if l not in dtset['links']:
        dtset['links'][l] = {'weight':0}
    dtset['links'][l]['weight'] += 1
    dtset['nodes']['people'][u]['size'] += 1
json.dump(dtset,open("leo.json",'w'))

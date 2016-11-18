import pandas as pd
import json
import re
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
    dtset['nodes']['people'][u.lower()] = {'size':0}
rooms = df['RoomName'].unique()
for r in rooms:
    if 'P:' not in r:
        dtset['nodes']['projects'][r] = {'size':0}
links = {}
for i in range(len(df)):
    u = df['User'][i].lower()
    r = df['RoomName'][i]
    mention = df['Mentions'][i]
    if "P:" in r:
        u1,u2 = r.replace("P:","").split('|')
        if u1 == u:
            r = u2
        else:
            r = u1
        r = r.lower()
        dtset['nodes']['people'][r]['size'] += 1
    else:
        dtset['nodes']['projects'][r]['size'] += 1
    l = "{},{}".format(r,u)
    if l not in dtset['links']:
        dtset['links'][l] = {'weight':0, 'mention_weight':0}
    dtset['links'][l]['weight'] += 1
    dtset['nodes']['people'][u]['size'] += 1
    if pd.notnull(mention):
        users = mention.split(',')
        regex = re.compile('[^a-zA-Z]')
        users = [regex.sub('',k).lower() for k in users]
        users = [k for k in users if k in dtset['nodes']['people'].keys()]
        for user in users:
             l = "{},{}".format(u,user)
             if l not in dtset['links']:
                 dtset['links'][l] = {'weight':0, 'mention_weight':0}
             dtset['links'][l]['mention_weight'] += 1
json.dump(dtset,open("leo.json",'w'))

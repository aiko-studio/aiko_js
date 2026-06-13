# BREAK CONTINUE
print("===== START BREAK CONTINUE =====");
for i = 200 .. 205 {
    if(i == 203){ break; }              # 200 201 202
    print(i);
}

for i = 300 .. 305 {
    if(i == 303){ continue; }           # 300 301 302 304
    print(i);
}
print("===== END BREAK CONTINUE =====");
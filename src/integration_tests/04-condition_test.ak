# CONDITION
print("===== START IF =====");
var first = 90; 
var second = 90;
var isSmall = first < second;

print(first < second);          # 0
print(isSmall);                 # 0

print(10 == 5);                 # 0
print(first == second);         # 1
print(first != second);         # 0

print(first >= second);         # 1
print(first <= second);         # 1

if(10 > 5){
    print("44444");             # 44444
}


if(10 < first){
    print("oi");                # oi
}



















var nilai = 100;                # else 99

if nilai == 10 {
    print("muehehehehe");
}
elif nilai == 9 {
    print("elif");
}
elif nilai == 7 {
    print("elif2");
}
elif nilai == 99 {
    print("elif3");
}
else {
    print("else");
    var m = 99;
    print(m);
}











var entah = false;
if(10 > 11){
    print("woi");
}
elif(entah){
    print("nah");
}
else {
    print("nanana");
}

entah = true;
if(10 > 11){
    print("woi");
}
elif(entah){
    print("nah");
}
else {
    print("nanana");
}
print("===== END IF =====");
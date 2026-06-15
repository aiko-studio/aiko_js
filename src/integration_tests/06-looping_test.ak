# LOOPING
print("===== START FOR =====");
for i = 888 .. 890 {
    print(i);
}

for i = 444 .. 450, 2 {        # 444 446 448
    print(i);
}

for i = 5 .. -1 {              # 5 4 3 2 1 0
    print(i);
}

for i = 49 .. -10, 20 {        # 49 29 9
    print(i);
}


for i = 10 .. 12 {
    for j = 10 .. 12 {
        var z = 99;
        print(z);               # 99 99 99 99
    }
}


var coba = 400;

for i = 0 .. coba, 100 {             # 0 100 200 300
    print(i);
}


for i = coba .. 0, 200 {
    print(i);                # 400 200
}

var updatenya = 5;
for i = 555 .. 600, updatenya {
    print(i);
}

for i = 0 .. 2 {               # 0 "ini 0" 1
    print(i);
    if(i == 0){
        print("ini 0");
    }
}

for i = 0 .. 2 {                # hemm 1 "hello inner" 2x
    for j = 0 .. 2 {
        if(j == 1){
            print(j);
            var inner = "hello inner";
            print(inner);
        }
        else {
            print("hemm");
        }
    }
}
print("===== END FOR =====");
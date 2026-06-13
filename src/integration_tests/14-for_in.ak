# FOR IN
print("===== START FOR IN =====");
var arr3 = [666, 444, 222, 999];

for item in arr3 {
    print(item);
}

for item in arr3 when item > 500 {
    print(item);
}

for item in arr3 when item < 500 {
    print(item);
}

var arr4 = ["string ini woi", true, 444, 863];
print(arr4[0]);

for i = 0 .. 4 {
    print(arr4[i]);
}
print("===== END FOR IN =====");
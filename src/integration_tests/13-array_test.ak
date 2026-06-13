# Array
print("===== START ARRAY =====");
var arr = [9 .. 15, 97, 43, 35, 42, 75];
var length = len(arr);

print(length);                      # 11
print(len(arr));                    # 11
print(arr);                       # 9
print(arr[0]);                    # 9
print(arr[5]);                    # 14

var idx = 2;
print(arr[idx]);                  # 11


print(arr[0]);                    # 9
arr[0] = 777;
print(arr[0]);                    # 777

arr[idx] = 25464;
print(arr[idx]);                  # 25464


var arr2 = [88, 65];
# print(arr2[7]); # berhasil out of bonds ketiganya
# arr2[6] = 5;
# arr2[idx] = 5;

# FOR BIASA
for i = 0 .. len(arr) {           # 777 10 25464 12 13 14 97 43 25 42 75 
    print(arr[i]);
}


# var bukanArr = 20;
# for i = 0 .. len(bukanArr) { # error bukan array: betul
#     print(arr[i]);
# }

print("===== END ARRAY =====");
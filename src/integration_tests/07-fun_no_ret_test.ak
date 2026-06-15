# FUNCTION NO RETURN
print("===== START FUNC NO RETURN =====");
fun displayHello(){
    print("mellow");
    for i = 0 .. 2 {
        for j = 3 .. 5 {
            if(i == 1){
                print(j);
            }
        }
    }

    var m = 99;
    print(m);
}
displayHello();                 # mellow 3 4 99

fun callWithParam(param1){
    print(param1);
}

callWithParam("hello");         # hello
callWithParam(10);              # 10

fun addParams(a, b){
    print(a + b);
}
addParams(10, 30);              # 40



fun diffTyParam(first, second){
    print(first);
    print(second);
}

diffTyParam(10, "apa ya");      # 10 "apa ya"
diffTyParam("apa ya", 10);      # "apa ya" 10
print("===== END FUNC NO RETURN =====");
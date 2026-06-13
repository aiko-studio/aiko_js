# return variable
print("===== START FUNC RETURN VAR ARG =====");
fun retParam1(){
    var a = 9;
    return a;
}
print(retParam1());             # 9
var retParam1Res = retParam1();
print(retParam1Res);            # 9


fun retParam2(a){
    return a;
}
print(retParam2(10));           # 10
var retParam2Res = retParam2(10);
print(retParam2Res);            # 10

print(retParam2("woi"));        # woi

var arg = 99;
fun retParam3(a){
    return a;
}
print(retParam3(arg));          # 99
var retParam3Res = retParam3(arg);
print(retParam3Res);            # 99



fun retParam4(a){
    return a;
}
print(retParam4(arg + 1));      # 100
var retParam4Res = retParam4(arg + 1);
print(retParam4Res);            # 100




fun retParam5(a){
    return a + 1 * 9;
}
print(retParam5(arg));          # 108
print(arg);                     # 99
var retParam5Res = retParam5(arg);
print(retParam5Res);            # 108
print(arg);                     # 99
print("===== END FUNC RETURN VAR ARG =====");
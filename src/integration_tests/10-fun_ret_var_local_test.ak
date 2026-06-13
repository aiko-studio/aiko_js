print("===== START FUNC RETURN VAR LOCAL =====");
fun retLocal(a){
    var b = 9;
    return a + b;
}
print(retLocal(8));             # 17
var retLocalVar = retLocal(1);
print(retLocalVar);             # 10



var arg2 = 9;
fun retLocal2(a){
    var b = 9;
    return a + b;
}
print(retLocal2(arg2));         # 18
var retLocalVar2 = retLocal2(1);
print(retLocalVar2);            # 10
print("===== END FUNC RETURN VAR LOCAL =====");
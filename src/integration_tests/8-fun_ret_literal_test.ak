# FUNCTION RETURN
print("===== START FUNC RETURN LITERAL =====");
fun ret5(){
    return 5;
}
var five = ret5();
print(five);                    # 5

print(ret5());                  # 5


fun resBinOp(a, b){
    return 5 + a * 7 / 2 - b;
}
print(resBinOp(6, 2));          # 24


fun retStr(){
    return "gello";
}

var getGello = retStr();
print(getGello);                # gello

print(retStr());                # gello
print("===== END FUNC RETURN LITERAL =====");
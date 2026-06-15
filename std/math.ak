val MAX_INT = 2147483647;
val MIN_INT = -2147483648;

fun abs(x){
    if(x < 0){ return -x; }
    return x;
}

fun min(a, b){
    if(a < b){ return a; }
    return b;
}

fun max(a, b){
    if(a > b){ return a; }
    return b;
}

fun clamp(value, min_val, max_val){
    if(value < min_val){ return min_val; }
    if(value > max_val){ return max_val; }
    return value;
}

fun power(base, exp){
    if(exp == 0){ return 1; }
    var result = 1;
    
    for i = 0 .. exp {
        result = result * base;
    }
    return result;
}
var f = 5;
var x = [15, 11, f, 7, 2];
print(x[2]);
var y = 9;


fun twoSum(arr, target){
    for i = 0 .. len(arr) {
        for j = i + 1 .. len(arr) {
            if(arr[i] + arr[j] == target){
                print(i);
                print(j);
                return [i, j];
            }
        }
    }
    return [];
}


var res = twoSum(x, y);
print(res[0]);
print(res[1]);
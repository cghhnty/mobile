/**
 * Created by cjh on 2016/10/8.
 */
module.exports = {
    chSort:function(arr,sfied){
        if(arr.constructor != Array) return;
        arr.sort(function(a,b){
            return a[sfied].localeCompare(b[sfied]);
        });
    }
}


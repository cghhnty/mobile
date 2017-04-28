/**
 * Created by cjh on 2016/10/8.
 */
module.exports = {
    dField:function(obj,fied){
        if(obj.constructor != Object) return;
        for (var p in obj) {
            if (p == fied) {
                delete obj[p];
            }
        }
       }
}

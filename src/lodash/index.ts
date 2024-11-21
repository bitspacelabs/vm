import _ from 'lodash'


function difference(object: Object, base: Object) {
    function changes(object: Object, base: Object) {
        return _.transform(object, function(result: any, value, key) {
            if (!_.isEqual(value, base[key])) {
                result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
            }
        });
    }
    return changes(object, base);
}


console.log(
    difference({a: 1, b: 2, c: 3, e: [1, 2]}, {a: 1, b: 2, e: [1, 2, 3]})
)